
import React, { useState } from 'react';
import { Truck as TruckIcon, Plus, Search, MapPin, Phone, Clock, Trash2 } from 'lucide-react';
import { Truck as TruckType, ListData } from '../types';
import Swal from 'sweetalert2';

interface TruckInfoProps {
  trucks: TruckType[];
  setTrucks: React.Dispatch<React.SetStateAction<TruckType[]>>;
  lists: ListData;
}

const TruckInfo: React.FC<TruckInfoProps> = ({ trucks, setTrucks, lists }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isDark = document.documentElement.classList.contains('dark');

  const handleAddTruck = async () => {
    const depotOptions = lists.depot.map(d => `<option value="${d}">${d}</option>`).join('');
    
    const { value: formValues } = await Swal.fire({
      title: 'New Truck Entry',
      html: `
        <div class="space-y-4">
          <input id="tr-no" class="swal2-input" placeholder="Truck Plate No (e.g. DHAKA METRO-T-1234)">
          <input id="tr-phone" class="swal2-input" placeholder="Driver Mobile No">
          <select id="tr-depot" class="swal2-input">
            <option value="">Select Depot</option>
            ${depotOptions}
          </select>
          <div class="flex gap-2">
            <div class="flex-1">
              <label class="text-[10px] text-gray-400 font-bold block text-left">IN TIME</label>
              <input id="tr-in" type="time" class="swal2-input w-full">
            </div>
            <div class="flex-1">
              <label class="text-[10px] text-gray-400 font-bold block text-left">OUT TIME (OPTIONAL)</label>
              <input id="tr-out" type="time" class="swal2-input w-full">
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save Record',
      confirmButtonColor: '#3b82f6',
      background: isDark ? '#1a202c' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#4a5568',
      preConfirm: () => {
        const truckNo = (document.getElementById('tr-no') as HTMLInputElement).value;
        const driverMobile = (document.getElementById('tr-phone') as HTMLInputElement).value;
        const depot = (document.getElementById('tr-depot') as HTMLSelectElement).value;
        const inTime = (document.getElementById('tr-in') as HTMLInputElement).value;
        const outTime = (document.getElementById('tr-out') as HTMLInputElement).value;

        if (!truckNo || !depot || !inTime) {
          Swal.showValidationMessage('Truck No, Depot, and In-Time are required');
          return false;
        }
        return { truckNo, driverMobile, depot, inTime, outTime };
      }
    });

    if (formValues) {
      const today = new Date().toISOString().split('T')[0];
      const newTruck: TruckType = {
        id: Date.now().toString(),
        date: today,
        truckNo: formValues.truckNo,
        driverMobile: formValues.driverMobile,
        depot: formValues.depot,
        inTime: `${today}T${formValues.inTime}`,
        outTime: formValues.outTime ? `${today}T${formValues.outTime}` : ''
      };

      setTrucks(prev => [newTruck, ...prev]);
      Swal.fire({
        title: 'Saved!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: isDark ? '#1a202c' : '#ffffff',
        color: isDark ? '#e2e8f0' : '#4a5568',
      });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      background: isDark ? '#1a202c' : '#ffffff',
      color: isDark ? '#e2e8f0' : '#4a5568',
    });

    if (result.isConfirmed) {
      setTrucks(prev => prev.filter(t => t.id !== id));
    }
  };

  const filteredTrucks = trucks.filter(t => t.truckNo.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <button 
          onClick={handleAddTruck}
          className="btn-neon px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2"
        >
          <Plus size={20} /> ADD TRUCK RECORD
        </button>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Truck No..." 
            className="w-full pl-10 pr-4 py-3 neu-inset bg-transparent border-none rounded-xl text-sm outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrucks.map(truck => (
          <div key={truck.id} className="neu-panel p-6 space-y-4 hover:scale-[1.02] transition-transform cursor-pointer group relative">
            <button 
              onClick={(e) => { e.stopPropagation(); handleDelete(truck.id); }}
              className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-full"
            >
              <Trash2 size={16} />
            </button>
            <div className="flex justify-between items-start">
              <div className="p-3 neu-inset rounded-xl text-amber-500">
                <TruckIcon size={24} />
              </div>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{truck.date}</span>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-2xl font-bold font-orbitron group-hover:text-blue-500 transition-colors uppercase tracking-tight">{truck.truckNo}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                <Phone size={14} className="text-green-500" /> {truck.driverMobile || 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-bold">
                <MapPin size={14} className="text-red-500" /> {truck.depot}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[8px] uppercase font-bold text-gray-400">Entry Time</p>
                <div className="flex items-center gap-1 text-[10px] font-bold"><Clock size={10} /> {new Date(truck.inTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] uppercase font-bold text-gray-400">Exit Time</p>
                <div className="flex items-center gap-1 text-[10px] font-bold"><Clock size={10} /> {truck.outTime ? new Date(truck.outTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-green-500 font-bold italic">Still In</span>}</div>
              </div>
            </div>
          </div>
        ))}
        {filteredTrucks.length === 0 && (
          <div className="col-span-full neu-panel p-20 text-center text-gray-400 italic">
            No truck movements found.
          </div>
        )}
      </div>
    </div>
  );
};

export default TruckInfo;
