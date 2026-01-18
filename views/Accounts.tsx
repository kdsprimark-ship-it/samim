
import React, { useState, useMemo } from 'react';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  Search, 
  History,
  CheckCircle2
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
}

const Accounts: React.FC<AccountsProps> = ({ 
  transactions, 
  shipments, 
  setTransactions, 
  setShipments, 
  submittedInvoices,
  setSubmittedInvoices
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isDark = document.documentElement.classList.contains('dark');

  const stats = useMemo(() => {
    // Total Billed = Base Indent + (Doc Count * 165 TK)
    const totalBilled = shipments.reduce((acc, s) => acc + (Number(s.totalIndent || 0)) + (Number(s.docQty || 0) * 165), 0);
    
    // Total Collection = Direct payments on jobs + Cash In entries
    const totalPaidInShipments = shipments.reduce((acc, s) => acc + Number(s.paid || 0), 0);
    const cashIn = transactions.filter(t => t.type === 'Cash In').reduce((a, b) => a + b.amount, 0);
    const cashOut = transactions.filter(t => t.type === 'Cash Out').reduce((a, b) => a + b.amount, 0);

    const totalCollection = totalPaidInShipments + cashIn;
    const outstanding = totalBilled - totalCollection + cashOut;

    return {
      totalBilled,
      totalCollection,
      outstanding,
      cashOut
    };
  }, [shipments, transactions]);

  const handleNewTransaction = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'New Cash Transaction',
      html: `
        <div class="space-y-4">
          <select id="t-type" class="swal2-input w-full">
            <option value="Cash In">Cash In (Revenue)</option>
            <option value="Cash Out">Cash Out (Expense)</option>
          </select>
          <input id="t-category" class="swal2-input" placeholder="Category (e.g. Office Rent, Salary)">
          <input id="t-desc" class="swal2-input" placeholder="Description">
          <input id="t-amount" type="number" class="swal2-input" placeholder="Amount (TK)">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Record Transaction',
      confirmButtonColor: '#3b82f6',
      background: isDark ? '#1a202c' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#4a5568',
      preConfirm: () => {
        const type = (document.getElementById('t-type') as HTMLSelectElement).value;
        const category = (document.getElementById('t-category') as HTMLInputElement).value;
        const description = (document.getElementById('t-desc') as HTMLInputElement).value;
        const amount = parseFloat((document.getElementById('t-amount') as HTMLInputElement).value);

        if (!category || isNaN(amount)) {
          Swal.showValidationMessage('Please enter valid category and amount');
          return false;
        }
        return { type, category, description, amount };
      }
    });

    if (formValues) {
      const newT: Transaction = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        ...formValues
      };
      setTransactions(prev => [newT, ...prev]);
      Swal.fire({
        title: 'Success!',
        text: 'Transaction recorded successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: isDark ? '#1a202c' : '#ffffff',
        color: isDark ? '#e2e8f0' : '#4a5568',
      });
    }
  };

  const handleSubmitBill = async () => {
    const { value: billData } = await Swal.fire({
      title: 'Submit Bill & Finalize Payment',
      html: `
        <div class="space-y-4">
          <p class="text-xs text-gray-400 font-bold mb-2 uppercase tracking-widest">Mark Invoice as Submitted (RED)</p>
          <input id="bill-inv" class="swal2-input" placeholder="Invoice Number (e.g. INV-2024-001)">
          <input id="bill-amt" type="number" class="swal2-input" placeholder="Collection Amount (TK)">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Submit & Reduce Due',
      confirmButtonColor: '#ef4444',
      background: isDark ? '#1a202c' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#4a5568',
      preConfirm: () => {
        const inv = (document.getElementById('bill-inv') as HTMLInputElement).value.trim();
        const amt = parseFloat((document.getElementById('bill-amt') as HTMLInputElement).value);
        if (!inv || isNaN(amt)) {
          Swal.showValidationMessage('Invoice No and Amount are required');
          return false;
        }
        return { inv, amt };
      }
    });

    if (billData) {
      // 1. Add to submitted list to turn text red in DIST_LOG
      setSubmittedInvoices(prev => [...new Set([...prev, billData.inv.toUpperCase()])]);

      // 2. Add as a Cash In transaction to reduce Outstanding Due
      const newT: Transaction = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        type: 'Cash In',
        category: 'Bill Collection',
        description: `Full/Partial Payment for Invoice ${billData.inv.toUpperCase()}`,
        amount: billData.amt,
        invoiceNo: billData.inv.toUpperCase()
      };
      setTransactions(prev => [newT, ...prev]);

      Swal.fire({
        title: 'Bill Processed!',
        html: `<p>Invoice <b>${billData.inv.toUpperCase()}</b> marked as red.<br/>Outstanding reduced by <b>TK ${billData.amt.toLocaleString()}</b>.</p>`,
        icon: 'success',
        background: isDark ? '#1a202c' : '#ffffff',
        color: isDark ? '#e2e8f0' : '#4a5568',
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete Transaction?',
      text: "This will revert the balance change.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete',
      background: isDark ? '#1a202c' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#4a5568',
    });

    if (result.isConfirmed) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      Swal.fire({
        title: 'Deleted',
        icon: 'success',
        timer: 1000,
        showConfirmButton: false,
        background: isDark ? '#1a202c' : '#ffffff',
        color: isDark ? '#e2e8f0' : '#4a5568',
      });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Finance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceCard 
          label="Total Billed" 
          value={stats.totalBilled.toLocaleString()} 
          icon={<Wallet className="text-blue-500" />} 
          color="blue" 
          detail="Includes 165 TK/Doc"
        />
        <FinanceCard 
          label="Total Collected" 
          value={stats.totalCollection.toLocaleString()} 
          icon={<ArrowUpCircle className="text-green-500" />} 
          color="green" 
          detail="All Income Sources"
        />
        <FinanceCard 
          label="Outstanding Due" 
          value={stats.outstanding.toLocaleString()} 
          icon={<ArrowDownCircle className="text-red-500" />} 
          color="red" 
          detail="Net Receivable"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-3">
          <button 
            onClick={handleNewTransaction}
            className="btn-neon px-8 py-4 rounded-2xl text-white font-bold flex items-center gap-3 shadow-xl"
          >
            <Plus size={20} /> NEW TRANSACTION
          </button>
          <button 
            onClick={handleSubmitBill}
            className="neu-panel px-8 py-4 rounded-2xl text-red-500 font-bold hover:neu-inset border-2 border-red-500/10 flex items-center gap-3 transition-all"
          >
            <CheckCircle2 size={20} /> SUBMIT BILL (INV RED)
          </button>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Accounts Records..." 
            className="w-full pl-12 pr-4 py-4 neu-inset bg-transparent border-none rounded-2xl text-sm outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Transaction Table */}
      <div className="neu-panel overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 font-bold text-sm bg-gray-50/50 dark:bg-gray-900/20">
          <History size={18} className="text-blue-500" /> Recent Activity Log
        </div>
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900/50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                <th className="p-5">Date</th>
                <th className="p-5">Type</th>
                <th className="p-5">Category</th>
                <th className="p-5">Description</th>
                <th className="p-5 text-right">Amount</th>
                <th className="p-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase())).map(t => (
                <tr key={t.id} className="hover:bg-blue-50/20 dark:hover:bg-blue-900/5 text-sm transition-colors">
                  <td className="p-5 font-mono text-xs text-gray-400">{t.date}</td>
                  <td className={`p-5 font-bold ${t.type === 'Cash In' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type}
                  </td>
                  <td className="p-5"><span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full font-bold text-[10px] uppercase">{t.category}</span></td>
                  <td className="p-5 italic opacity-70">
                    {t.description}
                    {t.invoiceNo && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-[4px] text-[10px] font-bold border border-red-200 uppercase tracking-tighter">{t.invoiceNo}</span>}
                  </td>
                  <td className="p-5 text-right font-bold text-lg">TK {t.amount.toLocaleString()}</td>
                  <td className="p-5 text-center">
                     <button 
                        onClick={() => handleDeleteTransaction(t.id)} 
                        className="text-red-400 p-2 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        ×
                      </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-gray-400 italic">No accounting activity recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const FinanceCard = ({ label, value, icon, color, detail }: any) => {
  const borderColors = {
    blue: "border-blue-500",
    green: "border-green-500",
    red: "border-red-500"
  }[color as 'blue' | 'green' | 'red'];

  return (
    <div className={`neu-panel p-8 flex flex-col items-center justify-center text-center border-t-8 ${borderColors} hover:scale-[1.02] transition-transform cursor-default`}>
      <div className="p-4 neu-inset rounded-2xl mb-4 text-gray-600">{icon}</div>
      <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-[0.2em]">{label}</p>
      <h3 className="text-3xl font-bold font-orbitron mb-1">TK {value}</h3>
      {detail && <p className="text-[9px] font-bold text-blue-500 opacity-60 uppercase">{detail}</p>}
    </div>
  );
};

export default Accounts;
