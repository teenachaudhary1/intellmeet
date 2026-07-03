import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import { Video, Plus, Play, Eye, Trash2, Calendar, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

const TABS = ['all', 'scheduled', 'active', 'ended'];

export default function Meetings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', agenda: '', scheduledAt: '' });
  const [creating, setCreating] = useState(false);
  const [starting, setStarting] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = tab !== 'all' ? { status: tab } : {};
      const { data } = await api.get('/meetings', { params });
      setMeetings(data.meetings || []);
    } finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      await api.post('/meetings', { ...form, scheduledAt: form.scheduledAt || undefined });
      setCreateOpen(false);
      setForm({ title: '', description: '', agenda: '', scheduledAt: '' });
      load();
    } catch (e) { alert(e.message); }
    finally { setCreating(false); }
  };

  const handleStart = async (id) => {
    setStarting(id);
    try { await api.post(`/meetings/${id}/start`); load(); }
    catch (e) { alert(e.message); }
    finally { setStarting(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this meeting?')) return;
    setDeleting(id);
    try { await api.delete(`/meetings/${id}`); load(); }
    catch (e) { alert(e.message); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
          <p className="text-gray-500 mt-1">Manage and join your team meetings.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> New Meeting</Button>
      </div>

      <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl w-fit border border-white/10">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm rounded-lg font-medium capitalize transition-colors ${tab === t ? 'bg-[#0f1629] text-gray-100 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
      ) : meetings.length === 0 ? (
        <EmptyState icon={Video} title="No meetings found" description="Create a new meeting to get started." action={<Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> New Meeting</Button>} />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {meetings.map(m => (
            <Card key={m._id} className="hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-gray-100 leading-tight line-clamp-2">{m.title}</h3>
                <Badge variant={m.status} className="shrink-0">{m.status}</Badge>
              </div>
              {m.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{m.description}</p>}
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
                {m.scheduledAt && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(m.scheduledAt), 'MMM d, h:mm a')}</span>}
                {m.participantCount > 0 && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{m.participantCount}</span>}
                {m.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{m.duration}m</span>}
              </div>
              <div className="flex items-center gap-2">
                {m.status === 'scheduled' && <Button size="sm" className="flex-1 gap-1.5" loading={starting === m._id} onClick={() => handleStart(m._id)}><Play className="w-3.5 h-3.5" /> Start</Button>}
                {m.status === 'active' && <Button size="sm" className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700" onClick={() => navigate(`/meetings/${m._id}/live`)}><Video className="w-3.5 h-3.5" /> Join Live</Button>}
                <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => navigate(`/meetings/${m._id}`)}><Eye className="w-3.5 h-3.5" /> View</Button>
                <button onClick={() => handleDelete(m._id)} disabled={deleting === m._id} className="text-gray-600 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Meeting">
        <div className="space-y-4">
          <Input label="Title *" placeholder="Q2 Planning Session" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" placeholder="What is this meeting about?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
          <Input label="Scheduled At" type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} />
          <Textarea label="Agenda" placeholder="Meeting agenda items..." value={form.agenda} onChange={e => setForm({ ...form, agenda: e.target.value })} rows={2} />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleCreate} loading={creating} disabled={!form.title.trim()} className="flex-1">Create Meeting</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
