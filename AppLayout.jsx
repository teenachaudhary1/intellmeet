export default function Badge({ children, variant = 'default', className = '' }) {
  const v = {
    default: 'bg-white/10 text-gray-300',
    active: 'badge-active', scheduled: 'badge-scheduled', ended: 'badge-ended',
    high: 'badge-high', medium: 'badge-medium', low: 'badge-low',
    pending: 'badge-pending', in_progress: 'badge-in_progress', completed: 'badge-completed',
    admin: 'badge-admin', member: 'badge-member',
    success: 'bg-green-500/15 text-green-400 border border-green-500/20',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    error: 'bg-red-500/15 text-red-400 border border-red-500/20',
  };
  return <span className={`badge ${v[variant] || v.default} ${className}`}>{children}</span>;
}
