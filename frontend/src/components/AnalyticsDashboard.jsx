import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Users, CheckCircle, TrendingUp, AlertCircle, RefreshCw, Filter } from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#22c55e', '#94a3b8'];

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'incharge', 'incontrol', 'mixed' (using 'all' as mixed/default)
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/admin/analytics?role=${filter}`, {
        headers: { Authorization: token }
      });
      setData(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filter]);

  if (loading && !data) return <div className="p-5 text-text-secondary">Loading analytics...</div>;
  if (error) return <div className="p-5 text-error">{error}</div>;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header & Filters */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-3">
            <Filter size={16} className="text-text-secondary" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border-none text-text-primary outline-none cursor-pointer min-w-[120px] text-sm font-medium"
            >
              <option value="all" className="bg-bg-secondary">All Users</option>
              <option value="incharge" className="bg-bg-secondary">In-Charge Only</option>
              <option value="incontrol" className="bg-bg-secondary">In-Control Only</option>
            </select>
          </div>
          
          <button 
            onClick={fetchAnalytics} 
            className="btn-primary px-3 py-2 text-sm" 
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="Total Users" 
          value={data.stats.totalUsers} 
          icon={<Users size={24} color="#6366f1" />} 
        />
        <StatCard 
          title="Avg Score (In-Charge)" 
          value={data.stats.avgScore?.toFixed(1) || '0.0'} 
          icon={<TrendingUp size={24} color="#22c55e" />} 
          subtext="Out of 10"
        />
        <StatCard 
          title="In-Charge Accuracy" 
          value={`${data.stats.inChargeAccuracy?.toFixed(1)}%`} 
          icon={<CheckCircle size={24} color="#a855f7" />} 
        />
        <StatCard 
          title="In-Control Accuracy" 
          value={`${data.stats.inControlAccuracy?.toFixed(1)}%`} 
          icon={<CheckCircle size={24} color="#f43f5e" />} 
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* User Growth */}
        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h3 className="text-lg font-bold mb-6">User Growth (30 Days)</h3>
          <div className="flex-1 w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.userGrowth}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} />
              <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#141417', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px' }} 
              />
              <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h3 className="text-lg font-bold mb-6">Role Distribution</h3>
          <div className="flex-1 w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.roleDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.roleDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#141417', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Accuracy Comparison */}
        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h3 className="text-lg font-bold mb-6">Accuracy Comparison</h3>
          <div className="flex-1 w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.accuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#141417', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="InCharge" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="InControl" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Top Users */}
        <div className="glass-card p-6 min-h-[350px] flex flex-col">
          <h3 className="text-lg font-bold mb-6">Top 5 Performers</h3>
          <div className="flex-1 w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topUsers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" tick={{fontSize: 12}} />
              <Tooltip contentStyle={{ backgroundColor: '#141417', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '8px' }} />
              <Bar dataKey="score" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-card p-0 overflow-hidden">
        <div className="p-6 border-b border-white/[0.08]">
          <h3 className="text-lg font-bold">User Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white/[0.02] text-text-secondary border-b border-white/[0.08]">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Score (Charge/Control)</th>
                <th className="p-4 font-semibold">Result</th>
                <th className="p-4 font-semibold">Accuracy</th>
                <th className="p-4 font-semibold">Last Quiz</th>
              </tr>
            </thead>
            <tbody>
              {data.usersTable.map((user) => (
                <tr key={user.id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-text-secondary">{user.email}</td>
                  <td className="p-4">{user.score}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      user.result === 'In-Charge' ? 'bg-indigo-500/20 text-indigo-400' : 
                      user.result === 'In-Control' ? 'bg-purple-500/20 text-purple-400' : 
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {user.result || 'N/A'}
                    </span>
                  </td>
                  <td className="p-4">{user.accuracy}</td>
                  <td className="p-4 text-text-secondary">
                    {user.lastQuizDate !== '-' ? new Date(user.lastQuizDate).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ title, value, icon, subtext }) => (
  <div className="glass-card p-6 flex items-center gap-4">
    <div className="bg-white/5 p-3 rounded-2xl flex items-center justify-center h-12 w-12">
      {icon}
    </div>
    <div>
      <div className="text-text-secondary text-sm font-medium">{title}</div>
      <div className="text-2xl font-bold mt-1 text-white">{value}</div>
      {subtext && <div className="text-xs text-text-secondary mt-0.5">{subtext}</div>}
    </div>
  </div>
);

export default AnalyticsDashboard;
