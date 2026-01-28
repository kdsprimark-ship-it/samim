
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
    const cashIn = transactions.filter(t => t.type === 'Cash In').reduce((acc, t) => acc + t.amount, 0);
    const cashOut = transactions.filter(t => t.type === 'Cash Out').reduce((acc, t) => acc + t.amount, 0);
    return { cashIn, cashOut, due: cashIn - cashOut };
  }, [transactions]);

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <MetricCard label="TOTAL SYSTEM CASH IN" value={stats.cashIn} color="green" icon={<ArrowUpCircle size={24}/>}/>
        <MetricCard label="TOTAL SYSTEM CASH OUT" value={stats.cashOut} color="red" icon={<ArrowDownCircle size={24}/>}/>
        <MetricCard label="NET SYSTEM BALANCE" value={stats.due} color="blue" icon={<Wallet size={24}/>}/>
      </div>

      <div className="classic-window no-print">
        <div className="classic-title-bar !bg-blue-900">
          <div className="flex items-center gap-2"><ListFilter size={12}/><span>ACCOUNTING COMMAND CENTER</span></div>
        </div>
        <div className="classic-body p-6 bg-white/50 space-y-4">
           <div className="flex flex-col md:flex-row gap-4 mb-4">
              <button onClick={() => setIsCashInOpen(true)} className="flex-1 classic-btn bg-green-700 text-white h-20 flex items-center justify-center gap-3 border-green-950 font-black text-xl shadow-lg hover:bg-green-800 transition-colors">
                 <ArrowUpCircle size={28}/> CASH IN TERMINAL
              </button>
              <button onClick={() => setIsCashOutOpen(true)} className="flex-1 classic-btn bg-red-700 text-white h-20 flex items-center justify-center gap-3 border-red-950 font-black text-xl shadow-lg hover:bg-red-800 transition-colors">
                 <ArrowDownCircle size={28}/> CASH OUT TERMINAL
              </button>
           </div>

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
                 <button onClick={() => window.print()} className="flex-1 classic-btn bg-white border-black/20 flex items-center justify-center gap-1 font-bold"><Printer size={12}/> PRINT</button>
                 <button className="flex-1 classic-btn bg-white border-black/20 flex items-center justify-center gap-1 font-bold"><Download size={12}/> CSV</button>
              </div>
           </div>
        </div>
      </div>

      <div className="classic-window print-area">
        <div className="classic-title-bar"><span>TRANSACTION DATABASE LEDGER</span></div>
        <div className="classic-body overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200 text-[10px] font-black uppercase border-b border-black">
                <th className="p-3 border-r border-black/10">DATE</th>
                <th className="p-3 border-r border-black/10">TYPE</th>
                <th className="p-3 border-r border-black/10">ACCOUNT</th>
                <th className="p-3 border-r border-black/10">DESCRIPTION</th>
                <th className="p-3 text-right">AMOUNT</th>
                <th className="p-3 text-center no-print">CMD</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id} className="border-b border-black/5 hover:bg-blue-50 text-[11px] font-mono">
                  <td className="p-3 border-r border-black/5">{t.date}</td>
                  <td className="p-3 border-r border-black/5">
                    <span className={`px-2 py-0.5 rounded font-black text-[9px] ${t.type === 'Cash In' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {t.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 border-r border-black/5 font-black uppercase text-blue-900">{t.subAccount}</td>
                  <td className="p-3 border-r border-black/5 italic truncate max-w-[250px]">{t.description}</td>
                  <td className={`p-3 text-right font-black ${t.type === 'Cash In' ? 'text-green-700' : 'text-red-700'}`}>
                    TK {t.amount.toLocaleString()}
                  </td>
                  <td className="p-3 text-center no-print">
                    <button onClick={() => setTransactions(prev => prev.filter(x => x.id !== t.id))} className="classic-btn p-1 text-red-700 hover:bg-red-50"><Trash2 size={12}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
  const [formData, setFormData] = useState({ subAccount: subAccounts[0], amount: '', description: '' });
  const handleSave = () => {
    if (!formData.amount) return;
    onSave({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'Cash In',
      subAccount: formData.subAccount,
      description: formData.description || `Collection: ${formData.subAccount}`,
      amount: parseFloat(formData.amount)
    });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 no-print">
      <div className="classic-window w-full max-w-md shadow-2xl border-green-800 border-2">
        <div className="classic-title-bar !bg-green-800 py-2">
          <span>SunnyTrans Int'l Ltd - CTG. (Cash In)</span>
          <button onClick={onClose}><X size={16}/></button>
        </div>
        <div className="classic-body p-6 space-y-4 bg-white">
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 uppercase">TARGET ACCOUNT</label>
             <select value={formData.subAccount} onChange={e => setFormData({...formData, subAccount: e.target.value})} className="classic-input w-full h-11 font-black">
                {subAccounts.map((s:string) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
             </select>
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-green-800 uppercase">AMOUNT (TK)</label>
             <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="classic-input w-full h-11 font-black text-2xl border-green-700" placeholder="0.00"/>
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 uppercase">REMARKS</label>
             <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="classic-input w-full h-11 font-bold" placeholder="Details..."/>
           </div>
           <button onClick={handleSave} className="w-full classic-btn bg-green-800 text-white font-black py-4 shadow-lg hover:bg-green-700 transition-colors">SAVE & POST</button>
        </div>
      </div>
    </div>
  );
};

const CashOutModal = ({ onClose, subAccounts, employees, shipments, setShipments, onSave }: any) => {
  const [formData, setFormData] = useState({ subAccount: subAccounts[0], payee: '', amount: '', remarks: '' });

  const handleSave = () => {
    const amt = parseFloat(formData.amount);
    if (!amt || !formData.payee) return;

    // 1. Record the Source Cash Out
    const sourceOut: Transaction = {
      id: Date.now().toString() + "-src",
      date: new Date().toISOString().split('T')[0],
      type: 'Cash Out',
      category: 'Disbursement',
      subAccount: formData.subAccount,
      description: `Payment to: ${formData.payee} (${formData.remarks || 'Standard'})`,
      amount: amt
    };
    onSave(sourceOut);

    // 2. LOGIC: Check if Target is another Sub-Account (Inter-account transfer)
    if (subAccounts.includes(formData.payee)) {
      onSave({
        id: Date.now().toString() + "-tgt",
        date: new Date().toISOString().split('T')[0],
        type: 'Cash In',
        category: 'Inter-Account Transfer',
        subAccount: formData.payee,
        description: `Transferred From: ${formData.subAccount}`,
        amount: amt
      });
    }

    // 3. LOGIC: Check if Target is Employee (Reduce Depot Indent)
    const isEmployee = employees.find((e: any) => e.name === formData.payee);
    if (isEmployee) {
      setShipments((prev: Shipment[]) => {
        let remaining = amt;
        return prev.map(s => {
          if (remaining <= 0 || s.employeeName !== formData.payee) return s;
          const due = (Number(s.totalIndent || 0)) - (Number(s.paid || 0));
          if (due <= 0) return s;
          const pay = Math.min(remaining, due);
          remaining -= pay;
          return { ...s, paid: Number(s.paid || 0) + pay };
        });
      });
    }

    onClose();
    Swal.fire({ title: 'TRANSACTION POSTED', icon: 'success', timer: 1500, showConfirmButton: false });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 no-print">
      <div className="classic-window w-full max-w-md shadow-2xl border-red-900 border-2">
        <div className="classic-title-bar !bg-red-800 py-2">
          <div className="flex items-center gap-2"><Banknote size={14}/><span>SunnyTrans Int'l Ltd - CTG. (Cash Out)</span></div>
          <button onClick={onClose}><X size={16}/></button>
        </div>
        <div className="classic-body p-6 space-y-4 bg-white">
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 uppercase">SOURCE ACCOUNT (FROM)</label>
             <select value={formData.subAccount} onChange={e => setFormData({...formData, subAccount: e.target.value})} className="classic-input w-full h-11 font-black">
                {subAccounts.map((s:string) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
             </select>
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-blue-900 uppercase">PAY TO (TARGET ACCOUNT / EMPLOYEE)</label>
             <select value={formData.payee} onChange={e => setFormData({...formData, payee: e.target.value})} className="classic-input w-full h-11 font-black border-blue-900">
                <option value="">-- SELECT RECIPIENT --</option>
                <optgroup label="SYSTEM SUB-ACCOUNTS">
                   {subAccounts.map((s:string) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </optgroup>
                <optgroup label="EMPLOYEES">
                   {employees.map((e:any) => <option key={e.id} value={e.name}>{e.name.toUpperCase()}</option>)}
                </optgroup>
             </select>
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-red-800 uppercase">AMOUNT (TK)</label>
             <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="classic-input w-full h-11 font-black text-2xl border-red-800" placeholder="0.00"/>
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 uppercase">REMARKS</label>
             <input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="classic-input w-full h-11 font-bold" placeholder="Details..."/>
           </div>
           <button onClick={handleSave} className="w-full classic-btn bg-red-800 text-white font-black py-4 shadow-lg hover:bg-red-700 transition-colors">POST TRANSACTION</button>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, color, icon }: any) => {
  const colors: any = {
    green: "border-green-700 bg-green-50 text-green-900",
    red: "border-red-700 bg-red-50 text-red-900",
    blue: "border-blue-700 bg-blue-50 text-blue-900"
  };
  return (
    <div className={`classic-inset p-5 border-l-4 flex items-center justify-between ${colors[color]}`}>
       <div><p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p><p className="text-2xl font-black font-mono mt-1">TK {value.toLocaleString()}</p></div>
       <div className="opacity-20">{icon}</div>
    </div>
  );
};

export default AccountInfo;
