
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  FileCheck, 
  AlertCircle, 
  Hash, 
  User, 
  Calculator, 
  CheckCircle2, 
  Tag, 
  ListFilter, 
  History, 
  FileText, 
  MessageSquare, 
  Users, 
  Clock,
  ClipboardList,
  CheckCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Shipment } from '../types';

interface BillSubmissionProps {
  shipments: Shipment[];
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
  submittedInvoices: string[];
  setSubmittedInvoices: React.Dispatch<React.SetStateAction<string[]>>;
  swalSize: number;
}

const BillSubmission: React.FC<BillSubmissionProps> = ({ 
  shipments, 
  setShipments, 
  submittedInvoices, 
  setSubmittedInvoices,
  swalSize 
}) => {
  const [invoiceSearch, setInvoiceSearch] = useState('');

  // Find all shipments matching the invoice search term
  const matchedShipments = useMemo(() => {
    if (!invoiceSearch || invoiceSearch.length < 2) return [];
    return shipments.filter(s => s.invoiceNo.toUpperCase().includes(invoiceSearch.toUpperCase()));
  }, [invoiceSearch, shipments]);

  // Registry filter: Only show invoices with actual due amount
  const dueInvoices = useMemo(() => {
    return shipments.filter(s => {
      const due = Number(s.totalIndent || 0) - Number(s.paid || 0);
      return due > 0.01;
    });
  }, [shipments]);

  // List of all shipments that have received at least some payment
  const paidInvoicesList = useMemo(() => {
    return shipments.filter(s => Number(s.paid || 0) > 0);
  }, [shipments]);

  return (
    <div className="space-y-6 animate-fadeIn pb-20 max-w-full mx-auto">
      
      {/* 1. PAID INVOICE REPOSITORY BOX */}
      <div className="classic-window">
        <div className="classic-title-bar !bg-green-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={12}/>
            <span>PAID / SUBMITTED INVOICE REPOSITORY [COLLECTION LOG]</span>
          </div>
        </div>
        <div className="classic-body p-4 bg-white/80 min-h-[100px] overflow-x-auto custom-scroll">
           <div className="flex flex-wrap gap-3">
              {paidInvoicesList.length > 0 ? paidInvoicesList.map(s => (
                <div 
                  key={s.id} 
                  className="group flex flex-col min-w-[180px] p-3 bg-white border-2 border-green-700 rounded shadow-sm hover:bg-green-50 cursor-pointer transition-all active:scale-95"
                  onClick={() => {
                    setInvoiceSearch(s.invoiceNo);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[12px] font-black text-green-900 font-mono">#{s.invoiceNo}</span>
                    <CheckCircle size={12} className="text-green-600"/>
                  </div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase truncate">{s.shipper}</span>
                  <div className="mt-2 flex justify-between items-end border-t border-green-100 pt-1">
                    <span className="text-[8px] font-bold text-green-600">PAID:</span>
                    <span className="text-[11px] font-black font-mono text-green-900">TK {Number(s.paid || 0).toLocaleString()}</span>
                  </div>
                </div>
              )) : (
                <div className="w-full flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">No collection records found in database</p>
                </div>
              )}
           </div>
        </div>
        <div className="classic-footer !bg-green-50 text-[9px] font-black text-green-800">
           <span>TOTAL COLLECTED: TK {paidInvoicesList.reduce((acc, s) => acc + (Number(s.paid || 0)), 0).toLocaleString()}</span>
           <span>RECORDS: {paidInvoicesList.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* 2. LEFT: SEARCH & ENTRY TERMINAL */}
        <div className="xl:col-span-6 space-y-6">
          <div className="classic-window">
            <div className="classic-title-bar !bg-blue-900">
              <div className="flex items-center gap-2">
                <Search size={12}/>
                <span>BILL SUBMISSION CONTROL TERMINAL</span>
              </div>
            </div>
            <div className="classic-body p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-900 uppercase tracking-widest">
                  SEARCH INVOICE (TYPE OR SCAN & (MULTIPLE SHIPPER SUPPORT))
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={24}/>
                  <input 
                    value={invoiceSearch}
                    onChange={e => setInvoiceSearch(e.target.value.toUpperCase())}
                    className="classic-input w-full pl-12 h-16 font-black text-3xl tracking-tighter uppercase border-blue-900 bg-blue-50/10 focus:bg-white transition-all" 
                    placeholder="ENTER INVOICE..."
                    autoFocus
                  />
                </div>
                {matchedShipments.length > 1 && (
                  <div className="flex items-center gap-2 bg-orange-100 border border-orange-300 p-2 rounded animate-pulse">
                    <Users size={14} className="text-orange-700"/>
                    <p className="text-[10px] font-black text-orange-800 uppercase">
                      MULTI-SHIPPER DETECTED: {matchedShipments.length} Records found for this Invoice.
                    </p>
                  </div>
                )}
              </div>

              {matchedShipments.length > 0 ? (
                <div className="animate-fadeIn space-y-6">
                  {matchedShipments.map(shipment => (
                    <IndividualSubmissionBox 
                      key={shipment.id}
                      shipment={shipment}
                      setShipments={setShipments}
                      setSubmittedInvoices={setSubmittedInvoices}
                      submittedInvoices={submittedInvoices}
                      swalSize={swalSize}
                    />
                  ))}
                </div>
              ) : invoiceSearch ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-red-200 rounded">
                  <AlertCircle size={48} className="text-red-400" strokeWidth={1.5}/>
                  <p className="font-black text-sm mt-4 uppercase text-red-700 tracking-widest">Entry Not Found</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-28 bg-white border-2 border-dashed border-gray-100 rounded">
                  <Calculator size={64} className="text-gray-100" strokeWidth={1}/>
                  <p className="italic text-xs mt-6 uppercase font-black text-gray-300 tracking-[0.5em]">
                    SYSTEM STANDBY
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. RIGHT: UNPAID SHIPMENT LEDGER */}
        <div className="xl:col-span-6 flex flex-col">
          <div className="classic-window flex-1">
            <div className="classic-title-bar !bg-red-900">
              <div className="flex items-center gap-2">
                <ClipboardList size={12}/>
                <span>UNPAID SHIPMENT LEDGER [DUE REGISTRY]</span>
              </div>
            </div>
            <div className="classic-body flex flex-col h-full min-h-[600px]">
              <div className="p-3 border-b border-black/10 bg-red-50 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                   <div className="p-1.5 bg-red-800 text-white rounded">
                      <ListFilter size={12}/>
                   </div>
                   <span className="text-[11px] font-black text-red-800 uppercase tracking-tighter">PENDING BALANCES</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">PENDING:</span>
                  <span className="bg-red-800 text-white text-[11px] font-black px-3 py-0.5 font-mono rounded shadow-inner">{dueInvoices.length}</span>
                </div>
              </div>
              <div className="overflow-auto flex-1 custom-scroll bg-white">
                <table className="w-full text-left border-collapse table-fixed">
                  <thead className="sticky top-0 bg-gray-200 text-[10px] font-black uppercase border-b border-black z-10">
                    <tr>
                      <th className="p-3 border-r border-black/10 w-[30%]">INV / SHIPPER</th>
                      <th className="p-3 border-r border-black/10 w-[20%]">EMPLOYEE NAME</th>
                      <th className="p-3 border-r border-black/10 w-[25%]">REMARKS</th>
                      <th className="p-3 text-right w-[25%] bg-red-100">DUE AM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {dueInvoices.map(s => {
                      const due = Number(s.totalIndent || 0) - Number(s.paid || 0);
                      return (
                        <tr 
                          key={s.id} 
                          className="hover:bg-red-50 cursor-pointer text-[10px] font-mono group transition-all"
                          onClick={() => {
                            setInvoiceSearch(s.invoiceNo);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          <td className="p-3 border-r border-black/5 align-top">
                            <p className="font-black text-blue-900 leading-none">#{s.invoiceNo}</p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase truncate mt-1">{s.shipper}</p>
                          </td>
                          <td className="p-3 border-r border-black/5 uppercase font-bold text-gray-600 align-top">
                             {s.employeeName}
                          </td>
                          <td className="p-3 border-r border-black/5 text-gray-400 italic text-[9px] truncate align-top">
                            {s.remarks || '---'}
                          </td>
                          <td className="p-3 text-right font-black text-red-700 align-top group-hover:bg-red-200 transition-colors">
                            TK {due.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                    {dueInvoices.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-20 text-center">
                          <div className="flex flex-col items-center justify-center opacity-30">
                            <CheckCircle2 size={64} className="text-green-600" strokeWidth={1}/>
                            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-green-900">LEDGER BALANCED</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="classic-footer p-4 bg-gray-100 border-t-2 border-black/10 mt-auto">
                <div className="flex justify-between w-full items-center">
                  <span className="uppercase tracking-widest text-gray-600 font-black text-[9px]">TOTAL OUTSTANDING:</span>
                  <span className="text-red-700 font-black text-xl font-mono">
                    TK {dueInvoices.reduce((acc, s) => acc + (Number(s.totalIndent || 0) - Number(s.paid || 0)), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

/**
 * Enhanced Box for Multiple Shipper Support
 */
const IndividualSubmissionBox = ({ shipment, setShipments, setSubmittedInvoices, submittedInvoices, swalSize }: any) => {
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');

  const currentDue = Number(shipment.totalIndent || 0) - Number(shipment.paid || 0);

  const handlePost = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Swal.fire({ title: 'ERROR', text: 'Enter valid numeric payment amount.', icon: 'error', width: swalSize, customClass: { popup: 'classic-swal' } });
      return;
    }

    if (amt > (currentDue + 0.01)) { 
      Swal.fire({ 
        title: 'LIMIT EXCEEDED', 
        text: `The payment (TK ${amt.toLocaleString()}) cannot exceed the due balance (TK ${currentDue.toLocaleString()}).`, 
        icon: 'warning', 
        width: swalSize, 
        customClass: { popup: 'classic-swal' } 
      });
      return;
    }

    setShipments((prev: Shipment[]) => prev.map(s => {
      if (s.id === shipment.id) {
        const updatedRemarks = remarks.trim() 
          ? (s.remarks ? `${s.remarks} | ${remarks.trim()}` : remarks.trim())
          : s.remarks;
        return { 
          ...s, 
          paid: (Number(s.paid || 0) + amt),
          remarks: updatedRemarks
        };
      }
      return s;
    }));

    if (!submittedInvoices.includes(shipment.invoiceNo)) {
      setSubmittedInvoices((prev: string[]) => [...prev, shipment.invoiceNo]);
    }

    setAmount('');
    setRemarks('');
    
    Swal.fire({ 
      title: 'SUBMISSION SUCCESSFUL', 
      text: `TK ${amt.toLocaleString()} recorded for ${shipment.shipper}.`, 
      icon: 'success', 
      timer: 1500, 
      showConfirmButton: false, 
      customClass: { popup: 'classic-swal' }
    });
  };

  return (
    <div className="animate-fadeIn space-y-2 border-l-4 border-blue-900 bg-blue-50/20 p-1">
      <div className="classic-window border-blue-900 shadow-md">
        <div className="classic-title-bar !bg-blue-950 flex justify-between py-1.5">
          <div className="flex items-center gap-2">
            <FileText size={12}/>
            <span className="text-[12px] font-black">INVOICE: #{shipment.invoiceNo}</span>
          </div>
          <span className="bg-white text-blue-950 px-2 py-0.5 rounded text-[9px] font-black uppercase">
            SHIPPER: {shipment.shipper.slice(0, 30)}
          </span>
        </div>
        <div className="classic-body p-4 space-y-4 bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[8px] font-bold text-gray-400 uppercase flex items-center gap-1"><User size={10}/> OPERATOR</p>
              <p className="text-[11px] font-black uppercase text-blue-900 truncate">{shipment.employeeName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[8px] font-bold text-gray-400 uppercase flex items-center gap-1"><Calculator size={10}/> GROSS BILL</p>
              <p className="text-[11px] font-black font-mono text-gray-800">TK {Number(shipment.totalIndent).toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-2 border border-green-100 rounded">
              <p className="text-[8px] font-bold text-green-700 uppercase flex items-center gap-1"><CheckCircle size={10}/> PAID</p>
              <p className="text-sm font-black font-mono text-green-800">TK {Number(shipment.paid || 0).toLocaleString()}</p>
            </div>
            <div className="bg-red-50 p-2 border border-red-100 rounded">
              <p className="text-[8px] font-bold text-red-700 uppercase flex items-center gap-1"><Clock size={10}/> DUE AM</p>
              <p className="text-sm font-black font-mono text-red-600">TK {currentDue.toLocaleString()}</p>
            </div>
          </div>
          
          {shipment.remarks && (
            <div className="bg-yellow-50 p-2 border border-yellow-200 rounded">
              <span className="text-[9px] font-bold text-yellow-800 uppercase flex items-center gap-1 mb-1"><MessageSquare size={10}/> PREVIOUS REMARKS</span>
              <p className="text-[9px] italic text-gray-600 font-mono leading-tight">{shipment.remarks}</p>
            </div>
          )}
        </div>
      </div>

      {currentDue > 0.01 ? (
        <div className="classic-window border-green-800 shadow-sm">
          <div className="classic-title-bar !bg-green-800 py-1">
            <span>POST PAYMENT: {shipment.shipper.toUpperCase()}</span>
          </div>
          <div className="p-3 space-y-3 bg-gray-50 border border-black/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               <div>
                  <label className="text-[9px] font-black text-gray-500 uppercase block mb-1">PAYMENT TK</label>
                  <input 
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="classic-input w-full h-10 font-black text-lg text-center border-green-700" 
                    placeholder="0.00"
                  />
               </div>
               <div>
                  <label className="text-[9px] font-black text-gray-500 uppercase block mb-1">SUBMISSION REMARKS</label>
                  <input 
                    type="text"
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    className="classic-input w-full h-10 font-bold text-[11px] border-green-700" 
                    placeholder="Transaction notes..."
                  />
               </div>
            </div>
            <button onClick={handlePost} className="classic-btn w-full bg-blue-900 text-white py-2.5 flex items-center justify-center gap-2 border-blue-950 hover:bg-blue-800 transition-colors">
              <FileCheck size={16}/> SUBMIT FOR THIS SHIPPER
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-green-100 border border-green-300 p-3 text-center rounded">
          <p className="text-[11px] font-black text-green-800 uppercase tracking-widest flex items-center justify-center gap-2">
            <CheckCircle2 size={14}/> ACCOUNT FULLY SETTLED
          </p>
        </div>
      )}
    </div>
  );
};

export default BillSubmission;
