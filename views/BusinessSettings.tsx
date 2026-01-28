
import React from 'react';
import { ListData } from '../types';
import { Plus, Trash2, Edit2, Database } from 'lucide-react';
import Swal from 'sweetalert2';

interface BusinessSettingsProps {
  lists: ListData;
  setLists: React.Dispatch<React.SetStateAction<ListData>>;
  swalSize: number;
}

const BusinessSettings: React.FC<BusinessSettingsProps> = ({ lists, setLists, swalSize }) => {

  const addItem = async (category: keyof ListData) => {
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    const { value: itemValue } = await Swal.fire({
      title: `SYSTEM LIST UPDATE: ${categoryName.toUpperCase()}`,
      input: 'text',
      inputPlaceholder: 'ENTER NEW ENTRY NAME...',
      showCancelButton: true,
      confirmButtonText: 'APPEND TO LIST',
      width: swalSize,
      customClass: { popup: 'classic-swal' },
      inputValidator: (value) => {
        if (!value) return 'VALID INPUT REQUIRED';
        if (lists[category].includes(value)) return 'DUPLICATE ENTRY DETECTED';
      }
    });

    if (itemValue) {
      setLists(prev => ({
        ...prev,
        [category]: [...prev[category], itemValue]
      }));
      
      Swal.fire({
        title: 'DATABASE UPDATED',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        width: swalSize,
        customClass: { popup: 'classic-swal' }
      });
    }
  };

  const deleteItem = async (category: keyof ListData, index: number) => {
    const itemName = lists[category][index];
    const result = await Swal.fire({
      title: 'CONFIRM REMOVAL?',
      text: `Deleting "${itemName}" from operational lists.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'YES, REMOVE',
      width: swalSize,
      customClass: { popup: 'classic-swal' }
    });

    if (result.isConfirmed) {
      setLists(prev => ({
        ...prev,
        [category]: prev[category].filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="classic-info-bar rounded">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase">
          <Database size={14} /> MASTER OPERATIONAL DIRECTORY
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ListManager title="SHIPPER DIRECTORY" items={lists.shipper} onAdd={() => addItem('shipper')} onDelete={(i: number) => deleteItem('shipper', i)} />
        <ListManager title="BUYER DIRECTORY" items={lists.buyer} onAdd={() => addItem('buyer')} onDelete={(i: number) => deleteItem('buyer', i)} />
        <ListManager title="DEPOT / WAREHOUSE" items={lists.depot} onAdd={() => addItem('depot')} onDelete={(i: number) => deleteItem('depot', i)} />
        <ListManager title="SYSTEM OPERATORS" items={lists.staff} onAdd={() => addItem('staff')} onDelete={(i: number) => deleteItem('staff', i)} />
        <ListManager title="EXIT POINTS / PORTS" items={lists.exportInfo} onAdd={() => addItem('exportInfo')} onDelete={(i: number) => deleteItem('exportInfo', i)} />
      </div>
    </div>
  );
};

const ListManager = ({ title, items, onAdd, onDelete }: any) => {
  return (
    <div className="classic-window h-[400px]">
      <div className="classic-title-bar">
        <span>{title}</span>
        <button onClick={onAdd} className="classic-btn p-0 px-2">+</button>
      </div>
      <div className="classic-body flex-1 overflow-y-auto custom-scroll p-2 space-y-1">
        {items.map((item: string, i: number) => (
          <div key={i} className="flex justify-between items-center p-2 bg-white border border-black/5 hover:bg-gray-50 text-[11px] font-bold group">
            <span className="uppercase">{item}</span>
            <button onClick={() => onDelete(i)} className="text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-gray-400 italic text-[10px] mt-10">LIST IS EMPTY</p>}
      </div>
      <div className="classic-footer text-[8px] font-bold">
        <span>COUNT: {items.length}</span>
      </div>
    </div>
  );
};

export default BusinessSettings;
