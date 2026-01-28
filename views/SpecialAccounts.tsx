
import React, { useState } from 'react';
import { Briefcase, Plus, Search, Trash2, Calendar, Layout, Landmark, CreditCard, Building, BookOpen, PenTool, Gift } from 'lucide-react';
import { Transaction, ListData } from '../types';
import Swal from 'sweetalert2';

interface SpecialAccountsProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  lists: ListData;
  swalSize: number;
}

const SpecialAccounts: React.FC<SpecialAccountsProps> = ({ transactions, setTransactions, lists, swalSize }) => {
  const [activeCat, setActiveCat] = useState('MBL DEPOSITE');
  const [filter, setFilter] = useState('');

  const categories = [
    { name: 'MBL DEPOSITE', icon: <Landmark size={14}/>, color: '!bg-blue-900' },
    { name: 'LICENSE RELATED', icon: <PenTool size={14}/>, color: '!bg-orange-800' },
    { name: 'HOUSE RENT', icon: <Building size={14}/>, color: '!bg-gray-800' },
    { name: 'PASS BOOK', icon: <BookOpen size={14}/>, color: '!bg-green-900' },
    { name: 'STATIONARY', icon: <PenTool size={14}/>, color: '!bg-purple-900' },
    { name: 'SONALI BANK', icon: <Landmark size={14}/>, color: '!bg-indigo-900' },
    { name: 'ONE BANK', icon: <Landmark size={14}/>, color: '!bg-cyan-900' },
    { name: 'SALARY / BONUS', icon: <Gift size={14}/>, color: '!bg-pink-900' },
  ];

  const handleAdd = async () => {
    const isSalary = activeCat === 'SALARY / BONUS';
    const { value: formValues } = await Swal.fire({
      title: `NEW ${activeCat} ENTRY`,
      html: `
        <div class="text-left space-y-3">
          <div><label class="text-[10px] font-bold">DATE:</label><input id="a-date" type="date" value="${new Date().toISOString().split('T')[0]}" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">SUB ACCOUNT:</label>
            <select id="a-sub" class="classic-input w-full h-10">
              ${lists.subAccounts.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </div>
          ${isSalary ? `<div><label class="text-[10px] font-bold">PAID MONTH:</label><input id="a-month" type="month" class="classic-input w-full h-10"></div>` : ''}
          <div><label class="text-[10px] font-bold">AMOUNT (TK):</label><input id="a-amt" type="number" class="classic-input w-full h-10 font-black"></div>
          <div><label class="text-[10px] font-bold">REMARKS:</label><input id="a-rem" class="classic-input w-full h-10"></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'POST TRANSACTION',
      width: swalSize,
      customClass: { popup: 'classic-swal' },
      preConfirm: () => ({
        date: (document.getElementById('a-date') as HTMLInputElement).value,
        subAccount: (document.getElementById('a-sub') as HTMLSelectElement).value,
        amount: parseFloat((document.getElementById('a-amt') as HTMLInputElement).value),
        description: (document.getElementById('a-rem') as HTMLInputElement).value,
        paidMonth: isSalary ? (document.getElementById('a-month') as HTMLInputElement).value : undefined,
      })
    });

    if (formValues?.amount) {
      setTransactions(prev => [{
        ...formValues,
        id: Date.now().toString(),
        type: 'Special',
        category: activeCat
      } as Transaction, ...prev]);
    }
  };

  const filtered = transactions
    .filter(t => t.category === activeCat)
    .filter(t => t.description.toLowerCase().includes(filter.toLowerCase()) || t.subAccount?.toLowerCase().includes(filter.toLowerCase()));

  const totalAmt = filtered.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button 
            key={cat.name} 
            onClick={() => setActiveCat(cat.name)}
            className={`classic-btn flex items-center gap-2 px-4 py-2 transition-all ${activeCat === cat.name ? `${cat.color} text-white shadow-[0_0_10px_rgba(0,0,0,0.5)] scale-105 z-10` : 'bg-white'}`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      <div className="classic-info-bar rounded">
        <button onClick={handleAdd} className="classic-btn neon-btn-green flex items-center gap-2 bg-green-900 text-white">
          <Plus size={14} /> NEW RECORD
        </button>
        <div className="flex-1"></div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="text" 
            placeholder="Search Records..." 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="classic-input pl-8 w-60"
          />
        </div>
      </div>

      <div className="classic-window">
        <div className={`classic-title-bar ${categories.find(c => c.name === activeCat)?.color}`}>
          <span>{activeCat} LEDGER</span>
          <span className="font-mono">TOTAL: TK {totalAmt.toLocaleString()}</span>
        </div>
        <div className="classic-body overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-200 text-[10px] font-black border-b border-black">
                <th className="p-3 border-r border-black/10">DATE</th>
                <th className="p-3 border-r border-black/10">SUB ACCOUNT</th>
                {activeCat === 'SALARY / BONUS' && <th className="p-3 border-r border-black/10">MONTH</th>}
                <th className="p-3 border-r border-black/10 text-right">AMOUNT (TK)</th>
                <th className="p-3 border-r border-black/10">REMARKS</th>
                <th className="p-3 text-center">CMD</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-black/5 hover:bg-gray-50 text-[11px] font-mono group">
                  <td className="p-3 border-r border-black/5">{t.date}</td>
                  <td className="p-3 border-r border-black/5 font-bold uppercase">{t.subAccount || '---'}</td>
                  {activeCat === 'SALARY / BONUS' && <td className="p-3 border-r border-black/5">{t.paidMonth || '---'}</td>}
                  <td className="p-3 border-r border-black/5 text-right font-black">TK {t.amount.toLocaleString()}</td>
                  <td className="p-3 border-r border-black/5 italic">{t.description}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="neon-btn-blue p-1"><PenTool size={12}/></button>
                      <button onClick={() => setTransactions(p => p.filter(x => x.id !== t.id))} className="neon-btn-red p-1 text-red-700"><Trash2 size={12}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="p-20 text-center text-gray-400 font-bold uppercase italic text-xs">No records found for {activeCat}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpecialAccounts;
