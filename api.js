import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { connectSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { Mic, MicOff, Video, VideoOff, Monitor, Circle, Send, X, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const COLORS = ['bg-indigo-500', 'bg-violet-500', 'bg-blue-500', 'bg-teal-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500'];

function Avatar({ name, color }) {
  const ini = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  return <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center text-white text-xl font-bold`}>{ini}</div>;
}

export default function LiveMeeting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    api.get(`/meetings/${id}`).then(({ data }) => { setMeeting(data); setParticipants(data.participants || []); });
    const socket = connectSocket(token);
    socketRef.current = socket;
    socket.emit('join_meeting', { meetingId: id });
    socket.on('recent_messages', msgs => setMessages(msgs));
    socket.on('new_message', msg => setMessages(prev => [...prev, msg]));
    socket.on('user_joined', data => setParticipants(prev => prev.some(p => p.user?._id === data.userId) ? prev : [...prev, { user: { _id: data.userId, name: data.name }, joinedAt: new Date() }]));
    socket.on('user_left', ({ userId }) => setParticipants(prev => prev.filter(p => p.user?._id !== userId)));
    socket.on('meeting_ended', () => navigate(`/meetings/${id}`));
    return () => {
      socket.emit('leave_meeting', { meetingId: id });
      ['recent_messages', 'new_message', 'user_joined', 'user_left', 'meeting_ended'].forEach(e => socket.off(e));
    };
  }, [id, token]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleToggleMute = () => { const n = !isMuted; setIsMuted(n); socketRef.current?.emit('toggle_media', { meetingId: id, isMuted: n, isVideoOn }); };
  const handleToggleVideo = () => { const n = !isVideoOn; setIsVideoOn(n); socketRef.current?.emit('toggle_media', { meetingId: id, isMuted, isVideoOn: n }); };

  const handleSend = () => {
    if (!chatInput.trim()) return;
    socketRef.current?.emit('send_message', { meetingId: id, content: chatInput });
    setChatInput('');
  };

  const handleLeave = () => { socketRef.current?.emit('leave_meeting', { meetingId: id }); navigate(`/meetings/${id}`); };
  const handleEnd = async () => { try { await api.post(`/meetings/${id}/end`); navigate(`/meetings/${id}`); } catch (e) { alert(e.message); } };

  const displayParticipants = participants.length > 0 ? participants : [
    { user: { _id: 'me', name: user?.name || 'You' } },
    { user: { _id: '2', name: 'Team Member' } },
    { user: { _id: '3', name: 'Colleague' } },
  ];

  return (
    <div className="fixed inset-0 bg-[#050810] flex flex-col z-50">
      <div className="flex items-center justify-between px-5 py-3 bg-[#080d1a]/90 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-white font-semibold text-sm">{meeting?.title || 'Live Meeting'}</span>
        </div>
        <span className="text-xs text-gray-500">{displayParticipants.length} participants</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-3 grid grid-cols-2 gap-2 content-start" style={{ gridAutoRows: 'minmax(140px, 1fr)' }}>
          {displayParticipants.map((p, i) => (
            <div key={p.user?._id || i} className="relative rounded-xl bg-[#0f1629] border border-white/10 overflow-hidden flex items-center justify-center">
              <Avatar name={p.user?.name} color={COLORS[i % COLORS.length]} />
              <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded-md text-xs text-white flex items-center gap-1.5">
                {p.isMuted && <MicOff className="w-3 h-3 text-red-400" />}
                {p.user?._id === 'me' || p.user?._id === user?._id ? 'You' : p.user?.name}
              </div>
            </div>
          ))}
        </div>

        {chatOpen ? (
          <div className="w-72 border-l border-white/10 bg-[#080d1a] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white text-sm font-semibold">Chat</span>
              <button onClick={() => setChatOpen(false)} className="text-gray-500 hover:text-gray-300"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={msg._id || i}>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-xs font-semibold text-primary-400">{msg.sender?.name}</span>
                    <span className="text-xs text-gray-600">{format(new Date(msg.createdAt), 'h:mm a')}</span>
                  </div>
                  <p className="text-sm text-gray-300 bg-white/[0.04] rounded-lg px-3 py-2">{msg.content}</p>
                </div>
              ))}
              {!messages.length && <p className="text-xs text-gray-600 text-center pt-4">No messages yet</p>}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-white/10 flex gap-2">
              <input className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Type a message..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
              <button onClick={handleSend} disabled={!chatInput.trim()} className="bg-primary-600 hover:bg-primary-700 p-2 rounded-lg text-white disabled:opacity-50"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        ) : (
          <button onClick={() => setChatOpen(true)} className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#0f1629] hover:bg-white/10 border border-white/10 rounded-l-lg px-1.5 py-4 text-gray-500 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="bg-[#080d1a]/95 border-t border-white/10 px-6 py-4 flex items-center justify-center gap-2">
        {[
          { icon: isMuted ? MicOff : Mic, label: isMuted ? 'Unmute' : 'Mute', onClick: handleToggleMute, active: isMuted },
          { icon: isVideoOn ? Video : VideoOff, label: isVideoOn ? 'Stop Video' : 'Start Video', onClick: handleToggleVideo, active: !isVideoOn },
          { icon: Monitor, label: 'Share', onClick: () => {}, active: false },
          { icon: Circle, label: 'Record', onClick: () => {}, active: false },
        ].map(btn => {
          const Icon = btn.icon;
          return (
            <button key={btn.label} onClick={btn.onClick}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${btn.active ? 'bg-red-500/15 text-red-400 hover:bg-red-500/20' : 'bg-white/[0.05] text-gray-400 hover:bg-white/10 hover:text-gray-200'}`}>
              <Icon className="w-5 h-5" />
              <span className="text-xs">{btn.label}</span>
            </button>
          );
        })}
        <div className="w-px h-10 bg-white/10 mx-2" />
        <button onClick={handleLeave} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-400 hover:bg-orange-500/15 transition-colors">
          <Phone className="w-5 h-5 rotate-135" />
          <span className="text-xs">Leave</span>
        </button>
        {user?.role === 'admin' && (
          <button onClick={handleEnd} className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/15 transition-colors">
            <X className="w-5 h-5" />
            <span className="text-xs">End</span>
          </button>
        )}
      </div>
    </div>
  );
}
