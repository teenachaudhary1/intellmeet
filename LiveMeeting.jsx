import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { Video, Users, CheckSquare, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{title}</p><p className="text-3xl font-bold text-gray-100">{value ?? '—'}</p></div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5" /></div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/analytics/dashboard'), api.get('/meetings/upcoming'), api.get('/tasks?status=pending')])
      .then(([s, u, p]) => { setStats(s.data); setUpcoming(u.data.slice(0, 5)); setPending(p.data.slice(0, 5)); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  const metrics = [
    { title: 'Total Meetings', value: stats?.totalMeetings, icon: Video, color: 'bg-indigo-500/10 text-indigo-400' },
    { title: 'Active Now', value: stats?.activeMeetings, icon: Users, color: 'bg-green-500/10 text-green-400' },
    { title: 'Pending Actions', value: stats?.pendingActionItems, icon: CheckSquare, color: 'bg-orange-500/10 text-orange-400' },
    { title: 'Completion Rate', value: `${stats?.actionItemCompletionRate ?? 0}%`, icon: TrendingUp, color: 'bg-violet-500/10 text-violet-400' },
  ];

  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Good {greeting}, <span className="text-primary-400">{user?.name?.split(' ')[0]}</span></h1>
        <p className="text-gray-500 mt-1">Here's your team's activity overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => <StatCard key={m.title} {...m} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary-400" /> Upcoming Meetings</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/meetings')} className="gap-1 text-gray-500 text-xs">View all <ArrowRight className="w-3 h-3" /></Button>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? <EmptyState icon={Calendar} title="No upcoming meetings" description="Schedule a meeting to see it here." /> : (
              <div className="space-y-2">
                {upcoming.map(m => (
                  <div key={m._id} onClick={() => navigate(`/meetings/${m._id}`)}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 cursor-pointer transition-all">
                    <div>
                      <p className="text-sm font-medium text-gray-200">{m.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{m.scheduledAt ? format(new Date(m.scheduledAt), 'MMM d, h:mm a') : 'Unscheduled'}</p>
                    </div>
                    <Badge variant={m.status}>{m.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckSquare className="w-4 h-4 text-orange-400" /> Pending Actions</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/action-items')} className="gap-1 text-gray-500 text-xs">View all <ArrowRight className="w-3 h-3" /></Button>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? <EmptyState icon={CheckSquare} title="All caught up!" description="No pending action items." /> : (
              <div className="space-y-2">
                {pending.map(item => (
                  <div key={item._id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                    <div>
                      <p className="text-sm font-medium text-gray-200 line-clamp-1">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.dueDate ? `Due ${format(new Date(item.dueDate), 'MMM d')}` : 'No due date'}
                        {item.assignee && ` · ${item.assignee.name}`}
                      </p>
                    </div>
                    <Badge variant={item.priority}>{item.priority}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Meeting Minutes', value: stats?.totalMeetingMinutes ?? 0, unit: 'min' },
          { label: 'Avg Meeting Duration', value: stats?.avgMeetingDuration ?? 0, unit: 'min' },
          { label: 'Meetings This Week', value: stats?.meetingsThisWeek ?? 0, unit: '' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-2xl font-bold text-primary-400">{s.value}{s.unit}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
