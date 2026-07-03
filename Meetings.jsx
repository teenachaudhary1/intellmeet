import { useNavigate } from 'react-router-dom';
import { Video, Zap, Users, BarChart3, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import Button from '../components/ui/Button';

const features = [
  { icon: Video, title: 'HD Video Meetings', description: 'Crystal-clear video conferences with real-time chat and up to 100 participants.' },
  { icon: Zap, title: 'AI-Powered Summaries', description: 'Google Gemini automatically generates summaries, extracts decisions, and lists next steps.' },
  { icon: Users, title: 'Real-Time Collaboration', description: 'Socket.io powered live chat, participant management, and shared meeting spaces.' },
  { icon: CheckCircle, title: 'Action Item Tracking', description: 'Kanban board to track every commitment from your meetings through to completion.' },
  { icon: BarChart3, title: 'Analytics Dashboard', description: 'Understand meeting frequency, duration trends, and team productivity at a glance.' },
  { icon: Shield, title: 'Enterprise Security', description: 'JWT authentication, bcrypt password hashing, rate limiting, and MongoDB Atlas encryption.' },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#080d1a] text-gray-100">
      <header className="border-b border-white/10 bg-[#080d1a]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="font-bold text-white text-sm">IM</span>
            </div>
            <span className="font-bold text-xl tracking-tight">IntellMeet</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
            <Button onClick={() => navigate('/register')}>Get Started</Button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-28 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-1.5 mb-8">
          <Zap className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-sm text-primary-400 font-medium">Powered by Google Gemini AI</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          The Command Center<br /><span className="text-primary-400">for Enterprise Meetings</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          AI-powered meeting intelligence that turns every conversation into actionable results — automatic summaries, smart action item extraction, and real-time collaboration.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/register')} className="gap-2">Start for free <ArrowRight className="w-4 h-4" /></Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/login')}>Sign in to workspace</Button>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[{ value: 'Real-Time', label: 'Socket.io Chat' }, { value: 'Gemini AI', label: 'Smart Summaries' }, { value: 'MongoDB', label: 'Atlas Database' }, { value: 'JWT + bcrypt', label: 'Secure Auth' }].map(s => (
            <div key={s.value}><div className="text-2xl font-extrabold text-primary-400 mb-1">{s.value}</div><div className="text-sm text-gray-500">{s.label}</div></div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Everything your team needs</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Built for modern enterprise teams who demand clarity and accountability from every meeting.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card p-6 hover:border-primary-500/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center mb-4"><Icon className="w-5 h-5 text-primary-400" /></div>
                <h3 className="font-semibold text-gray-100 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-white/10 bg-primary-600/5">
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your meetings?</h2>
          <p className="text-gray-400 mb-8">Set up in minutes. No credit card required.</p>
          <Button size="lg" onClick={() => navigate('/register')} className="gap-2">Create free account <ArrowRight className="w-4 h-4" /></Button>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary-600/80 flex items-center justify-center"><span className="font-bold text-white text-xs">IM</span></div>
            <span>IntellMeet</span>
          </div>
          <span>React + Express + MongoDB + Gemini AI</span>
        </div>
      </footer>
    </div>
  );
}
