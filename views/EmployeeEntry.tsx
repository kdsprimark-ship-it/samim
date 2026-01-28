
import React, { useState, useEffect } from 'react';
import { Save, X, Calculator, Zap, User, Hash, Calendar, Layers, Anchor, Tag, Truck } from 'lucide-react';
import { Shipment, Shipper, Buyer, Depot, Employee, UserSession, PriceRate } from '../types';
import Swal from 'sweetalert2';

interface EmployeeEntryProps {
  currentUser: UserSession;
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
  shippers: Shipper[];
  buyers: Buyer[];
  depots: Depot[];
  employees: Employee[];
  onComplete: () => void;
  swalSize: number;
  prices: PriceRate[];
}

const EmployeeEntry: React.FC<EmployeeEntryProps> = ({ 
  currentUser, setShipments, shippers, buyers, depots, employees, onComplete, swalSize, prices
}) => {
  // Setting default date to 28-Jan-2026 as per user request
  const [formData, setFormData] = useState<Partial<Shipment>>({
    date: '2026-01-28', 
    employeeName: currentUser.role === 'Admin' ? (employees[0]?.name || '') : currentUser.name,
    invoiceNo: '',
    shipper: shippers[0]?.name || '',
    buyer: buyers[0]?.name || '',
    depot: depots[0]?.name || '',
    docQty: 0, ctnQty: 0, tonQty: 0, unloadQty: 0, conQty: 0, otherAmt: 0, remarks: '', totalIndent: 0, paid: 0
  });

  const [breakdown, setBreakdown] = useState({
    depotIndent: 0, assocFee: 0, officeIncome: 0,
    docRate: 485, ctnRate: 3, tonRate: 249, unloadRate: 150, conRate: 150, officeRate: 80
  });

  useEffect(() => {
    // --- BILING LOGIC ENGINE ---
    
    // 1. DOC Rate: H&M (220), H&M SEA AIR (270), Others (485)
    let docR = 485;
    const buyerStr = (formData.buyer || '').toUpperCase();
    if (buyerStr.includes('H&M') && buyerStr.includes('SEA AIR')) docR = 270;
    else if (buyerStr.includes('H&M')) docR = 220;

    // 2. UNLOAD Rate: Confidence + (Matalon/Primark) = 300, Else 150
    let unloadR = 150;
    const shipperStr = (formData.shipper || '').toUpperCase();
    if (shipperStr.includes('CONFIDENCE') && (buyerStr.includes('MATALON') || buyerStr.includes('PRIMARK'))) {
      unloadR = 300;
    }

    // 3. CON Rate: KDS, SAVER, NAMSUN = 200, Else 150
    let conR = 150;
    const depotStr = (formData.depot || '').toUpperCase();
    if (['KDS', 'SAVER', 'NAMSUN'].some(d => depotStr.includes(d))) {
      conR = 200;
    }

    // 4. Office Income: H&M = 75, Others = 80
    const officeR = buyerStr.includes('H&M') ? 75 : 80;

    // Fixed constants
    const ctnR = 3;
    const tonR = 249;
    const assocR = 85;

    // Quantities
    const dQ = Number(formData.docQty || 0);
    const cQ = Number(formData.ctnQty || 0);
    const tQ = Number(formData.tonQty || 0);
    const uQ = Number(formData.unloadQty || 0);
    const cnQ = Number(formData.conQty || 0);
    const oA = Number(formData.otherAmt || 0);

    // Calculate Totals
    const depotIndentValue = (dQ * docR) + (cQ * ctnR) + (tQ * tonR) + (uQ * unloadR) + (cnQ * conR) + oA;
    const assocFeeValue = dQ * assocR;
    const officeIncomeValue = dQ * officeR;
    const total = depotIndentValue + assocFeeValue + officeIncomeValue;

    setBreakdown({ 
      depotIndent: depotIndentValue, assocFee: assocFeeValue, officeIncome: officeIncomeValue, 
      docRate: docR, ctnRate: ctnR, tonRate: tonR, 
      unloadRate: unloadR, conRate: conR, officeRate: officeR 
    });
    setFormData(prev => ({ ...prev, totalIndent: total }));
  }, [formData.docQty, formData.ctnQty, formData.tonQty, formData.unloadQty, formData.conQty, formData.otherAmt, formData.buyer, formData.shipper, formData.depot]);

  const handleSave = () => {
    if (!formData.invoiceNo) {
      Swal.fire({ title: 'ERROR', text: 'INVOICE NUMBER IS REQUIRED', icon: 'error', width: swalSize, customClass: { popup: 'classic-swal' } });
      return;
    }
    setShipments(prev => [{ ...formData, id: Date.now().toString() } as Shipment, ...prev]);
    Swal.fire({ title: 'ENTRY SAVED', text: 'RECORDS POSTED TO LEDGER', icon: 'success', timer: 1500, showConfirmButton: false }).then(() => onComplete());
  };

  // Helper to handle "0 = empty" display requirement
  const handleNumericInput = (field: keyof Shipment, value: string) => {
    const parsed = value === "" ? 0 : parseFloat(value);
    setFormData(prev => ({ ...prev, [field]: parsed }));
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-24">
      <div className="classic-window border-2 border-blue-900 shadow-2xl">
        <div className="classic-title-bar !bg-blue-950 py-3 px-6">
          <div className="flex items-center gap-3">
            <Zap size={16} className="text-yellow-400 fill-yellow-400"/>
            <span className="tracking-widest font-black uppercase">New Shipment Entry (Employee Form)</span>
          </div>
          <button onClick={onComplete} className="hover:text-red-400"><X size={20}/></button>
        </div>
        
        <div className="classic-body p-8 space-y-6 bg-white">
          
          {/* 1. DATE & INVOICE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/30 p-6 border rounded shadow-inner">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                <Calendar size={12}/> ENTRY DATE
              </label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="classic-input w-full h-11 font-black text-blue-900" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-red-700 uppercase tracking-widest flex items-center gap-1">
                <Hash size={12}/> INVOICE NUMBER (REQUIRED)
              </label>
              <input value={formData.invoiceNo} onChange={e => setFormData({...formData, invoiceNo: e.target.value.toUpperCase()})} className="classic-input w-full font-black text-2xl h-11 border-blue-900 uppercase" placeholder="REQUIRED" />
            </div>
          </div>

          {/* 2. EMPLOYEE & BUYER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <User size={12}/> EMPLOYEE NAME
              </label>
              <select 
                value={formData.employeeName} 
                onChange={e => setFormData({...formData, employeeName: e.target.value})} 
                className="classic-input w-full h-11 font-black border-gray-300"
                disabled={currentUser.role !== 'Admin'}
              >
                {employees.map(e => <option key={e.id} value={e.name}>{e.name.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Tag size={12}/> BUYER ENTITY
              </label>
              <select value={formData.buyer} onChange={e => setFormData({...formData, buyer: e.target.value})} className="classic-input w-full h-11 font-black">
                {buyers.map(b => <option key={b.id} value={b.name}>{b.name.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          {/* 3. SHIPPER & DEPOT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Anchor size={12}/> SHIPPER / EXPORTER
              </label>
              <select value={formData.shipper} onChange={e => setFormData({...formData, shipper: e.target.value})} className="classic-input w-full h-11 font-bold">
                {shippers.map(s => <option key={s.id} value={s.name}>{s.name.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <Truck size={12}/> TARGET DEPOT
              </label>
              <select value={formData.depot} onChange={e => setFormData({...formData, depot: e.target.value})} className="classic-input w-full h-11 font-bold">
                {depots.map(d => <option key={d.id} value={d.name}>{d.name.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          <hr className="border-dashed border-gray-200" />

          {/* 4. QUANTITY INPUTS (FAKA IF 0) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <QtyCard label={`DOC (@${breakdown.docRate})`} value={formData.docQty === 0 ? "" : formData.docQty} onChange={v => handleNumericInput('docQty', v)} color="blue" />
            <QtyCard label={`UNLOAD (@${breakdown.unloadRate})`} value={formData.unloadQty === 0 ? "" : formData.unloadQty} onChange={v => handleNumericInput('unloadQty', v)} color="orange" />
            <QtyCard label={`CON (@${breakdown.conRate})`} value={formData.conQty === 0 ? "" : formData.conQty} onChange={v => handleNumericInput('conQty', v)} color="purple" />
            <div className="flex flex-col gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                <label className="text-[8px] font-black uppercase text-center text-gray-400">CTN / TON</label>
                <input type="number" placeholder="CTN" value={formData.ctnQty === 0 ? "" : formData.ctnQty} onChange={e => handleNumericInput('ctnQty', e.target.value)} className="classic-input text-center h-8 font-bold border-gray-300" />
                <input type="number" placeholder="TON" value={formData.tonQty === 0 ? "" : formData.tonQty} onChange={e => handleNumericInput('tonQty', e.target.value)} className="classic-input text-center h-8 font-bold border-gray-300" />
            </div>
            <div className="flex flex-col gap-2 p-2 bg-gray-50 border border-gray-200 rounded-xl">
                <label className="text-[8px] font-black uppercase text-center text-gray-400">OTHER TK & REMARK</label>
                <input type="number" value={formData.otherAmt === 0 ? "" : formData.otherAmt} onChange={e => handleNumericInput('otherAmt', e.target.value)} className="classic-input text-center h-8 font-black border-gray-300" />
                <input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="classic-input text-[9px] h-8 font-bold border-gray-300" placeholder="NOTE..." />
            </div>
          </div>

          {/* 5. TOTAL DISPLAY AREA */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><Calculator size={100}/></div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 border-b border-white/10 pb-6">
                <div>
                   <p className="text-[9px] font-bold text-blue-300 uppercase">DEPOT INDENT</p>
                   <p className="text-xl font-black font-mono">TK {breakdown.depotIndent.toLocaleString()}</p>
                </div>
                <div>
                   <p className="text-[9px] font-bold text-blue-300 uppercase">ASSCIOEN FEE (@85)</p>
                   <p className="text-xl font-black font-mono">TK {breakdown.assocFee.toLocaleString()}</p>
                </div>
                <div>
                   <p className="text-[9px] font-bold text-blue-300 uppercase">OFFICE INCOME (@{breakdown.officeRate})</p>
                   <p className="text-xl font-black font-mono">TK {breakdown.officeIncome.toLocaleString()}</p>
                </div>
             </div>

             <div className="text-center">
                <p className="text-[11px] font-black text-blue-300 uppercase tracking-[0.5em] mb-2">GRAND TOTAL SHIPMENT INDENT</p>
                <div className="flex items-center justify-center gap-3">
                   <span className="text-xl font-bold text-blue-400">TK</span>
                   <p className="text-6xl font-black font-mono tracking-tighter drop-shadow-lg">{formData.totalIndent?.toLocaleString()}</p>
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button onClick={onComplete} className="classic-btn px-10 py-3 font-bold hover:bg-gray-100 transition-all border-black/20">ESC-CANCEL</button>
            <button onClick={handleSave} className="classic-btn px-16 py-3 bg-blue-900 text-white font-black border-blue-950 shadow-xl hover:bg-blue-800 flex items-center gap-3 active:scale-95">
              <Save size={18}/> F10-SAVE & POST
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QtyCard = ({ label, value, onChange, color }: any) => {
  const colors: any = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    orange: "bg-orange-50 border-orange-200 text-orange-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
  };
  return (
    <div className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all hover:border-blue-400 ${colors[color]}`}>
      <label className="text-[9px] font-black uppercase mb-2 tracking-tighter text-center">{label}</label>
      <input 
        type="number" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-transparent border-none text-center font-black text-2xl outline-none"
      />
    </div>
  );
};

export default EmployeeEntry;
