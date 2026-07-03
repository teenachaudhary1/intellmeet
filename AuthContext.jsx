import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { ArrowLeft, Play, Square, Video, Users, Clock, Calendar, Sparkles, MessageSquare, FileText, CheckSquare, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

function Initials({ name }) {
  const ini = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  return <div className="w-8 h-8 rounded-full bg-primary-600/30 text-primary-300 font-bold text-xs flex items-center justify-center border border-primary-500/20 shrink-0">{ini}</div>;
}

const TABS = ['overview', 'chat', 'transcript', 'summary', 'actions'];

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [meeting, setMeeting] = useState(null);
  const [messages, setMessages] = useState([]);
  const [transcript, setTranscript] = useState([]);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    api.get(`/meetings/${id}`).then(({ data }) => setMeeting(data)).finally(() => setLoading(false));
    api.get(`/chat/${id}`).then(({ data }) => setMessages(data)).catch(() => {});
    api.get(`/ai/meetings/${id}/transcript`).then(({ data }) => setTranscript(data)).catch(() => {});
    api.get(`/ai/meetings/${id}/summary`).then(({ data }) => setSummary(data)).catch(() => {});
    api.get(`/tasks?meetingId=${id}`).then(({ data }) => setActions(data)).catch(() => {});
  }, [id]);

  const handleStart = async () => { await api.post(`/meetings/${id}/start`); const { data } = await api.get(`/meetings/${id}`); setMeeting(data); };
  const handleEnd = async () => { await api.post(`/meetings/${id}/end`); const { data } = await api.get(`/meetings/${id}`); setMeeting(data); };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try { const { data } = await api.post(`/ai/meetings/${id}/summary`); setSummary(data); }
    catch (e) { alert(e.message); }
    finally { setSummaryLoading(false); }
  };

  const handleExtractActions = async () => {
    setActionLoading(true);
    try { await api.post(`/ai/meetings/${id}/extract-actions`); const { data } = await api.get(`/tasks?meetingId=${id}`); setActions(data); }
    catch (e) { alert(e.message); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  if (!meeting) return (
    <div className="text-center py-20">
      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
      <p className="text-gray-500">Meeting not found</p>
      <Button variant="outline" className="mt-4" onClick={() => navigate('/meetings')}>Back to meetings</Button>
    </div>
  );

  const isHost = meeting.host?._id === user?._id || user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="gap-1.5 mb-3 -ml-2 text-gray-500" onClick={() => navigate('/meetings')}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{meeting.title}</h1>
            {meeting.description && <p className="text-gray-500 mt-1">{meeting.description}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {meeting.status === 'scheduled' && isHost && <Button size="sm" onClick={handleStart} className="gap-1.5"><Play className="w-3.5 h-3.5" /> Start</Button>}
            {meeting.status === 'active' && (
              <>
                <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700" onClick={() => navigate(`/meetings/${id}/live`)}><Video className="w-3.5 h-3.5" /> Join Live</Button>
                {isHost && <Button size="sm" variant="outline" onClick={handleEnd} className="gap-1.5 border-red-500/40 text-red-400 hover:bg-red-500/10"><Square className="w-3.5 h-3.5" /> End</Button>}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-500 card p-4">
        <Badge variant={meeting.status}>{meeting.status}</Badge>
        {meeting.scheduledAt && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{format(new Date(meeting.scheduledAt), 'MMM d, yyyy h:mm a')}</span>}
        {meeting.duration && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{meeting.duration}m</span>}
        {meeting.participants && <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{meeting.participants.length} participants</span>}
        {meeting.host && <span className="text-gray-600">Host: <span className="text-gray-400">{meeting.host.name}</span></span>}
      </div>

      <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/10 w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${tab === t ? 'bg-[#0f1629] text-gray-100' : 'text-gray-500 hover:text-gray-300'}`}>
            {t === 'summary' ? 'AI Summary' : t === 'actions' ? 'Action Items' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          {meeting.agenda && <Card><CardHeader><CardTitle>Agenda</CardTitle></CardHeader><CardContent><p className="text-sm text-gray-400 whitespace-pre-line">{meeting.agenda}</p></CardContent></Card>}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-4 h-4 text-primary-400" /> Participants ({meeting.participants?.length || 0})</CardTitle></CardHeader>
            <CardContent>
              {!meeting.participants?.length ? <p className="text-sm text-gray-500">No participants yet.</p> : (
                <div className="divide-y divide-white/5">
                  {meeting.participants.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 py-3">
                      <Initials name={p.user?.name} />
                      <div><p className="text-sm font-medium text-gray-200">{p.user?.name}</p><p className="text-xs text-gray-500">{p.user?.email}</p></div>
                      {p.joinedAt && <span className="ml-auto text-xs text-gray-600">Joined {format(new Date(p.joinedAt), 'h:mm a')}</span>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'chat' && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Chat</CardTitle></CardHeader>
          <CardContent>
            {!messages.length ? <p className="text-sm text-gray-500 text-center py-6">No chat messages.</p> : (
              <div className="space-y-4">
                {messages.map(msg => (
                  <div key={msg._id} className="flex gap-3">
                    <Initials name={msg.sender?.name} />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-gray-200">{msg.sender?.name}</span>
                        <span className="text-xs text-gray-600">{format(new Date(msg.createdAt), 'h:mm a')}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-0.5">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'transcript' && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-4 h-4" /> Transcript</CardTitle></CardHeader>
          <CardContent>
            {!transcript.length ? <p className="text-sm text-gray-500 text-center py-6">No transcript available.</p> : (
              <div className="space-y-3">
                {transcript.map((entry, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-xs text-gray-600 w-12 shrink-0 mt-0.5 font-mono">{Math.floor((entry.timestamp||0)/60).toString().padStart(2,'0')}:{((entry.timestamp||0)%60).toString().padStart(2,'0')}</span>
                    <div><span className="text-xs font-semibold text-primary-400">{entry.speaker}</span><p className="text-sm text-gray-400 mt-0.5">{entry.content}</p></div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'summary' && (
        <div className="space-y-4">
          {!summary ? (
            <Card className="text-center py-10">
              <CardContent>
                <Sparkles className="w-10 h-10 mx-auto mb-3 text-primary-400 opacity-50" />
                <p className="font-medium mb-1">No AI summary yet</p>
                <p className="text-sm text-gray-500 mb-5">Generate a summary powered by Google Gemini AI.</p>
                <Button onClick={handleGenerateSummary} loading={summaryLoading} disabled={meeting.status !== 'ended'} className="gap-2 mx-auto"><Sparkles className="w-4 h-4" /> Generate with Gemini AI</Button>
                {meeting.status !== 'ended' && <p className="text-xs text-gray-600 mt-3">Meeting must have ended to generate a summary.</p>}
              </CardContent>
            </Card>
          ) : (
            <>
              <Card><CardHeader><CardTitle>Summary</CardTitle></CardHeader><CardContent><p className="text-sm text-gray-400 leading-relaxed">{summary.content || summary.summary}</p></CardContent></Card>
              {summary.keyPoints?.length > 0 && <Card><CardHeader><CardTitle>Key Points</CardTitle></CardHeader><CardContent><ul className="space-y-2">{summary.keyPoints.map((pt, i) => <li key={i} className="flex gap-2 text-sm text-gray-400"><span className="text-primary-400 mt-0.5">•</span>{pt}</li>)}</ul></CardContent></Card>}
              {summary.decisions?.length > 0 && <Card><CardHeader><CardTitle>Decisions</CardTitle></CardHeader><CardContent><ul className="space-y-2">{summary.decisions.map((d, i) => <li key={i} className="flex gap-2 text-sm text-gray-400"><span className="text-green-400 mt-0.5">✓</span>{d}</li>)}</ul></CardContent></Card>}
              {summary.nextSteps?.length > 0 && <Card><CardHeader><CardTitle>Next Steps</CardTitle></CardHeader><CardContent><ul className="space-y-2">{summary.nextSteps.map((s, i) => <li key={i} className="flex gap-2 text-sm text-gray-400"><span className="text-blue-400 mt-0.5">→</span>{s}</li>)}</ul></CardContent></Card>}
              {summary.sentiment && <div className="text-xs text-gray-600 flex items-center gap-2">Sentiment: <Badge variant={summary.sentiment === 'positive' ? 'success' : summary.sentiment === 'negative' ? 'error' : 'default'}>{summary.sentiment}</Badge></div>}
            </>
          )}
        </div>
      )}

      {tab === 'actions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Action Items</CardTitle>
            {transcript.length > 0 && <Button size="sm" variant="outline" onClick={handleExtractActions} loading={actionLoading} className="gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Extract with AI</Button>}
          </CardHeader>
          <CardContent>
            {!actions.length ? <p className="text-sm text-gray-500 text-center py-6">No action items for this meeting.</p> : (
              <div className="divide-y divide-white/5">
                {actions.map(item => (
                  <div key={item._id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-200">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.assignee && `${item.assignee.name} · `}{item.dueDate && `Due ${format(new Date(item.dueDate), 'MMM d')}`}</p>
                    </div>
                    <div className="flex items-center gap-2"><Badge variant={item.priority}>{item.priority}</Badge><Badge variant={item.status}>{item.status.replace('_', ' ')}</Badge></div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
