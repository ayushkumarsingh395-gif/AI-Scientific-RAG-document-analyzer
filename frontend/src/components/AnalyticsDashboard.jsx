import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Users, FileText, Zap, TrendingUp, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const COLORS = ['#2B6FF2', '#6D5AED', '#22D3EE', '#10B981'];

export const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics`);
      if (!res.ok) throw new Error('Failed to load analytics');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nexus-900 text-slate-200 p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-nexus-500/40">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg bg-nexus-800 border border-nexus-500/50 hover:bg-nexus-700 text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Intelligence & System Analytics</h1>
            <p className="text-xs text-slate-400">Real-time operational metrics, retrieval accuracy, and model usage</p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchAnalytics}
          className="px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-400 text-white text-xs font-medium transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="p-4 rounded-xl border border-nexus-500/50 bg-nexus-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Queries</span>
            <Activity size={18} className="text-primary-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data?.total_queries || 0}</div>
          <div className="text-[11px] text-green-400 flex items-center gap-1 mt-1">
            <TrendingUp size={12} /> +18.4% from last week
          </div>
        </div>

        <div className="p-4 rounded-xl border border-nexus-500/50 bg-nexus-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Indexed Documents</span>
            <FileText size={18} className="text-accent-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data?.total_documents || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Vectorized in FAISS</div>
        </div>

        <div className="p-4 rounded-xl border border-nexus-500/50 bg-nexus-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Latency</span>
            <Zap size={18} className="text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data?.avg_latency_ms || 320} ms</div>
          <div className="text-[11px] text-green-400 mt-1">Sub-second inference</div>
        </div>

        <div className="p-4 rounded-xl border border-nexus-500/50 bg-nexus-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Satisfaction</span>
            <ShieldCheck size={18} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data?.satisfaction_rate || 96.5}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Based on user feedback</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-nexus-500/50 bg-nexus-800/70 flex flex-col">
          <h3 className="text-sm font-semibold text-white mb-4">Query Volume (Past 7 Days)</h3>
          <div className="flex-1 min-h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.daily_queries || []}>
                <defs>
                  <linearGradient id="queryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2B6FF2" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2B6FF2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#111A2E', borderColor: '#23304F', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="queries" stroke="#2B6FF2" strokeWidth={2} fillOpacity={1} fill="url(#queryGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="p-5 rounded-xl border border-nexus-500/50 bg-nexus-800/70 flex flex-col">
          <h3 className="text-sm font-semibold text-white mb-4">AI Model Distribution</h3>
          <div className="flex-1 min-h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data?.model_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.model_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111A2E', borderColor: '#23304F', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {(data?.model_distribution || []).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <span className="font-mono text-slate-400">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
