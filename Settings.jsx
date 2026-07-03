import { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { BarChart3, Video, CheckSquare, Clock, TrendingUp } from 'lucide-react';

const PIE_COLORS = { pending: '#f97316', in_progress: '#6366f1', completed: '#22c55e', overdue: '#ef4444' };
const TOOLTIP_STYLE = { backgroundColor: '#0f1629', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e5e7eb' };

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [meetingData, setMeetingData] = useState([]);
  const [actionStats, setActionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get(`/analytics/meetings?days=${days}`),
      api.get('/analytics/action-items'),
    ]).then(([s, m, a]) => { setStats(s.data); setMeetingData(m.data); setActionStats(a.data); })
    .finally(() => setLoading(false));
  }, [days]);

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  const pieData = actionStats ? [
    { name: 'Pending', value: actionStats.pending, color: PIE_COLORS.pending },
    { name: 'In Progress', value: actionStats.in_progress, color: PIE_COLORS.in_progress },
    { name: 'Completed', value: actionStats.completed, color: PIE_COLORS.completed },
    { name: 'Overdue', value: actionStats.overdue, color: PIE_COLORS.overdue },
  ].filter(d => d.value > 0) : [];

  const completionRate = stats?.actionItemCompletionRate ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-gray-500 mt-1">Insights into your team's meeting and productivity patterns.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Meetings', value: stats?.totalMeetings ?? 0, icon: Video, color: 'text-indigo-400' },
          { label: 'Total Participants', value: stats?.totalParticipants ?? 0, icon: BarChart3, color: 'text-violet-400' },
          { label: 'Avg Duration', value: `${stats?.avgMeetingDuration ?? 0}m`, icon: Clock, color: 'text-blue-400' },
          { label: 'Action Items', value: stats?.totalActionItems ?? 0, icon: CheckSquare, color: 'text-orange-400' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-5">
              <div className="flex items-center gap-2 mb-2"><Icon className={`w-4 h-4 ${s.color}`} /><p className="text-xs text-gray-500">{s.label}</p></div>
              <p className="text-2xl font-bold text-gray-100">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">Period:</span>
        {[7, 30, 90].map(d => (
          <button key={d} onClick={() => setDays(d)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${days === d ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
            {d}d
          </button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary-400" /> Meetings Over Time</CardTitle></CardHeader>
        <CardContent>
          {meetingData.length === 0 ? <p className="text-sm text-gray-500 text-center py-8">No meeting data for this period.</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={meetingData}>
                <defs>
                  <linearGradient id="mGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#mGrad)" name="Meetings" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Action Item Status</CardTitle></CardHeader>
          <CardContent>
            {pieData.length === 0 ? <p className="text-sm text-gray-500 text-center py-8">No action items yet.</p> : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend iconType="circle" wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Completion Rate</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#6366f1" strokeWidth="10"
                    strokeDasharray={`${(completionRate / 100) * 263.89} 263.89`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-3xl font-bold text-primary-400">{completionRate}%</p>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500">{stats?.completedActionItems ?? 0} of {stats?.totalActionItems ?? 0} action items completed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
