import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getItem, deleteItem, updateItem } from '../api/items.api';
import { getSpace } from '../api/spaces.api';
import { listClaims, updateClaim } from '../api/claims.api';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import type { Item } from '@laf/shared';

const STATUS_LABEL: Record<string, string> = {
  open: 'Open', claimed: 'Claimed', resolved: 'Resolved', expired: 'Expired',
};
const STATUS_PILL: Record<string, string> = {
  open: 'laf-pill-emerald', claimed: 'laf-pill-amber', resolved: 'laf-pill-neutral', expired: 'laf-pill-lost',
};

function CategoryIconLarge({ category }: { category: string }) {
  const paths: Record<string, React.ReactNode> = {
    bag: <><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/><path d="M8 10h8"/></>,
    electronics: <><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M12 18h.01"/></>,
    keys: <><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></>,
    eyewear: <><circle cx="6" cy="14" r="3"/><circle cx="18" cy="14" r="3"/><path d="M9 14 12 6l3 8"/></>,
    wallet: <><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    clothing: <><path d="M6 3v6a6 6 0 0 0 12 0V3"/><path d="M4 21h16"/><path d="M12 15v6"/></>,
    books: <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>,
  };
  return (
    <svg width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(15,23,42,0.45)' }}>
      {paths[category] ?? <circle cx="12" cy="12" r="9" />}
    </svg>
  );
}

export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [selectedThumb, setSelectedThumb] = useState(0);

  const { data: item, isLoading } = useQuery<Item>({
    queryKey: ['item', itemId],
    queryFn: () => getItem(itemId!),
  });

  const { data: space } = useQuery({
    queryKey: ['space', item?.spaceId],
    queryFn: () => getSpace(item!.spaceId),
    enabled: !!item,
  });

  const isOwner = item?.reportedBy === user?.id;
  const isManager = space?.member_role === 'manager';
  const canManage = isOwner || isManager;

  const { data: claims = [] } = useQuery({
    queryKey: ['claims', itemId],
    queryFn: () => listClaims(itemId!),
    enabled: canManage,
  });

  const claimMutation = useMutation({
    mutationFn: ({ claimId, status }: { claimId: string; status: 'approved' | 'rejected' }) =>
      updateClaim(itemId!, claimId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['item', itemId] }),
  });

  const resolveMutation = useMutation({
    mutationFn: () => updateItem(itemId!, { status: 'resolved' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['item', itemId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(itemId!),
    onSuccess: () => navigate(`/spaces/${item!.spaceId}`),
  });

  function handleDelete() {
    if (window.confirm('Delete this item? This cannot be undone.')) deleteMutation.mutate();
  }

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: 'var(--slate-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)' }}>Loading…</div>
  );
  if (!item) return (
    <div style={{ minHeight: '100vh', background: 'var(--slate-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)' }}>Item not found.</div>
  );

  const isLost = item.type === 'lost';
  const photoBg = isLost
    ? 'radial-gradient(circle at 30% 30%, #FEE2E2 0%, #FCA5A5 95%)'
    : 'radial-gradient(circle at 30% 30%, #D1FAE5 0%, #6EE7B7 95%)';

  return (
    <>
      <div className="atmosphere soft" aria-hidden="true" />

      {/* Nav */}
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
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sep"><path d="m9 18 6-6-6-6"/></svg>
            <Link to={`/spaces/${item.spaceId}`}>Space</Link>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sep"><path d="m9 18 6-6-6-6"/></svg>
            <span className="here">
              <span className="ic"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/></svg></span>
              {item.title}
            </span>
          </div>

          <div className="laf-nav-right">
            <button className="laf-icon-btn" aria-label="Share">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <path d="m8.6 13.5 6.8 4"/><path d="m15.4 6.5-6.8 4"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="laf-shell">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: 32, alignItems: 'start' }}>

          {/* Left: gallery + meta */}
          <div>
            {/* Photo gallery */}
            <div>
              <div style={{ aspectRatio: '5/4', borderRadius: 20, overflow: 'hidden', background: photoBg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: 'var(--shadow-md)' }}>
                {item.photos.length > 0 ? (
                  <img src={item.photos[selectedThumb]?.url ?? item.photos[0].url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <CategoryIconLarge category={item.category} />
                )}
                <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 6 }}>
                  <span className={`laf-pill ${isLost ? 'laf-pill-lost' : 'laf-pill-found'}`} style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(8px)', color: isLost ? '#991B1B' : '#065F46', boxShadow: '0 2px 6px rgba(15,23,42,0.08)' }}>
                    {item.type}
                  </span>
                </div>
              </div>
              {item.photos.length > 1 && (
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  {item.photos.map((p, i) => (
                    <button key={p.id} onClick={() => setSelectedThumb(i)} style={{ width: 84, height: 68, borderRadius: 12, overflow: 'hidden', border: selectedThumb === i ? '2px solid var(--brand-indigo-600)' : '2px solid transparent', boxShadow: selectedThumb === i ? '0 0 0 4px rgba(79,70,229,0.15)' : undefined, opacity: selectedThumb === i ? 1 : 0.7, transition: 'all 140ms', cursor: 'pointer', background: 'none', padding: 0 }}>
                      <img src={p.thumbnailUrl ?? p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <div className="laf-card" style={{ marginTop: 20 }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 600, letterSpacing: '-0.012em', color: 'var(--fg-1)' }}>Description</h2>
                <p style={{ margin: '0 0 0', fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6 }}>{item.description}</p>
              </div>
            )}

            {/* Item details */}
            <div className="laf-card" style={{ marginTop: 18 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-2)' }}>Item details</h3>
              <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px 24px', fontSize: 13.5 }}>
                <dt style={{ color: 'var(--fg-3)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/></svg>
                  Category
                </dt>
                <dd style={{ margin: 0, color: 'var(--fg-1)', fontWeight: 500, textTransform: 'capitalize' }}>{item.category}</dd>

                {item.locationLabel && (
                  <>
                    <dt style={{ color: 'var(--fg-3)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.5A8 8 0 0 1 20 10.5C20 17.5 12 22 12 22Z"/><circle cx="12" cy="10" r="3"/></svg>
                      Last seen
                    </dt>
                    <dd style={{ margin: 0, color: 'var(--fg-1)', fontWeight: 500 }}>{item.locationLabel}</dd>
                  </>
                )}

                <dt style={{ color: 'var(--fg-3)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
                  Date reported
                </dt>
                <dd style={{ margin: 0, color: 'var(--fg-1)', fontWeight: 500 }}>{new Date(item.dateReported).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</dd>

                <dt style={{ color: 'var(--fg-3)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 21a6 6 0 0 1 12 0"/></svg>
                  Reported by
                </dt>
                <dd style={{ margin: 0, color: 'var(--fg-1)', fontWeight: 500 }}>{item.reporterName}{isOwner ? ' (you)' : ''}</dd>
              </dl>
            </div>
          </div>

          {/* Right: actions, claims, timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Header */}
            <div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                <span className={`laf-pill ${isLost ? 'laf-pill-lost' : 'laf-pill-found'}`}>
                  {isLost ? (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  )}
                  {item.type}
                </span>
                <span className={`laf-pill ${STATUS_PILL[item.status] ?? 'laf-pill-neutral'}`}>{STATUS_LABEL[item.status] ?? item.status}</span>
              </div>
              <h1 style={{ margin: '0 0 10px', fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, color: 'var(--fg-1)' }}>{item.title}</h1>
              <div style={{ fontSize: 13, color: 'var(--fg-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#A5B4FC,#6366F1)', color: '#fff', fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.reporterName?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                Reported by <strong style={{ color: 'var(--fg-1)', fontWeight: 600 }}>{item.reporterName}</strong>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--fg-4)' }} />
                {new Date(item.dateReported).toLocaleDateString()}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {!isOwner && !isManager && item.status === 'open' && item.type === 'found' && (
                <button className="laf-btn laf-btn-primary" onClick={() => navigate(`/items/${itemId}/claim`)} style={{ flex: 1, justifyContent: 'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h6"/><path d="M12 9v6"/><circle cx="12" cy="12" r="10"/></svg>
                  This is mine — submit claim
                </button>
              )}
              {canManage && item.status !== 'resolved' && (
                <button className="laf-btn laf-btn-emerald" onClick={() => resolveMutation.mutate()} disabled={resolveMutation.isPending}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  {resolveMutation.isPending ? 'Marking…' : 'Mark resolved'}
                </button>
              )}
              {canManage && (
                <button className="laf-btn laf-btn-ghost" onClick={handleDelete} disabled={deleteMutation.isPending} style={{ color: 'var(--color-danger)', borderColor: 'rgba(239,68,68,0.25)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                </button>
              )}
            </div>

            {/* Claims (owner/manager) */}
            {canManage && claims.length > 0 && (
              <div className="laf-card">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 4px', fontSize: 17, fontWeight: 600, letterSpacing: '-0.012em', color: 'var(--fg-1)' }}>
                  Claims
                  <span className="laf-pill laf-pill-indigo" style={{ fontSize: 10 }}>{claims.length} total</span>
                </h2>
                <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--fg-3)' }}>People who say this might be theirs.</p>

                {claims.map((claim: { id: string; claimant_name: string; message: string; status: string }) => (
                  <div key={claim.id} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, paddingBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#A5B4FC,#6366F1)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {claim.claimant_name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                      <strong style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--fg-1)' }}>{claim.claimant_name}</strong>
                      <span className={`laf-pill ${claim.status === 'pending' ? 'laf-pill-amber' : claim.status === 'approved' ? 'laf-pill-emerald' : 'laf-pill-neutral'}`} style={{ marginLeft: 4, fontSize: 10 }}>{claim.status}</span>
                    </div>
                    <p style={{ margin: '6px 0 10px 40px', fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.55 }}>"{claim.message}"</p>
                    <div style={{ marginLeft: 40, display: 'flex', gap: 6 }}>
                      <button className="laf-btn laf-btn-ghost laf-btn-sm" onClick={() => navigate(`/items/${itemId}/claims/${claim.id}/review`)}>
                        Review claim →
                      </button>
                      {claim.status === 'pending' && (
                        <>
                          <button className="laf-btn laf-btn-emerald laf-btn-sm" onClick={() => claimMutation.mutate({ claimId: claim.id, status: 'approved' })}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            Approve
                          </button>
                          <button className="laf-btn laf-btn-ghost laf-btn-sm" onClick={() => claimMutation.mutate({ claimId: claim.id, status: 'rejected' })}>Reject</button>
                        </>
                      )}
                      {claim.status === 'approved' && (
                        <button className="laf-btn laf-btn-ghost laf-btn-sm" onClick={() => navigate(`/items/${itemId}/claims/${claim.id}/pickup`)}>
                          View thread →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Timeline */}
            <div className="laf-card">
              <h2 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 600, letterSpacing: '-0.012em', color: 'var(--fg-1)' }}>Timeline</h2>
              <div className="laf-timeline">
                <div className="laf-t-row done">
                  <strong style={{ color: 'var(--fg-1)', fontWeight: 600, display: 'block', fontSize: 13.5 }}>Item reported {item.type}</strong>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{new Date(item.dateReported).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                {claims.length > 0 && (
                  <div className="laf-t-row now">
                    <strong style={{ color: 'var(--fg-1)', fontWeight: 600, display: 'block', fontSize: 13.5 }}>Claim received</strong>
                    <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>From {claims[0]?.claimant_name}</div>
                  </div>
                )}
                <div className={`laf-t-row ${item.status === 'resolved' ? 'done' : ''}`}>
                  <strong style={{ color: item.status === 'resolved' ? 'var(--fg-1)' : 'var(--fg-3)', fontWeight: 600, display: 'block', fontSize: 13.5 }}>Mark as resolved</strong>
                  <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{item.status === 'resolved' ? 'Done' : 'Pending'}</div>
                </div>
              </div>
            </div>

            {/* Danger zone */}
            {canManage && (
              <div style={{ border: '1px solid rgba(239,68,68,0.22)', background: '#fff', borderRadius: 18, padding: 22, boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 600, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m10.3 3-7.5 13a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3l-7.5-13a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
                  </svg>
                  Danger zone
                </h2>
                <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--fg-3)' }}>Delete this report if it was filed by mistake. This cannot be undone.</p>
                <button className="laf-btn laf-btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={handleDelete} disabled={deleteMutation.isPending}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  {deleteMutation.isPending ? 'Deleting…' : 'Delete this report'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="laf-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M11 3a8 8 0 1 0 8 8" /><path d="m21 21-4.3-4.3" /></svg>
          <span>© 2026 Lost &amp; Found</span>
        </div>
        <div style={{ display: 'flex', gap: 18 }}>
          <a href="#" style={{ color: 'var(--fg-3)' }}>Help</a>
          <a href="#" style={{ color: 'var(--fg-3)' }}>Privacy</a>
          <a href="#" style={{ color: 'var(--fg-3)' }}>Terms</a>
        </div>
      </footer>

    </>
  );
}
