
import React, { useState, useMemo } from 'react';
import { 
  ArrowUpCircle, ArrowDownCircle, Wallet, Save, X, Trash2, Search, Printer, 
  Download, ListFilter, Banknote, User, Clock, Layers 
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
  transactions, setTransactions, shipments, setShipments, lists, employees, swalSize 
}) => {
  const [isCashInOpen, setIsCashInOpen] = useState(false);
  const [isCashOutOpen, setIsCashOutOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const stats = useMemo(() => {
    const cashIn = transactions.filter(t => t.type === 'Cash In').reduce((acc, t) => acc + t.amount, 0);
    const cashOut = transactions.filter(t => t.type === 'Cash Out').reduce((acc, t) => acc + t.amount, 0);
    return { cashIn, cashOut, net: cashIn - cashOut };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t.subAccount || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="TOTAL SYSTEM CASH IN" value={stats.cashIn} color="green" icon={<ArrowUpCircle size={24}/>}/>
        <MetricCard label="TOTAL SYSTEM CASH OUT" value={stats.cashOut} color="red" icon={<ArrowDownCircle size={24}/>}/>
        <MetricCard label="NET SYSTEM BALANCE" value={stats.net} color="blue" icon={<Wallet size={24}/>}/>
      </div>

      <div className="classic-window">
        <div className="classic-title-bar !bg-blue-900 py-3">
          <div className="flex items-center gap-2"><ListFilter size={14}/><span>ACCOUNTING COMMAND CENTER</span></div>
        </div>
        <div className="classic-body p-6 bg-white/50 space-y-4">
           <div className="flex flex-col md:flex-row gap-4 mb-4">
              <button onClick={() => setIsCashInOpen(true)} className="flex-1 classic-btn bg-green-700 text-white h-20 flex items-center justify-center gap-3 font-black text-xl shadow-lg hover:bg-green-800">
                 <ArrowUpCircle size={28}/> CASH IN TERMINAL
              </button>
              <button onClick={() => setIsCashOutOpen(true)} className="flex-1 classic-btn bg-red-700 text-white h-20 flex items-center justify-center gap-3 font-black text-xl shadow-lg hover:bg-red-800">
                 <ArrowDownCircle size={28}/> CASH OUT TERMINAL
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                 <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="classic-input pl-10 w-full h-11 font-bold" placeholder="Search Ledgers..."/>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => window.print()} className="flex-1 classic-btn bg-white flex items-center justify-center gap-2 font-bold"><Printer size={16}/> PRINT</button>
                 <button className="flex-1 classic-btn bg-white flex items-center justify-center gap-2 font-bold"><Download size={16}/> CSV</button>
              </div>
           </div>
        </div>
      </div>

      <div className="classic-window">
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
                  <td className={`p-3 text-right font-black ${t.type === 'Cash In' ? 'text-green-700' : 'text-red-700'}`}>TK {t.amount.toLocaleString()}</td>
                  <td className="p-3 text-center no-print">
                    <button onClick={() => setTransactions(prev => prev.filter(x => x.id !== t.id))} className="classic-btn p-1 text-red-700 hover:bg-red-50"><Trash2 size={12}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isCashInOpen && <CashInModal onClose={() => setIsCashInOpen(false)} subAccounts={lists.subAccounts} onSave={(t: any) => setTransactions(prev => [t, ...prev])} />}
      {isCashOutOpen && <CashOutModal onClose={() => setIsCashOutOpen(false)} subAccounts={lists.subAccounts} employees={employees} setShipments={setShipments} onSave={(t: any) => setTransactions(prev => [t, ...prev])} />}
    </div>
  );
};

const CashInModal = ({ onClose, subAccounts, onSave }: any) => {
  const [formData, setFormData] = useState({ subAccount: subAccounts[0], amount: '', description: '' });
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="classic-window w-full max-w-md shadow-2xl border-green-800 border-2">
        <div className="classic-title-bar !bg-green-800 py-2">
          <span>CASH IN: SUNNYTRANS CTG HUB</span>
          <button onClick={onClose}><X size={16}/></button>
        </div>
        <div className="classic-body p-6 space-y-4 bg-white">
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 uppercase">TARGET ACCOUNT</label>
             <select value={formData.subAccount} onChange={e => setFormData({...formData, subAccount: e.target.value})} className="classic-input w-full h-11 font-black uppercase">
                {subAccounts.map((s:string) => <option key={s} value={s}>{s}</option>)}
             </select>
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-green-800 uppercase">COLLECTION AMOUNT (TK)</label>
             <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="classic-input w-full h-11 font-black text-2xl border-green-700" placeholder="0.00"/>
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 uppercase">REMARKS</label>
             <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="classic-input w-full h-11 font-bold" placeholder="Details..."/>
           </div>
           <button onClick={() => { if(!formData.amount) return; onSave({...formData, id:Date.now().toString(), type:'Cash In', date:new Date().toISOString().split('T')[0], amount:parseFloat(formData.amount)}); onClose(); }} className="w-full classic-btn bg-green-800 text-white font-black py-4 shadow-lg">POST COLLECTION</button>
        </div>
      </div>
    </div>
  );
};

const CashOutModal = ({ onClose, subAccounts, employees, setShipments, onSave }: any) => {
  const [formData, setFormData] = useState({ sourceAcc: subAccounts[0], target: '', amount: '', remarks: '' });
  const handleSave = () => {
    const amt = parseFloat(formData.amount);
    if (!amt || !formData.target) return;
    onSave({ id: Date.now().toString(), date: new Date().toISOString().split('T')[0], type: 'Cash Out', subAccount: formData.sourceAcc, description: `Payment to: ${formData.target} (${formData.remarks})`, amount: amt });
    if (subAccounts.includes(formData.target)) {
      onSave({ id: Date.now().toString()+"-in", date: new Date().toISOString().split('T')[0], type: 'Cash In', subAccount: formData.target, description: `Transfer From: ${formData.sourceAcc}`, amount: amt });
    }
    const emp = employees.find((e: any) => e.name === formData.target);
    if (emp) {
      setShipments((prev: Shipment[]) => {
        let rem = amt;
        return prev.map(s => {
          if (rem <= 0 || s.employeeName !== formData.target) return s;
          const due = (Number(s.totalIndent || 0)) - (Number(s.paid || 0));
          if (due <= 0) return s;
          const pay = Math.min(rem, due); rem -= pay;
          return { ...s, paid: Number(s.paid || 0) + pay };
        });
      });
    }
    onClose();
    Swal.fire({ title: 'TRANSACTION POSTED', icon: 'success', timer: 1500, showConfirmButton: false });
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="classic-window w-full max-w-md border-red-900 border-2">
        <div className="classic-title-bar !bg-red-800 py-2 flex justify-between">
          <div className="flex items-center gap-2"><Banknote size={14}/><span>CASH OUT: DISBURSEMENT TERMINAL</span></div>
          <button onClick={onClose}><X size={16}/></button>
        </div>
        <div className="classic-body p-6 space-y-4 bg-white">
           <div className="space-y-1">
             <label className="text-[10px] font-black text-gray-500 uppercase">SOURCE ACCOUNT (FROM)</label>
             <select value={formData.sourceAcc} onChange={e => setFormData({...formData, sourceAcc: e.target.value})} className="classic-input w-full h-11 font-black">
                {subAccounts.map((s:string) => <option key={s} value={s}>{s}</option>)}
             </select>
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black text-blue-900 uppercase">TARGET (ACCOUNT OR EMPLOYEE)</label>
             <select value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})} className="classic-input w-full h-11 font-black border-blue-900">
                <option value="">-- SELECT TARGET --</option>
                <optgroup label="SUB-ACCOUNTS">{subAccounts.map((s:string) => <option key={s} value={s}>{s}</option>)}</optgroup>
                <optgroup label="EMPLOYEES">{employees.map((e:any) => <option key={e.id} value={e.name}>{e.name.toUpperCase()}</option>)}</optgroup>
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
           <button onClick={handleSave} className="w-full classic-btn bg-red-800 text-white font-black py-4 shadow-lg">POST TRANSACTION</button>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, color, icon }: any) => {
  const colors: any = { green: "border-green-700 bg-green-50 text-green-900", red: "border-red-700 bg-red-50 text-red-900", blue: "border-blue-700 bg-blue-50 text-blue-900" };
  return (
    <div className={`classic-inset p-5 border-l-4 flex items-center justify-between ${colors[color]}`}>
       <div><p className="text-[10px] font-black uppercase opacity-60">{label}</p><p className="text-2xl font-black font-mono mt-1">TK {value.toLocaleString()}</p></div>
       <div className="opacity-20">{icon}</div>
    </div>
  );
};

export default AccountInfo;
