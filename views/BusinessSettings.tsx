
import React from 'react';
import { ListData } from '../types';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Swal from 'sweetalert2';

interface BusinessSettingsProps {
  lists: ListData;
  setLists: React.Dispatch<React.SetStateAction<ListData>>;
}

const BusinessSettings: React.FC<BusinessSettingsProps> = ({ lists, setLists }) => {
  const isDark = document.documentElement.classList.contains('dark');

  const addItem = async (category: keyof ListData) => {
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    const { value: itemValue } = await Swal.fire({
      title: `Add New ${categoryName}`,
      input: 'text',
      inputLabel: `Enter the name for this ${categoryName}`,
      inputPlaceholder: 'Type here...',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      background: isDark ? '#1a202c' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#4a5568',
      inputValidator: (value) => {
        if (!value) return 'You need to write something!';
        if (lists[category].includes(value)) return 'This item already exists!';
      }
    });

    if (itemValue) {
      setLists(prev => ({
        ...prev,
        [category]: [...prev[category], itemValue]
      }));
      
      Swal.fire({
        title: 'Added!',
        text: `${itemValue} added to ${categoryName} list.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: isDark ? '#1a202c' : '#ffffff',
        color: isDark ? '#e2e8f0' : '#4a5568',
      });
    }
  };

  const deleteItem = async (category: keyof ListData, index: number) => {
    const itemName = lists[category][index];
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Remove "${itemName}" from the list?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, remove it!',
      background: isDark ? '#1a202c' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#4a5568',
    });

    if (result.isConfirmed) {
      setLists(prev => ({
        ...prev,
        [category]: prev[category].filter((_, i) => i !== index)
      }));
      
      Swal.fire({
        title: 'Removed!',
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
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-indigo-600">Business Lists & Categories</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ListManager title="Shipper List" items={lists.shipper} onAdd={() => addItem('shipper')} onDelete={(i: number) => deleteItem('shipper', i)} color="blue" />
        <ListManager title="Buyer List" items={lists.buyer} onAdd={() => addItem('buyer')} onDelete={(i: number) => deleteItem('buyer', i)} color="pink" />
        <ListManager title="Depot List" items={lists.depot} onAdd={() => addItem('depot')} onDelete={(i: number) => deleteItem('depot', i)} color="purple" />
        <ListManager title="Staff Members" items={lists.staff} onAdd={() => addItem('staff')} onDelete={(i: number) => deleteItem('staff', i)} color="green" />
        <ListManager title="Export Information" items={lists.exportInfo} onAdd={() => addItem('exportInfo')} onDelete={(i: number) => deleteItem('exportInfo', i)} color="orange" />
      </div>
    </div>
  );
};

const ListManager = ({ title, items, onAdd, onDelete, color }: any) => {
  const colorMap = {
    blue: "text-blue-500 bg-blue-500/10",
    pink: "text-pink-500 bg-pink-500/10",
    purple: "text-purple-500 bg-purple-500/10",
    green: "text-green-500 bg-green-500/10",
    orange: "text-orange-500 bg-orange-500/10",
  }[color as 'blue'|'pink'|'purple'|'green'|'orange'];

  return (
    <div className="neu-panel flex flex-col h-[400px]">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <h4 className="font-bold text-sm">{title}</h4>
        <button onClick={onAdd} className={`p-2 rounded-lg ${colorMap} hover:opacity-80`}><Plus size={16}/></button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-2">
        {items.map((item: string, i: number) => (
          <div key={i} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl group">
            <span className="text-sm font-medium">{item}</span>
            <button onClick={() => onDelete(i)} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-gray-400 text-xs mt-8">No items found.</p>}
      </div>
    </div>
  );
};

export default BusinessSettings;
