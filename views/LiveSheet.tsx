
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Edit2, 
  Trash2, 
  Printer, 
  FileText, 
  X, 
  Save, 
  Calendar,
  Layers,
  Tag,
  Anchor,
  Calculator,
  ChevronDown,
  Filter
} from 'lucide-react';
import { Shipment, Shipper, Buyer, Employee, Depot, PriceRate } from '../types';
import Swal from 'sweetalert2';

interface LiveSheetProps {
  shipments: Shipment[];
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
  shippers: Shipper[];
  buyers: Buyer[];
  employees: Employee[];
  depots: Depot[];
  swalSize: number;
  prices: PriceRate[];
}

const LiveSheet: React.FC<LiveSheetProps> = ({ 
  shipments, 
  setShipments, 
  shippers, 
  buyers, 
  employees, 
  depots, 
  swalSize,
  prices
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fDate, setFDate] = useState('');
  const [fShipper, setFShipper] = useState('ALL');
  const [fBuyer, setFBuyer] = useState('ALL');
  const [fDepot, setFDepot] = useState('ALL');
  
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  const filtered = useMemo(() => {
    return shipments.filter(s => {
      const matchSearch = s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.shipper.toLowerCase().includes(searchTerm.toLowerCase());
      const matchShipper = fShipper === 'ALL' || s.shipper === fShipper;
      const matchBuyer = fBuyer === 'ALL' || s.buyer === fBuyer;
      const matchDepot = fDepot === 'ALL' || s.depot === fDepot;
      const matchDate = !fDate || s.date === fDate;
      
      return matchSearch && matchShipper && matchBuyer && matchDepot && matchDate;
    });
  }, [shipments, searchTerm, fShipper, fBuyer, fDepot, fDate]);

  const handleDelete = (id: string, inv: string) => {
    Swal.fire({ 
      title: 'CONFIRM DELETE?', 
      text: `Removing Invoice: ${inv} permanently.`,
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonText: 'DELETE', 
      width: swalSize,
      customClass: { popup: 'classic-swal' } 
    }).then(res => {
      if (res.isConfirmed) setShipments(p => p.filter(x => x.id !== id));
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-20">
      {/* Advanced Filter Bar */}
      <div className="classic-info-bar rounded grid grid-cols-2 md:grid-cols-6 gap-3 shadow-md border border-black/10">
        <div className="relative col-span-1 md:col-span-1">
           <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-900" size={14} />
           <input type="text" placeholder="Search INV..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="classic-input pl-8 w-full h-9" />
        </div>
        <div className="relative">
           <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
           <input type="date" value={fDate} onChange={e => setFDate(e.target.value)} className="classic-input pl-8 w-full h-9" />
        </div>
        <select value={fShipper} onChange={e => setFShipper(e.target.value)} className="classic-input font-bold h-9">
           <option value="ALL">ALL SHIPPERS</option>
           {shippers.map(s => <option key={s.id} value={s.name}>{s.name.toUpperCase()}</option>)}
        </select>
        <select value={fBuyer} onChange={e => setFBuyer(e.target.value)} className="classic-input font-bold h-9">
           <option value="ALL">ALL BUYERS</option>
           {buyers.map(b => <option key={b.id} value={b.name}>{b.name.toUpperCase()}</option>)}
        </select>
        <select value={fDepot} onChange={e => setFDepot(e.target.value)} className="classic-input font-bold h-9">
           <option value="ALL">ALL DEPOTS</option>
           {depots.map(d => <option key={d.id} value={d.name}>{d.name.toUpperCase()}</option>)}
        </select>
        <button onClick={handlePrint} className="classic-btn border-black/20 h-9 flex items-center justify-center gap-2 hover:bg-gray-100">
          <Printer size={14}/> PRINT
        </button>
      </div>

      <div className="classic-window">
        <div className="classic-title-bar flex justify-between">
          <div className="flex items-center gap-2">
            <FileText size={12}/>
            <span>EXPORT LEDGER TERMINAL [RECORDS: {filtered.length}]</span>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-black uppercase">
            <span>TOTAL VALUE: TK {filtered.reduce((a, b) => a + (b.totalIndent || 0), 0).toLocaleString()}</span>
          </div>
        </div>
        <div className="classic-body overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-300 text-[10px] font-black uppercase border-b border-black">
                <th className="p-3 border-r border-black/10">DATE</th>
                <th className="p-3 border-r border-black/10">INVOICE NO</th>
                <th className="p-3 border-r border-black/10">SHIPPER / BUYER</th>
                <th className="p-3 border-r border-black/10 text-right">GROSS AMT</th>
                <th className="p-3 border-r border-black/10 text-right">PAID</th>
                <th className="p-3 border-r border-black/10 text-right">DUE</th>
                <th className="p-3 text-center no-print">CMD</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const due = (s.totalIndent || 0) - (s.paid || 0);
                return (
                  <tr key={s.id} className="border-b border-black/5 hover:bg-blue-50 text-[11px] font-mono group transition-colors">
                    <td className="p-3 border-r border-black/5 whitespace-nowrap">{s.date}</td>
                    <td className="p-3 border-r border-black/5 font-black text-blue-900">{s.invoiceNo}</td>
                    <td className="p-3 border-r border-black/5">
                       <p className="font-bold uppercase text-[9px] truncate max-w-[150px]">{s.shipper}</p>
                       <p className="text-[8px] text-gray-400 font-bold uppercase">{s.buyer}</p>
                    </td>
                    <td className="p-3 border-r border-black/5 text-right font-black bg-blue-50/20">TK {s.totalIndent.toLocaleString()}</td>
                    <td className="p-3 border-r border-black/5 text-right font-bold text-green-700">TK {(s.paid || 0).toLocaleString()}</td>
                    <td className={`p-3 border-r border-black/5 text-right font-black ${due > 0.01 ? 'text-red-600 bg-red-50/20' : 'text-green-600 bg-green-50/20'}`}>TK {due.toLocaleString()}</td>
                    <td className="p-3 text-center no-print">
                      <div className="flex justify-center gap-1.5">
                        <button onClick={() => setEditingShipment(s)} className="p-1.5 rounded bg-blue-100 text-blue-900 border border-blue-200 hover:bg-blue-200"><Edit2 size={11}/></button>
                        <button onClick={() => handleDelete(s.id, s.invoiceNo)} className="p-1.5 rounded bg-red-100 text-red-900 border border-red-200 hover:bg-red-200"><Trash2 size={11}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-20 text-center opacity-30 text-xs font-black uppercase tracking-[0.4em]">Standby: No Ledger Data Matched</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="classic-footer text-[9px] font-bold">
           <span>DB STATUS: ONLINE</span>
           <span className="text-blue-900 uppercase">Total entries: {shipments.length}</span>
        </div>
      </div>

      {editingShipment && (
        <EditModal 
          shipment={editingShipment} 
          onClose={() => setEditingShipment(null)} 
          onSave={(updated) => {
            setShipments(prev => prev.map(s => s.id === updated.id ? updated : s));
            setEditingShipment(null);
          }}
          shippers={shippers}
          buyers={buyers}
          depots={depots}
          prices={prices}
        />
      )}

      <style>{`
        @media print {
          .no-print, header, aside, .classic-info-bar, .classic-title-bar button { display: none !important; }
          body { background: white !important; overflow: visible !important; }
          .classic-window { border: none !important; box-shadow: none !important; }
          .classic-body { border: 1px solid black !important; overflow: visible !important; }
          table { width: 100% !important; }
          main { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};

const EditModal = ({ shipment, onClose, onSave, shippers, buyers, depots, prices }: any) => {
  const [form, setForm] = useState<Shipment>({ ...shipment });

  const resolveRate = (category: 'DOC' | 'CTN' | 'TON' | 'UNLOAD' | 'CON', defaultRate: number) => {
    const match = (prices || []).find((p: PriceRate) => {
      const cond = (p.condition || '').toUpperCase();
      if (!cond) return false;
      return (
        (form.buyer || '').toUpperCase().includes(cond) ||
        (form.shipper || '').toUpperCase().includes(cond) ||
        (form.depot || '').toUpperCase().includes(cond)
      );
    });
    return match && match.category === category ? match.rate : defaultRate;
  };

  useEffect(() => {
    // Shared Billing Logic (Matching EmployeeEntry)
    let baseDocRate = 485;
    let officeIncomeRate = 80;
    
    if (form.buyer === 'H&M') {
      baseDocRate = 220;
      officeIncomeRate = 75;
    } else if (form.buyer === 'H&M SEA AIR') {
      baseDocRate = 270;
      officeIncomeRate = 75;
    }

    const assocRate = 85;
    
    // Dynamic Resolution
    const resolvedDocRate = resolveRate('DOC', baseDocRate);
    const resolvedCtnRate = resolveRate('CTN', 3);
    const resolvedTonRate = resolveRate('TON', 249);

    let unloadR = 150;
    if (form.shipper === 'CONFIDENCE KNIT WEAR LTD' && (form.buyer === 'MATALON' || form.buyer === 'PRIMARK')) {
      unloadR = 300;
    }
    const resolvedUnloadRate = resolveRate('UNLOAD', unloadR);

    let conR = 150;
    if (['KDS', 'SAVER', 'NAMSUN'].includes(form.depot || '')) {
      conR = 200;
    }
    const resolvedConRate = resolveRate('CON', conR);

    const docQty = Number(form.docQty || 0);
    const ctnQty = Number(form.ctnQty || 0);
    const tonQty = Number(form.tonQty || 0);
    const unloadQty = Number(form.unloadQty || 0);
    const conQty = Number(form.conQty || 0);
    const other = Number(form.otherAmt || 0);

    const depotIndent = (docQty * resolvedDocRate) + (ctnQty * resolvedCtnRate) + (tonQty * resolvedTonRate) + (unloadQty * resolvedUnloadRate) + (conQty * resolvedConRate) + other;
    const assocFee = docQty * assocRate;
    const officeIncome = docQty * officeIncomeRate;
    const total = depotIndent + assocFee + officeIncome;

    setForm(prev => ({ ...prev, totalIndent: total }));
  }, [form.docQty, form.ctnQty, form.tonQty, form.unloadQty, form.conQty, form.otherAmt, form.buyer, form.shipper, form.depot, prices]);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setForm(p => ({ ...p, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="classic-window w-full max-w-3xl animate-zoomIn">
        <div className="classic-title-bar !bg-blue-900 py-2">
          <div className="flex items-center gap-2"><Calculator size={14}/><span>EDIT SHIPMENT TERMINAL: {shipment.invoiceNo}</span></div>
          <button onClick={onClose}><X size={18}/></button>
        </div>
        <div className="classic-body p-6 grid grid-cols-2 gap-4 bg-white">
          <Field label="DATE" type="date" name="date" value={form.date} onChange={handleChange} />
          <Field label="INVOICE NO" name="invoiceNo" value={form.invoiceNo} onChange={handleChange} isBold />
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500">SHIPPER</label>
            <select name="shipper" value={form.shipper} onChange={handleChange} className="classic-input w-full font-bold">
              {shippers.map((s:any) => <option key={s.id} value={s.name}>{s.name.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-gray-500">BUYER</label>
            <select name="buyer" value={form.buyer} onChange={handleChange} className="classic-input w-full font-bold">
              {buyers.map((b:any) => <option key={b.id} value={b.name}>{b.name.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="col-span-full border-t border-black/10 pt-4 grid grid-cols-4 gap-4">
             <Field label="DOC QTY" type="number" name="docQty" value={form.docQty} onChange={handleChange} />
             <Field label="UNLOAD QTY" type="number" name="unloadQty" value={form.unloadQty} onChange={handleChange} />
             <Field label="PAID AMT" type="number" name="paid" value={form.paid} onChange={handleChange} />
             <Field label="CON QTY" type="number" name="conQty" value={form.conQty} onChange={handleChange} />
          </div>
          <div className="col-span-full bg-blue-900 text-white p-6 rounded text-center shadow-inner mt-4 border-2 border-white/10">
             <p className="text-[10px] font-black opacity-60 uppercase mb-1">RECALCULATED TOTAL INDENT</p>
             <p className="text-4xl font-black font-mono">TK {form.totalIndent.toLocaleString()}</p>
          </div>
        </div>
        <div className="classic-footer flex justify-end gap-2 p-3 bg-gray-200">
           <button onClick={onClose} className="classic-btn px-6 py-2 bg-white">ABORT</button>
           <button onClick={() => onSave(form)} className="classic-btn bg-blue-900 text-white px-10 py-2 border-blue-950 font-black">UPDATE LEDGER</button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, type = "text", name, value, onChange, isBold }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase text-gray-500">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} className={`classic-input w-full ${isBold ? 'font-black' : 'font-bold'}`} />
  </div>
);

export default LiveSheet;
