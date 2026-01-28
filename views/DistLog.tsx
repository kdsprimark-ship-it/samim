
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X,
  Printer,
  Search as SearchIcon,
  FileText
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Shipment, ListData } from '../types';

interface DistLogProps {
  shipments: Shipment[];
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
  lists: ListData;
  submittedInvoices: string[];
  swalSize: number;
}

const DistLog: React.FC<DistLogProps> = ({ shipments, setShipments, lists, submittedInvoices, swalSize }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const searchStr = `${s.invoiceNo} ${s.shipper} ${s.buyer} ${s.exporterName} ${s.employeeName || ''}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [shipments, searchTerm]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'CONFIRM DELETE?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'YES, DELETE',
      width: swalSize,
      customClass: { popup: 'classic-swal' }
    });
    if (result.isConfirmed) setShipments(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="classic-info-bar rounded">
        <button 
          onClick={() => { setEditingShipment(null); setIsModalOpen(true); }}
          className="classic-btn flex items-center gap-2"
        >
          <Plus size={14} /> F1-NEW ENTRY
        </button>
        <div className="flex-1"></div>
        <div className="relative">
          <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
          <input 
            type="text" 
            placeholder="Search Record..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="classic-input pl-8 w-60"
          />
        </div>
      </div>

      <div className="classic-window">
        <div className="classic-title-bar">
          <span>SHIPMENT DATABASE LOG [RECORDS: {shipments.length}]</span>
          <div className="flex gap-1">
            <button className="classic-btn p-0 px-1">_</button>
            <button className="classic-btn p-0 px-1">X</button>
          </div>
        </div>
        <div className="classic-body overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-300 text-[10px] font-bold border-b border-black">
                <th className="p-2 border-r border-black/10">DATE</th>
                <th className="p-2 border-r border-black/10">INVOICE NO</th>
                <th className="p-2 border-r border-black/10">SHIPPER</th>
                <th className="p-2 text-right">BILL (TK)</th>
                <th className="p-2 text-center">CMD</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredShipments.map(s => (
                <tr key={s.id} className="hover:bg-blue-100 border-b border-black/5 text-[11px] font-mono">
                  <td className="p-2 border-r border-black/5">{s.date}</td>
                  <td className="p-2 border-r border-black/5 font-bold text-blue-900">{s.invoiceNo}</td>
                  <td className="p-2 border-r border-black/5">{s.shipper}</td>
                  <td className="p-2 text-right font-bold">{s.totalIndent.toLocaleString()}</td>
                  <td className="p-2">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setEditingShipment(s); setIsModalOpen(true); }} className="classic-btn p-1"><Edit3 size={10} /></button>
                      <button onClick={() => handleDelete(s.id)} className="classic-btn p-1 text-red-700"><Trash2 size={10} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="classic-footer text-[9px] font-bold">
           <span>DB STATUS: ONLINE</span>
           <span>LOGISTICS ENGINE V5.1</span>
        </div>
      </div>

      {isModalOpen && (
        <ShipmentModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={(data: any) => {
            if (editingShipment) {
              setShipments(prev => prev.map(s => s.id === editingShipment.id ? { ...data, id: s.id } : s));
            } else {
              setShipments(prev => [{ ...data, id: Date.now().toString() }, ...prev]);
            }
            setIsModalOpen(false);
          }}
          initialData={editingShipment || undefined}
          lists={lists}
        />
      )}
    </div>
  );
};

const ShipmentModal = ({ onClose, onSubmit, initialData, lists }: any) => {
  const [formData, setFormData] = useState<Partial<Shipment>>(initialData || {
    date: new Date().toISOString().split('T')[0],
    invoiceNo: '', shipper: lists.shipper[0] || '', buyer: lists.buyer[0] || '', depot: lists.depot[0] || '',
    docQty: 0, ctnQty: 0, tonQty: 0, unloadQty: 0, conQty: 0, otherAmt: 0, totalIndent: 0, remarks: ''
  });

  useEffect(() => {
    // Shared billing engine logic
    let docR = 485;
    if (formData.buyer === 'H&M') docR = 220;
    else if (formData.buyer === 'H&M SEA AIR') docR = 270;

    let unloadR = 150;
    if (formData.shipper === 'CONFIDENCE KNIT WEAR LTD' && (formData.buyer === 'MATALON' || formData.buyer === 'PRIMARK')) {
      unloadR = 300;
    }

    let conR = 150;
    if (['KDS', 'SAVER', 'NAMSUN'].includes(formData.depot || '')) {
      conR = 200;
    }

    const total = 
      (Number(formData.docQty || 0) * docR) + 
      (Number(formData.ctnQty || 0) * 3) + 
      (Number(formData.tonQty || 0) * 249) + 
      (Number(formData.unloadQty || 0) * unloadR) + 
      (Number(formData.conQty || 0) * conR) + 
      Number(formData.otherAmt || 0);

    setFormData(prev => ({ ...prev, totalIndent: total }));
  }, [formData.docQty, formData.ctnQty, formData.tonQty, formData.unloadQty, formData.conQty, formData.otherAmt, formData.buyer, formData.shipper, formData.depot]);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="classic-window w-full max-w-3xl">
        <div className="classic-title-bar">
          <span>{initialData ? 'EDIT SHIPMENT RECORD' : 'NEW SHIPMENT ENTRY'}</span>
          <button onClick={onClose} className="classic-btn p-0 px-1">X</button>
        </div>
        <div className="classic-body p-6 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase">Date:</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="classic-input w-full" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase">Invoice No:</label>
            <input name="invoiceNo" value={formData.invoiceNo} onChange={handleChange} className="classic-input w-full" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase">Shipper:</label>
            <select name="shipper" value={formData.shipper} onChange={handleChange} className="classic-input w-full">
              {lists.shipper.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase">Buyer:</label>
            <select name="buyer" value={formData.buyer} onChange={handleChange} className="classic-input w-full">
              {lists.buyer.map((b: string) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase">Depot:</label>
            <select name="depot" value={formData.depot} onChange={handleChange} className="classic-input w-full">
              {lists.depot.map((d: string) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase">Doc Qty:</label>
            <input type="number" name="docQty" value={formData.docQty} onChange={handleChange} className="classic-input w-full" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase">Truck Unload:</label>
            <input type="number" name="unloadQty" value={formData.unloadQty} onChange={handleChange} className="classic-input w-full" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase">Remarks:</label>
            <input name="remarks" value={formData.remarks} onChange={handleChange} className="classic-input w-full" />
          </div>
          <div className="col-span-full classic-inset p-4 bg-white">
             <p className="text-[10px] font-bold text-gray-400">Total Calculated Indent:</p>
             <p className="text-2xl font-black font-mono">TK {formData.totalIndent?.toLocaleString()}</p>
          </div>
        </div>
        <div className="classic-footer flex justify-end gap-2 p-2">
           <button onClick={() => onSubmit(formData)} className="classic-btn px-6 py-1 font-bold">F10-SAVE</button>
           <button onClick={onClose} className="classic-btn px-6 py-1">ESC-CANCEL</button>
        </div>
      </div>
    </div>
  );
};

export default DistLog;
