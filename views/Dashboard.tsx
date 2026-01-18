
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Package, 
  Calendar, 
  CreditCard,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Shipment, Transaction } from '../types';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';

interface DashboardProps {
  shipments: Shipment[];
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ shipments, transactions }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    const todayShipments = shipments.filter(s => s.date === today);
    const monthShipments = shipments.filter(s => s.date.startsWith(currentMonth));

    const totalDocs = shipments.length;
    
    // Billing Logic: Sum of (Indent + Doc Qty * 165 TK)
    const totalIndent = shipments.reduce((acc, s) => acc + (Number(s.totalIndent || 0)) + (Number(s.docQty || 0) * 165), 0);
    
    // Collection Logic: Sum of paid in shipments + Cash In transactions
    const totalPaidInShipments = shipments.reduce((acc, s) => acc + Number(s.paid || 0), 0);
    const cashIn = transactions.filter(t => t.type === 'Cash In').reduce((a, b) => a + b.amount, 0);
    const cashOut = transactions.filter(t => t.type === 'Cash Out').reduce((a, b) => a + b.amount, 0);
    
    const totalCollection = totalPaidInShipments + cashIn;
    
    // Outstanding = (Total Billed + Expenses) - Total Collection
    const totalDue = totalIndent - totalCollection + cashOut;

    const todayIndent = todayShipments.reduce((acc, s) => acc + (Number(s.totalIndent || 0)) + (Number(s.docQty || 0) * 165), 0);
    const monthIndent = monthShipments.reduce((acc, s) => acc + (Number(s.totalIndent || 0)) + (Number(s.docQty || 0) * 165), 0);

    return {
      todayCount: todayShipments.length,
      todayIndent,
      monthCount: monthShipments.length,
      totalDocs,
      totalBilled: totalIndent,
      totalCollection,
      totalDue,
      expense: cashOut
    };
  }, [shipments, transactions]);

  const chartData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toISOString().substring(0, 7);
    }).reverse();

    return months.map(m => ({
      name: new Date(m + '-01').toLocaleDateString('default', { month: 'short' }),
      billed: shipments.filter(s => s.date.startsWith(m)).reduce((acc, s) => acc + (Number(s.totalIndent || 0)) + (Number(s.docQty || 0) * 165), 0),
      collected: shipments.filter(s => s.date.startsWith(m)).reduce((acc, s) => acc + Number(s.paid || 0), 0),
    }));
  }, [shipments]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Metrics Row 1: Operations */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Today's Docs" 
          value={stats.todayCount} 
          icon={<Package className="text-purple-500" />} 
          trend="+12%"
        />
        <StatCard 
          label="Today's Billing" 
          value={stats.todayIndent.toLocaleString()} 
          icon={<TrendingUp className="text-blue-500" />} 
          prefix="TK"
          trend="+5.4%"
        />
        <StatCard 
          label="Total Documents" 
          value={stats.totalDocs} 
          icon={<BarChart3 className="text-indigo-500" />} 
        />
        <StatCard 
          label="Monthly Records" 
          value={stats.monthCount} 
          icon={<Calendar className="text-orange-500" />} 
        />
      </div>

      {/* Metrics Row 2: Finance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neu-panel p-6 flex flex-col items-center justify-center border-t-4 border-blue-500 hover:scale-[1.02] transition-transform">
          <p className="text-[10px] uppercase font-bold text-gray-400">Total Billed (Inc. Doc Fee)</p>
          <h3 className="text-3xl font-bold text-blue-600 mt-2 font-orbitron">TK {stats.totalBilled.toLocaleString()}</h3>
          <div className="flex items-center gap-1 mt-2 text-green-500 text-xs font-bold">
            <ArrowUpRight size={14} /> Global Revenue
          </div>
        </div>
        <div className="neu-panel p-6 flex flex-col items-center justify-center border-t-4 border-green-500 hover:scale-[1.02] transition-transform">
          <p className="text-[10px] uppercase font-bold text-gray-400">Total Collection</p>
          <h3 className="text-3xl font-bold text-green-600 mt-2 font-orbitron">TK {stats.totalCollection.toLocaleString()}</h3>
          <div className="flex items-center gap-1 mt-2 text-blue-500 text-xs font-bold">
            <CreditCard size={14} /> Received Payments
          </div>
        </div>
        <div className="neu-panel p-6 flex flex-col items-center justify-center border-t-4 border-red-500 hover:scale-[1.02] transition-transform">
          <p className="text-[10px] uppercase font-bold text-gray-400">Outstanding Balance</p>
          <h3 className="text-3xl font-bold text-red-600 mt-2 font-orbitron">TK {stats.totalDue.toLocaleString()}</h3>
          <div className="flex items-center gap-1 mt-2 text-red-400 text-xs font-bold">
            <ArrowDownRight size={14} /> Pending Amount
          </div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="neu-panel p-8">
        <h4 className="text-sm font-bold mb-8 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-500" /> Financial Performance (Last 6 Months)
        </h4>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '12px', fontWeight: 'bold' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} style={{ fontSize: '10px' }} tickFormatter={(value) => `TK ${value/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-color)', borderRadius: '15px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '5px' }}
              />
              <Area type="monotone" dataKey="billed" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBilled)" strokeWidth={4} />
              <Area type="monotone" dataKey="collected" stroke="#10b981" fillOpacity={1} fill="url(#colorCollected)" strokeWidth={4} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  prefix?: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, prefix, trend }) => {
  return (
    <div className="neu-panel p-6 flex flex-col gap-3 relative overflow-hidden group hover:neu-inset transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="p-3 neu-inset rounded-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="flex flex-col items-end">
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</div>
          {trend && <span className="text-[10px] text-green-500 font-bold">{trend}</span>}
        </div>
      </div>
      <div className="mt-1">
        <h3 className="text-3xl font-bold flex items-baseline gap-1 font-orbitron">
          {prefix && <span className="text-xs opacity-40 font-sans">{prefix}</span>}
          {value}
        </h3>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
    </div>
  );
};

export default Dashboard;
