import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { User, Shield, Key, Save, CheckCircle } from 'lucide-react';

export default function Settings() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put('/auth/me', { name });
      setUser(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-4 h-4 text-primary-400" /> Profile</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-600/30 text-primary-300 font-bold text-2xl flex items-center justify-center border border-primary-500/20">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-gray-100 text-lg">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user?.role}>{user?.role}</Badge>
                {user?.isActive && <Badge variant="success">Active</Badge>}
              </div>
            </div>
          </div>

          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

          <Input
            label="Display Name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your full name"
          />
          <Input
            label="Email Address"
            value={user?.email || ''}
            disabled
            className="opacity-60 cursor-not-allowed"
          />
          <Button onClick={handleSave} loading={saving} className="gap-2">
            {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-400" /> Security</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-200">Password</p>
                <p className="text-xs text-gray-500">Secured with bcrypt (12 rounds)</p>
              </div>
            </div>
            <Badge variant="success">Protected</Badge>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-200">JWT Authentication</p>
                <p className="text-xs text-gray-500">Tokens expire after 7 days</p>
              </div>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Account Info</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'User ID', value: user?._id },
              { label: 'Role', value: user?.role },
              { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              { label: 'Last seen', value: user?.lastSeen ? new Date(user.lastSeen).toLocaleDateString() : '—' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-gray-500">{row.label}</span>
                <span className="text-sm text-gray-300 font-mono text-right max-w-xs truncate">{row.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
