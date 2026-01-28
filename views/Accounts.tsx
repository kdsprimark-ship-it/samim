
import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  Search, 
  History,
  Printer,
  X,
  Search as SearchIcon,
  Edit2,
  Trash2,
  Calculator,
  FileCheck,
  TrendingUp,
  CreditCard,
  DollarSign
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Transaction, Shipment } from '../types';

interface AccountsProps {
  transactions: Transaction[];
  shipments: Shipment[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
  submittedInvoices: string[];
  setSubmittedInvoices: React.Dispatch<React.SetStateAction<string[]>>;
  swalSize: number;
}

const Accounts: React.FC<AccountsProps> = ({ 
  transactions, 
  shipments, 
  setTransactions, 
  setShipments, 
  submittedInvoices,
  setSubmittedInvoices,
  swalSize
}) => {
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [submitAmount, setSubmitAmount] = useState<string>('');

  const officeStats = useMemo(() => {
    // 1. Auto Income Calculation Logic
    // Rate: 75 if Buyer is H&M, else 80 per Doc Qty
    const autoIncome = shipments.reduce((acc, s) => {
      const rate = s.buyer && s.buyer.includes('H&M') ? 75 : 80;
      return acc + (Number(s.docQty || 0) * rate);
    }, 0);

    // 2. Manual Transactions
    const manualIncome = transactions.filter(t => t.type === 'Cash In').reduce((a, b) => a + b.amount, 0);
    const totalOfficeIncome = autoIncome + manualIncome;
    const totalOfficeCost = transactions.filter(t => t.type === 'Cash Out').reduce((a, b) => a + b.amount, 0);
    const officeDue = totalOfficeIncome - totalOfficeCost;

    return { totalOfficeIncome, totalOfficeCost, officeDue, autoIncome, manualIncome };
  }, [shipments, transactions]);

  const handlePostTransaction = async (type: 'Cash In' | 'Cash Out') => {
    const { value: formValues } = await Swal.fire({
      title: `POST OFFICE ${type.toUpperCase()}`,
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="text-[10px] font-bold block mb-1">TRANSACTION CATEGORY:</label>
            <select id="t-cat" class="classic-input w-full h-10 font-bold">
              ${type === 'Cash In' ? `
                <option value="Manual Billing">MANUAL BILLING</option>
                <option value="Misc Income">MISC INCOME</option>
                <option value="Commission">COMMISSION</option>
              ` : `
                <option value="Office Rent">OFFICE RENT</option>
                <option value="Electricity">ELECTRICITY</option>
                <option value="Stationary">STATIONARY</option>
                <option value="Staff Salary">STAFF SALARY</option>
                <option value="Maintenance">MAINTENANCE</option>
                <option value="Tea & Snacks">TEA & SNACKS</option>
                <option value="Conveyance">CONVEYANCE</option>
              `}
            </select>
          </div>
          <div>
            <label class="text-[10px] font-bold block mb-1">AMOUNT (TK):</label>
            <input id="t-amt" type="number" class="classic-input w-full h-10 font-black text-lg" placeholder="0.00">
          </div>
          <div>
            <label class="text-[10px] font-bold block mb-1">REMARKS / DESCRIPTION:</label>
            <input id="t-rem" class="classic-input w-full h-10" placeholder="Details...">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'COMMIT TO LEDGER',
      width: swalSize,
      customClass: { popup: 'classic-swal' },
      preConfirm: () => {
        const category = (document.getElementById('t-cat') as HTMLSelectElement).value;
        const amount = parseFloat((document.getElementById('t-amt') as HTMLInputElement).value);
        const remarks = (document.getElementById('t-rem') as HTMLInputElement).value;
        if (!amount || isNaN(amount)) return Swal.showValidationMessage('Valid Amount Required');
        return { category, amount, remarks };
      }
    });

    if (formValues) {
      const newT: Transaction = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        type,
        category: formValues.category,
        description: formValues.remarks,
        amount: formValues.amount
      };
      setTransactions(prev => [newT, ...prev]);
      Swal.fire({ title: 'POSTED', icon: 'success', timer: 800, showConfirmButton: false, customClass: { popup: 'classic-swal' } });
    }
  };

  const invoiceMatch = useMemo(() => {
    if (!invoiceSearch) return null;
    const matches = shipments.filter(s => s.invoiceNo.toUpperCase().includes(invoiceSearch.toUpperCase()));
    if (matches.length === 0) return null;
    
    // Filter out already submitted ones if requested, but user said "akdik invoice number thakla sabmite bill gulo show korba na dew bill gulo show korb"
    const pendingMatches = matches.filter(m => !submittedInvoices.includes(m.invoiceNo));
    return pendingMatches.length > 0 ? pendingMatches[0] : matches[0];
  }, [invoiceSearch, shipments, submittedInvoices]);

  const handleBillSubmit = () => {
    const amt = parseFloat(submitAmount);
    if (!invoiceMatch) return;
    if (isNaN(amt) || amt <= 0) {
      Swal.fire({ title: 'ERROR', text: 'Enter valid amount to submit.', icon: 'error', width: swalSize, customClass: { popup: 'classic-swal' } });
      return;
    }

    setShipments(prev => prev.map(s => {
      if (s.invoiceNo === invoiceMatch.invoiceNo) {
        return { ...s, paid: (Number(s.paid || 0) + amt) };
      }
      return s;
    }));

    if (!submittedInvoices.includes(invoiceMatch.invoiceNo)) {
       setSubmittedInvoices(prev => [...prev, invoiceMatch.invoiceNo]);
    }

    setInvoiceSearch('');
    setSubmitAmount('');
    Swal.fire({ 
      title: 'BILL POSTED', 
      text: `TK ${amt.toLocaleString()} received for ${invoiceMatch.invoiceNo}`, 
      icon: 'success', 
      timer: 1500, 
      showConfirmButton: false, 
      customClass: { popup: 'classic-swal' }
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20 max-w-6xl mx-auto">
      {/* 1. Office Info Stats */}
      <div className="classic-window">
        <div className="classic-title-bar">
          <div className="flex items-center gap-2">
            <TrendingUp size={12}/>
            <span>OFFICE FINANCIAL RECAP & INCOME ANALYSIS</span>
          </div>
        </div>
        <div className="classic-body p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="classic-inset p-4 bg-white border-l-4 border-green-600">
              <p className="text-[9px] font-bold text-gray-500 uppercase">TOTAL OFFICE INCOME</p>
              <h3 className="text-3xl font-black font-mono text-green-700">TK {officeStats.totalOfficeIncome.toLocaleString()}</h3>
              <div className="flex justify-between mt-2 text-[8px] font-bold text-gray-400 border-t pt-1">
                <span>AUTO (DOCS): {officeStats.autoIncome.toLocaleString()}</span>
                <span>MISC: {officeStats.manualIncome.toLocaleString()}</span>
              </div>
            </div>
            <div className="classic-inset p-4 bg-white border-l-4 border-red-600">
              <p className="text-[9px] font-bold text-gray-500 uppercase">TOTAL OFFICE COST</p>
              <h3 className="text-3xl font-black font-mono text-red-700">TK {officeStats.totalOfficeCost.toLocaleString()}</h3>
              <p className="text-[8px] font-bold text-gray-400 mt-2 uppercase italic">Operations & Overheads</p>
            </div>
            <div className="classic-inset p-4 bg-white border-l-4 border-blue-600">
              <p className="text-[9px] font-bold text-gray-500 uppercase">OFFICE DUE BALANCE</p>
              <h3 className="text-3xl font-black font-mono text-blue-800">TK {officeStats.officeDue.toLocaleString()}</h3>
              <p className="text-[8px] font-bold text-gray-400 mt-2 uppercase">Net Profitability</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* 2. Office Transaction Terminal */}
         <div className="classic-window">
            <div className="classic-title-bar"><span>OFFICE CASH MANAGEMENT TERMINAL</span></div>
            <div className="classic-body p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => handlePostTransaction('Cash In')} className="classic-btn bg-green-700 text-white h-14 flex items-center justify-center gap-2">
                     <ArrowUpCircle size={20}/> ADD INCOME
                  </button>
                  <button onClick={() => handlePostTransaction('Cash Out')} className="classic-btn bg-red-700 text-white h-14 flex items-center justify-center gap-2">
                     <ArrowDownCircle size={20}/> ADD COST
                  </button>
               </div>
               <div className="h-80 overflow-y-auto custom-scroll space-y-2 pr-2">
                  {transactions.map(t => (
                    <div key={t.id} className="p-3 bg-white border border-black/10 flex justify-between items-center group transition-colors hover:border-blue-300">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${t.type === 'Cash In' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {t.type === 'Cash In' ? <DollarSign size={14}/> : <CreditCard size={14}/>}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase">{t.category}</p>
                            <p className="text-[10px] text-gray-400 max-w-[200px] truncate">{t.description || t.date}</p>
                          </div>
                       </div>
                       <div className="text-right flex items-center gap-4">
                          <p className={`font-black text-xs ${t.type === 'Cash In' ? 'text-green-700' : 'text-red-700'}`}>
                            {t.type === 'Cash In' ? '+' : '-'} TK {t.amount.toLocaleString()}
                          </p>
                          <button onClick={() => setTransactions(prev => prev.filter(p => p.id !== t.id))} className="text-gray-300 hover:text-red-700 transition-colors">
                            <Trash2 size={12}/>
                          </button>
                       </div>
                    </div>
                  ))}
                  {transactions.length === 0 && <p className="text-center text-gray-400 py-20 italic text-[11px] uppercase">No manual logs</p>}
               </div>
            </div>
         </div>

         {/* 3. Enhanced Bill Submission Terminal */}
         <div className="classic-window">
            <div className="classic-title-bar"><span>BILL SUBMISSION & INVOICE LOOKUP ENGINE</span></div>
            <div className="classic-body p-6 space-y-6 bg-gray-50">
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">SEARCH INVOICE (AUTO-DETECTION)</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                    <input 
                      value={invoiceSearch}
                      onChange={e => setInvoiceSearch(e.target.value.toUpperCase())}
                      className="classic-input w-full pl-10 h-14 font-black text-xl tracking-tighter" 
                      placeholder="SCAN OR TYPE INVOICE..."
                    />
                  </div>
               </div>

               {invoiceMatch ? (
                 <div className="classic-window bg-white shadow-lg animate-fadeIn border-blue-800">
                    <div className="classic-title-bar !bg-blue-900"><span>INVOICE DETAILS: {invoiceMatch.invoiceNo}</span></div>
                    <div className="p-4 space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <p className="text-[9px] font-bold text-gray-400 uppercase">SHIPPER</p>
                             <p className="text-xs font-black truncate">{invoiceMatch.shipper}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] font-bold text-gray-500 uppercase">BUYER</p>
                             <p className="text-xs font-black">{invoiceMatch.buyer}</p>
                          </div>
                          <div className="space-y-1 bg-gray-50 p-2 border border-black/5">
                             <p className="text-[9px] font-bold text-blue-800 uppercase">TOTAL INDENT</p>
                             <p className="text-sm font-black font-mono">TK {invoiceMatch.totalIndent.toLocaleString()}</p>
                          </div>
                          <div className="space-y-1 bg-gray-50 p-2 border border-black/5">
                             <p className="text-[9px] font-bold text-green-700 uppercase">PAID AMOUNT</p>
                             <p className="text-sm font-black font-mono">TK {(Number(invoiceMatch.paid || 0)).toLocaleString()}</p>
                          </div>
                       </div>
                       
                       <div className="classic-inset p-3 bg-red-50 text-center border-red-200">
                          <p className="text-[10px] font-black text-red-800 uppercase mb-1 tracking-widest">REMAINING DUE</p>
                          <p className="text-2xl font-black font-mono text-red-700">TK {(Number(invoiceMatch.totalIndent || 0) - Number(invoiceMatch.paid || 0)).toLocaleString()}</p>
                       </div>

                       <div className="space-y-2 border-t pt-4">
                          <label className="text-[10px] font-bold text-gray-600 block uppercase">SUBMIT BILL AMOUNT (TK)</label>
                          <div className="flex gap-2">
                             <input 
                               type="number"
                               value={submitAmount}
                               onChange={e => setSubmitAmount(e.target.value)}
                               className="classic-input flex-1 h-12 font-black text-lg text-center" 
                               placeholder="0.00"
                             />
                             <button onClick={handleBillSubmit} className="classic-btn bg-blue-800 text-white px-6 flex items-center gap-2">
                                <FileCheck size={16}/> SUBMIT
                             </button>
                          </div>
                          {submittedInvoices.includes(invoiceMatch.invoiceNo) && (
                            <p className="text-[9px] font-bold text-orange-600 text-center mt-1 uppercase italic tracking-widest animate-pulse">Bill submission active for this record</p>
                          )}
                       </div>
                    </div>
                 </div>
               ) : invoiceSearch ? (
                 <div className="flex flex-col items-center justify-center py-20 text-red-400 bg-white border border-dashed border-red-200">
                   <AlertCircle size={32} strokeWidth={1}/>
                   <p className="font-bold text-[11px] mt-2 uppercase">No Matching Records</p>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-20 text-gray-300 bg-white border border-dashed border-gray-200">
                    <SearchIcon size={40} strokeWidth={1}/>
                    <p className="italic text-[10px] mt-2 uppercase font-bold tracking-widest">Awaiting Input Data...</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

const AlertCircle = ({ size, strokeWidth }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
);

export default Accounts;
