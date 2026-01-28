
import React, { useMemo, useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Search, 
  Calendar, 
  FileText,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Filter,
  ArrowRight,
  CheckCircle2,
  CheckCircle as CheckCircleIcon,
  Hash,
  FileCheck,
  Zap,
  MessageSquare,
  Layers
} from 'lucide-react';
import { Shipment } from '../types';
import Swal from 'sweetalert2';

interface AssociationInfoProps {
  shipments: Shipment[];
  setShipments?: React.Dispatch<React.SetStateAction<Shipment[]>>;
  swalSize?: number;
}

const AssociationInfo: React.FC<AssociationInfoProps> = ({ shipments, setShipments, swalSize }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [payInvoiceSearch, setPayInvoiceSearch] = useState('');
  
  // Local states for the Payment Terminal (Paid Box)
  const [payQnty, setPayQnty] = useState<number>(0);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payRemark, setPayRemark] = useState<string>('');

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const filteredData = useMemo(() => {
    return shipments.filter(s => {
      const matchSearch = s.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.shipper.toLowerCase().includes(searchTerm.toLowerCase());
      const shipDate = new Date(s.date);
      const shipMonth = months[shipDate.getMonth()];
      const matchMonth = selectedMonth === 'ALL' || shipMonth === selectedMonth;
      return matchSearch && matchMonth;
    });
  }, [shipments, searchTerm, selectedMonth]);

  // Find specifically paid association fees
  const paidAssociationFeesList = useMemo(() => {
    return shipments.filter(s => Number(s.associationPaid || 0) > 0);
  }, [shipments]);

  // Payment Terminal Match
  const payMatch = useMemo(() => {
    if (!payInvoiceSearch || payInvoiceSearch.length < 2) return null;
    return shipments.find(s => s.invoiceNo.toUpperCase() === payInvoiceSearch.toUpperCase());
  }, [payInvoiceSearch, shipments]);

  // Sync terminal values when match changes
  useEffect(() => {
    if (payMatch) {
      setPayQnty(payMatch.docQty || 0);
      setPayAmount((payMatch.docQty || 0) * 85);
      setPayRemark('');
    } else {
      setPayQnty(0);
      setPayAmount(0);
      setPayRemark('');
    }
  }, [payMatch]);

  // Auto-recalculate amount if user changes Qnty manually in the terminal
  const handleQntyChange = (val: number) => {
    setPayQnty(val);
    setPayAmount(val * 85);
  };

  const summary = useMemo(() => {
    return filteredData.reduce((acc, s) => {
      const q = Number(s.docQty || 0);
      const amt = q * 85;
      const paid = Number(s.associationPaid || 0);
      return {
        qty: acc.qty + q,
        amount: acc.amount + amt,
        paid: acc.paid + paid,
        due: acc.due + (amt - paid)
      };
    }, { qty: 0, amount: 0, paid: 0, due: 0 });
  }, [filteredData]);

  const handlePayFee = () => {
    if (!payMatch || !setShipments) return;
    
    if (payAmount <= 0) {
      Swal.fire({ title: 'ERROR', text: 'Amount must be greater than zero.', icon: 'error' });
      return;
    }

    Swal.fire({
      title: 'SUBMIT ASSOCIATION FEE',
      html: `
        <div class="text-left font-mono text-[11px] space-y-2">
           <p>INVOICE: <span class="text-blue-900 font-black">#${payMatch.invoiceNo}</span></p>
           <p>QNTY: <span class="font-black">${payQnty}</span></p>
           <p>AMOUNT: <span class="font-black text-green-700">TK ${payAmount.toLocaleString()}</span></p>
           <hr/>
           <p class="text-[9px] text-gray-400">Commit transaction to secure repository?</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'CONFIRM & POST',
      confirmButtonColor: '#166534',
      width: swalSize,
      customClass: { popup: 'classic-swal' }
    }).then(res => {
      if (res.isConfirmed) {
        setShipments(prev => prev.map(s => s.id === payMatch.id ? { 
          ...s, 
          associationPaid: (Number(s.associationPaid || 0) + payAmount),
          associationRemarks: payRemark || s.associationRemarks
        } : s));
        
        setPayInvoiceSearch('');
        Swal.fire({ title: 'FEE POSTED', icon: 'success', timer: 1500, showConfirmButton: false });
      }
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      
      {/* 1. PAID ASSOCIATION FEE REPOSITORY */}
      <div className="classic-window">
        <div className="classic-title-bar !bg-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={12}/>
            <span>PAID / SUBMITTED ASSOCIATION FEE REPOSITORY</span>
          </div>
        </div>
        <div className="classic-body p-4 bg-white/80 min-h-[100px] overflow-x-auto custom-scroll">
           <div className="flex flex-wrap gap-3">
              {paidAssociationFeesList.length > 0 ? paidAssociationFeesList.map(s => {
                const paidAmount = Number(s.associationPaid || 0);
                return (
                  <div 
                    key={s.id} 
                    className="group flex flex-col min-w-[220px] p-3 bg-white border-2 border-green-700 rounded shadow-sm hover:bg-green-50 cursor-pointer transition-all active:scale-95"
                    onClick={() => {
                      setSearchTerm(s.invoiceNo);
                      window.scrollTo({ top: 500, behavior: 'smooth' });
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[12px] font-black text-green-900 font-mono">#{s.invoiceNo}</span>
                      <CheckCircleIcon size={12} className="text-green-600"/>
                    </div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase truncate">{s.shipper}</span>
                    
                    <div className="mt-2 grid grid-cols-2 gap-2 border-t border-green-100 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-gray-400 uppercase">DOC QTY</span>
                        <span className="text-[11px] font-black text-blue-900">{s.docQty}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[8px] font-bold text-green-600 uppercase">PAID FEE</span>
                        <span className="text-[11px] font-black font-mono text-green-900">TK {paidAmount.toLocaleString()}</span>
                      </div>
                    </div>
                    {s.associationRemarks && (
                       <div className="mt-2 bg-green-50/50 p-1.5 border border-green-100 rounded">
                          <p className="text-[8px] italic text-gray-500 flex items-center gap-1"><MessageSquare size={8}/> {s.associationRemarks}</p>
                       </div>
                    )}
                  </div>
                );
              }) : (
                <div className="w-full flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">No paid fee records found in database</p>
                </div>
              )}
           </div>
        </div>
        <div className="classic-footer !bg-green-50 text-[9px] font-black text-green-800">
           <span>TOTAL COLLECTED EST: TK {Math.round(paidAssociationFeesList.reduce((acc, s) => acc + Number(s.associationPaid || 0), 0)).toLocaleString()}</span>
           <span>RECORDS: {paidAssociationFeesList.length}</span>
        </div>
      </div>

      {/* 2. ASSOCIATION FEE PAYMENT TERMINAL (PAID BOX) */}
      <div className="classic-window">
        <div className="classic-title-bar !bg-blue-900">
           <div className="flex items-center gap-2">
              <Zap size={12} className="text-yellow-400 fill-yellow-400"/>
              <span>ASSOCIATION FEE PAYMENT TERMINAL (PAID BOX)</span>
           </div>
        </div>
        <div className="classic-body p-6 bg-blue-50/10">
           <div className="max-w-4xl mx-auto space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-900 uppercase tracking-widest">SEARCH INVOICE TO INITIATE PAYMENT</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={24}/>
                  <input 
                    value={payInvoiceSearch}
                    onChange={e => setPayInvoiceSearch(e.target.value.toUpperCase())}
                    className="classic-input w-full pl-12 h-14 font-black text-2xl tracking-tighter uppercase border-blue-900 bg-white" 
                    placeholder="ENTER INVOICE NUMBER..."
                  />
                </div>
              </div>

              {payMatch ? (
                <div className="animate-fadeIn grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                   {/* Left: Info Card */}
                   <div className="lg:col-span-5 classic-window border-blue-800 bg-white shadow-xl">
                      <div className="classic-title-bar !bg-blue-950 py-1.5 flex justify-between">
                         <span>INVOICE: #{payMatch.invoiceNo}</span>
                      </div>
                      <div className="p-4 space-y-4">
                         <div className="space-y-1">
                            <p className="text-[8px] font-bold text-gray-400 uppercase">SHIPPER</p>
                            <p className="text-xs font-black truncate">{payMatch.shipper}</p>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-2 bg-gray-50 border border-black/5">
                               <p className="text-[8px] font-bold text-gray-400 uppercase">SYSTEM DOC QTY</p>
                               <p className="text-lg font-black">{payMatch.docQty}</p>
                            </div>
                            <div className="p-2 bg-blue-50 border border-blue-100">
                               <p className="text-[8px] font-bold text-blue-700 uppercase">TOTAL ESTIMATED FEE</p>
                               <p className="text-lg font-black font-mono">TK {(Number(payMatch.docQty || 0) * 85).toLocaleString()}</p>
                            </div>
                         </div>
                         <div className="classic-inset p-3 bg-red-50 border-red-200">
                            <p className="text-[9px] font-black text-red-800 uppercase tracking-widest text-center">OUTSTANDING FEE DUE</p>
                            <p className="text-2xl font-black font-mono text-red-700 text-center">TK {((Number(payMatch.docQty || 0) * 85) - Number(payMatch.associationPaid || 0)).toLocaleString()}</p>
                         </div>
                      </div>
                   </div>

                   {/* Right: Input Form */}
                   <div className="lg:col-span-7 classic-window border-green-700 bg-white shadow-xl">
                      <div className="classic-title-bar !bg-green-800 py-1.5 flex justify-between">
                         <span>FEE SUBMISSION FORM</span>
                      </div>
                      <div className="p-4 space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1"><Layers size={10}/> QNTY (DOCS)</label>
                               <input 
                                  type="number" 
                                  value={payQnty} 
                                  onChange={e => handleQntyChange(parseFloat(e.target.value) || 0)}
                                  className="classic-input w-full h-11 font-black text-xl text-center border-blue-200"
                               />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[10px] font-black text-green-800 uppercase flex items-center gap-1"><DollarSign size={10}/> PAID AMOUNT (TK)</label>
                               <input 
                                  type="number" 
                                  value={payAmount} 
                                  onChange={e => setPayAmount(parseFloat(e.target.value) || 0)}
                                  className="classic-input w-full h-11 font-black text-xl text-center border-green-700 bg-green-50/30"
                               />
                            </div>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1"><MessageSquare size={10}/> PAYMENT REMARKS</label>
                            <input 
                              type="text" 
                              value={payRemark}
                              onChange={e => setPayRemark(e.target.value)}
                              className="classic-input w-full h-11 font-bold" 
                              placeholder="E.g. Paid in cash, Bank transfer ref..."
                            />
                         </div>
                         <button 
                           onClick={handlePayFee} 
                           className="classic-btn w-full bg-green-800 text-white font-black py-4 flex items-center justify-center gap-2 border-green-950 hover:bg-green-700 transition-colors shadow-lg active:scale-[0.98]"
                         >
                            <FileCheck size={20}/> SUBMIT ASSOCIATION FEE
                         </button>
                      </div>
                   </div>
                </div>
              ) : payInvoiceSearch ? (
                <div className="text-center py-10 border-2 border-dashed border-red-200 rounded text-red-400 font-bold uppercase text-[11px] tracking-widest bg-white">
                   Invoice No Not Found in Registry
                </div>
              ) : null}
           </div>
        </div>
      </div>

      {/* 3. Association Filter Bar */}
      <div className="classic-info-bar rounded grid grid-cols-1 md:grid-cols-3 gap-4 border border-black/10 shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-900" size={14} />
          <input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="classic-input pl-10 w-full h-10 font-bold" 
            placeholder="Search INV / Shipper..." 
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-500" />
          <select 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)} 
            className="classic-input w-full font-black h-10 bg-white"
          >
            <option value="ALL">ALL MONTHS (FULL YEAR)</option>
            {months.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
          </select>
        </div>
        <div className="flex items-center justify-end font-black text-[10px] text-blue-950 uppercase tracking-[0.2em] bg-blue-50/50 px-4 rounded">
           <Filter size={10} className="mr-2" />
           {selectedMonth === 'ALL' ? 'GLOBAL LEDGER' : `${selectedMonth} REGISTRY`}
        </div>
      </div>

      {/* 4. Metric Boxes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <MetricBox label="ASSCIOEN QTY (DOCS)" value={summary.qty} icon={<FileText size={18}/>} color="blue" />
         <MetricBox label="TOTAL AMOUNT (@85)" value={summary.amount} icon={<DollarSign size={18}/>} color="black" isCurrency />
         <MetricBox label="EST. PAID AMOUNT" value={summary.paid} icon={<CheckCircle size={18}/>} color="green" isCurrency />
         <MetricBox label="OUTSTANDING DUE" value={summary.due} icon={<AlertCircle size={18}/>} color="red" isCurrency />
      </div>

      {/* 5. Main Ledger Window */}
      <div className="classic-window">
        <div className="classic-title-bar flex justify-between">
          <div className="flex items-center gap-2">
             <ClipboardList size={12}/>
             <span>ASSOCIATION FINANCIAL LEDGER [FEE: 85 TK / DOC]</span>
          </div>
          <span className="text-[9px] opacity-70">Records Active: {filteredData.length}</span>
        </div>
        <div className="classic-body overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200 text-[10px] font-black uppercase border-b border-black">
                <th className="p-4 border-r border-black/10">DATE</th>
                <th className="p-4 border-r border-black/10">INVOICE & SHIPPER</th>
                <th className="p-4 border-r border-black/10 text-center bg-blue-50/30">QTY (DOC)</th>
                <th className="p-4 border-r border-black/10 text-right font-black">AMOUNT (TK)</th>
                <th className="p-4 border-r border-black/10 text-right font-bold text-green-700">PAID</th>
                <th className="p-4 text-right font-black">DUE BAL</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredData.map(s => {
                const q = Number(s.docQty || 0);
                const amt = q * 85;
                const paid = Number(s.associationPaid || 0);
                const due = amt - paid;
                return (
                  <tr key={s.id} className="border-b border-black/5 hover:bg-blue-50 text-[11px] font-mono group transition-colors">
                    <td className="p-4 border-r border-black/5 whitespace-nowrap">{s.date}</td>
                    <td className="p-4 border-r border-black/5">
                       <p className="font-black text-blue-900">#{s.invoiceNo}</p>
                       <p className="text-[8px] font-bold text-gray-400 uppercase truncate max-w-[200px]">{s.shipper}</p>
                    </td>
                    <td className="p-4 border-r border-black/5 text-center font-black bg-blue-50/10 group-hover:bg-blue-100">
                      <div className="inline-block px-3 py-1 bg-white border border-black/10 shadow-sm rounded">
                        {q}
                      </div>
                    </td>
                    <td className="p-4 border-r border-black/5 text-right font-black">TK {amt.toLocaleString()}</td>
                    <td className="p-4 border-r border-black/5 text-right font-bold text-green-700">TK {Math.round(paid).toLocaleString()}</td>
                    <td className={`p-4 text-right font-black ${due > 0.01 ? 'text-red-600' : 'text-green-600'}`}>TK {Math.round(due).toLocaleString()}</td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-32 text-center">
                    <div className="flex flex-col items-center justify-center opacity-30">
                       <Filter size={64} className="text-gray-300" strokeWidth={1} />
                       <p className="mt-4 font-black text-xs uppercase tracking-[0.4em]">No Records Found for Current Selection</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="classic-footer p-4 bg-gray-100 border-t-2 border-black/10 font-black text-[10px] uppercase">
           <span>DATABASE STATUS: SYNCHRONIZED</span>
           <span className="text-blue-900">Calculated on 85 TK / Doc Basis</span>
        </div>
      </div>
    </div>
  );
};

const MetricBox = ({ label, value, icon, color, isCurrency }: any) => {
  const colors: any = {
    blue: "border-blue-600 text-blue-900 bg-blue-50/50",
    green: "border-green-600 text-green-800 bg-green-50/50",
    red: "border-red-600 text-red-800 bg-red-50/50",
    black: "border-gray-400 text-gray-950 bg-white"
  };
  return (
    <div className={`classic-inset p-5 border-l-4 shadow-sm ${colors[color]}`}>
       <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-white/40 rounded shadow-sm">{icon}</div>
          <p className="text-[9px] font-black uppercase tracking-widest">{label}</p>
       </div>
       <p className="text-3xl font-black font-mono tracking-tighter">
         {isCurrency ? `TK ${Math.round(value).toLocaleString()}` : value.toLocaleString()}
       </p>
    </div>
  );
};

export default AssociationInfo;
