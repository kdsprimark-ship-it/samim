
import React, { useState } from 'react';
import { UserPlus, Search, Trash2, Edit2, Phone, Briefcase } from 'lucide-react';
import { Contact, ListData } from '../types';
import Swal from 'sweetalert2';

interface ContactsViewProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  lists: ListData;
  swalSize: number;
}

const ContactsView: React.FC<ContactsViewProps> = ({ contacts, setContacts, lists, swalSize }) => {
  const [filter, setFilter] = useState('');

  const handleAdd = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'NEW CONTACT ENTRY',
      html: `
        <div class="text-left space-y-3">
          <div><label class="text-[10px] font-bold">Contact Name:</label><input id="c-name" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">Type:</label>
            <select id="c-type" class="classic-input w-full h-10">
              <option value="Customer">Customer</option>
              <option value="Supplier/Employee">Supplier/Employee</option>
            </select>
          </div>
          <div><label class="text-[10px] font-bold">Phone Number:</label><input id="c-phone" class="classic-input w-full h-10"></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'SAVE CONTACT',
      width: swalSize,
      customClass: { popup: 'classic-swal' },
      preConfirm: () => ({
        name: (document.getElementById('c-name') as HTMLInputElement).value,
        type: (document.getElementById('c-type') as HTMLSelectElement).value as any,
        phone: (document.getElementById('c-phone') as HTMLInputElement).value,
      })
    });

    if (formValues?.name) {
      setContacts(prev => [...prev, { ...formValues, id: Date.now().toString() }]);
    }
  };

  const filtered = contacts.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="classic-info-bar rounded">
        <button onClick={handleAdd} className="classic-btn neon-btn-green flex items-center gap-2 bg-green-900 text-white">
          <UserPlus size={14} /> ADD CONTACT
        </button>
        <div className="flex-1"></div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input 
            type="text" 
            placeholder="Search Contacts..." 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="classic-input pl-8 w-60"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div key={c.id} className="classic-window group">
            <div className={`classic-title-bar ${c.type === 'Customer' ? '!bg-blue-900' : '!bg-orange-800'}`}>
              <div className="flex items-center gap-2">
                <Briefcase size={12} />
                <span>{c.type.toUpperCase()}</span>
              </div>
              <button onClick={() => setContacts(p => p.filter(x => x.id !== c.id))} className="text-red-300 hover:text-red-500">
                <Trash2 size={12}/>
              </button>
            </div>
            <div className="classic-body p-4 space-y-3 bg-white">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-100 rounded-full text-blue-900">
                    <UserPlus size={24}/>
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-sm">{c.name}</h4>
                    <p className="text-[10px] text-gray-400 font-bold tracking-widest">UID: {c.id.slice(-6)}</p>
                  </div>
               </div>
               <div className="flex items-center gap-2 text-xs font-mono text-gray-600">
                  <Phone size={12}/> {c.phone || 'N/A'}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactsView;
