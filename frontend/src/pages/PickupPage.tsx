import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConversationByClaim, listMessages, sendMessage } from '../api/conversations.api';
import { updateItem } from '../api/items.api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

function getInitials(name: string) {
  if (!name) return '??';
  return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function PickupPage() {
  const { itemId, claimId } = useParams<{ itemId: string; claimId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const socket = useSocket();
  const threadRef = useRef<HTMLDivElement>(null);

  const [draft, setDraft] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: conv } = useQuery({
    queryKey: ['conversation', claimId],
    queryFn: () => getConversationByClaim(claimId!),
    enabled: !!claimId,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['messages', conv?.id],
    queryFn: () => listMessages(conv!.id),
    enabled: !!conv?.id,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (!socket || !conv?.id) return;
    const handler = (data: { conversationId: string }) => {
      if (data.conversationId === conv.id) refetchMessages();
    };
    socket.on('message:new', handler);
    return () => { socket.off('message:new', handler); };
  }, [socket, conv?.id, refetchMessages]);

  // Scroll to bottom when messages arrive
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: () => sendMessage(conv!.id, draft),
    onSuccess: () => { setDraft(''); refetchMessages(); },
  });

  const resolveMutation = useMutation({
    mutationFn: () => updateItem(itemId!, { status: 'resolved' }),
    onSuccess: () => navigate(`/items/${itemId}`),
  });

  if (!conv) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)' }}>
        Loading…
      </div>
    );
  }

  const isClaimant = conv.claimant_id === user?.id;
  const myName = user?.displayName ?? 'You';
  const myRole = isClaimant ? 'Original owner' : 'Finder';
  const otherName = isClaimant ? conv.finder_name : conv.claimant_name;
  const otherEmail = isClaimant ? conv.finder_email : conv.claimant_email;
  const otherRole = isClaimant ? 'Finder' : 'Original owner';

  function handleQuickReply(text: string) {
    setDraft(text);
    textareaRef.current?.focus();
  }

  function handleSend() {
    if (!draft.trim() || !conv?.id) return;
    sendMutation.mutate();
  }

  function handleKeyDownComposer(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const QUICK_REPLIES = ['👍 Sounds good', '🕐 Running late', '✅ I\'m here'];

  return (
    <>
      <div className="atmosphere soft" aria-hidden="true" />

      <nav className="laf-nav">
        <div className="laf-nav-inner">
          <Link to="/dashboard" className="laf-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-indigo-600)' }}>
              <path d="M11 3a8 8 0 1 0 8 8" /><path d="m21 21-4.3-4.3" />
            </svg>
            Lost &amp; Found
          </Link>

          <div className="laf-crumb">
            <Link to="/dashboard">Dashboard</Link>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sep"><path d="m9 18 6-6-6-6" /></svg>
            <Link to={`/items/${itemId}`}>{conv.item_title}</Link>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sep"><path d="m9 18 6-6-6-6" /></svg>
            <span className="here">Pickup</span>
          </div>
        </div>
      </nav>

      <main className="laf-shell">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 28, alignItems: 'start' }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Reunion banner */}
            <section style={{ background: 'linear-gradient(135deg, #DCFCE7 0%, #CFFAFE 50%, #EEF2FF 100%)', border: '1px solid #A7F3D0', borderRadius: 20, padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,0.05)' }} aria-hidden="true" />
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#059669', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Claim approved · ready for pickup
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: '#064E3B' }}>
                It's a match. Time to reunite.
              </h1>
              <p style={{ margin: '0 0 24px', fontSize: 14.5, color: '#065F46', lineHeight: 1.6 }}>
                Contact details have been shared between you and {otherName}.
              </p>

              {/* Handshake row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                {/* You card */}
                <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 150 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#A5B4FC,#6366F1)', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {getInitials(myName)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#064E3B' }}>{myName}</div>
                    <div style={{ fontSize: 11.5, color: '#059669' }}>{myRole}</div>
                  </div>
                </div>

                {/* Arrow */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>

                {/* Item card */}
                <div style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10, minWidth: 140 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#EEF2FF,#CFFAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-indigo-600)', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: '#064E3B', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.item_title}</div>
                    <div style={{ fontSize: 11.5, color: '#059669', textTransform: 'capitalize' }}>{conv.item_type}</div>
                  </div>
                </div>

                {/* Arrow */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>

                {/* Other person card */}
                <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 150 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#FCA5A5,#F87171)', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {getInitials(otherName ?? '')}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#064E3B' }}>{otherName}</div>
                    <div style={{ fontSize: 11.5, color: '#059669' }}>{otherRole}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pickup details card */}
            <div className="laf-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, letterSpacing: '-0.012em', color: 'var(--fg-1)' }}>Pickup details</h2>
                <span className="laf-pill laf-pill-emerald" style={{ fontSize: 11 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Confirmed
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 22 }}>
                {[
                  { label: 'When', value: conv.availability ?? 'As soon as possible', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></> },
                  { label: 'Where', value: 'Front desk', icon: <><path d="M12 22s-8-4.5-8-11.5A8 8 0 0 1 20 10.5C20 17.5 12 22 12 22Z" /><circle cx="12" cy="10" r="3" /></> },
                  { label: 'Meet', value: otherName ?? '—', icon: <><circle cx="12" cy="8" r="4" /><path d="M6 21a6 6 0 0 1 12 0" /></> },
                ].map(({ label, value, icon }) => (
                  <div key={label} style={{ background: 'var(--slate-50)', borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-indigo-600)', flexShrink: 0 }}>
                        {icon}
                      </svg>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-3)' }}>{label}</span>
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)' }}>{value}</div>
                  </div>
                ))}
              </div>

              <button
                className="laf-btn laf-btn-emerald"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => resolveMutation.mutate()}
                disabled={resolveMutation.isPending}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {resolveMutation.isPending ? 'Updating…' : "I've collected it — mark as resolved"}
              </button>
            </div>

            {/* Match summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { heading: 'Found report', name: conv.finder_name, role: 'Finder', color: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' },
                { heading: 'Your claim', name: conv.claimant_name, role: 'Claimant', color: 'linear-gradient(135deg,#EEF2FF,#E0E7FF)' },
              ].map(({ heading, name, role, color }) => (
                <div key={heading} style={{ background: color, border: '1px solid rgba(255,255,255,0.7)', borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--fg-2)', marginBottom: 10 }}>{heading}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--fg-1)', flexShrink: 0 }}>
                      {getInitials(name ?? '')}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--fg-2)' }}>{role}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, fontSize: 13, color: 'var(--fg-1)', fontWeight: 500 }}>{conv.item_title}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)', textTransform: 'capitalize' }}>{conv.item_category}</div>
                </div>
              ))}
            </div>

            {/* Message thread */}
            <div className="laf-card" style={{ padding: 0, overflow: 'hidden' }} id="message-thread">
              {/* Chat header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#FCA5A5,#F87171)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {getInitials(otherName ?? '')}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-1)' }}>{otherName}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-3)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                    Active now
                  </div>
                </div>
              </div>

              {/* Thread body */}
              <div
                ref={threadRef}
                style={{ maxHeight: 460, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {(messages as any[]).map((msg: any) => {
                  if (msg.type === 'system') {
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: 'center' }}>
                        <span style={{ fontSize: 11.5, color: 'var(--fg-3)', background: 'var(--slate-100)', borderRadius: 20, padding: '4px 14px' }}>
                          {msg.content}
                        </span>
                      </div>
                    );
                  }
                  const isMine = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: isMine ? 'row-reverse' : 'row' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: isMine ? 'linear-gradient(135deg,#A5B4FC,#6366F1)' : 'linear-gradient(135deg,#FCA5A5,#F87171)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {getInitials(msg.sender_name ?? (isMine ? myName : otherName ?? ''))}
                      </div>
                      <div style={{ maxWidth: '72%' }}>
                        <div style={{ background: isMine ? 'var(--brand-indigo-600)' : '#fff', color: isMine ? '#fff' : 'var(--fg-1)', border: isMine ? 'none' : '1px solid var(--border-subtle)', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '10px 14px', fontSize: 13.5, lineHeight: 1.5 }}>
                          {msg.content}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 3, textAlign: isMine ? 'right' : 'left' }}>
                          {formatTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--fg-3)', fontSize: 13.5, padding: '24px 0' }}>
                    No messages yet. Say hello!
                  </div>
                )}
              </div>

              {/* Quick replies */}
              <div style={{ padding: '8px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {QUICK_REPLIES.map(qr => (
                  <button
                    key={qr}
                    onClick={() => handleQuickReply(qr)}
                    style={{ fontSize: 12.5, padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border-subtle)', background: '#fff', color: 'var(--fg-2)', cursor: 'pointer', transition: 'all 130ms' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand-indigo-600)'; (e.currentTarget as HTMLElement).style.color = 'var(--brand-indigo-600)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-subtle)'; (e.currentTarget as HTMLElement).style.color = 'var(--fg-2)'; }}
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* Composer */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={handleKeyDownComposer}
                  placeholder="Type a message…"
                  rows={1}
                  style={{ flex: 1, resize: 'none', border: '1.5px solid var(--border-subtle)', borderRadius: 12, padding: '10px 14px', fontSize: 14, color: 'var(--fg-1)', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, transition: 'border-color 150ms' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--brand-indigo-600)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                />
                <button
                  className="laf-btn laf-btn-primary"
                  onClick={handleSend}
                  disabled={!draft.trim() || sendMutation.isPending}
                  style={{ flexShrink: 0, alignSelf: 'flex-end' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                  </svg>
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Right rail */}
          <div style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Contact card */}
            <div className="laf-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 18 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#FCA5A5,#F87171)', color: '#fff', fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  {getInitials(otherName ?? '')}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg-1)', marginBottom: 4 }}>{otherName}</div>
                <span className="laf-pill laf-pill-indigo" style={{ fontSize: 11 }}>{otherRole}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                {otherEmail && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--fg-2)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-3)', flexShrink: 0 }}>
                      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{otherEmail}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {otherEmail && (
                  <a href={`mailto:${otherEmail}`} className="laf-btn laf-btn-ghost" style={{ justifyContent: 'center', textDecoration: 'none' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    Email
                  </a>
                )}
                <button
                  className="laf-btn laf-btn-primary"
                  style={{ justifyContent: 'center' }}
                  onClick={() => {
                    document.getElementById('message-thread')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Message
                </button>
              </div>
            </div>

            {/* Decorative map card */}
            <div className="laf-card" style={{ padding: 18, overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: 120, borderRadius: 10, overflow: 'hidden', background: 'linear-gradient(135deg,#E0F2FE,#BAE6FD,#E0E7FF)', marginBottom: 12 }}>
                {/* Decorative grid lines */}
                {[20, 40, 60, 80].map(pct => (
                  <div key={pct} style={{ position: 'absolute', left: 0, right: 0, top: `${pct}%`, height: 1, background: 'rgba(99,102,241,0.1)' }} />
                ))}
                {[20, 40, 60, 80].map(pct => (
                  <div key={pct} style={{ position: 'absolute', top: 0, bottom: 0, left: `${pct}%`, width: 1, background: 'rgba(99,102,241,0.1)' }} />
                ))}
                {/* Pin */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand-indigo-600)', border: '3px solid #fff', boxShadow: '0 4px 12px rgba(79,70,229,0.4)' }} />
                  <div style={{ width: 2, height: 8, background: 'var(--brand-indigo-600)', margin: '0 auto' }} />
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 2 }}>Pickup location</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>Front desk · {conv.item_title}</div>
            </div>

            {/* Safety card */}
            <div style={{ background: 'linear-gradient(135deg,rgba(209,250,229,0.6),rgba(207,250,254,0.6))', border: '1px solid #A7F3D0', borderRadius: 14, padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#064E3B', marginBottom: 3 }}>Meet in a safe place</div>
                <div style={{ fontSize: 12.5, color: '#065F46', lineHeight: 1.5 }}>Pickups happen at the front desk where staff are present.</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="laf-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <path d="M11 3a8 8 0 1 0 8 8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <span>© 2026 Lost &amp; Found</span>
        </div>
      </footer>
    </>
  );
}
