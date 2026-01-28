
import React, { useState, useMemo } from 'react';
// Added ShoppingCart to the lucide-react imports to fix the "Cannot find name 'ShoppingCart'" error
import { DollarSign, Search, FileCheck, Edit2, Trash2, Calendar, Hash, User, Calculator, ShoppingCart } from 'lucide-react';
import { Shipment, ListData } from '../types';
import Swal from 'sweetalert2';

interface SellViewProps {
  shipments: Shipment[];
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
  submittedInvoices: string[];
  setSubmittedInvoices: React.Dispatch<React.SetStateAction<string[]>>;
  lists: ListData;
  swalSize: number;
}

const SellView: React.FC<SellViewProps> = ({ shipments, setShipments, submittedInvoices, setSubmittedInvoices, lists, swalSize }) => {
  const [invoiceInput, setInvoiceInput] = useState('');
  
  const invoiceMatch = useMemo(() => {
    if (!invoiceInput) return null;
    return shipments.find(s => s.invoiceNo.toUpperCase() === invoiceInput.toUpperCase());
  }, [invoiceInput, shipments]);

  const handleSubmission = async () => {
    if (!invoiceMatch) return;
    
    const { value: amt } = await Swal.fire({
      title: 'BILL SUBMISSION',
      input: 'number',
      inputLabel: `POST PAYMENT FOR INV: ${invoiceMatch.invoiceNo}`,
      inputPlaceholder: 'Enter Amount...',
      showCancelButton: true,
      confirmButtonText: 'SUBMIT PAYMENT',
      width: swalSize,
      customClass: { popup: 'classic-swal' }
    });

    if (amt && parseFloat(amt) > 0) {
      const amount = parseFloat(amt);
      setShipments(prev => prev.map(s => {
        if (s.invoiceNo === invoiceMatch.invoiceNo) {
          return { ...s, paid: (Number(s.paid || 0) + amount) };
        }
        return s;
      }));
      setInvoiceInput('');
      Swal.fire('Success', 'Payment Logged', 'success');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="classic-window">
        <div className="classic-title-bar !bg-blue-900">
          <div className="flex items-center gap-2">
            <DollarSign size={12}/>
            <span>BILL SUBMISSION TERMINAL</span>
          </div>
        </div>
        <div className="classic-body p-8 space-y-6 bg-white/50">
           <div className="max-w-xl mx-auto space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-900 uppercase">ENTER INVOICE NUMBER</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={20}/>
                  <input 
                    value={invoiceInput}
                    onChange={e => setInvoiceInput(e.target.value.toUpperCase())}
                    className="classic-input w-full pl-10 h-16 font-black text-2xl tracking-tighter uppercase border-blue-800"
                    placeholder="INV-XXXXX..."
                  />
                </div>
              </div>

              {invoiceMatch ? (
                <div className="classic-window animate-fadeIn neon-btn-blue bg-white">
                   <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <InfoItem label="OPERATOR" value={invoiceMatch.employeeName} icon={<User size={12}/>}/>
                         <InfoItem label="BUYER" value={invoiceMatch.buyer} icon={<ShoppingCart size={12}/>}/>
                         <InfoItem label="TOTAL BILL" value={`TK ${invoiceMatch.totalIndent.toLocaleString()}`} icon={<Calculator size={12}/>}/>
                         <InfoItem label="PAID AMT" value={`TK ${(invoiceMatch.paid || 0).toLocaleString()}`} icon={<FileCheck size={12}/>}/>
                      </div>
                      <div className="classic-inset p-4 bg-red-50 text-center border-red-200">
                         <p className="text-[10px] font-black text-red-800 uppercase">DUE BALANCE</p>
                         <p className="text-3xl font-black font-mono text-red-600">TK {(invoiceMatch.totalIndent - (invoiceMatch.paid || 0)).toLocaleString()}</p>
                      </div>
                      <button onClick={handleSubmission} className="classic-btn w-full py-4 neon-btn-green bg-green-900 text-white font-black text-lg">
                        POST BILL SUBMISSION
                      </button>
                   </div>
                </div>
              ) : invoiceInput && (
                <div className="p-10 text-center bg-red-50 border border-dashed border-red-200 text-red-700 font-black uppercase text-xs">
                  Invoice No not found in system database
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="classic-window">
        <div className="classic-title-bar"><span>RECENT BILLING ACTIVITY</span></div>
        <div className="classic-body overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200 text-[10px] font-black uppercase border-b border-black">
                <th className="p-3 border-r border-black/10">DATE</th>
                <th className="p-3 border-r border-black/10">INVOICE</th>
                <th className="p-3 border-r border-black/10 text-right">TOTAL</th>
                <th className="p-3 border-r border-black/10 text-right">PAID</th>
                <th className="p-3 border-r border-black/10 text-right">DUE</th>
                <th className="p-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {shipments.filter(s => s.paid > 0).slice(0, 15).map(s => (
                <tr key={s.id} className="border-b border-black/5 hover:bg-gray-50 text-[11px] font-mono">
                  <td className="p-3 border-r border-black/5">{s.date}</td>
                  <td className="p-3 border-r border-black/5 font-black text-blue-900">{s.invoiceNo}</td>
                  <td className="p-3 border-r border-black/5 text-right font-bold">{s.totalIndent.toLocaleString()}</td>
                  <td className="p-3 border-r border-black/5 text-right text-green-700 font-bold">{s.paid.toLocaleString()}</td>
                  <td className="p-3 border-r border-black/5 text-right text-red-600 font-black">{(s.totalIndent - s.paid).toLocaleString()}</td>
                  <td className="p-3 text-center flex justify-center gap-2">
                    <button className="neon-btn-blue p-1"><Edit2 size={12}/></button>
                    <button className="neon-btn-red p-1"><Trash2 size={12}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, icon }: any) => (
  <div className="space-y-1">
    <p className="text-[8px] font-bold text-gray-400 uppercase flex items-center gap-1">{icon} {label}</p>
    <p className="text-xs font-black truncate">{value}</p>
  </div>
);

export default SellView;
