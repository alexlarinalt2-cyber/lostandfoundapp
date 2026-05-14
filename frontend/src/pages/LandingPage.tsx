import { Link } from 'react-router-dom';

const STATS = [
  { value: '18,400+', label: 'Items tracked' },
  { value: '94%', label: 'Recovery rate' },
  { value: '3.2h', label: 'Avg. resolution' },
  { value: '600+', label: 'Active spaces' },
];

const FEATURES = [
  {
    iconBg: 'var(--brand-indigo-50)', iconColor: 'var(--brand-indigo-700)',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 2.6 5.3 5.9.9-4.3 4.2 1 5.8L12 16.5l-5.2 2.7 1-5.8L3.5 9.2l5.9-.9Z"/></svg>,
    title: 'Smart matching',
    desc: 'AI surfaces likely matches between lost and found reports with ≥ 60% confidence — so you don\'t have to scroll forever.',
  },
  {
    iconBg: '#D1FAE5', iconColor: '#065F46',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
    title: 'Real-time alerts',
    desc: 'Members get instant pings when a match is found, a claim is submitted, or an item is resolved.',
  },
  {
    iconBg: '#EFF6FF', iconColor: '#1D4ED8',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>,
    title: 'Invite-based spaces',
    desc: 'Create a space for your office, gym, or campus. Share an invite code — no sign-up friction for your members.',
  },
  {
    iconBg: '#FEF3C7', iconColor: '#92400E',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V7l9-4 9 4v14"/><path d="M3 21h18"/></svg>,
    title: 'Manager dashboard',
    desc: 'Resolve items, manage members, set retention policies, and see weekly digests — all in one place.',
  },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate-50)', position: 'relative', overflowX: 'hidden' }}>
      <div className="atmosphere" aria-hidden="true" />

      {/* Nav */}
      <nav className="laf-nav" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15.5, color: 'var(--fg-1)', letterSpacing: '-0.015em', flex: 1 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-indigo-600)' }}>
              <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
            </svg>
            Lost &amp; Found
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/login" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, color: 'var(--fg-2)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--fg-1)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--fg-2)'}
            >
              Log in
            </Link>
            <Link to="/register" className="laf-btn-primary" style={{ padding: '8px 20px', borderRadius: 10, fontSize: 13.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Get started free
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1160, margin: '0 auto', padding: '80px 32px 64px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--brand-indigo-50)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 999, padding: '5px 14px', fontSize: 12.5, fontWeight: 600, color: 'var(--brand-indigo-700)', marginBottom: 28, letterSpacing: '0.01em' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand-indigo-600)', flexShrink: 0, animation: 'laf-pulse 2s infinite' }} />
          Reuniting people with their things
        </div>

        <h1 style={{ margin: '0 auto 20px', fontSize: 'clamp(36px,6vw,68px)', fontWeight: 800, letterSpacing: '-0.032em', lineHeight: 1.08, color: 'var(--fg-1)', maxWidth: 820 }}>
          Your space's lost &amp; found,{' '}
          <span style={{ background: 'linear-gradient(135deg, var(--brand-indigo-600) 0%, var(--brand-cyan-500) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            finally organised.
          </span>
        </h1>

        <p style={{ margin: '0 auto 40px', fontSize: 'clamp(15px,2vw,18px)', color: 'var(--fg-2)', lineHeight: 1.65, maxWidth: 560 }}>
          Create a space for your office, gym, or campus. Let members report lost and found items, claim what's theirs, and get matched automatically.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/register" className="laf-btn-primary" style={{ padding: '13px 28px', borderRadius: 13, fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Create your space — it's free
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
          <Link to="/login" style={{ padding: '13px 24px', borderRadius: 13, fontSize: 15, fontWeight: 600, border: '1px solid var(--border-1)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', color: 'var(--fg-2)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Sign in
          </Link>
        </div>

        {/* Social proof */}
        <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, color: 'var(--fg-3)' }}>
          <div style={{ display: 'flex' }}>
            {['#6366F1','#06B6D4','#10B981','#F59E0B','#EF4444'].map((c, i) => (
              <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(135deg, ${c}88, ${c})`, border: '2px solid #fff', marginLeft: i ? -8 : 0, boxShadow: '0 1px 4px rgba(15,23,42,0.12)' }} />
            ))}
          </div>
          <span>Trusted by <strong style={{ color: 'var(--fg-2)' }}>600+ spaces</strong> worldwide</span>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ maxWidth: 1160, margin: '0 auto 64px', padding: '0 32px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 16, padding: '20px 24px', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 800, letterSpacing: '-0.028em', color: 'var(--fg-1)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1160, margin: '0 auto 80px', padding: '0 32px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--brand-indigo-600)', marginBottom: 12 }}>FEATURES</div>
          <h2 style={{ margin: '0 auto', fontSize: 'clamp(24px,3vw,38px)', fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--fg-1)', maxWidth: 560 }}>Everything you need to run a great lost &amp; found</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 18, padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: f.iconBg, color: f.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, letterSpacing: '-0.012em', color: 'var(--fg-1)' }}>{f.title}</h3>
                <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-3)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section style={{ maxWidth: 1160, margin: '0 auto 80px', padding: '0 32px', position: 'relative', zIndex: 1 }}>
        <div style={{
          borderRadius: 24, padding: '48px 48px',
          background: 'radial-gradient(420px 220px at 110% -10%, rgba(6,182,212,0.42), transparent 60%), radial-gradient(420px 220px at -10% 120%, rgba(79,70,229,0.55), transparent 60%), linear-gradient(160deg, #4F46E5 0%, #4338CA 100%)',
          boxShadow: '0 8px 40px -8px rgba(79,70,229,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap',
        }}>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>Ready to get started?</h2>
            <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.82)', lineHeight: 1.55 }}>Set up your space in under 2 minutes. No credit card required.</p>
          </div>
          <Link to="/register" style={{ padding: '13px 28px', borderRadius: 13, background: '#fff', color: 'var(--brand-indigo-700)', fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0, boxShadow: '0 4px 16px rgba(0,0,0,0.16)', transition: 'all 140ms cubic-bezier(0.22,1,0.36,1)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.22)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.16)'; }}
          >
            Create a free space
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--fg-3)', position: 'relative', zIndex: 1, maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-indigo-600)' }}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <span>© 2026 Lost &amp; Found</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <a href="#" style={{ color: 'var(--fg-3)', textDecoration: 'none' }}>Help</a>
          <a href="#" style={{ color: 'var(--fg-3)', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ color: 'var(--fg-3)', textDecoration: 'none' }}>Terms</a>
        </div>
      </footer>
    </div>
  );
}
