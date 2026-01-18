
import React, { useState } from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (user: string, pass: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'admin' && pass === '1234') {
      onLogin(user, pass);
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center p-6 overflow-hidden">
      {/* High-Resolution Logistics Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&q=80&w=2000")',
          filter: 'brightness(0.4) saturate(1.2)'
        }}
      ></div>
      
      {/* Dynamic Overlay Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-purple-900/40 backdrop-blur-[1px]"></div>
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-blue-500 rounded-full blur-[150px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-purple-500 rounded-full blur-[150px] opacity-30 animate-pulse"></div>

      <div className="w-full max-w-md animate-zoomIn relative z-10">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-10 rounded-[45px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-block p-4 bg-white/10 rounded-full mb-2">
              <ShieldCheck className="text-blue-400" size={40} />
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-lg">
              SUNNYTRANS
            </h1>
            <p className="text-[11px] font-bold text-blue-200/80 uppercase tracking-[0.4em]">
              Logistics Enterprise Suite
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-4">Operator ID</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input 
                  type="text" 
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-full py-5 pl-14 pr-8 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-black/70 transition-all placeholder-gray-500"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-4">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-blue-400 transition-colors" size={20} />
                <input 
                  type="password" 
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-full py-5 pl-14 pr-8 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-black/70 transition-all placeholder-gray-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-3 text-red-400 text-center text-xs font-bold animate-shake">
                Invalid credentials. Unauthorized access prohibited.
              </div>
            )}

            <button 
              type="submit" 
              className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full font-black text-lg shadow-[0_10px_20px_-5px_rgba(59,130,246,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              AUTHENTICATE SESSION
            </button>
          </form>

          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-[10px] text-gray-400">
              Authorized Personnel Only • <span className="text-blue-400 font-bold">ST Global Systems</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
