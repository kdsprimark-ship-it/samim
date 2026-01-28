
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Shield, 
  UserPlus, 
  Filter, 
  Eye, 
  Lock, 
  Unlock, 
  ExternalLink,
  Layers,
  FileText,
  DollarSign,
  TrendingUp,
  X,
  Settings,
  ShieldAlert,
  UserCheck,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Employee, Shipment } from '../types';
import Swal from 'sweetalert2';

interface UserManagementProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  shipments: Shipment[];
  swalSize: number;
}

const UserManagement: React.FC<UserManagementProps> = ({ employees, setEmployees, shipments, swalSize }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserForSheet, setSelectedUserForSheet] = useState<Employee | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.post.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const targetUserShipments = useMemo(() => {
    if (!selectedUserForSheet) return [];
    return shipments.filter(s => s.employeeName === selectedUserForSheet.name);
  }, [shipments, selectedUserForSheet]);

  const userStats = useMemo(() => {
    if (!selectedUserForSheet) return { count: 0, bill: 0, paid: 0, due: 0 };
    return targetUserShipments.reduce((acc, s) => ({
      count: acc.count + 1,
      bill: acc.bill + (Number(s.totalIndent || 0)),
      paid: acc.paid + (Number(s.paid || 0)),
      due: acc.due + (Number(s.totalIndent || 0) - Number(s.paid || 0))
    }), { count: 0, bill: 0, paid: 0, due: 0 });
  }, [targetUserShipments, selectedUserForSheet]);

  const handleAddUser = async () => {
    const { value: f } = await Swal.fire({
      title: 'CREATE NEW SYSTEM USER',
      html: `
        <div class="text-left space-y-3">
          <div><label class="text-[10px] font-bold">FULL NAME:</label><input id="u-name" class="classic-input w-full h-10"></div>
          <div><label class="text-[10px] font-bold">ROLE / POSITION:</label><input id="u-post" class="classic-input w-full h-10" placeholder="e.g. Senior Operator"></div>
          <div><label class="text-[10px] font-bold">SYSTEM ROLE:</label>
            <select id="u-role" class="classic-input w-full h-10">
              <option value="Operator">Operator</option>
              <option value="Admin">Administrator</option>
            </select>
          </div>
          <div><label class="text-[10px] font-bold">SECURITY PIN:</label><input id="u-pin" class="classic-input w-full h-10" value="1234"></div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'ACTIVATE USER',
      width: swalSize,
      customClass: { popup: 'classic-swal' },
      preConfirm: () => ({
        name: (document.getElementById('u-name') as HTMLInputElement).value,
        post: (document.getElementById('u-post') as HTMLInputElement).value,
        role: (document.getElementById('u-role') as HTMLSelectElement).value as any,
        pin: (document.getElementById('u-pin') as HTMLInputElement).value,
      })
    });

    if (f?.name) {
      const newUser: Employee = {
        id: Date.now().toString(),
        name: f.name,
        post: f.post,
        mobile: 'N/A',
        joinDate: new Date().toISOString().split('T')[0],
        salary: 0,
        address: 'N/A',
        optional: f.pin,
        guardianMobile: 'N/A',
        role: f.role,
        status: 'Active'
      };
      setEmployees(prev => [...prev, newUser]);
      Swal.fire({ title: 'USER CREATED', icon: 'success', timer: 1500, showConfirmButton: false });
    }
  };

  const toggleUserStatus = (id: string) => {
    setEmployees(prev => prev.map(e => {
      if (e.id === id) {
        const nextStatus = e.status === 'Locked' ? 'Active' : 'Locked';
        return { ...e, status: nextStatus };
      }
      return e;
    }));
  };

  const toggleUserRole = (id: string) => {
    setEmployees(prev => prev.map(e => {
      if (e.id === id) {
        const nextRole = e.role === 'Admin' ? 'Operator' : 'Admin';
        return { ...e, role: nextRole };
      }
      return e;
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      
      {/* Search & Action Bar */}
      <div className="classic-info-bar rounded shadow-sm border border-black/10">
        <div className="flex items-center gap-2 text-blue-900 font-black text-xs uppercase">
          <ShieldCheck size={16} /> USER ACCESS & SHEET CONTROL CENTER
        </div>
        <div className="flex-1"></div>
        <div className="flex gap-2">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="classic-input pl-10 w-64 h-10 font-bold" 
              placeholder="Filter Users..."
            />
          </div>
          <button onClick={handleAddUser} className="classic-btn bg-blue-900 text-white flex items-center gap-2 border-blue-950 hover:bg-blue-800">
             <UserPlus size={14}/> CREATE NEW USER
          </button>
        </div>
      </div>

      {/* Main User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmployees.map(emp => (
          <div key={emp.id} className={`classic-window group transition-all ${emp.status === 'Locked' ? 'opacity-60 border-red-500' : 'hover:border-blue-900 shadow-md'}`}>
            <div className={`classic-title-bar flex justify-between ${emp.role === 'Admin' ? '!bg-indigo-900' : '!bg-gray-800'}`}>
              <div className="flex items-center gap-1.5">
                 {emp.role === 'Admin' ? <Shield size={10}/> : <Users size={10}/>}
                 <span>{emp.role || 'OPERATOR'}</span>
              </div>
              <div className="flex gap-1">
                 <button onClick={() => toggleUserRole(emp.id)} title="Toggle Role" className="hover:text-cyan-400 p-0.5"><Settings size={10}/></button>
                 <button onClick={() => toggleUserStatus(emp.id)} title={emp.status === 'Locked' ? "Unlock User" : "Lock User"} className={`p-0.5 ${emp.status === 'Locked' ? 'text-red-400 hover:text-green-400' : 'hover:text-red-400'}`}>
                    {emp.status === 'Locked' ? <Lock size={10}/> : <Unlock size={10}/>}
                 </button>
              </div>
            </div>
            <div className="classic-body p-5 bg-white space-y-4">
              <div className="flex items-center gap-3">
                 <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-xl shadow-inner ${emp.role === 'Admin' ? 'bg-indigo-100 text-indigo-900' : 'bg-blue-100 text-blue-900'}`}>
                    {emp.name.charAt(0)}
                 </div>
                 <div className="overflow-hidden">
                    <h4 className="font-black uppercase text-sm truncate" title={emp.name}>{emp.name}</h4>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{emp.post}</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-center text-[9px] font-black uppercase">
                 <div className="p-2 bg-gray-50 border border-black/5 rounded">
                    <p className="opacity-50 mb-0.5">AUTH STATUS</p>
                    <p className={`flex items-center justify-center gap-1 ${emp.status === 'Locked' ? 'text-red-600' : 'text-green-600'}`}>
                       {emp.status === 'Locked' ? <ShieldAlert size={8}/> : <UserCheck size={8}/>}
                       {emp.status || 'ACTIVE'}
                    </p>
                 </div>
                 <div className="p-2 bg-gray-50 border border-black/5 rounded">
                    <p className="opacity-50 mb-0.5">SECURE PIN</p>
                    <p className="text-gray-700 font-mono tracking-tighter">{emp.optional || '1234'}</p>
                 </div>
              </div>

              <button 
                onClick={() => setSelectedUserForSheet(emp)}
                className="classic-btn w-full bg-blue-900 text-white font-black py-2.5 flex items-center justify-center gap-2 border-blue-950 hover:bg-blue-800 transition-colors"
              >
                <ExternalLink size={14}/> OPEN ALADA SHEET
              </button>
            </div>
            <div className="classic-footer !bg-gray-100 text-[8px] font-bold">
               <span>SYSTEM ID: {emp.id.slice(-6)}</span>
               <span className="opacity-40 italic uppercase">Logon Enabled</span>
            </div>
          </div>
        ))}
      </div>

      {/* Alada Sheet Popup */}
      {selectedUserForSheet && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 animate-fadeIn backdrop-blur-sm">
          <div className="classic-window w-full max-w-5xl h-[85vh] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] border-2 border-blue-900">
            <div className="classic-title-bar !bg-blue-950 py-3 px-6 flex justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-full"><FileText size={18}/></div>
                <div>
                   <span className="text-sm font-black uppercase tracking-widest">ALADA SHEET CONTROL</span>
                   <p className="text-[9px] text-cyan-400 font-bold uppercase tracking-[0.2em]">{selectedUserForSheet.name}'S SECURE LEDGER</p>
                </div>
              </div>
              <button onClick={() => setSelectedUserForSheet(null)} className="hover:text-red-400 transition-colors p-2">
                <X size={24}/>
              </button>
            </div>
            <div className="classic-body bg-gray-100 flex-1 flex flex-col overflow-hidden m-0 border-none">
               {/* User Dashboard Ribbon */}
               <div className="p-6 bg-white border-b-2 border-black/10 grid grid-cols-4 gap-6 shadow-sm">
                  <UserMiniMetric label="TOTAL SHIPMENTS" value={userStats.count} icon={<Layers size={14}/>} color="blue" />
                  <UserMiniMetric label="GROSS INDENT" value={userStats.bill} icon={<DollarSign size={14}/>} color="black" isCurrency />
                  <UserMiniMetric label="TOTAL RECEIVED" value={userStats.paid} icon={<TrendingUp size={14}/>} color="green" isCurrency />
                  <UserMiniMetric label="OUTSTANDING DUE" value={userStats.due} icon={<ShieldAlert size={14}/>} color="red" isCurrency />
               </div>

               {/* Table Data */}
               <div className="flex-1 overflow-auto custom-scroll p-6">
                  <div className="classic-window !bg-white">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-gray-200 text-[10px] font-black uppercase border-b-2 border-black z-10 shadow-sm">
                        <tr>
                          <th className="p-4 border-r border-black/10">DATE</th>
                          <th className="p-4 border-r border-black/10">INVOICE NO</th>
                          <th className="p-4 border-r border-black/10">SHIPPER DIRECTORY</th>
                          <th className="p-4 border-r border-black/10 text-right">BILL (TK)</th>
                          <th className="p-4 border-r border-black/10 text-right">PAID (TK)</th>
                          <th className="p-4 text-right bg-red-50/50">DUE (TK)</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {targetUserShipments.map(s => {
                          const due = (Number(s.totalIndent || 0)) - (Number(s.paid || 0));
                          return (
                            <tr key={s.id} className="border-b border-black/5 hover:bg-blue-50 text-[11px] font-mono transition-colors group">
                              <td className="p-4 border-r border-black/5 whitespace-nowrap">{s.date}</td>
                              <td className="p-4 border-r border-black/5 font-black text-blue-900 group-hover:underline">#{s.invoiceNo}</td>
                              <td className="p-4 border-r border-black/5 uppercase font-bold text-gray-500 truncate max-w-[250px]">{s.shipper}</td>
                              <td className="p-4 border-r border-black/5 text-right font-black">TK {s.totalIndent.toLocaleString()}</td>
                              <td className="p-4 border-r border-black/5 text-right font-bold text-green-700">TK {(s.paid || 0).toLocaleString()}</td>
                              <td className={`p-4 text-right font-black ${due > 0.01 ? 'text-red-600 bg-red-50/20' : 'text-green-600 bg-green-50/20'}`}>TK {due.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                        {targetUserShipments.length === 0 && (
                          <tr><td colSpan={6} className="p-40 text-center">
                            <div className="flex flex-col items-center justify-center opacity-20">
                               <FileText size={64} strokeWidth={1}/>
                               <p className="mt-4 font-black uppercase text-xs tracking-[0.5em]">No Ledger Records Found</p>
                            </div>
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
            <div className="classic-footer p-4 bg-gray-200 border-t-2 border-blue-900 font-black text-[10px] uppercase flex justify-between">
               <div className="flex gap-6">
                 <span>AUDIT MODE: <span className="text-blue-900 underline">READ-ONLY</span></span>
                 <span>USER: <span className="text-blue-900">{selectedUserForSheet.name}</span></span>
               </div>
               <span className="text-gray-400 italic">SYSTEM ENCRYPTED DATA STREAM v5.5</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UserMiniMetric = ({ label, value, icon, color, isCurrency }: any) => {
  const colorMap: any = {
    blue: "border-blue-600 bg-blue-50 text-blue-900",
    green: "border-green-600 bg-green-50 text-green-900",
    red: "border-red-600 bg-red-50 text-red-900",
    black: "border-gray-900 bg-gray-50 text-gray-900"
  };
  return (
    <div className={`p-4 border-l-4 shadow-inner rounded-r transition-transform hover:scale-[1.02] cursor-default ${colorMap[color]}`}>
       <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 bg-white/50 rounded shadow-sm">{icon}</div>
          <p className="text-[9px] font-black uppercase tracking-tighter opacity-70">{label}</p>
       </div>
       <p className="text-xl font-black font-mono">
         {isCurrency ? `TK ${value.toLocaleString()}` : value}
       </p>
    </div>
  );
};

export default UserManagement;
