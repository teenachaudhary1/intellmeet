@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { @apply border-white/10; }
  body { @apply bg-[#080d1a] text-gray-100 font-sans antialiased; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { @apply bg-transparent; }
  ::-webkit-scrollbar-thumb { @apply bg-white/10 rounded-full hover:bg-white/20; }
}

@layer components {
  .card { @apply bg-[#0f1629] border border-white/10 rounded-xl; }
  .btn-primary { @apply bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed; }
  .btn-outline { @apply border border-white/20 hover:bg-white/5 text-gray-300 font-medium px-4 py-2 rounded-lg transition-colors; }
  .btn-ghost { @apply hover:bg-white/5 text-gray-400 hover:text-gray-200 font-medium px-3 py-2 rounded-lg transition-colors; }
  .input { @apply bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all w-full; }
  .badge { @apply inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium; }
  .badge-active   { @apply bg-green-500/15 text-green-400 border border-green-500/20; }
  .badge-scheduled { @apply bg-blue-500/15 text-blue-400 border border-blue-500/20; }
  .badge-ended    { @apply bg-gray-500/15 text-gray-400 border border-gray-500/20; }
  .badge-high     { @apply bg-red-500/15 text-red-400 border border-red-500/20; }
  .badge-medium   { @apply bg-amber-500/15 text-amber-400 border border-amber-500/20; }
  .badge-low      { @apply bg-gray-500/15 text-gray-400 border border-gray-500/20; }
  .badge-pending      { @apply bg-orange-500/15 text-orange-400 border border-orange-500/20; }
  .badge-in_progress  { @apply bg-blue-500/15 text-blue-400 border border-blue-500/20; }
  .badge-completed    { @apply bg-green-500/15 text-green-400 border border-green-500/20; }
  .badge-admin    { @apply bg-primary-500/15 text-primary-400 border border-primary-500/20; }
  .badge-member   { @apply bg-gray-500/15 text-gray-400 border border-gray-500/20; }
}
