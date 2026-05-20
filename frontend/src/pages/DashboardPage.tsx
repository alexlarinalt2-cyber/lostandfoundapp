import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { listSpaces } from '../api/spaces.api';
import { useAuth } from '../context/AuthContext';

/* Per-type accent gradient + icon colours */
const SPACE_TYPE_STYLES: Record<string, { accent: string; iconBg: string; iconColor: string }> = {
  office:    { accent: 'linear-gradient(90deg,#6366F1 0%,#4F46E5 100%)', iconBg: '#EEF2FF', iconColor: '#4338CA' },
  gym:       { accent: 'linear-gradient(90deg,#F59E0B 0%,#EA580C 100%)', iconBg: '#FFFBEB', iconColor: '#B45309' },
  library:   { accent: 'linear-gradient(90deg,#A855F7 0%,#8B5CF6 100%)', iconBg: '#F5F3FF', iconColor: '#6D28D9' },
  coworking: { accent: 'linear-gradient(90deg,#06B6D4 0%,#0891B2 100%)', iconBg: '#ECFEFF', iconColor: '#0E7490' },
  other:     { accent: 'linear-gradient(90deg,#6366F1 0%,#4F46E5 100%)', iconBg: '#EEF2FF', iconColor: '#4338CA' },
};

/* Lucide-style SVG icons per space type */
function SpaceIcon({ type }: { type: string }) {
  if (type === 'gym') return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5 17.5 17.5"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/>
      <path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>
    </svg>
  );
  if (type === 'library') return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
    </svg>
  );
  if (type === 'coworking') return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6 8 2h8l4 4v16H4Z"/><path d="M4 6h16"/><path d="M12 12v6"/><path d="M9 18h6"/>
    </svg>
  );
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V7l9-4 9 4v14"/><path d="M3 21h18"/><path d="M9 9h.01"/><path d="M9 13h.01"/><path d="M9 17h.01"/><path d="M15 9h.01"/><path d="M15 13h.01"/><path d="M15 17h.01"/>
    </svg>
  );
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: spaces = [], isLoading } = useQuery({
    queryKey: ['spaces'],
    queryFn: listSpaces,
  });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      <div className="atmosphere" aria-hidden="true" />

      {/* Glass nav */}
      <nav className="laf-nav" aria-label="Primary">
        <div className="laf-nav-inner">
          <div className="laf-brand">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-indigo-600)' }}>
              <path d="M11 3a8 8 0 1 0 8 8" /><path d="m21 21-4.3-4.3" />
            </svg>
            Lost &amp; Found
          </div>

          <div className="laf-nav-links">
            <span className="laf-nav-link is-current">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
              </svg>
              Dashboard
            </span>
          </div>

          <div className="laf-nav-right">
            <button className="laf-icon-btn" aria-label="Notifications" style={{ position: 'relative' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </button>
            <button className="laf-userpill" onClick={logout}>
              <span className="laf-avatar" style={{ fontSize: 10 }}>{user ? getInitials(user.displayName) : 'U'}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{user?.displayName?.split(' ')[0]}</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-3)' }}>
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="laf-shell">

        {/* Welcome row */}
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--brand-indigo-600)', marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span className="laf-pulse-dot" />
              {today}
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(28px,3vw,38px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1, color: 'var(--fg-1)' }}>
              Good day, {user?.displayName?.split(' ')[0]}.{' '}
              <span className="text-gradient">Your spaces at a glance.</span>
            </h1>
            <p style={{ margin: '10px 0 0', fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.55 }}>
              Report lost items, find what was turned in, and connect with your community.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link to="/join" className="laf-btn laf-btn-ghost" style={{ textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
              Join a space
            </Link>
            <button className="laf-btn laf-btn-primary" onClick={() => navigate('/spaces/create')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14"/><path d="M5 12h14"/>
              </svg>
              Create space
            </button>
          </div>
        </header>

        {/* Section title */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', margin: '0 0 18px', gap: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-2)' }}>Your spaces</h2>
            {spaces.length > 0 && (
              <div style={{ fontSize: 13, color: 'var(--fg-3)', marginTop: 4 }}>{spaces.length} active · tap any to open its feed</div>
            )}
          </div>
        </div>

        {/* Spaces grid */}
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 18, height: 200, border: '1px solid var(--border-subtle)' }} className="animate-pulse" />
            ))}
          </div>
        ) : spaces.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg,#EEF2FF,#CFFAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--brand-indigo-600)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s-8-4.5-8-11.5A8 8 0 0 1 20 10.5C20 17.5 12 22 12 22Z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg-1)', margin: '0 0 8px' }}>No spaces yet</p>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', margin: '0 0 24px' }}>Join an existing space with an invite code, or create your own.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <Link to="/join" className="laf-btn laf-btn-ghost" style={{ textDecoration: 'none' }}>Join a space</Link>
              <button className="laf-btn laf-btn-primary" onClick={() => navigate('/spaces/create')}>Create a space</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {spaces.map((space: { id: string; name: string; type: string; member_role: string; address?: string; member_count?: number; open_count?: number; found_count?: number; match_count?: number }) => {
              const st = SPACE_TYPE_STYLES[space.type] ?? SPACE_TYPE_STYLES.other;
              return (
                <Link
                  key={space.id}
                  to={`/spaces/${space.id}`}
                  className="laf-space-card"
                  style={{ position: 'relative', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 22, cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'all 220ms cubic-bezier(0.22,1,0.36,1)', overflow: 'hidden', display: 'block', textDecoration: 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)'; const arrow = (e.currentTarget as HTMLElement).querySelector('.space-arrow') as HTMLElement; if (arrow) { arrow.style.background = 'var(--brand-indigo-50)'; arrow.style.color = 'var(--brand-indigo-600)'; arrow.style.transform = 'translate(2px,-1px)'; } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; const arrow = (e.currentTarget as HTMLElement).querySelector('.space-arrow') as HTMLElement; if (arrow) { arrow.style.background = 'rgba(15,23,42,0.04)'; arrow.style.color = 'var(--fg-3)'; arrow.style.transform = ''; } }}
                >
                  {/* Top accent stripe */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: st.accent, borderRadius: '18px 18px 0 0' }} />

                  {/* Icon + role pill row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: st.iconBg, color: st.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)' }}>
                      <SpaceIcon type={space.type} />
                    </div>
                    {space.member_role === 'manager' && (
                      <span className="laf-pill laf-pill-indigo" style={{ fontSize: 10.5 }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m12 15 3.5-3.5"/><circle cx="9" cy="11" r="6"/><path d="m16 18 3 3"/>
                        </svg>
                        Manager
                      </span>
                    )}
                  </div>

                  <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--fg-1)' }}>{space.name}</h3>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s-8-4.5-8-11.5A8 8 0 0 1 20 10.5C20 17.5 12 22 12 22Z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {space.address || 'No address'}
                    {space.member_count != null && (
                      <><span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--fg-4)', display: 'inline-block' }} /> {space.member_count} {space.member_count === 1 ? 'member' : 'members'}</>
                    )}
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'flex', gap: 18, marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', paddingRight: 42 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 3 }}>Open</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#DC2626', fontVariantNumeric: 'tabular-nums' }}>{space.open_count ?? 0}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 3 }}>Found</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#059669', fontVariantNumeric: 'tabular-nums' }}>{space.found_count ?? 0}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 3 }}>Matches</div>
                      <div style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg,#6366F1,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: space.match_count ? 'transparent' : undefined, color: space.match_count ? undefined : 'var(--fg-3)', fontVariantNumeric: 'tabular-nums' }}>
                        {space.match_count ?? '—'}
                      </div>
                    </div>
                  </div>

                  {/* Arrow — bottom-right, clear of stats */}
                  <div className="space-arrow" style={{ position: 'absolute', bottom: 20, right: 20, width: 28, height: 28, padding: 5, borderRadius: 8, background: 'rgba(15,23,42,0.04)', color: 'var(--fg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 220ms cubic-bezier(0.22,1,0.36,1)', boxSizing: 'border-box' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                  </div>
                </Link>
              );
            })}

            {/* Add another space tile */}
            <button
              onClick={() => navigate('/spaces/create')}
              style={{ background: 'rgba(255,255,255,0.5)', border: '1.5px dashed var(--border-1)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'var(--fg-2)', cursor: 'pointer', transition: 'all 220ms cubic-bezier(0.22,1,0.36,1)', textAlign: 'center' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand-indigo-300)'; (e.currentTarget as HTMLElement).style.color = 'var(--brand-indigo-700)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-1)'; (e.currentTarget as HTMLElement).style.color = 'var(--fg-2)'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#EEF2FF,#CFFAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-indigo-600)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14"/><path d="M5 12h14"/>
                  </svg>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>Add another space</div>
                <div style={{ fontSize: 12.5 }}>Join with a code, or start a new one</div>
              </div>
            </button>
          </div>
        )}
      </main>

      <footer className="laf-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <path d="M11 3a8 8 0 1 0 8 8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <span>© 2026 Lost &amp; Found</span>
        </div>
        <div style={{ display: 'flex', gap: 18 }}>
          <a href="#" style={{ color: 'var(--fg-3)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg-1)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}>Help</a>
          <a href="#" style={{ color: 'var(--fg-3)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg-1)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}>Privacy</a>
          <a href="#" style={{ color: 'var(--fg-3)' }} onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg-1)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-3)')}>Terms</a>
        </div>
      </footer>

    </>
  );
}
