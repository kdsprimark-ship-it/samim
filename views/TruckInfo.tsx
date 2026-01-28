
import React, { useState, useMemo } from 'react';
import { Truck as TruckIcon, Trash2, Edit2, Search as SearchIcon, Save, Printer, Filter } from 'lucide-react';
import { Truck as TruckType, Depot } from '../types';
import Swal from 'sweetalert2';

interface TruckInfoProps {
  trucks: TruckType[];
  setTrucks: React.Dispatch<React.SetStateAction<TruckType[]>>;
  depots: Depot[];
  swalSize: number;
}

const TruckInfo: React.FC<TruckInfoProps> = ({ trucks, setTrucks, depots, swalSize }) => {
  const [searchDate, setSearchDate] = useState('');
  const [searchTruckNo, setSearchTruckNo] = useState('');
  const [newTruck, setNewTruck] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    truckNo: '', 
    mobile: '', 
    depot: depots[0]?.name || 'KDS',
    inTime: '',
    outTime: ''
  });

  const filteredTrucks = useMemo(() => {
    return trucks.filter(t => {
      const matchDate = searchDate ? t.date === searchDate : true;
      const matchNo = searchTruckNo ? t.truckNo.toLowerCase().includes(searchTruckNo.toLowerCase()) : true;
      return matchDate && matchNo;
    });
  }, [trucks, searchDate, searchTruckNo]);

  const handleSave = () => {
    if (!newTruck.truckNo) { 
      Swal.fire({ 
        title: 'INPUT ERROR', 
        text: 'Truck Number is required.', 
        icon: 'error', 
        width: swalSize,
        customClass: { popup: 'classic-swal' } 
      }); 
      return; 
    }
    const t: TruckType = { 
      id: Date.now().toString(), 
      date: newTruck.date, 
      truckNo: newTruck.truckNo, 
      driverMobile: newTruck.mobile, 
      depot: newTruck.depot, 
      inTime: newTruck.inTime, 
      outTime: newTruck.outTime 
    };
    setTrucks(prev => [t, ...prev]);
    Swal.fire({ 
      title: 'RECORD SAVED', 
      text: 'Truck information has been added to fleet database.',
      icon: 'info', 
      width: swalSize,
      customClass: { popup: 'classic-swal' } 
    });
    setNewTruck({ ...newTruck, truckNo: '', mobile: '', inTime: '', outTime: '' });
  };

  const handleDelete = (id: string) => {
    Swal.fire({ 
      title: 'CONFIRM DELETE?', 
      text: 'Are you sure you want to remove this truck record?',
      icon: 'warning', 
      showCancelButton: true,
      confirmButtonText: 'YES',
      width: swalSize,
      customClass: { popup: 'classic-swal' }
    }).then(r => {
      if (r.isConfirmed) setTrucks(prev => prev.filter(t => t.id !== id));
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* 1. Search Section */}
      <div className="classic-window">
        <div className="classic-title-bar"><span>FLEET SEARCH TERMINAL</span></div>
        <div className="classic-body p-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
             <div className="space-y-1">
               <label className="text-[10px] font-bold uppercase text-gray-500">SEARCH BY DATE</label>
               <input 
                 type="date"
                 value={searchDate} 
                 onChange={e => setSearchDate(e.target.value)} 
                 className="classic-input w-full"
               />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-bold uppercase text-gray-500">SEARCH BY TRUCK NO</label>
               <input 
                 type="text"
                 placeholder="Select or Type Truck..."
                 value={searchTruckNo} 
                 onChange={e => setSearchTruckNo(e.target.value)} 
                 className="classic-input w-full"
               />
             </div>
             <button className="classic-btn h-10 bg-cyan-600 text-white flex items-center justify-center gap-2">
                <SearchIcon size={14}/> FIND
             </button>
           </div>
        </div>
      </div>

      {/* 2. New Entry Form */}
      <div className="classic-window">
        <div className="classic-title-bar"><span>NEW VEHICLE ENTRY FORM</span></div>
        <div className="classic-body p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-1">
               <label className="text-[10px] font-bold uppercase text-gray-600">DATE</label>
               <input type="date" value={newTruck.date} onChange={e => setNewTruck({...newTruck, date: e.target.value})} className="classic-input w-full font-bold"/>
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-bold uppercase text-gray-600">TRUCK NUMBER</label>
               <input value={newTruck.truckNo} onChange={e => setNewTruck({...newTruck, truckNo: e.target.value})} className="classic-input w-full font-bold uppercase" placeholder="DM-TA-1234"/>
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-bold uppercase text-gray-600">MOBILE NUMBER</label>
               <input value={newTruck.mobile} onChange={e => setNewTruck({...newTruck, mobile: e.target.value})} className="classic-input w-full font-bold" placeholder="017..."/>
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-bold uppercase text-gray-600">DEPOT</label>
               <select value={newTruck.depot} onChange={e => setNewTruck({...newTruck, depot: e.target.value})} className="classic-input w-full font-bold">
                 {depots.length > 0 ? depots.map(d => <option key={d.id} value={d.name}>{d.name}</option>) : <option value="">NO DEPOTS LOADED</option>}
               </select>
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-bold uppercase text-gray-600">IN TIME</label>
               <input type="time" value={newTruck.inTime} onChange={e => setNewTruck({...newTruck, inTime: e.target.value})} className="classic-input w-full"/>
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-bold uppercase text-gray-600">OUT TIME</label>
               <input type="time" value={newTruck.outTime} onChange={e => setNewTruck({...newTruck, outTime: e.target.value})} className="classic-input w-full"/>
             </div>
          </div>
          <button onClick={handleSave} className="classic-btn w-full py-3 bg-green-600 text-white border-green-800 flex items-center justify-center gap-2">
            <Save size={14} /> F10-SAVE TRUCK INFO
          </button>
        </div>
      </div>

      {/* 3. Results Table */}
      <div className="classic-window">
        <div className="classic-title-bar"><span>FLEET RECORDS DATABASE</span></div>
        <div className="classic-body overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white text-[10px] font-bold border-b border-black">
                  <th className="p-3 border-r border-white/10">Date</th>
                  <th className="p-3 border-r border-white/10">Truck No</th>
                  <th className="p-3 border-r border-white/10">Mobile</th>
                  <th className="p-3 border-r border-white/10">Depot</th>
                  <th className="p-3 border-r border-white/10">In</th>
                  <th className="p-3">Out</th>
                  <th className="p-3 text-center">CMD</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                 {filteredTrucks.map(t => (
                   <tr key={t.id} className="border-b border-black/5 hover:bg-gray-50 text-[11px] font-mono">
                     <td className="p-3 border-r border-black/5">{t.date}</td>
                     <td className="p-3 border-r border-black/5 font-bold uppercase">{t.truckNo}</td>
                     <td className="p-3 border-r border-black/5">{t.driverMobile}</td>
                     <td className="p-3 border-r border-black/5">{t.depot}</td>
                     <td className="p-3 border-r border-black/5 font-bold text-green-700">{t.inTime || '--:--'}</td>
                     <td className="p-3 font-bold text-red-700">{t.outTime || '--:--'}</td>
                     <td className="p-3 text-center">
                       <button onClick={() => handleDelete(t.id)} className="classic-btn p-1 text-red-700"><Trash2 size={12}/></button>
                     </td>
                   </tr>
                 ))}
                 {filteredTrucks.length === 0 && (
                   <tr><td colSpan={7} className="p-10 text-center text-gray-400 font-bold italic uppercase text-[10px]">No fleet records found in database.</td></tr>
                 )}
              </tbody>
           </table>
        </div>
        <div className="classic-footer text-[9px] font-bold">
           <span>FLEET-DB V5.1</span>
           <span>REAL-TIME TRACKING: ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default TruckInfo;
