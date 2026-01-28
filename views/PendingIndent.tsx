
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Search, 
  CheckCircle2, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  AlertCircle, 
  Calculator,
  User,
  Package,
  CheckCircle
} from 'lucide-react';
import { Shipment } from '../types';
import Swal from 'sweetalert2';

interface PendingIndentProps {
  shipments: Shipment[];
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
  swalSize: number;
}

const PendingIndent: React.FC<PendingIndentProps> = ({ shipments, setShipments, swalSize }) => {
  const [filter, setFilter] = useState('');
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  const pending = shipments.filter(s => (Number(s.totalIndent || 0) - Number(s.paid || 0)) > 0.01)
    .filter(s => s.invoiceNo.toLowerCase().includes(filter.toLowerCase()) || s.shipper.toLowerCase().includes(filter.toLowerCase()));

  const handleDelete = (id: string, inv: string) => {
    Swal.fire({
      title: 'ERASE PENDING RECORD?',
      text: `Deleting Invoice #${inv}. This action is irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'CONFIRM DELETE',
      confirmButtonColor: '#b91c1c',
      width: swalSize,
      customClass: { popup: 'classic-swal' }
    }).then(res => {
      if (res.isConfirmed) {
        setShipments(prev => prev.filter(s => s.id !== id));
        Swal.fire({ title: 'RECORD REMOVED', icon: 'success', timer: 1000, showConfirmButton: false });
      }
    });
  };

  const handleApprove = (id: string, inv: string, due: number) => {
    Swal.fire({
      title: 'APPROVE & SETTLE?',
      text: `Marking Invoice #${inv} as FULLY PAID (TK ${due.toLocaleString()}).`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'APPROVE PAYMENT',
      confirmButtonColor: '#15803d',
      width: swalSize,
      customClass: { popup: 'classic-swal' }
    }).then(res => {
      if (res.isConfirmed) {
        setShipments(prev => prev.map(s => {
          if (s.id === id) {
            return { ...s, paid: Number(s.totalIndent) };
          }
          return s;
        }));
        Swal.fire({ title: 'SETTLED', icon: 'success', timer: 1000, showConfirmButton: false });
      }
    });
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-20">
      <div className="classic-info-bar rounded bg-red-50 border-red-200 shadow-sm">
        <div className="flex items-center gap-2 text-red-800 font-black text-xs uppercase">
          <Clock size={16} /> OUTSTANDING INDENT ACTION CENTER
        </div>
        <div className="flex-1"></div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="Search INV / Shipper..." 
            value={filter} 
            onChange={e => setFilter(e.target.value)} 
            className="classic-input pl-8 w-64 h-10 font-bold border-red-200" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pending.map(s => {
          const due = Number(s.totalIndent || 0) - Number(s.paid || 0);
          return (
            <div key={s.id} className="classic-window border-red-800 shadow-lg group hover:border-blue-900 transition-all">
              <div className="classic-title-bar !bg-red-800 group-hover:!bg-blue-900 transition-colors flex justify-between">
                <div className="flex items-center gap-2">
                   <AlertCircle size={10}/>
                   <span>INV: {s.invoiceNo}</span>
                </div>
                <span className="font-mono text-[9px] opacity-70">{s.date}</span>
              </div>
              
              <div className="classic-body p-4 space-y-4 bg-white">
                <div className="flex justify-between items-start border-b border-black/5 pb-2">
                   <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">SHIPPER ENTITY</p>
                      <p className="text-xs font-black truncate max-w-[180px] uppercase text-blue-900">{s.shipper}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">OPERATOR</p>
                      <p className="text-[10px] font-bold text-gray-600">{s.employeeName}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                   <div className="bg-gray-50 p-2 border border-black/5 rounded">
                      <p className="text-[8px] font-bold text-gray-400 uppercase">GROSS BILL</p>
                      <p className="font-mono font-black text-xs">TK {s.totalIndent.toLocaleString()}</p>
                   </div>
                   <div className="bg-green-50 p-2 border border-green-100 rounded">
                      <p className="text-[8px] font-bold text-green-700 uppercase">COLLECTED</p>
                      <p className="font-mono font-black text-xs text-green-800">TK {(s.paid || 0).toLocaleString()}</p>
                   </div>
                </div>

                <div className="p-3 bg-red-50 border-2 border-red-200 text-center rounded relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
                   <p className="text-[10px] font-black text-red-800 tracking-[0.2em] uppercase mb-1">OUTSTANDING BALANCE</p>
                   <p className="text-3xl font-black font-mono text-red-700 tracking-tighter">TK {due.toLocaleString()}</p>
                </div>

                {/* ACTION COMMANDS */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                   <button 
                    onClick={() => handleApprove(s.id, s.invoiceNo, due)}
                    className="classic-btn bg-green-700 text-white flex flex-col items-center justify-center py-2 border-green-900 hover:bg-green-600 transition-all"
                    title="Quick Approval"
                   >
                      <CheckCircle2 size={14}/>
                      <span className="text-[8px] mt-1">APPROVE</span>
                   </button>
                   <button 
                    onClick={() => setEditingShipment(s)}
                    className="classic-btn bg-blue-900 text-white flex flex-col items-center justify-center py-2 border-blue-950 hover:bg-blue-800 transition-all"
                    title="Edit Record"
                   >
                      <Edit2 size={14}/>
                      <span className="text-[8px] mt-1">EDIT</span>
                   </button>
                   <button 
                    onClick={() => handleDelete(s.id, s.invoiceNo)}
                    className="classic-btn bg-white text-red-700 flex flex-col items-center justify-center py-2 border-red-200 hover:bg-red-50 transition-all"
                    title="Delete Record"
                   >
                      <Trash2 size={14}/>
                      <span className="text-[8px] mt-1">DELETE</span>
                   </button>
                </div>
              </div>
            </div>
          );
        })}
        {pending.length === 0 && (
          <div className="col-span-full py-40 flex flex-col items-center justify-center opacity-20">
            <CheckCircle size={64} className="text-green-600" strokeWidth={1} />
            <p className="mt-4 font-black uppercase text-sm tracking-[0.5em] text-green-900">All Indents Are Balanced</p>
          </div>
        )}
      </div>

      {/* RE-USABLE EDIT MODAL */}
      {editingShipment && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 animate-fadeIn backdrop-blur-sm">
          <div className="classic-window w-full max-w-2xl shadow-2xl">
            <div className="classic-title-bar !bg-blue-900 py-3 px-4 flex justify-between">
              <div className="flex items-center gap-3">
                <Edit2 size={16}/>
                <span className="text-sm font-black uppercase tracking-widest">AMEND PENDING SHIPMENT</span>
              </div>
              <button onClick={() => setEditingShipment(null)} className="hover:text-red-400">
                <X size={20}/>
              </button>
            </div>
            <div className="classic-body bg-gray-50 p-6">
               <EditTerminal 
                  shipment={editingShipment} 
                  onClose={() => setEditingShipment(null)} 
                  onSave={(updated) => {
                    setShipments(prev => prev.map(s => s.id === updated.id ? updated : s));
                    setEditingShipment(null);
                    Swal.fire({ title: 'LEDGER UPDATED', icon: 'success', timer: 1000, showConfirmButton: false });
                  }}
               />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditTerminal = ({ shipment, onClose, onSave }: { shipment: Shipment, onClose: () => void, onSave: (s: Shipment) => void }) => {
  const [form, setForm] = useState<Shipment>({ ...shipment });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm(p => ({ ...p, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  useEffect(() => {
    // Re-calculate billing based on global rules
    let baseDocRate = 485;
    if (form.buyer?.includes('H&M')) baseDocRate = 220;
    if (form.buyer?.includes('H&M SEA AIR')) baseDocRate = 270;

    let unloadR = 150;
    if (form.shipper?.includes('CONFIDENCE') && (form.buyer?.includes('MATALON') || form.buyer?.includes('PRIMARK'))) {
      unloadR = 300;
    }

    let conR = 150;
    if (['KDS', 'SAVER', 'NAMSUN'].includes(form.depot || '')) conR = 200;

    const total = (Number(form.docQty) * baseDocRate) + (Number(form.ctnQty) * 3) + (Number(form.tonQty) * 249) + (Number(form.unloadQty) * unloadR) + (Number(form.conQty) * conR) + Number(form.otherAmt || 0);
    setForm(prev => ({ ...prev, totalIndent: total }));
  }, [form.docQty, form.ctnQty, form.tonQty, form.unloadQty, form.conQty, form.otherAmt, form.buyer, form.shipper, form.depot]);

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 uppercase">INVOICE NO</label>
             <input name="invoiceNo" value={form.invoiceNo} onChange={handleChange} className="classic-input w-full font-black text-blue-900 h-10 uppercase" />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 uppercase">OPERATOR NAME</label>
             <input name="employeeName" value={form.employeeName} onChange={handleChange} className="classic-input w-full font-bold h-10" />
          </div>
       </div>

       <div className="grid grid-cols-3 gap-4 border-y border-black/5 py-4">
          <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 uppercase">DOC QTY</label>
             <input type="number" name="docQty" value={form.docQty} onChange={handleChange} className="classic-input w-full font-black h-10 text-center bg-blue-50" />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 uppercase">UNLOAD QTY</label>
             <input type="number" name="unloadQty" value={form.unloadQty} onChange={handleChange} className="classic-input w-full font-black h-10 text-center bg-orange-50" />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 uppercase">ALREADY PAID (TK)</label>
             <input type="number" name="paid" value={form.paid} onChange={handleChange} className="classic-input w-full font-black h-10 text-center bg-green-50" />
          </div>
       </div>

       <div className="bg-blue-900 p-6 rounded shadow-inner text-center border-2 border-white/20">
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">RE-CALCULATED GROSS INDENT</p>
          <p className="text-4xl font-black font-mono text-white tracking-tighter">TK {form.totalIndent.toLocaleString()}</p>
       </div>

       <div className="flex gap-3 justify-end pt-2">
          <button onClick={onClose} className="classic-btn px-8 py-2.5 font-bold">ABORT</button>
          <button onClick={() => onSave(form)} className="classic-btn px-12 py-2.5 bg-blue-900 text-white border-blue-950 font-black flex items-center gap-2">
             <Save size={16}/> SAVE AMENDMENTS
          </button>
       </div>
    </div>
  );
};

export default PendingIndent;
