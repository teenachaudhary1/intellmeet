export default function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-gray-300">{label}</label>}
      <select className={`input appearance-none ${error ? 'border-red-500/50' : ''} ${className}`} {...props}>{children}</select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
