import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { lookupSpace, joinSpace } from '../api/spaces.api';
import { useAuth } from '../context/AuthContext';

const SPACE_TYPE_LABEL: Record<string, string> = {
  office: 'Office', gym: 'Gym', library: 'Library', coworking: 'Co-working', other: 'Other',
};

export default function JoinSpacePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [chars, setChars] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [lookupResult, setLookupResult] = useState<{ id: string; name: string; type: string; member_count: number } | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLooking, setIsLooking] = useState(false);

  const code = chars.join('');
  const isComplete = code.length === 6 && chars.every(c => c.length === 1);

  useEffect(() => {
    if (!isComplete) {
      setLookupResult(null);
      setLookupError(null);
      return;
    }
    setIsLooking(true);
    setLookupError(null);
    lookupSpace(code)
      .then(data => { setLookupResult(data); setLookupError(null); })
      .catch(() => { setLookupResult(null); setLookupError('Invalid invite code. Please try again.'); })
      .finally(() => setIsLooking(false));
  }, [code, isComplete]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...chars];
      if (next[index]) {
        next[index] = '';
        setChars(next);
      } else if (index > 0) {
        next[index - 1] = '';
        setChars(next);
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }
    if (/^[a-zA-Z0-9]$/.test(e.key)) {
      e.preventDefault();
      const next = [...chars];
      next[index] = e.key.toUpperCase();
      setChars(next);
      if (index < 5) inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    if (!pasted) return;
    const next = [...chars];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? '';
    setChars(next);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  }

  const joinMutation = useMutation({
    mutationFn: () => joinSpace({ inviteCode: code }),
    onSuccess: (data) => navigate(`/spaces/${data.id}`),
  });

  const segInputStyle = (filled: boolean): React.CSSProperties => ({
    width: 46,
    height: 58,
    borderRadius: 12,
    border: filled ? 'none' : '1.5px solid var(--border-1)',
    background: filled ? 'linear-gradient(180deg,#fff,#F8FAFC)' : '#fff',
    boxShadow: filled ? 'inset 0 0 0 1.5px var(--brand-indigo-500)' : '0 1px 3px rgba(0,0,0,0.07)',
    fontSize: 24,
    fontWeight: 600,
    fontFamily: 'ui-monospace, monospace',
    textAlign: 'center',
    color: 'var(--fg-1)',
    outline: 'none',
    textTransform: 'uppercase',
    cursor: 'text',
    transition: 'all 150ms ease-out',
  });

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
            <span className="here">Join a space</span>
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <Link to="/dashboard" className="laf-btn laf-btn-ghost" style={{ textDecoration: 'none' }}>Cancel</Link>
          </div>
        </div>
      </nav>

      <main className="laf-shell">
        {/* Page header */}
        <header style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 7h14"/><path d="M5 12h14"/><path d="M5 17h7"/>
            </svg>
            Join by invite
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--fg-1)', lineHeight: 1.2 }}>
            Got a code?{' '}
            <span style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Drop it in.
            </span>
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.6, maxWidth: 480 }}>
            Spaces are invite-only — your front desk, gym manager, or library admin can hand you a code.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 24, alignItems: 'start' }}>

          {/* Left: form card */}
          <div className="laf-card" style={{ padding: 28 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.018em', textAlign: 'center', color: 'var(--fg-1)' }}>
              Enter your invite code
            </h2>
            <p style={{ margin: '0 0 24px', textAlign: 'center', fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.55 }}>
              Six characters · letters and numbers · case doesn't matter.
            </p>

            {/* 6-box code input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', margin: '8px 0 14px', flexWrap: 'wrap' }} role="group" aria-label="Six-character invite code">
              {/* First 3 */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[0, 1, 2].map(i => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    value={chars[i]}
                    onKeyDown={e => handleKeyDown(e, i)}
                    onPaste={handlePaste}
                    onChange={() => {/* controlled via keydown */}}
                    onFocus={e => { e.target.style.borderColor = 'var(--brand-indigo-600)'; e.target.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.18)'; e.target.style.transform = 'translateY(-1px)'; }}
                    onBlur={e => { e.target.style.borderColor = chars[i] ? 'transparent' : 'var(--border-1)'; e.target.style.boxShadow = chars[i] ? 'inset 0 0 0 1.5px var(--brand-indigo-500)' : '0 1px 3px rgba(0,0,0,0.07)'; e.target.style.transform = 'none'; }}
                    maxLength={1}
                    style={segInputStyle(!!chars[i])}
                    aria-label={`Code character ${i + 1}`}
                  />
                ))}
              </div>
              {/* Dash */}
              <span style={{ alignSelf: 'center', width: 14, height: 2, background: 'var(--border-1)', borderRadius: 99, display: 'block' }} aria-hidden="true" />
              {/* Last 3 */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[3, 4, 5].map(i => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    value={chars[i]}
                    onKeyDown={e => handleKeyDown(e, i)}
                    onPaste={handlePaste}
                    onChange={() => {/* controlled via keydown */}}
                    onFocus={e => { e.target.style.borderColor = 'var(--brand-indigo-600)'; e.target.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.18)'; e.target.style.transform = 'translateY(-1px)'; }}
                    onBlur={e => { e.target.style.borderColor = chars[i] ? 'transparent' : 'var(--border-1)'; e.target.style.boxShadow = chars[i] ? 'inset 0 0 0 1.5px var(--brand-indigo-500)' : '0 1px 3px rgba(0,0,0,0.07)'; e.target.style.transform = 'none'; }}
                    maxLength={1}
                    style={segInputStyle(!!chars[i])}
                    aria-label={`Code character ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <p style={{ textAlign: 'center', margin: '8px 0 0', fontSize: 12, color: 'var(--fg-3)' }}>
              Pasting works too — we'll auto-fill the boxes.
            </p>

            {/* Loading */}
            {isLooking && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 0', color: 'var(--fg-3)', fontSize: 14 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--brand-indigo-600)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                Verifying code…
              </div>
            )}

            {/* Error */}
            {lookupError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, marginTop: 16, color: '#991B1B', fontSize: 14 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
                </svg>
                {lookupError}
              </div>
            )}

            {/* Verified card */}
            {lookupResult && (
              <div style={{
                marginTop: 18, borderRadius: 14, padding: '16px 18px',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.06))',
                border: '1px solid rgba(16,185,129,0.22)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#10B981', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: '0 4px 12px -4px rgba(16,185,129,0.5)',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-1)', display: 'block' }}>{lookupResult.name}</b>
                  <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--fg-2)', lineHeight: 1.5 }}>
                    {SPACE_TYPE_LABEL[lookupResult.type] ?? lookupResult.type}
                  </p>
                  <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 11.5, color: 'var(--fg-3)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      </svg>
                      {lookupResult.member_count} {lookupResult.member_count === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-3)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Joining as <strong style={{ color: 'var(--fg-1)', marginLeft: 3 }}>{user?.displayName ?? 'you'}</strong>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/dashboard" className="laf-btn laf-btn-ghost" style={{ textDecoration: 'none' }}>Cancel</Link>
                <button
                  className="laf-btn laf-btn-primary"
                  disabled={!lookupResult || joinMutation.isPending}
                  onClick={() => joinMutation.mutate()}
                >
                  {joinMutation.isPending ? 'Joining…' : 'Join space'}
                  {!joinMutation.isPending && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {joinMutation.isError && (
              <p style={{ margin: '12px 0 0', fontSize: 13, color: '#991B1B' }}>Failed to join. Please try again.</p>
            )}
          </div>

          {/* Right rail */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="laf-card" style={{ padding: 22 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-2)' }}>
                Where to find a code
              </h2>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--fg-3)' }}>Common places spaces post their invite.</p>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                {[
                  'On a poster near the front desk or check-in',
                  'In the welcome email from your office or gym',
                  'On the back of a member card or wristband',
                  'Ask a manager — they can regenerate one anytime',
                ].map((tip, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.5 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'var(--brand-indigo-50)', color: 'var(--brand-indigo-700)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--fg-2)' }}>
              No code yet?{' '}
              <Link to="/spaces/create" style={{ color: 'var(--brand-indigo-600)', fontWeight: 600, textDecoration: 'none' }}>
                Start your own space
              </Link>
            </div>
          </aside>
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

      <style>{`
        @media (max-width: 760px) {
          .join-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
