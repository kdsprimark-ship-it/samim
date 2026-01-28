
import React, { useState } from 'react';
import { Lock, User, ShieldCheck, Key, ShieldAlert } from 'lucide-react';
import { Employee } from '../types';

interface LoginProps {
  onLogin: (name: string, role: 'Admin' | 'Operator', id: string) => void;
  employees: Employee[];
}

const Login: React.FC<LoginProps> = ({ onLogin, employees }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const username = user.trim();
    setError(null);
    
    // 1. Check Master Admin
    if (username.toLowerCase() === 'admin' && pass === '1234') {
      onLogin('Master Admin', 'Admin', 'master-001');
      return;
    }

    // 2. Check Employee Database
    const matchedEmployee = employees.find(emp => 
       emp.name.toLowerCase() === username.toLowerCase() && (emp.optional === pass || pass === '1234')
    );

    if (matchedEmployee) {
      if (matchedEmployee.status === 'Locked') {
        setError('Your account is currently locked. Contact Administrator.');
        return;
      }
      onLogin(matchedEmployee.name, matchedEmployee.role || 'Operator', matchedEmployee.id);
    } else {
      setError('Credentials refused. Verified users only.');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center p-6 overflow-hidden">
      {/* Background with higher contrast overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&q=80&w=2000")',
          filter: 'brightness(0.3) saturate(1.4)'
        }}
      ></div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-transparent to-purple-900/60 backdrop-blur-[2px]"></div>
      
      <div className="w-full max-w-md animate-zoomIn relative z-10">
        <div className="bg-white/10 backdrop-blur-3xl border border-white/20 p-10 rounded-[45px] shadow-[0_25px_80px_-12px_rgba(0,0,0,0.8)] space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-block p-4 bg-blue-600/20 rounded-full mb-2 ring-2 ring-blue-400/30">
              <ShieldCheck className="text-blue-400" size={40} />
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-2xl">
              SUNNYTRANS
            </h1>
            <p className="text-[11px] font-bold text-blue-200/80 uppercase tracking-[0.4em]">
              Logistics Enterprise Suite
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-4">Operator Name / ID</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input 
                  type="text" 
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-full py-5 pl-14 pr-8 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-black/70 transition-all placeholder-gray-500 font-bold"
                  placeholder="admin or Employee Name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-4">Secure PIN</label>
              <div className="relative group">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input 
                  type="password" 
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-full py-5 pl-14 pr-8 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-black/70 transition-all placeholder-gray-500"
                  placeholder="••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 text-red-200 text-center text-[10px] font-black uppercase animate-shake flex items-center justify-center gap-2">
                <ShieldAlert size={14}/> {error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full font-black text-lg shadow-[0_10px_30px_-5px_rgba(59,130,246,0.6)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              INITIATE SESSION
            </button>
          </form>

          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">
              Authorized Access Only • <span className="text-blue-400 font-black">CTG HUB</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
