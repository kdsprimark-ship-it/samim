
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Edit2, Trash2, Printer, FileText, X, Calculator, Calendar, Filter 
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
  shipments, setShipments, shippers, buyers, employees, depots, swalSize, prices 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  const filtered = useMemo(() => {
    return shipments.filter(s => 
      s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.shipper.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [shipments, searchTerm]);

  const handleDelete = (id: string, inv: string) => {
    Swal.fire({ title: 'DELETE RECORD?', text: `Invoice: ${inv}`, icon: 'warning', showCancelButton: true, confirmButtonText: 'DELETE', width: swalSize, customClass: { popup: 'classic-swal' } }).then(res => {
      if (res.isConfirmed) setShipments(p => p.filter(x => x.id !== id));
    });
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-20">
      <div className="classic-info-bar rounded grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative col-span-2">
           <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-900" size={14} />
           <input type="text" placeholder="Global Search Invoice / Shipper..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="classic-input pl-8 w-full h-10" />
        </div>
        <div className="col-span-1"></div>
        <button onClick={() => window.print()} className="classic-btn border-black/20 h-10 flex items-center justify-center gap-2">
          <Printer size={16}/> PRINT EXPORT LEDGER
        </button>
      </div>

      <div className="classic-window">
        <div className="classic-title-bar flex justify-between">
          <div className="flex items-center gap-2"><FileText size={12}/><span>EXPORT LEDGER TERMINAL</span></div>
          <span className="text-[9px] font-black uppercase">TOTAL VALUE: TK {filtered.reduce((a, b) => a + (b.totalIndent || 0), 0).toLocaleString()}</span>
        </div>
        <div className="classic-body overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-300 text-[10px] font-black uppercase border-b border-black">
                <th className="p-3 border-r border-black/10">DATE</th>
                <th className="p-3 border-r border-black/10">INVOICE NO</th>
                <th className="p-3 border-r border-black/10">SHIPPER</th>
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
                  <tr key={s.id} className="border-b border-black/5 hover:bg-blue-50 text-[11px] font-mono group">
                    <td className="p-3 border-r border-black/5">{s.date}</td>
                    <td className="p-3 border-r border-black/5 font-black text-blue-900 uppercase">{s.invoiceNo}</td>
                    <td className="p-3 border-r border-black/5 truncate max-w-[200px] uppercase font-bold text-gray-500">{s.shipper}</td>
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
            </tbody>
          </table>
        </div>
      </div>

      {editingShipment && (
        <EditModal 
          shipment={editingShipment} 
          onClose={() => setEditingShipment(null)} 
          onSave={(updated) => { setShipments(prev => prev.map(s => s.id === updated.id ? updated : s)); setEditingShipment(null); }}
          shippers={shippers} buyers={buyers} depots={depots}
        />
      )}
    </div>
  );
};

const EditModal = ({ shipment, onClose, onSave, shippers, buyers, depots }: any) => {
  const [form, setForm] = useState<Shipment>({ ...shipment });
  
  useEffect(() => {
    // Exact logic from EmployeeEntry
    const buyerStr = (form.buyer || '').toUpperCase();
    const shipperStr = (form.shipper || '').toUpperCase();
    const depotStr = (form.depot || '').toUpperCase();

    let docR = 485;
    if (buyerStr.includes('H&M') && buyerStr.includes('SEA AIR')) docR = 270;
    else if (buyerStr.includes('H&M')) docR = 220;

    let unloadR = 150;
    if (shipperStr.includes('CONFIDENCE') && (buyerStr.includes('MATALON') || buyerStr.includes('PRIMARK'))) unloadR = 300;

    let conR = 150;
    if (['KDS', 'SAVER', 'NAMSUN'].some(d => depotStr.includes(d))) conR = 200;

    const officeR = buyerStr.includes('H&M') ? 75 : 80;
    const dQ = Number(form.docQty || 0);
    const depotIndent = (dQ * docR) + (Number(form.ctnQty || 0) * 3) + (Number(form.tonQty || 0) * 249) + (Number(form.unloadQty || 0) * unloadR) + (Number(form.conQty || 0) * conR) + Number(form.otherAmt || 0);
    const assocFee = dQ * 85;
    const officeIncome = dQ * officeR;
    setForm(prev => ({ ...prev, totalIndent: depotIndent + assocFee + officeIncome }));
  }, [form.docQty, form.ctnQty, form.tonQty, form.unloadQty, form.conQty, form.otherAmt, form.buyer, form.shipper, form.depot]);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setForm(p => ({ ...p, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <div className="classic-window w-full max-w-2xl">
        <div className="classic-title-bar !bg-blue-900 py-3 px-4 flex justify-between">
          <div className="flex items-center gap-2"><Calculator size={14}/><span>AMEND SHIPMENT RECORD</span></div>
          <button onClick={onClose}><X size={18}/></button>
        </div>
        <div className="classic-body p-6 grid grid-cols-2 gap-4 bg-white">
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400">INVOICE NO</label><input name="invoiceNo" value={form.invoiceNo} onChange={handleChange} className="classic-input w-full font-black text-blue-900 h-10 uppercase" /></div>
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400">DOC QTY</label><input type="number" name="docQty" value={form.docQty} onChange={handleChange} className="classic-input w-full font-black h-10 text-center" /></div>
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400">UNLOAD QTY</label><input type="number" name="unloadQty" value={form.unloadQty} onChange={handleChange} className="classic-input w-full font-black h-10 text-center" /></div>
          <div className="space-y-1"><label className="text-[10px] font-black uppercase text-gray-400">PAID AM (TK)</label><input type="number" name="paid" value={form.paid} onChange={handleChange} className="classic-input w-full font-black h-10 text-center bg-green-50" /></div>
          <div className="col-span-full bg-blue-900 text-white p-6 rounded text-center mt-4">
             <p className="text-[10px] font-black opacity-60 uppercase mb-1">TOTAL RE-CALCULATED INDENT</p>
             <p className="text-3xl font-black font-mono">TK {form.totalIndent.toLocaleString()}</p>
          </div>
        </div>
        <div className="classic-footer flex justify-end gap-2 p-3 bg-gray-200">
           <button onClick={onClose} className="classic-btn px-6 py-2 bg-white">CANCEL</button>
           <button onClick={() => onSave(form)} className="classic-btn bg-blue-900 text-white px-10 py-2 font-black">UPDATE LEDGER</button>
        </div>
      </div>
    </div>
  );
};

export default LiveSheet;
