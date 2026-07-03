export default function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return <div className={`${s[size]} border-2 border-white/10 border-t-primary-500 rounded-full animate-spin ${className}`} />;
}
