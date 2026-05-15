import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateSpaceSchema, type UpdateSpaceInput } from '@laf/shared';
import { getSpace, listMembers, updateSpace, updateMemberRole, removeMember, leaveSpace, deleteSpace, regenerateInviteCode } from '../api/spaces.api';
import { useAuth } from '../context/AuthContext';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#A5B4FC,#6366F1)',
  'linear-gradient(135deg,#FCA5A5,#EF4444)',
  'linear-gradient(135deg,#FDBA74,#EA580C)',
  'linear-gradient(135deg,#7DD3FC,#06B6D4)',
  'linear-gradient(135deg,#86EFAC,#16A34A)',
  'linear-gradient(135deg,#F9A8D4,#DB2777)',
];

function avatarGradient(id: string) {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return AVATAR_GRADIENTS[n % AVATAR_GRADIENTS.length];
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function SpaceSettingsPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);
  const [activeSection, setActiveSection] = useState('invite');

  const { data: space, isLoading } = useQuery({
    queryKey: ['space', spaceId],
    queryFn: () => getSpace(spaceId!),
  });

  const isManager = space?.member_role === 'manager';

  const { data: members = [] } = useQuery({
    queryKey: ['members', spaceId],
    queryFn: () => listMembers(spaceId!),
    enabled: isManager,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateSpaceInput>({
    resolver: zodResolver(UpdateSpaceSchema),
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateSpaceInput) => updateSpace(spaceId!, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['space', spaceId] }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'member' | 'manager' }) =>
      updateMemberRole(spaceId!, userId, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members', spaceId] }),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeMember(spaceId!, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members', spaceId] }),
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveSpace(spaceId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['spaces'] }); navigate('/dashboard'); },
  });

  const deleteSpaceMutation = useMutation({
    mutationFn: () => deleteSpace(spaceId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['spaces'] }); navigate('/dashboard'); },
  });

  const regenerateMutation = useMutation({
    mutationFn: () => regenerateInviteCode(spaceId!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['space', spaceId] }),
  });

  function copyCode() {
    if (!space?.invite_code) return;
    navigator.clipboard.writeText(space.invite_code);
    setCopied('code');
    setTimeout(() => setCopied(null), 2000);
  }

  function copyLink() {
    const url = `${window.location.origin}/join?code=${space?.invite_code}`;
    navigator.clipboard.writeText(url);
    setCopied('link');
    setTimeout(() => setCopied(null), 2000);
  }

  function scrollTo(id: string) {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' });
  }

  const userInitials = user?.displayName ? initials(user.displayName) : '??';

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--slate-50)' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--brand-indigo-600)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  const navLink = (id: string, label: string, icon: React.ReactNode, danger = false) => (
    <a
      key={id}
      onClick={e => { e.preventDefault(); scrollTo(id); }}
      href={`#${id}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 10,
        fontSize: 13.5, fontWeight: activeSection === id ? 600 : 500,
        color: danger ? '#9F1239' : activeSection === id ? 'var(--brand-indigo-700)' : 'var(--fg-2)',
        background: activeSection === id ? 'var(--brand-indigo-50)' : 'transparent',
        cursor: 'pointer', textDecoration: 'none',
        transition: 'all 120ms cubic-bezier(0.22,1,0.36,1)',
      }}
      onMouseEnter={e => { if (activeSection !== id) (e.currentTarget as HTMLElement).style.background = 'rgba(15,23,42,0.04)'; (e.currentTarget as HTMLElement).style.color = danger ? '#9F1239' : 'var(--fg-1)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = activeSection === id ? 'var(--brand-indigo-50)' : 'transparent'; (e.currentTarget as HTMLElement).style.color = danger ? '#9F1239' : activeSection === id ? 'var(--brand-indigo-700)' : 'var(--fg-2)'; }}
    >
      <span style={{ width: 15, height: 15, flexShrink: 0 }}>{icon}</span>
      {label}
    </a>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate-50)', position: 'relative' }}>
      <div className="atmosphere" aria-hidden="true" />

      {/* Nav */}
      <nav className="laf-nav" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15, color: 'var(--fg-1)', letterSpacing: '-0.015em', flexShrink: 0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-indigo-600)' }}>
              <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
            </svg>
            Lost &amp; Found
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg-3)', flexWrap: 'wrap' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            <Link to="/dashboard" style={{ color: 'var(--fg-3)', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            <Link to={`/spaces/${spaceId}`} style={{ color: 'var(--fg-3)', textDecoration: 'none', fontWeight: 500 }}>{space?.name ?? '…'}</Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--fg-1)', fontWeight: 600 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
              Settings
            </span>
          </div>

          <div style={{ marginLeft: 'auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(15,23,42,0.05)', borderRadius: 999, padding: '5px 13px 5px 6px', cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: 'var(--fg-1)' }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#A5B4FC,#6366F1)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{userInitials}</span>
              {user?.displayName?.split(' ')[0] ?? 'Me'}
            </div>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '0 32px 80px', position: 'relative', zIndex: 1 }}>
        {/* Page header */}
        <header style={{ padding: '36px 0 28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6 }}>SPACE SETTINGS</div>
            <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--fg-1)' }}>{space?.name ?? '…'}</h1>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--fg-3)' }}>Configure how this space behaves — invitations, members, notifications, and retention.</p>
          </div>
          <Link
            to={`/spaces/${spaceId}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, border: '1px solid var(--border-1)', background: '#fff', color: 'var(--fg-2)', fontSize: 13.5, fontWeight: 600, textDecoration: 'none', flexShrink: 0 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            Back to feed
          </Link>
        </header>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px minmax(0,1fr)', gap: 32, alignItems: 'start' }}>
          {/* Side nav */}
          <nav style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navLink('invite',
              'Invite & access',
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M5 7h14"/><path d="M5 12h14"/><path d="M5 17h7"/><circle cx="18" cy="17" r="3"/><path d="M18 14v6"/><path d="M15 17h6"/></svg>
            )}
            {navLink('details',
              'Space details',
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M3 21V7l9-4 9 4v14"/><path d="M3 21h18"/></svg>
            )}
            {navLink('members',
              'Members',
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>
            )}
            {navLink('notifs',
              'Notifications',
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            )}
            {navLink('retention',
              'Retention',
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
            )}
            {navLink('danger', 'Danger zone',
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><path d="m10.3 3-7.5 13a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
              true
            )}
          </nav>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* ── Invite ── */}
            <section id="invite" style={{
              position: 'relative', borderRadius: 18, padding: 24, overflow: 'hidden',
              background: 'radial-gradient(420px 220px at 110% -10%, rgba(6,182,212,0.42), transparent 60%), radial-gradient(420px 220px at -10% 120%, rgba(79,70,229,0.55), transparent 60%), linear-gradient(160deg, #4F46E5 0%, #4338CA 100%)',
              color: '#fff', boxShadow: '0 8px 40px -8px rgba(79,70,229,0.6)',
            }}>
              <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 600, letterSpacing: '-0.014em', color: '#fff' }}>Invite people to this space</h2>
              <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.55 }}>Share this code or link with anyone you'd like to add. Members can report items and submit claims.</p>

              <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.96)', color: 'var(--fg-1)', borderRadius: 12, padding: '12px 18px', fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, letterSpacing: '0.18em', display: 'inline-flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 200 }}>
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--fg-3)', textTransform: 'uppercase', marginRight: 4 }}>CODE</span>
                  {space?.invite_code ?? '———'}
                </div>
                <button
                  onClick={copyCode}
                  style={{ background: '#fff', color: 'var(--brand-indigo-700)', padding: '0 16px', borderRadius: 12, fontWeight: 600, fontSize: 13.5, border: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 120ms cubic-bezier(0.22,1,0.36,1)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(0,0,0,0.18)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  {copied === 'code' ? 'Copied!' : 'Copy code'}
                </button>
                <button
                  onClick={copyLink}
                  style={{ background: '#fff', color: 'var(--brand-indigo-700)', padding: '0 16px', borderRadius: 12, fontWeight: 600, fontSize: 13.5, border: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 120ms cubic-bezier(0.22,1,0.36,1)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(0,0,0,0.18)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.71"/></svg>
                  {copied === 'link' ? 'Copied!' : 'Copy link'}
                </button>
              </div>

              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', color: 'rgba(255,255,255,0.8)', fontSize: 12.5 }}>
                <span>
                  {space?.invite_code_expires_at
                    ? <>Code expires <strong style={{ color: '#fff' }}>{new Date(space.invite_code_expires_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong></>
                    : <>Code expires in <strong style={{ color: '#fff' }}>30 days</strong></>
                  }
                </span>
                <span style={{ opacity: 0.5 }}>·</span>
                <button
                  onClick={() => regenerateMutation.mutate()}
                  disabled={regenerateMutation.isPending}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '6px 12px', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 5, opacity: regenerateMutation.isPending ? 0.6 : 1 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9"/><path d="M21 3v6h-6"/></svg>
                  {regenerateMutation.isPending ? 'Regenerating…' : 'Regenerate'}
                </button>
                <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '6px 12px', borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
                  Send by email
                </button>
              </div>
            </section>

            {/* ── Space details ── */}
            {isManager && (
              <section id="details" style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V7l9-4 9 4v14"/><path d="M3 21h18"/></svg>
                  SECTION 02
                </div>
                <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 600, letterSpacing: '-0.012em', color: 'var(--fg-1)' }}>Space details</h2>
                <p style={{ margin: '0 0 18px', fontSize: 13.5, color: 'var(--fg-3)' }}>Public information shown to members and on this space's listings.</p>

                <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 6 }}>Name</label>
                      <input
                        {...register('name')}
                        defaultValue={space?.name}
                        className="laf-input"
                        style={{ width: '100%' }}
                      />
                      {errors.name && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#DC2626' }}>{errors.name.message}</p>}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 6 }}>Type</label>
                      <select className="laf-input" style={{ width: '100%' }}>
                        <option>Office</option>
                        <option>Gym</option>
                        <option>Library</option>
                        <option>Coworking</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 6 }}>
                      Address <span style={{ fontWeight: 400, color: 'var(--fg-3)' }}>Optional · helps members find it</span>
                    </label>
                    <input
                      {...register('address')}
                      defaultValue={space?.address ?? ''}
                      className="laf-input"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ marginBottom: 0 }}>
                    <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 6 }}>Short description</label>
                    <textarea
                      rows={2}
                      placeholder="Describe this space for members…"
                      className="laf-input"
                      style={{ width: '100%', resize: 'vertical', minHeight: 64 }}
                    />
                  </div>

                  {updateMutation.isSuccess && <p style={{ margin: '10px 0 0', fontSize: 12.5, color: '#059669' }}>Changes saved.</p>}
                  {updateMutation.isError && <p style={{ margin: '10px 0 0', fontSize: 12.5, color: '#DC2626' }}>Failed to save.</p>}

                  <div style={{ display: 'flex', gap: 8, marginTop: 18, alignItems: 'center' }}>
                    <button type="submit" disabled={updateMutation.isPending} className="laf-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      {updateMutation.isPending ? 'Saving…' : 'Save changes'}
                    </button>
                    <button type="button" style={{ padding: '9px 18px', borderRadius: 11, border: '1px solid var(--border-1)', background: '#fff', color: 'var(--fg-2)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                      Discard
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* ── Members ── */}
            {isManager && (
              <section id="members" style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/></svg>
                  SECTION 03
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                  <div>
                    <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 600, letterSpacing: '-0.012em', color: 'var(--fg-1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      Members
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999, background: 'var(--slate-100)', color: 'var(--fg-2)', verticalAlign: 'middle' }}>{members.length}</span>
                    </h2>
                    <p style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-3)' }}>Promote trusted members to manager. Managers can resolve items and remove people.</p>
                  </div>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: 14 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)' }}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
                  <input type="text" placeholder="Search members…" style={{ width: '100%', border: '1px solid var(--border-subtle)', background: '#fff', borderRadius: 11, padding: '9px 14px 9px 36px', fontFamily: 'inherit', fontSize: 13, outline: 'none' }} />
                </div>

                {members.map((m: { id: string; display_name: string; role: string }, i: number) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
                    <span style={{ width: 36, height: 36, borderRadius: '50%', background: avatarGradient(m.id), color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {initials(m.display_name)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', display: 'block' }}>
                        {m.display_name}
                        {m.id === user?.id && <span style={{ color: 'var(--fg-3)', fontWeight: 400, fontSize: 12 }}> (you)</span>}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{m.role === 'manager' ? 'Manager' : 'Member'}</span>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: m.role === 'manager' ? 'var(--brand-indigo-700)' : 'var(--fg-2)',
                      padding: '4px 10px', borderRadius: 999,
                      background: m.role === 'manager' ? 'var(--brand-indigo-50)' : 'var(--slate-100)',
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                    }}>
                      {m.role === 'manager' && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m12 15 3.5-3.5"/><circle cx="9" cy="11" r="6"/></svg>}
                      {m.role === 'manager' ? 'Manager' : 'Member'}
                    </span>
                    {m.id !== user?.id && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => roleMutation.mutate({ userId: m.id, role: m.role === 'manager' ? 'member' : 'manager' })}
                          disabled={roleMutation.isPending}
                          style={{ fontSize: 12, padding: '5px 12px', borderRadius: 9, border: '1px solid var(--border-1)', background: '#fff', color: 'var(--fg-2)', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {m.role === 'manager' ? 'Demote' : 'Promote'}
                        </button>
                        <button
                          onClick={() => removeMutation.mutate(m.id)}
                          disabled={removeMutation.isPending}
                          style={{ fontSize: 12, padding: '5px 12px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.3)', background: '#fff', color: '#DC2626', cursor: 'pointer', fontWeight: 600 }}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* ── Notifications ── */}
            <section id="notifs" style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/></svg>
                SECTION 04
              </div>
              <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 600, letterSpacing: '-0.012em', color: 'var(--fg-1)' }}>Notifications</h2>
              <p style={{ margin: '0 0 6px', fontSize: 13.5, color: 'var(--fg-3)' }}>What members of this space get pinged about. These are the defaults — each member can override.</p>

              {[
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="m12 3 2.6 5.3 5.9.9-4.3 4.2 1 5.8L12 16.5l-5.2 2.7 1-5.8L3.5 9.2l5.9-.9Z"/></svg>,
                  iconBg: 'var(--brand-indigo-50)', iconColor: 'var(--brand-indigo-700)',
                  title: 'Match suggestions',
                  desc: 'Notify the original reporter when we surface a likely match (≥ 60% confidence).',
                  defaultOn: true,
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M20 6 9 17l-5-5"/></svg>,
                  iconBg: '#D1FAE5', iconColor: '#065F46',
                  title: 'New found-item posts',
                  desc: 'Daily digest at 5 PM for anyone with an open lost report.',
                  defaultOn: true,
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>,
                  iconBg: '#FEF3C7', iconColor: '#92400E',
                  title: 'Stale reports',
                  desc: "Remind reporters after 7 days if their item hasn't been claimed or resolved.",
                  defaultOn: true,
                },
                {
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}><path d="M22 16v-7a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 4 9v7c0 .73.4 1.4 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 22 16Z"/></svg>,
                  iconBg: 'var(--slate-100)', iconColor: 'var(--fg-2)',
                  title: 'Weekly manager digest',
                  desc: 'Monday morning summary of stats, top reporters, and items needing attention.',
                  defaultOn: false,
                },
              ].map((row, i) => (
                <NotifRow key={i} {...row} first={i === 0} />
              ))}
            </section>

            {/* ── Retention ── */}
            <section id="retention" style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 18, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>
                SECTION 05
              </div>
              <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 600, letterSpacing: '-0.012em', color: 'var(--fg-1)' }}>Retention</h2>
              <p style={{ margin: '0 0 18px', fontSize: 13.5, color: 'var(--fg-3)' }}>How long this space keeps items and their photos after they're resolved or expired. We never sell or share photos.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 6 }}>Open items auto-expire after</label>
                  <select className="laf-input" style={{ width: '100%' }}>
                    <option>30 days</option>
                    <option>60 days</option>
                    <option>90 days</option>
                    <option>Never</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 6 }}>Resolved items kept for</label>
                  <select className="laf-input" style={{ width: '100%' }}>
                    <option>30 days</option>
                    <option>60 days</option>
                    <option>1 year</option>
                    <option>Forever</option>
                  </select>
                </div>
              </div>
            </section>

            {/* ── Danger zone ── */}
            <section id="danger" style={{ border: '1px solid rgba(239,68,68,0.22)', background: '#fff', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 600, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.3 3-7.5 13a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                Danger zone
              </h2>

              {isManager && (
                <div style={{ paddingTop: 14, borderTop: '1px solid rgba(239,68,68,0.16)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <strong style={{ fontSize: 14, color: 'var(--fg-1)', display: 'block' }}>Transfer ownership</strong>
                    <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--fg-3)' }}>Hand the lead-manager seat to another manager in this space.</p>
                  </div>
                  <button style={{ padding: '7px 16px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.5)', background: '#fff', color: '#DC2626', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                    Transfer
                  </button>
                </div>
              )}

              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(239,68,68,0.16)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <strong style={{ fontSize: 14, color: 'var(--fg-1)', display: 'block' }}>Leave this space</strong>
                  <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--fg-3)' }}>You'll lose access to items and history. You can rejoin with the invite code.</p>
                </div>
                <button
                  onClick={() => { if (confirm('Are you sure you want to leave this space?')) leaveMutation.mutate(); }}
                  disabled={leaveMutation.isPending}
                  style={{ padding: '7px 16px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.5)', background: '#fff', color: '#DC2626', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
                >
                  {leaveMutation.isPending ? 'Leaving…' : 'Leave space'}
                </button>
              </div>

              {isManager && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(239,68,68,0.16)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <strong style={{ fontSize: 14, color: 'var(--fg-1)', display: 'block' }}>Delete this space</strong>
                    <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--fg-3)' }}>Removes all items and member records. This cannot be undone.</p>
                  </div>
                  <button
                    onClick={() => { if (confirm('Delete this space permanently? All items will be lost.')) deleteSpaceMutation.mutate(); }}
                    disabled={deleteSpaceMutation.isPending}
                    style={{ padding: '7px 16px', borderRadius: 9, border: 'none', background: '#DC2626', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 2px rgba(220,38,38,0.3), 0 4px 12px -2px rgba(220,38,38,0.4)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    {deleteSpaceMutation.isPending ? 'Deleting…' : 'Delete space'}
                  </button>
                </div>
              )}
            </section>

          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--fg-3)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-indigo-600)' }}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <span>© 2026 Lost &amp; Found</span>
        </div>
        <div style={{ display: 'flex', gap: 18 }}>
          <a href="#" style={{ color: 'var(--fg-3)', textDecoration: 'none' }}>Help</a>
          <a href="#" style={{ color: 'var(--fg-3)', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ color: 'var(--fg-3)', textDecoration: 'none' }}>Terms</a>
        </div>
      </footer>
    </div>
  );
}

function NotifRow({ icon, iconBg, iconColor, title, desc, defaultOn, first }: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  title: string; desc: string; defaultOn: boolean; first: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 0', borderTop: first ? 'none' : '1px solid var(--border-subtle)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', display: 'block' }}>{title}</strong>
        <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.55 }}>{desc}</p>
      </div>
      <label style={{ position: 'relative', width: 38, height: 22, flexShrink: 0, cursor: 'pointer', display: 'block' }}>
        <input type="checkbox" checked={on} onChange={e => setOn(e.target.checked)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', margin: 0 }} />
        <span style={{ position: 'absolute', inset: 0, background: on ? 'var(--brand-indigo-600)' : 'var(--slate-200)', borderRadius: 99, transition: 'background 120ms cubic-bezier(0.22,1,0.36,1)' }} />
        <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 18, height: 18, background: '#fff', borderRadius: '50%', boxShadow: '0 2px 4px rgba(15,23,42,0.18)', transition: 'left 120ms cubic-bezier(0.22,1,0.36,1)' }} />
      </label>
    </div>
  );
}
