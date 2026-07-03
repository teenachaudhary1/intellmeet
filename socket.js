import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import { CheckSquare, Plus, Trash2, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const COLUMNS = [
  { id: 'pending', label: 'Pending', colorClass: 'border-orange-500/30 text-orange-400 bg-orange-500/5' },
  { id: 'in_progress', label: 'In Progress', colorClass: 'border-blue-500/30 text-blue-400 bg-blue-500/5' },
  { id: 'completed', label: 'Completed', colorClass: 'border-green-500/30 text-green-400 bg-green-500/5' },
];
const NEXT = { pending: 'in_progress', in_progress: 'completed', completed: null };
const NEXT_LABEL = { pending: 'Move to In Progress', in_progress: 'Mark Completed', completed: null };

export default function ActionItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '' });
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/tasks'); setItems(data); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filterPriority === 'all' ? items : items.filter(i => i.priority === filterPriority);
  const getCol = status => filtered.filter(i => i.status === status);

  const moveItem = async (id, newStatus) => {
    setUpdating(id);
    try { await api.put(`/tasks/${id}`, { status: newStatus }); load(); }
    catch (e) { alert(e.message); }
    finally { setUpdating(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this action item?')) return;
    await api.delete(`/tasks/${id}`);
    load();
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setCreating(true);
    try {
      await api.post('/tasks', { ...form, dueDate: form.dueDate || undefined });
      setCreateOpen(false);
      setForm({ title: '', description: '', priority: 'medium', dueDate: '' });
      load();
    } catch (e) { alert(e.message); }
    finally { setCreating(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Action Items</h1>
          <p className="text-gray-500 mt-1">Track every commitment from your meetings.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500">
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> New Item</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {COLUMNS.map(col => {
          const colItems = getCol(col.id);
          return (
            <div key={col.id} className="flex flex-col gap-3">
              <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${col.colorClass}`}>
                <span className="font-semibold text-sm">{col.label}</span>
                <span className="text-xs opacity-70 bg-black/20 px-2 py-0.5 rounded-full">{colItems.length}</span>
              </div>
              <div className="space-y-2">
                {colItems.length === 0 && <div className="border border-dashed border-white/10 rounded-xl p-4 text-center"><p className="text-xs text-gray-600">Empty</p></div>}
                {colItems.map(item => {
                  const next = NEXT[item.status];
                  return (
                    <div key={item._id} className="card p-4 space-y-2.5 hover:border-white/20 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-100 leading-tight">{item.title}</p>
                        <button onClick={() => handleDelete(item._id)} className="text-gray-600 hover:text-red-400 shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                      {item.description && <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={item.priority}>{item.priority}</Badge>
                        {item.assignee && <span className="text-xs text-gray-500">{item.assignee.name}</span>}
                      </div>
                      {item.dueDate && <div className="flex items-center gap-1 text-xs text-gray-500"><Calendar className="w-3 h-3" />Due {format(new Date(item.dueDate), 'MMM d, yyyy')}</div>}
                      {item.meeting && <p className="text-xs text-gray-600 truncate">From: {item.meeting.title}</p>}
                      {next && (
                        <button onClick={() => moveItem(item._id, next)} disabled={updating === item._id}
                          className="w-full flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-primary-400 py-1.5 rounded-lg hover:bg-primary-500/10 transition-all disabled:opacity-50">
                          {updating === item._id ? <Spinner size="sm" /> : <><span>{NEXT_LABEL[item.status]}</span><ArrowRight className="w-3 h-3" /></>}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Action Item">
        <div className="space-y-4">
          <Input label="Title *" placeholder="Draft architecture document" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Description" placeholder="Additional details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
            <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleCreate} loading={creating} disabled={!form.title.trim()} className="flex-1">Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
