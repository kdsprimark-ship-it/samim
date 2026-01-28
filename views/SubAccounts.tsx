
import React from 'react';
import { PlusCircle, Trash2, Layers } from 'lucide-react';
import { ListData } from '../types';
import Swal from 'sweetalert2';

interface SubAccountsProps {
  lists: ListData;
  setLists: React.Dispatch<React.SetStateAction<ListData>>;
  swalSize: number;
}

const SubAccounts: React.FC<SubAccountsProps> = ({ lists, setLists, swalSize }) => {
  const handleAdd = async () => {
    const { value: name } = await Swal.fire({
      title: 'ADD FINANCE SUB-ACCOUNT',
      input: 'text',
      inputPlaceholder: 'Enter Account Name...',
      showCancelButton: true,
      confirmButtonText: 'ADD ACCOUNT',
      width: swalSize,
      customClass: { popup: 'classic-swal' }
    });
    if (name) setLists(prev => ({ ...prev, subAccounts: [...prev.subAccounts, name] }));
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
      <div className="classic-info-bar rounded">
        <button onClick={handleAdd} className="classic-btn bg-blue-900 text-white flex items-center gap-2"><PlusCircle size={14}/> NEW ACCOUNT</button>
      </div>
      <div className="classic-window">
        <div className="classic-title-bar"><span>FINANCE: SUB-ACCOUNT DIRECTORY</span></div>
        <div className="classic-body p-4 space-y-2 bg-white">
          {lists.subAccounts.map((acc, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 border border-black/5 group hover:border-blue-500">
               <div className="flex items-center gap-3"><Layers size={14} className="text-gray-400"/><span className="text-xs font-black uppercase">{acc}</span></div>
               <button onClick={() => setLists(p => ({ ...p, subAccounts: p.subAccounts.filter((_, idx) => idx !== i) }))} className="text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100"><Trash2 size={14}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubAccounts;
