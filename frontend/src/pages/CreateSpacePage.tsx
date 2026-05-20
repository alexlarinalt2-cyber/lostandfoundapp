import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createSpace } from '../api/spaces.api';

const TYPES = [
  {
    key: 'office' as const,
    label: 'Office',
    sub: 'HQ, branch, mailroom',
    accent: 'linear-gradient(90deg,#6366F1 0%,#4F46E5 100%)',
    iconBg: '#EEF2FF',
    iconColor: '#4338CA',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21V7l9-4 9 4v14"/><path d="M3 21h18"/>
        <path d="M9 9h.01"/><path d="M9 13h.01"/><path d="M9 17h.01"/>
        <path d="M15 9h.01"/><path d="M15 13h.01"/><path d="M15 17h.01"/>
      </svg>
    ),
  },
  {
    key: 'gym' as const,
    label: 'Gym',
    sub: 'Studio, locker room',
    accent: 'linear-gradient(90deg,#F59E0B 0%,#EA580C 100%)',
    iconBg: '#FFFBEB',
    iconColor: '#B45309',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5 17.5 17.5"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/>
        <path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>
      </svg>
    ),
  },
  {
    key: 'library' as const,
    label: 'Library',
    sub: 'Public, school, branch',
    accent: 'linear-gradient(90deg,#A855F7 0%,#8B5CF6 100%)',
    iconBg: '#F5F3FF',
    iconColor: '#6D28D9',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
      </svg>
    ),
  },
  {
    key: 'other' as const,
    label: 'Other',
    sub: 'Campus, café, venue',
    accent: 'linear-gradient(90deg,#64748B 0%,#475569 100%)',
    iconBg: '#F1F5F9',
    iconColor: '#334155',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
];

export default function CreateSpacePage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<typeof TYPES[number]>(TYPES[0]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const mutation = useMutation({
    mutationFn: () => createSpace({ name: name.trim(), type: selectedType.key, address: address.trim() || undefined }),
    onSuccess: (data) => navigate(`/spaces/${data.id}`),
  });

  const previewName = name.trim() || 'Your space name';
  const previewAddr = address.trim() || 'Add an address';

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
            <span className="here">
              Create a space
            </span>
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <Link to="/dashboard" className="laf-btn laf-btn-ghost" style={{ textDecoration: 'none' }}>Cancel</Link>
          </div>
        </div>
      </nav>

      <main className="laf-shell" style={{ maxWidth: 1080 }}>
        {/* Page header */}
        <header style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--fg-3)', textTransform: 'uppercase', marginBottom: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21V7l9-4 9 4v14"/><path d="M3 21h18"/>
            </svg>
            New Space
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--fg-1)', lineHeight: 1.2 }}>
            Set up a new{' '}
            <span style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              community lost &amp; found.
            </span>
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.6, maxWidth: 540 }}>
            Spaces are where people in your office, gym, or library report and recover items. You'll become its first manager.
          </p>
        </header>

        {/* Step rail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { n: 1, label: 'Basics', active: true, done: false },
            { n: 2, label: 'Invite', active: false, done: false },
            { n: 3, label: 'Done', active: false, done: false },
          ].map((step, i, arr) => (
            <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: step.active ? 'var(--fg-1)' : 'var(--fg-3)' }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11.5, fontWeight: 700,
                  background: step.active ? 'var(--brand-indigo-600)' : '#fff',
                  color: step.active ? '#fff' : 'var(--fg-3)',
                  border: step.active ? 'none' : '1.5px solid var(--border-1)',
                  boxShadow: step.active ? '0 4px 12px -4px rgba(79,70,229,0.45)' : 'none',
                }}>
                  {step.n}
                </span>
                {step.label}
              </div>
              {i < arr.length - 1 && (
                <div style={{ width: 40, height: 1.5, background: 'var(--border-1)', borderRadius: 99 }} />
              )}
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 310px', gap: 28, alignItems: 'start' }}>

          {/* Form */}
          <div className="laf-card" style={{ padding: 28 }}>

            {/* Type picker */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 4 }}>
                What kind of space is this?
                <span style={{ fontWeight: 400, color: 'var(--fg-3)', marginLeft: 8 }}>Helps members categorize at a glance</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 10 }}>
                {TYPES.map((t) => {
                  const on = selectedType.key === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setSelectedType(t)}
                      style={{
                        position: 'relative',
                        background: '#fff',
                        border: on ? 'none' : '1px solid var(--border-subtle)',
                        borderRadius: 14,
                        padding: '16px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        textAlign: 'center',
                        boxShadow: on
                          ? 'inset 0 0 0 1.5px var(--brand-indigo-600), 0 8px 22px -10px rgba(79,70,229,0.35)'
                          : '0 1px 3px rgba(0,0,0,0.06)',
                        transition: 'all 150ms ease-out',
                      }}
                    >
                      {on && (
                        <span style={{
                          position: 'absolute', top: 8, right: 8, width: 18, height: 18,
                          borderRadius: '50%', background: 'var(--brand-indigo-600)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5"/>
                          </svg>
                        </span>
                      )}
                      <span style={{
                        width: 44, height: 44, borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: on ? 'linear-gradient(135deg,#6366F1,#4F46E5)' : 'var(--slate-100)',
                        color: on ? '#fff' : 'var(--fg-2)',
                        boxShadow: on ? '0 4px 12px -4px rgba(79,70,229,0.45)' : 'none',
                        transition: 'all 150ms ease-out',
                      }}>
                        {t.icon}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{t.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--fg-3)', lineHeight: 1.4 }}>{t.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="cs-name" style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
                Space name
                <span style={{ fontWeight: 400, color: 'var(--fg-3)', marginLeft: 8 }}>What people will see</span>
              </label>
              <input
                id="cs-name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Atlas Works HQ"
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 14px',
                  border: '1.5px solid var(--border-1)', borderRadius: 10,
                  fontSize: 14.5, color: 'var(--fg-1)', outline: 'none',
                  background: '#fff', fontFamily: 'inherit',
                  transition: 'border-color 150ms',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--brand-indigo-600)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Address */}
            <div style={{ marginBottom: 28 }}>
              <label htmlFor="cs-addr" style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>
                Address
                <span style={{ fontWeight: 400, color: 'var(--fg-3)', marginLeft: 8 }}>Optional · helps members find it</span>
              </label>
              <input
                id="cs-addr"
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. 120 Mission St, Floor 2"
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 14px',
                  border: '1.5px solid var(--border-1)', borderRadius: 10,
                  fontSize: 14.5, color: 'var(--fg-1)', outline: 'none',
                  background: '#fff', fontFamily: 'inherit',
                  transition: 'border-color 150ms',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--brand-indigo-600)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {mutation.isError && (
              <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, marginBottom: 18, fontSize: 13.5, color: '#991B1B' }}>
                Failed to create space. Please try again.
              </div>
            )}

            {/* Submit row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-3)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                </svg>
                You'll be the first manager of this space.
              </div>
              <button
                className="laf-btn laf-btn-primary"
                disabled={!name.trim() || mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending ? 'Creating…' : 'Create space'}
                {!mutation.isPending && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Live preview */}
          <aside style={{ position: 'sticky', top: 88 }}>
            <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 18, boxShadow: '0 4px 20px -8px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
              {/* Accent stripe */}
              <div style={{ height: 3, background: selectedType.accent, transition: 'background 300ms' }} />
              <div style={{ padding: 20 }}>
                {/* Live preview label */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700,
                  color: 'var(--brand-indigo-700)', background: 'var(--brand-indigo-50)',
                  padding: '4px 9px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14,
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                  Live preview
                </span>

                {/* Space icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: selectedType.iconBg, color: selectedType.iconColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14, transition: 'background 300ms, color 300ms',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
                }}>
                  {selectedType.icon}
                </div>

                <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, letterSpacing: '-0.012em', color: 'var(--fg-1)' }}>
                  {previewName}
                </h4>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1.5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s-8-4.5-8-11.5A8 8 0 0 1 20 10.5C20 17.5 12 22 12 22Z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {previewAddr}
                </p>

                {/* Mini stats */}
                <div style={{ display: 'flex', gap: 14, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                  {[
                    { k: 'Open', v: '0', color: '#DC2626' },
                    { k: 'Found', v: '0', color: '#059669' },
                    { k: 'Members', v: '1', color: 'var(--fg-1)' },
                  ].map(s => (
                    <div key={s.k} style={{ flex: 1 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{s.k}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(248,250,252,0.6)', fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-indigo-600)', flexShrink: 0, marginTop: 1 }}>
                  <path d="m12 3 2.6 5.3 5.9.9-4.3 4.2 1 5.8L12 16.5l-5.2 2.7 1-5.8L3.5 9.2l5.9-.9Z"/>
                </svg>
                The colored accent at the top matches the space type — changes as you pick above.
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--fg-2)' }}>
              Already have an invite code?{' '}
              <Link to="/join" style={{ color: 'var(--brand-indigo-600)', fontWeight: 600, textDecoration: 'none' }}>
                Join an existing space
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
        @media (max-width: 900px) {
          .cs-layout { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .cs-type-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
