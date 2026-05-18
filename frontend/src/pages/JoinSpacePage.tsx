import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { lookupSpace, joinSpace } from '../api/spaces.api';
import { useAuth } from '../context/AuthContext';

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const SPACE_TYPE_LABEL: Record<string, string> = {
  office: 'Office', gym: 'Gym', library: 'Library', coworking: 'Co-working', other: 'Other',
};

export default function JoinSpacePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 6 individual characters
  const [chars, setChars] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [lookupResult, setLookupResult] = useState<{ id: string; name: string; type: string; member_count: number } | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLooking, setIsLooking] = useState(false);

  const code = chars.join('');
  const isComplete = code.length === 6 && chars.every(c => c.length === 1);

  // Auto-lookup when all 6 chars entered
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
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] ?? '';
    }
    setChars(next);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  }

  const joinMutation = useMutation({
    mutationFn: () => joinSpace({ inviteCode: code }),
    onSuccess: (data) => {
      navigate(`/spaces/${data.id}`);
    },
  });

  const boxStyle = (filled: boolean, focused: boolean): React.CSSProperties => ({
    width: 46,
    height: 58,
    borderRadius: 10,
    border: `2px solid ${filled ? 'var(--brand-indigo-600)' : 'var(--border-subtle)'}`,
    background: '#fff',
    fontSize: 24,
    fontWeight: 700,
    fontFamily: 'ui-monospace, monospace',
    textAlign: 'center',
    color: 'var(--fg-1)',
    outline: 'none',
    textTransform: 'uppercase',
    transition: 'all 150ms',
    boxShadow: filled
      ? 'inset 0 0 0 2px var(--brand-indigo-600)'
      : focused
        ? '0 0 0 3px rgba(99,102,241,0.2)'
        : 'none',
    cursor: 'text',
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
        </div>
      </nav>

      <main className="laf-shell">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, alignItems: 'start' }}>

          {/* Left: form card */}
          <div className="laf-card" style={{ padding: 28 }}>
            <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--fg-1)' }}>
              Enter your invite code
            </h1>
            <p style={{ margin: '0 0 28px', fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.6 }}>
              Ask your space manager for a 6-character invite code.
            </p>

            {/* Code input row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
              {[0, 1, 2].map(i => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  value={chars[i]}
                  onKeyDown={e => handleKeyDown(e, i)}
                  onPaste={handlePaste}
                  onChange={() => {/* controlled via keydown */}}
                  maxLength={1}
                  style={boxStyle(!!chars[i], false)}
                  aria-label={`Code character ${i + 1}`}
                />
              ))}
              <span style={{ fontSize: 22, fontWeight: 300, color: 'var(--fg-3)', userSelect: 'none' }}>-</span>
              {[3, 4, 5].map(i => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  value={chars[i]}
                  onKeyDown={e => handleKeyDown(e, i)}
                  onPaste={handlePaste}
                  onChange={() => {/* controlled via keydown */}}
                  maxLength={1}
                  style={boxStyle(!!chars[i], false)}
                  aria-label={`Code character ${i + 1}`}
                />
              ))}
            </div>

            {/* Loading state */}
            {isLooking && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 0', color: 'var(--fg-3)', fontSize: 14 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--brand-indigo-600)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                Verifying code…
              </div>
            )}

            {/* Error state */}
            {lookupError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, marginBottom: 20, color: '#991B1B', fontSize: 14 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
                </svg>
                {lookupError}
              </div>
            )}

            {/* Verified card */}
            {lookupResult && (
              <div style={{ background: 'linear-gradient(135deg, #DCFCE7 0%, #D1FAE5 50%, #CFFAFE 100%)', border: '1px solid #6EE7B7', borderRadius: 14, padding: '18px 20px', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#059669' }}>
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Space verified</span>
                </div>
                <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700, color: '#064E3B', letterSpacing: '-0.015em' }}>{lookupResult.name}</h2>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13.5, color: '#065F46' }}>
                  <span className="laf-pill laf-pill-emerald" style={{ fontSize: 11 }}>{SPACE_TYPE_LABEL[lookupResult.type] ?? lookupResult.type}</span>
                  <span>{lookupResult.member_count} {lookupResult.member_count === 1 ? 'member' : 'members'}</span>
                </div>
              </div>
            )}

            {/* Submit row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
              <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>
                Joining as{' '}
                <span style={{ fontWeight: 600, color: 'var(--fg-1)' }}>{user?.displayName ?? 'you'}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to="/dashboard" className="laf-btn laf-btn-ghost">Cancel</Link>
                <button
                  className="laf-btn laf-btn-primary"
                  disabled={!lookupResult || joinMutation.isPending}
                  onClick={() => joinMutation.mutate()}
                >
                  {joinMutation.isPending ? 'Joining…' : 'Join space →'}
                </button>
              </div>
            </div>

            {joinMutation.isError && (
              <p style={{ margin: '12px 0 0', fontSize: 13, color: '#991B1B' }}>Failed to join. Please try again.</p>
            )}
          </div>

          {/* Right: tips rail */}
          <div className="laf-card" style={{ padding: 22 }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--fg-1)', letterSpacing: '-0.01em' }}>
              Where to find a code
            </h2>
            <ol style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                'Ask the space manager directly for the 6-character code.',
                'Check your email — you may have received an invite link.',
                'Look for a QR code poster displayed at the physical location.',
              ].map((tip, i) => (
                <li key={i} style={{ fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.55 }}>
                  {tip}
                </li>
              ))}
            </ol>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16, marginTop: 20 }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--fg-3)' }}>Want to create your own space?</p>
              <Link to="/dashboard" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--brand-indigo-600)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                Create space
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
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

      <style>{`
        @media (max-width: 760px) {
          .join-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
