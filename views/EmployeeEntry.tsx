
import React, { useState, useEffect } from 'react';
import { Save, X, Calculator, Zap, TrendingUp, DollarSign } from 'lucide-react';
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
  const [formData, setFormData] = useState<Partial<Shipment>>({
    date: new Date().toISOString().split('T')[0],
    employeeName: currentUser.role === 'Admin' ? (employees[0]?.name || '') : currentUser.name,
    invoiceNo: '',
    shipper: shippers[0]?.name || '',
    buyer: buyers[0]?.name || '',
    depot: depots[0]?.name || '',
    docQty: 0, ctnQty: 0, tonQty: 0, unloadQty: 0, conQty: 0, otherAmt: 0, remarks: '', totalIndent: 0, paid: 0
  });

  const [billing, setBilling] = useState({
    depotIndent: 0, assocFee: 0, officeIncome: 0,
    docRate: 485, ctnRate: 3, tonRate: 249, unloadRate: 150, conRate: 150
  });

  // ROBUST PRICE RULE RESOLVER
  const resolveRate = (category: string, defaultRate: number) => {
    // Search for a rule that matches current selections
    const match = prices.find(p => {
      if (p.category !== category) return false;
      const cond = (p.condition || '').toUpperCase();
      if (!cond) return false;

      // Condition matches if it's found inside Buyer, Shipper, or Depot name
      return (
        (formData.buyer || '').toUpperCase().includes(cond) ||
        (formData.shipper || '').toUpperCase().includes(cond) ||
        (formData.depot || '').toUpperCase().includes(cond)
      );
    });
    
    return match ? match.rate : defaultRate;
  };

  useEffect(() => {
    // 1. Resolve Core Component Rates (Using Prices Registry or Default Logic)
    const docR = resolveRate('DOC', formData.buyer?.includes('H&M') ? (formData.buyer.includes('AIR') ? 270 : 220) : 485);
    const ctnR = resolveRate('CTN', 3);
    const tonR = resolveRate('TON', 249);
    const unloadR = resolveRate('UNLOAD', 150);
    const conR = resolveRate('CON', 150);

    const officeRate = formData.buyer?.includes('H&M') ? 75 : 80;
    const assocRate = 85;

    const dQ = Number(formData.docQty || 0);
    const cQ = Number(formData.ctnQty || 0);
    const tQ = Number(formData.tonQty || 0);
    const uQ = Number(formData.unloadQty || 0);
    const cnQ = Number(formData.conQty || 0);
    const oA = Number(formData.otherAmt || 0);

    const depotIndent = (dQ * docR) + (cQ * ctnR) + (tQ * tonR) + (uQ * unloadR) + (cnQ * conR) + oA;
    const assocFee = dQ * assocRate;
    const officeIncome = dQ * officeRate;
    const total = depotIndent + assocFee + officeIncome;

    setBilling({ depotIndent, assocFee, officeIncome, docRate: docR, ctnRate: ctnR, tonRate: tonR, unloadRate: unloadR, conRate: conR });
    setFormData(prev => ({ ...prev, totalIndent: total }));
  }, [formData.docQty, formData.ctnQty, formData.tonQty, formData.unloadQty, formData.conQty, formData.otherAmt, formData.buyer, formData.shipper, formData.depot, prices]);

  const handleSave = () => {
    if (!formData.invoiceNo) {
      Swal.fire({ title: 'ERROR', text: 'Invoice No is required.', icon: 'error' });
      return;
    }
    setShipments(prev => [{ ...formData, id: Date.now().toString() } as Shipment, ...prev]);
    Swal.fire({ title: 'POSTED', icon: 'success', timer: 1500, showConfirmButton: false }).then(() => onComplete());
  };

  return (
    <div className="max-w-5xl mx-auto animate-fadeIn pb-20">
      <div className="classic-window border-2 border-blue-900 shadow-2xl">
        <div className="classic-title-bar !bg-blue-900 py-2.5">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-yellow-400 fill-yellow-400"/>
            <span className="tracking-widest">NEW SHIPMENT TERMINAL - {currentUser.name.toUpperCase()}</span>
          </div>
          <button onClick={onComplete} className="hover:text-red-400"><X size={18}/></button>
        </div>
        
        <div className="classic-body p-8 space-y-8 bg-white">
          {/* Header Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 border rounded-lg shadow-inner">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ENTRY DATE</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="classic-input w-full h-11 font-bold text-blue-900" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-blue-900 uppercase tracking-widest">INVOICE NUMBER</label>
              <input value={formData.invoiceNo} onChange={e => setFormData({...formData, invoiceNo: e.target.value.toUpperCase()})} className="classic-input w-full font-black text-xl h-11 border-blue-900 uppercase" placeholder="REQUIRED" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">BUYER ENTITY</label>
              <select value={formData.buyer} onChange={e => setFormData({...formData, buyer: e.target.value})} className="classic-input w-full h-11 font-black">
                {buyers.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
          </div>

          {/* Logistics Multi-Select */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase">SHIPPER / EXPORTER</label>
              <select value={formData.shipper} onChange={e => setFormData({...formData, shipper: e.target.value})} className="classic-input w-full h-11 font-bold">
                {shippers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase">TARGET DEPOT</label>
              <select value={formData.depot} onChange={e => setFormData({...formData, depot: e.target.value})} className="classic-input w-full h-11 font-bold">
                {depots.map(d => <option key={d.id} value={d.name}>{d.name}</option>) || <option>NO DEPOT</option>}
              </select>
            </div>
          </div>

          {/* Quantity Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <QtyCard label={`DOC (@${billing.docRate})`} value={formData.docQty} onChange={v => setFormData({...formData, docQty: v})} color="blue" />
            <QtyCard label={`UNLOAD (@${billing.unloadRate})`} value={formData.unloadQty} onChange={v => setFormData({...formData, unloadQty: v})} color="orange" />
            <QtyCard label={`CON (@${billing.conRate})`} value={formData.conQty} onChange={v => setFormData({...formData, conQty: v})} color="purple" />
            <QtyCard label="TONNAGE" value={formData.tonQty} onChange={v => setFormData({...formData, tonQty: v})} color="gray" />
            <QtyCard label="OTHER TK" value={formData.otherAmt} onChange={v => setFormData({...formData, otherAmt: v})} color="green" />
          </div>

          {/* Analysis Result */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-10 rounded-2xl text-center shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:scale-125 transition-transform">
                <Calculator size={120}/>
             </div>
             <p className="text-[11px] font-black text-blue-300 uppercase tracking-[0.4em] mb-3">GRAND TOTAL SHIPMENT INDENT</p>
             <div className="flex items-center justify-center gap-4">
                <span className="text-2xl font-bold text-blue-400">TK</span>
                <p className="text-6xl font-black font-mono tracking-tighter drop-shadow-lg">
                  {formData.totalIndent?.toLocaleString()}
                </p>
             </div>
             <div className="mt-6 flex justify-center gap-6 text-[9px] font-black text-white/40 uppercase">
                <p>Registry Rules: {prices.length} Active</p>
                <p>|</p>
                <p>Status: Verified</p>
             </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button onClick={onComplete} className="classic-btn px-10 py-3 font-bold hover:bg-gray-100">CANCEL ENTRY</button>
            <button onClick={handleSave} className="classic-btn px-16 py-3 bg-blue-900 text-white font-black border-blue-950 shadow-lg hover:bg-blue-800 flex items-center gap-3">
              <Save size={18}/> F10-POST TO LEDGER
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
    green: "bg-green-50 border-green-200 text-green-900",
    gray: "bg-gray-50 border-gray-200 text-gray-900"
  };
  return (
    <div className={`p-4 border-2 rounded-xl flex flex-col items-center transition-all hover:scale-105 ${colors[color]}`}>
      <label className="text-[9px] font-black uppercase mb-2 tracking-tighter text-center">{label}</label>
      <input 
        type="number" 
        value={value} 
        onChange={e => onChange(parseFloat(e.target.value) || 0)} 
        className="w-full bg-transparent border-none text-center font-black text-2xl outline-none focus:ring-0"
      />
    </div>
  );
};

export default EmployeeEntry;
