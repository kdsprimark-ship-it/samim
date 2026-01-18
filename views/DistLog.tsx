
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Download, 
  Filter,
  ArrowUpDown
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Shipment, ListData } from '../types';

interface DistLogProps {
  shipments: Shipment[];
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
  lists: ListData;
  submittedInvoices: string[];
}

const DistLog: React.FC<DistLogProps> = ({ shipments, setShipments, lists, submittedInvoices }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);

  // Filter Logic
  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const searchStr = `${s.invoiceNo} ${s.shipper} ${s.buyer} ${s.employeeName} ${s.date}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    });
  }, [shipments, searchTerm]);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Permanent removal of shipment record!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Confirm Delete',
      background: document.documentElement.classList.contains('dark') ? '#1a202c' : '#ffffff',
      color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#4a5568',
    });

    if (result.isConfirmed) {
      setShipments(prev => prev.filter(s => s.id !== id));
      Swal.fire({
        title: 'Removed!',
        icon: 'success',
        timer: 1000,
        showConfirmButton: false,
        background: document.documentElement.classList.contains('dark') ? '#1a202c' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#4a5568',
      });
    }
  };

  const handleEdit = (s: Shipment) => {
    setEditingShipment(s);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <button 
          onClick={() => { setEditingShipment(null); setIsModalOpen(true); }}
          className="btn-neon px-8 py-4 rounded-2xl text-white font-bold flex items-center gap-3 shadow-lg"
        >
          <Plus size={24} /> NEW ENTRY
        </button>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter Invoice, Employee, Client..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 neu-inset bg-transparent border-none rounded-2xl focus:ring-2 focus:ring-blue-500/30 outline-none text-sm font-medium transition-all"
            />
          </div>
          <button className="p-4 neu-panel hover:neu-inset transition-all text-blue-500" title="Export CSV">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="neu-panel overflow-hidden">
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900/80 text-[10px] uppercase font-bold text-gray-500 tracking-widest border-b border-gray-200 dark:border-gray-800">
                <th className="p-5">Date</th>
                <th className="p-5">Invoice No</th>
                <th className="p-5">Staff</th>
                <th className="p-5">Client (Shipper)</th>
                <th className="p-5">Buyer</th>
                <th className="p-5 text-right">Total Bill</th>
                <th className="p-5 text-right">Collected</th>
                <th className="p-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredShipments.map(s => {
                const isSubmitted = submittedInvoices.includes(s.invoiceNo.toUpperCase());
                // Recalculate billing display on the fly to ensure accuracy
                const displayTotal = Number(s.totalIndent || 0) + (Number(s.docQty || 0) * 165);
                
                return (
                  <tr key={s.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors text-sm">
                    <td className="p-5 font-mono text-xs opacity-60 whitespace-nowrap">{s.date}</td>
                    <td className={`p-5 font-bold whitespace-nowrap tracking-tight ${isSubmitted ? 'text-red-500' : 'text-blue-600'}`}>
                      <div className="flex flex-col">
                        <span>{s.invoiceNo}</span>
                        {isSubmitted && <span className="text-[8px] uppercase tracking-tighter opacity-70 font-black">SUBMITTED (RED)</span>}
                      </div>
                    </td>
                    <td className="p-5 font-bold text-purple-600/80 whitespace-nowrap">{s.employeeName}</td>
                    <td className="p-5 max-w-[200px] truncate font-medium">{s.shipper}</td>
                    <td className="p-5 max-w-[150px] truncate opacity-80">{s.buyer}</td>
                    <td className="p-5 text-right font-bold text-blue-500">TK {displayTotal.toLocaleString()}</td>
                    <td className="p-5 text-right font-bold text-green-500">TK {(s.paid || 0).toLocaleString()}</td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(s)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredShipments.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-24 text-center text-gray-400 italic font-medium">No logistics records found for current criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Integration */}
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
    invoiceNo: '',
    employeeName: '',
    shipper: '',
    buyer: '',
    depot: '',
    docQty: 0,
    ctnQty: 0,
    tonQty: 0,
    unloadQty: 0,
    conQty: 0,
    otherAmt: 0,
    remarks: '',
    totalIndent: 0,
    paid: 0
  });

  const rDoc = 165; // Global Doc Fee fixed to 165 TK

  const calculateTotal = (data: Partial<Shipment>) => {
    // Note: totalIndent stores the dynamic operations amount.
    // Doc Fee (Qty * 165) is added visually and in accounting views.
    const rCtn = 3;
    const rTon = 249;
    const rUnload = 150;
    const rCon = 200;

    return (
      (Number(data.ctnQty || 0) * rCtn) +
      (Number(data.tonQty || 0) * rTon) +
      (Number(data.unloadQty || 0) * rUnload) +
      (Number(data.conQty || 0) * rCon) +
      Number(data.otherAmt || 0)
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: val };
      if (['ctnQty', 'tonQty', 'unloadQty', 'conQty', 'otherAmt'].includes(name)) {
        newData.totalIndent = calculateTotal(newData);
      }
      return newData;
    });
  };

  const currentDisplayTotal = (Number(formData.totalIndent || 0)) + (Number(formData.docQty || 0) * rDoc);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto neu-panel p-10 bg-[var(--bg-color)] shadow-[0_0_100px_rgba(0,0,0,0.3)] border-2 border-white/20">
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
          <h3 className="text-2xl font-black text-blue-600 tracking-tight">
            {initialData ? 'REFINE SHIPMENT RECORD' : 'CREATE NEW SHIPMENT'}
          </h3>
          <button onClick={onClose} className="p-3 neu-panel text-red-500 font-black text-2xl hover:neu-inset transition-all">&times;</button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Job Date" name="date" type="date" value={formData.date} onChange={handleChange} required />
              <Input label="Invoice No" name="invoiceNo" value={formData.invoiceNo} onChange={handleChange} placeholder="SUN-XXXX" required />
            </div>
            <Select label="Assign Staff" name="employeeName" value={formData.employeeName} onChange={handleChange} options={lists.staff} required />
            <div className="bg-blue-500/5 dark:bg-blue-500/10 p-6 rounded-[30px] border border-blue-500/20 space-y-5">
              <Select label="Shipper (Client)" name="shipper" value={formData.shipper} onChange={handleChange} options={lists.shipper} />
              <Select label="Buyer Entity" name="buyer" value={formData.buyer} onChange={handleChange} options={lists.buyer} />
              <Select label="Offdock (Depot)" name="depot" value={formData.depot} onChange={handleChange} options={lists.depot} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Input label="DOC Qty (165TK)" name="docQty" type="number" value={formData.docQty} onChange={handleChange} />
              <Input label="CTN Qty" name="ctnQty" type="number" value={formData.ctnQty} onChange={handleChange} />
              <Input label="TON Qty" name="tonQty" type="number" value={formData.tonQty} onChange={handleChange} />
              <Input label="Unload" name="unloadQty" type="number" value={formData.unloadQty} onChange={handleChange} />
              <Input label="Con" name="conQty" type="number" value={formData.conQty} onChange={handleChange} />
              <Input label="Misc." name="otherAmt" type="number" value={formData.otherAmt} onChange={handleChange} />
            </div>
            <Input label="Special Instructions / Remarks" name="remarks" value={formData.remarks} onChange={handleChange} />
            
            <div className="neu-panel p-8 space-y-4 mt-4 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-blue-500/20">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Grand Total Bill</span>
                <span className="text-3xl font-orbitron font-bold text-blue-600">TK {currentDisplayTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Paid Collection</span>
                <input 
                  type="number" 
                  name="paid" 
                  value={formData.paid} 
                  onChange={handleChange} 
                  className="w-40 bg-transparent text-right font-orbitron font-bold text-2xl text-green-600 outline-none border-b-2 border-green-500/30 focus:border-green-500"
                />
              </div>
            </div>
            <button type="submit" className="w-full btn-neon py-5 rounded-[25px] text-white font-black text-xl shadow-2xl tracking-widest">
              FINALIZE & SAVE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Input = ({ label, ...props }: any) => (
  <div className="space-y-1 group">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 group-focus-within:text-blue-500 transition-colors">{label}</label>
    <input 
      className="w-full p-4 neu-inset bg-transparent border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium transition-all" 
      {...props} 
    />
  </div>
);

const Select = ({ label, options, ...props }: any) => (
  <div className="space-y-1 group">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 group-focus-within:text-blue-500 transition-colors">{label}</label>
    <select 
      className="w-full p-4 neu-inset bg-transparent border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium appearance-none transition-all cursor-pointer" 
      {...props}
    >
      <option value="">Choose {label}...</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default DistLog;
