
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Save, 
  X, 
  Trash2, 
  Calculator,
  Search,
  Plus,
  Printer,
  Download,
  ListFilter,
  Banknote,
  User,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { Transaction, ListData, Employee, Shipment } from '../types';
import Swal from 'sweetalert2';

interface AccountInfoProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  shipments: Shipment[];
  setShipments: React.Dispatch<React.SetStateAction<Shipment[]>>;
  lists: ListData;
  employees: Employee[];
  swalSize: number;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ 
  transactions, 
  setTransactions, 
  shipments,
  setShipments,
  lists, 
  employees, 
  swalSize 
}) => {
  const [isCashInOpen, setIsCashInOpen] = useState(false);
  const [isCashOutOpen, setIsCashOutOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterYear, setFilterYear] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState('ALL');
  const [filterSubAcc, setFilterSubAcc] = useState('ALL');
  const [statementMode, setStatementMode] = useState<'all' | 'in' | 'out'>('all');

  const months = ["ALL", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const years = useMemo(() => {
    const ySet = new Set(transactions.map(t => t.date.split('-')[0]));
    ySet.add(new Date().getFullYear().toString());
    return ['ALL', ...Array.from(ySet).sort().reverse()];
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      const tYear = t.date.split('-')[0];
      const tMonth = months[date.getMonth() + 1];

      const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.subAccount || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchYear = filterYear === 'ALL' || tYear === filterYear;
      const matchMonth = filterMonth === 'ALL' || tMonth === filterMonth;
      const matchSub = filterSubAcc === 'ALL' || t.subAccount === filterSubAcc;
      const matchMode = statementMode === 'all' || 
                        (statementMode === 'in' && t.type === 'Cash In') || 
                        (statementMode === 'out' && t.type === 'Cash Out');

      return matchSearch && matchYear && matchMonth && matchSub && matchMode;
    });
  }, [transactions, searchTerm, filterYear, filterMonth, filterSubAcc, statementMode]);

  const stats = useMemo(() => {
    const cashIn = filteredTransactions.filter(t => t.type === 'Cash In').reduce((acc, t) => acc + t.amount, 0);
    const cashOut = filteredTransactions.filter(t => t.type === 'Cash Out').reduce((acc, t) => acc + t.amount, 0);
    return { cashIn, cashOut, due: cashIn - cashOut };
  }, [filteredTransactions]);

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'CONFIRM REMOVAL?',
      text: "Permanent record deletion from ledger.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'DELETE',
      width: swalSize,
      customClass: { popup: 'classic-swal' }
    }).then(res => {
      if (res.isConfirmed) setTransactions(prev => prev.filter(t => t.id !== id));
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    try {
      const headers = ["Date", "Type", "Sub Account", "Description", "Amount (TK)"];
      const rows = filteredTransactions.map(t => [
        t.date,
        t.type,
        `"${t.subAccount || 'GENERAL'}"`,
        `"${(t.description || "").replace(/"/g, '""')}"`,
        t.amount
      ]);

      const csvContent = "\uFEFF" + [
        headers.join(","),
        ...rows.map(r => r.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `SunnyTrans_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("CSV Download Error:", err);
      Swal.fire('Error', 'Failed to generate CSV download.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      
      {/* 1. Header Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <MetricCard label="TOTAL CASH IN (FILTERED)" value={stats.cashIn} color="green" icon={<ArrowUpCircle size={24}/>}/>
        <MetricCard label="TOTAL CASH OUT (FILTERED)" value={stats.cashOut} color="red" icon={<ArrowDownCircle size={24}/>}/>
        <MetricCard label="NET BALANCE / DUE" value={stats.due} color="blue" icon={<Wallet size={24}/>}/>
      </div>

      <div className="classic-window no-print">
        <div className="classic-title-bar !bg-blue-900">
          <div className="flex items-center gap-2">
             <ListFilter size={12}/>
             <span>ACCOUNTING & TRANSACTION CONTROL CENTER</span>
          </div>
        </div>
        <div className="classic-body p-6 bg-white/50 space-y-4">
           {/* Terminal Launcher Buttons */}
           <div className="flex flex-col md:flex-row gap-4 mb-4">
              <button onClick={() => setIsCashInOpen(true)} className="flex-1 classic-btn bg-green-700 text-white h-20 flex items-center justify-center gap-3 border-green-950 font-black text-xl shadow-lg hover:bg-green-800 transition-colors">
                 <ArrowUpCircle size={28}/> CASH IN TERMINAL
              </button>
              <button onClick={() => setIsCashOutOpen(true)} className="flex-1 classic-btn bg-red-700 text-white h-20 flex items-center justify-center gap-3 border-red-950 font-black text-xl shadow-lg hover:bg-red-800 transition-colors">
                 <ArrowDownCircle size={28}/> CASH OUT TERMINAL
              </button>
           </div>

           {/* View Selection Toggles */}
           <div className="flex gap-2 p-1 bg-gray-200 rounded border border-black/10">
              <button onClick={() => setStatementMode('all')} className={`flex-1 h-10 classic-btn font-black ${statementMode === 'all' ? 'bg-blue-900 text-white' : ''}`}>FULL LEDGER</button>
              <button onClick={() => setStatementMode('in')} className={`flex-1 h-10 classic-btn font-black ${statementMode === 'in' ? 'bg-green-700 text-white' : ''}`}>CASH IN ONLY</button>
              <button onClick={() => setStatementMode('out')} className={`flex-1 h-10 classic-btn font-black ${statementMode === 'out' ? 'bg-red-700 text-white' : ''}`}>CASH OUT ONLY</button>
           </div>

           {/* Advanced Filters */}
           <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="col-span-1 md:col-span-1 relative">
                 <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
                 <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="classic-input pl-8 w-full h-10 font-bold" placeholder="Search..."/>
              </div>
              <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="classic-input h-10 font-black">
                 {years.map(y => <option key={y} value={y}>{y === 'ALL' ? 'ALL YEARS' : y}</option>)}
              </select>
              <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="classic-input h-10 font-black uppercase">
                 {months.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
              <select value={filterSubAcc} onChange={e => setFilterSubAcc(e.target.value)} className="classic-input h-10 font-black uppercase">
                 <option value="ALL">ALL SUB ACCOUNTS</option>
                 {lists.subAccounts.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
              <div className="flex gap-1">
                 <button onClick={handlePrint} className="flex-1 classic-btn bg-white border-black/20 flex items-center justify-center gap-1 font-bold"><Printer size={12}/> PRINT</button>
                 <button onClick={handleDownloadCSV} className="flex-1 classic-btn bg-white border-black/20 flex items-center justify-center gap-1 font-bold"><Download size={12}/> CSV</button>
              </div>
           </div>
        </div>
      </div>

      {/* 2. Detailed Transaction Table */}
      <div className="classic-window print-area">
        <div className="classic-title-bar flex justify-between">
          <div className="flex items-center gap-2">
             <Calculator size={12}/>
             <span>LEDGER: {statementMode.toUpperCase()} RECORDS [{filterMonth} {filterYear}]</span>
          </div>
          <span className="text-[9px] opacity-70">RECORDS: {filteredTransactions.length}</span>
        </div>
        <div className="classic-body overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200 text-[10px] font-black uppercase border-b border-black">
                <th className="p-3 border-r border-black/10">DATE</th>
                <th className="p-3 border-r border-black/10">TYPE</th>
                <th className="p-3 border-r border-black/10">SUB ACCOUNT</th>
                <th className="p-3 border-r border-black/10">DESCRIPTION / PAYEE</th>
                <th className="p-3 text-right">AMOUNT (TK)</th>
                <th className="p-3 text-center no-print">CMD</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id} className="border-b border-black/5 hover:bg-blue-50 text-[11px] font-mono transition-colors">
                  <td className="p-3 border-r border-black/5">{t.date}</td>
                  <td className="p-3 border-r border-black/5">
                    <span className={`px-2 py-0.5 rounded font-black text-[9px] ${t.type === 'Cash In' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {t.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 border-r border-black/5 font-black uppercase text-blue-900">{t.subAccount || 'GENERAL'}</td>
                  <td className="p-3 border-r border-black/5 italic truncate max-w-[250px]">{t.description}</td>
                  <td className={`p-3 text-right font-black ${t.type === 'Cash In' ? 'text-green-700' : 'text-red-700'}`}>
                    TK {t.amount.toLocaleString()}
                  </td>
                  <td className="p-3 text-center no-print">
                    <button onClick={() => handleDelete(t.id)} className="classic-btn p-1 text-red-700 hover:bg-red-50">
                      <Trash2 size={12}/>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr><td colSpan={6} className="p-20 text-center text-gray-400 italic font-black text-[10px] uppercase">No ledger records found for current filter</td></tr>
              )}
            </tbody>
            {filteredTransactions.length > 0 && (
              <tfoot className="bg-gray-100 border-t-2 border-black font-black text-[11px]">
                 <tr>
                    <td colSpan={4} className="p-3 text-right uppercase text-[9px] tracking-widest opacity-50">STATEMENT TOTALS:</td>
                    <td className={`p-3 text-right font-black ${stats.due >= 0 ? 'text-blue-900' : 'text-red-700'}`}>TK {stats.due.toLocaleString()}</td>
                    <td className="p-3 no-print"></td>
                 </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <style>{`
        @media print {
          html, body, #root, [class*="flex h-screen"], main, [class*="flex-1 overflow-y-auto"] {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            position: static !important;
            display: block !important;
          }
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 1px solid black !important;
            box-shadow: none !important;
          }
          .no-print, button, .swal2-container {
            display: none !important;
            visibility: hidden !important;
          }
          table { width: 100% !important; border-collapse: collapse !important; border: 1px solid black !important; }
          th, td { border: 1px solid #000 !important; padding: 8px !important; color: black !important; visibility: visible !important; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          tr { page-break-inside: avoid; }
        }
      `}</style>

      {/* Terminal Modals */}
      {isCashInOpen && (
        <CashInModal 
          onClose={() => setIsCashInOpen(false)} 
          subAccounts={lists.subAccounts}
          onSave={(t: any) => setTransactions(prev => [t, ...prev])}
        />
      )}
      {isCashOutOpen && (
        <CashOutModal 
          onClose={() => setIsCashOutOpen(false)} 
          subAccounts={lists.subAccounts}
          employees={employees}
          shipments={shipments}
          setShipments={setShipments}
          onSave={(t: any) => setTransactions(prev => [t, ...prev])}
        />
      )}
    </div>
  );
};

const CashInModal = ({ onClose, subAccounts, onSave }: any) => {
  const [rows, setRows] = useState([{ subAccount: subAccounts[0] || 'Main', amount: '', description: '' }]);
  const grandTotal = rows.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);

  const handleSave = () => {
    let savedCount = 0;
    rows.forEach(row => {
      const amt = parseFloat(row.amount);
      if (amt > 0) {
        onSave({
          id: Date.now().toString() + Math.random(),
          date: new Date().toISOString().split('T')[0],
          type: 'Cash In',
          category: 'Cash Collection',
          subAccount: row.subAccount,
          description: row.description || `Cash In: ${row.subAccount}`,
          amount: amt
        });
        savedCount++;
      }
    });
    if (savedCount > 0) {
      onClose();
      Swal.fire({ title: 'CASH POSTED', icon: 'success', timer: 1000, showConfirmButton: false });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 no-print">
      <div className="classic-window w-full max-w-2xl animate-zoomIn shadow-2xl border-green-800 border-2">
        <div className="classic-title-bar !bg-green-800 py-2">
          <span>SunnyTrans Int'l Ltd - CTG. (Cash In)</span>
          <button onClick={onClose}><X size={16}/></button>
        </div>
        <div className="classic-body p-6 space-y-4 bg-white">
           <div className="overflow-y-auto max-h-[400px]">
             <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-gray-500 border-b-2 border-black/10">
                    <th className="pb-2 text-left">SUB ACCOUNT</th>
                    <th className="pb-2 text-left">REMARKS</th>
                    <th className="pb-2 text-right">AMOUNT (TK)</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-black/5">
                      <td className="py-2 pr-2">
                         <select 
                          value={row.subAccount} 
                          onChange={e => {
                            const newRows = [...rows];
                            newRows[i].subAccount = e.target.value;
                            setRows(newRows);
                          }}
                          className="classic-input w-full h-10 font-bold"
                         >
                           {subAccounts.map((s:string) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                         </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input value={row.description} onChange={e => {
                          const n = [...rows]; n[i].description = e.target.value; setRows(n);
                        }} className="classic-input w-full h-10 font-bold" placeholder="Source details..."/>
                      </td>
                      <td className="py-2 text-right">
                         <input 
                          type="number" 
                          value={row.amount}
                          onChange={e => {
                            const newRows = [...rows];
                            newRows[i].amount = e.target.value;
                            setRows(newRows);
                          }}
                          placeholder="0.00" 
                          className="classic-input w-28 h-10 text-right font-black text-lg border-green-700"
                         />
                      </td>
                      <td className="py-2">
                         <button onClick={() => setRows(rows.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:text-red-700"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
           
           <div className="flex justify-between items-center p-4 bg-green-50 border-l-4 border-green-800 shadow-inner">
              <span className="text-[10px] font-black text-green-900 uppercase tracking-widest">GRAND TOTAL COLLECTION</span>
              <span className="text-3xl font-black font-mono text-green-800">TK {grandTotal.toLocaleString()}</span>
           </div>

           <div className="flex gap-3">
              <button onClick={() => setRows([...rows, { subAccount: subAccounts[0] || 'Main', amount: '', description: '' }])} className="classic-btn px-6 font-black bg-gray-100 hover:bg-gray-200 transition-colors">+ ADD ROW</button>
              <div className="flex-1 flex gap-2">
                <button onClick={handleSave} className="flex-1 classic-btn bg-green-800 text-white font-black py-2 shadow-lg hover:bg-green-700 transition-colors">SAVE & POST</button>
                <button onClick={onClose} className="classic-btn px-8 hover:bg-gray-100 transition-colors">CLOSE</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const CashOutModal = ({ onClose, subAccounts, employees, shipments, setShipments, onSave }: any) => {
  const [formData, setFormData] = useState({
    subAccount: 'Salary account',
    payee: '',
    amount: '',
    remarks: '',
    qnty: ''
  });

  const selectedEmployee = useMemo(() => {
    return employees.find((e: Employee) => e.name === formData.payee);
  }, [formData.payee, employees]);

  const handlePayeeChange = (name: string) => {
    const emp = employees.find((e: Employee) => e.name === name);
    setFormData(prev => ({
      ...prev,
      payee: name,
      amount: emp ? emp.salary.toString() : prev.amount
    }));
  };

  const handleSave = () => {
    const amt = parseFloat(formData.amount);
    if (!formData.payee) {
       Swal.fire({ title: 'VALIDATION ERROR', text: 'Please select a Payee / Target Account.', icon: 'error' });
       return;
    }
    
    if (!amt || amt <= 0) {
       Swal.fire({ title: 'VALIDATION ERROR', text: 'Please set a valid amount.', icon: 'error' });
       return;
    }

    onSave({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'Cash Out',
      category: 'Disbursement',
      subAccount: formData.subAccount,
      description: `Payment to: ${formData.payee} (${formData.remarks || 'Standard Payment'})`,
      amount: amt
    });

    if (selectedEmployee) {
      setShipments((prev: Shipment[]) => {
        let remaining = amt;
        return prev.map(s => {
          if (remaining <= 0 || s.employeeName !== formData.payee) return s;
          const currentPaid = Number(s.paid || 0);
          const currentTotal = Number(s.totalIndent || 0);
          const due = currentTotal - currentPaid;
          if (due <= 0) return s;
          const paymentToApply = Math.min(remaining, due);
          remaining -= paymentToApply;
          return { ...s, paid: currentPaid + paymentToApply };
        });
      });
    }

    onClose();
    Swal.fire({ title: 'PAYMENT RECORDED', icon: 'info', timer: 1500, showConfirmButton: false });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 no-print">
      <div className="classic-window w-full max-w-xl animate-zoomIn shadow-2xl border-red-900 border-2">
        <div className="classic-title-bar !bg-red-800 py-2">
          <div className="flex items-center gap-2">
            <Banknote size={14}/>
            <span>SunnyTrans Int'l Ltd - CTG. (Cash Out)</span>
          </div>
          <button onClick={onClose}><X size={16}/></button>
        </div>
        <div className="classic-body p-6 space-y-5 bg-white">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase">SOURCE ACCOUNT (FROM)</label>
                <select value={formData.subAccount} onChange={e => setFormData({...formData, subAccount: e.target.value})} className="classic-input w-full h-11 font-black border-red-200">
                   {subAccounts.map((s:string) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-900 uppercase">PAY TO (TARGET ACCOUNT)</label>
                <select value={formData.payee} onChange={e => handlePayeeChange(e.target.value)} className="classic-input w-full h-11 font-black border-blue-900">
                   <option value="">-- SELECT TARGET --</option>
                   <optgroup label="SYSTEM SUB-ACCOUNTS">
                      {subAccounts.map((s:string) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                   </optgroup>
                   <optgroup label="EMPLOYEES">
                      {employees.map((emp:any) => <option key={emp.id} value={emp.name}>{emp.name.toUpperCase()} [{emp.post}]</option>)}
                   </optgroup>
                </select>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-red-800 uppercase">AMOUNT (TK)</label>
                <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="classic-input w-full h-11 font-black text-2xl text-center border-red-800 bg-red-50/20" placeholder="0.00"/>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase">REMARKS</label>
                <input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="classic-input w-full h-11 font-bold" placeholder="Details..."/>
              </div>
           </div>

           <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="flex-1 classic-btn bg-red-800 text-white font-black py-4 border-red-950 shadow-xl hover:bg-red-700 flex items-center justify-center gap-2 transition-colors">
                <Save size={18}/> POST TRANSACTION
              </button>
              <button onClick={onClose} className="classic-btn flex-1 py-4 font-black uppercase hover:bg-gray-100 transition-colors">
                CLOSE
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, color, icon }: any) => {
  const colors: any = {
    green: "border-green-700 bg-green-50 text-green-900 shadow-sm",
    red: "border-red-700 bg-red-50 text-red-900 shadow-sm",
    blue: "border-blue-700 bg-blue-50 text-blue-900 shadow-sm"
  };
  return (
    <div className={`classic-inset p-5 border-l-4 flex items-center justify-between ${colors[color]}`}>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p>
          <p className="text-2xl font-black font-mono mt-1">TK {value.toLocaleString()}</p>
       </div>
       <div className="opacity-20">{icon}</div>
    </div>
  );
};

export default AccountInfo;
