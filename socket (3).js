export default function Textarea({ label, error, className = '', rows = 3, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <textarea rows={rows} className={`input resize-none ${error ? 'border-red-500/50' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
