import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClaim, listClaims, updateClaim } from '../api/claims.api';
import type { Item } from '@laf/shared';

interface ClaimPhoto {
  url: string;
  thumbnailUrl?: string;
  order: number;
}

interface IdentifyingMark {
  label: string;
  checked: boolean;
  detail?: string;
}

interface ClaimData {
  id: string;
  item_id: string;
  claimant_id: string;
  claimant_name: string;
  claimant_email: string;
  claimant_avatar: string | null;
  claimant_member_since: string;
  claimant_total_claims: number;
  claimant_prior_claims: number;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  identifying_marks: IdentifyingMark[];
  photos: ClaimPhoto[];
  pickup_method: 'in_person' | 'email';
  phone: string | null;
  availability: string | null;
  created_at: string;
}

interface ClaimReviewData {
  claim: ClaimData;
  item: Item;
}

function statusPill(status: string) {
  if (status === 'approved') return 'laf-pill-emerald';
  if (status === 'rejected') return 'laf-pill-neutral';
  return 'laf-pill-amber';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function ClaimReviewPage() {
  const { itemId, claimId } = useParams<{ itemId: string; claimId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [note, setNote] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading } = useQuery<ClaimReviewData>({
    queryKey: ['claim', itemId, claimId],
    queryFn: () => getClaim(itemId!, claimId!),
  });

  const { data: allClaims = [] } = useQuery<ClaimData[]>({
    queryKey: ['claims', itemId],
    queryFn: () => listClaims(itemId!),
  });

  const currentIndex = allClaims.findIndex((c: ClaimData) => c.id === claimId);
  const prevClaim = currentIndex > 0 ? allClaims[currentIndex - 1] : null;
  const nextClaim = currentIndex >= 0 && currentIndex < allClaims.length - 1 ? allClaims[currentIndex + 1] : null;

  const approveMutation = useMutation({
    mutationFn: () => updateClaim(itemId!, claimId!, 'approved'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['item', itemId] });
      navigate(`/items/${itemId}`);
    },
    onError: () => setActionError('Failed to approve claim. Please try again.'),
  });

  const rejectMutation = useMutation({
    mutationFn: () => updateClaim(itemId!, claimId!, 'rejected'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['item', itemId] });
      navigate(`/items/${itemId}`);
    },
    onError: () => setActionError('Failed to reject claim. Please try again.'),
  });

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--slate-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)' }}>
        Loading…
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--slate-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)' }}>
        Claim not found.
      </div>
    );
  }

  const { claim, item } = data;

  const checkedMarks = (claim.identifying_marks ?? []).filter(m => m.checked);
  const totalMarks = claim.identifying_marks?.length ?? 0;
  const marksScore = totalMarks > 0 ? Math.round((checkedMarks.length / totalMarks) * 100) : 0;
  const photosCount = claim.photos?.length ?? 0;

  let confidenceLabel = 'Low';
  let confidenceColor = '#DC2626';
  if (marksScore >= 60 || photosCount >= 2) { confidenceLabel = 'High'; confidenceColor = '#059669'; }
  else if (marksScore >= 30 || photosCount >= 1) { confidenceLabel = 'Medium'; confidenceColor = '#D97706'; }

  const isPending = claim.status === 'pending';

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
            <Link to={`/items/${itemId}`}>{item.title}</Link>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sep"><path d="m9 18 6-6-6-6"/></svg>
            <span className="here">
              <span className="ic">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12h6"/><path d="M12 9v6"/><circle cx="12" cy="12" r="10"/>
                </svg>
              </span>
              Claim from {claim.claimant_name}
            </span>
          </div>

          <div className="laf-nav-right">
            <Link to={`/items/${itemId}`} className="laf-btn laf-btn-ghost laf-btn-sm" style={{ textDecoration: 'none' }}>Back to item</Link>
          </div>
        </div>
      </nav>

      <main className="laf-shell" style={{ paddingBottom: 60 }}>
        {/* Page header */}
        <header style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--brand-indigo-600)', marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
            CLAIM REVIEW
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12, color: 'var(--fg-1)' }}>
            Verify the proof and approve or reject.
          </h1>
        </header>

        {/* Claim switcher strip */}
        {allClaims.length > 1 && (
          <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 14, padding: '12px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-sm)' }}>
            <button
              type="button"
              className="laf-btn laf-btn-ghost laf-btn-sm"
              disabled={!prevClaim}
              onClick={() => prevClaim && navigate(`/items/${itemId}/claims/${prevClaim.id}/review`)}
              style={{ opacity: prevClaim ? 1 : 0.4 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Prev
            </button>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 13, color: 'var(--fg-2)' }}>
              There {allClaims.length === 1 ? 'is' : 'are'} <strong style={{ color: 'var(--fg-1)' }}>{allClaims.length}</strong> claim{allClaims.length !== 1 ? 's' : ''} on this item.
              {currentIndex >= 0 && (
                <> Viewing <strong style={{ color: 'var(--fg-1)' }}>{currentIndex + 1}</strong> of {allClaims.length}.</>
              )}
            </div>
            <Link to={`/items/${itemId}`} style={{ fontSize: 13, color: 'var(--brand-indigo-600)', textDecoration: 'none', fontWeight: 500, whiteSpace: 'nowrap' }}>
              View all claims →
            </Link>
            <button
              type="button"
              className="laf-btn laf-btn-ghost laf-btn-sm"
              disabled={!nextClaim}
              onClick={() => nextClaim && navigate(`/items/${itemId}/claims/${nextClaim.id}/review`)}
              style={{ opacity: nextClaim ? 1 : 0.4 }}
            >
              Next
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>
        )}

        {/* 2-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 32, alignItems: 'start' }}>
          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Claim header card */}
            <div className="laf-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                {/* Avatar */}
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #A5B4FC, #6366F1)', color: '#fff', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {claim.claimant_avatar
                    ? <img src={claim.claimant_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : getInitials(claim.claimant_name)
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--fg-1)' }}>{claim.claimant_name}</h2>
                    <span className={`laf-pill ${statusPill(claim.status)}`}>{claim.status}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>Submitted {formatDate(claim.created_at)}</div>
                </div>
                {/* Preferred pickup (right) */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 4 }}>Preferred pickup</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>
                    {claim.pickup_method === 'in_person' ? 'In person at the space' : 'Coordinate by email'}
                  </div>
                  {claim.availability && <div style={{ fontSize: 12, color: 'var(--fg-3)' }}>{claim.availability}</div>}
                </div>
              </div>

              {/* Contact info row */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', padding: '14px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 2 }}>Email</div>
                  <div style={{ fontSize: 13, color: 'var(--fg-1)', fontWeight: 500 }}>{claim.claimant_email}</div>
                </div>
                {claim.phone && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 2 }}>Phone</div>
                    <div style={{ fontSize: 13, color: 'var(--fg-1)', fontWeight: 500 }}>{claim.phone}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 2 }}>Member since</div>
                  <div style={{ fontSize: 13, color: 'var(--fg-1)', fontWeight: 500 }}>{formatDateShort(claim.claimant_member_since)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 2 }}>Prior claims</div>
                  <div style={{ fontSize: 13, color: 'var(--fg-1)', fontWeight: 500 }}>{Number(claim.claimant_prior_claims)} on other items</div>
                </div>
              </div>

              {/* Confidence row */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 10 }}>Claim confidence</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  <div style={{ background: 'var(--slate-50)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-3)', marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>System score</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: confidenceColor }}>{marksScore}%</div>
                    <div style={{ fontSize: 12, color: confidenceColor, fontWeight: 600, marginTop: 2 }}>{confidenceLabel}</div>
                  </div>
                  <div style={{ background: 'var(--slate-50)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-3)', marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Marks matched</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg-1)' }}>{checkedMarks.length}<span style={{ fontSize: 13, color: 'var(--fg-3)', fontWeight: 500 }}>/{totalMarks}</span></div>
                    <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>ticked by claimant</div>
                  </div>
                  <div style={{ background: 'var(--slate-50)', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-3)', marginBottom: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Proof photos</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg-1)' }}>{photosCount}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 2 }}>{photosCount === 1 ? 'photo' : 'photos'} uploaded</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Proof statement */}
            <div className="laf-card">
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Proof statement</h3>
              <blockquote style={{ margin: 0, padding: '16px 20px', borderLeft: '3px solid var(--brand-indigo-600)', background: 'var(--brand-indigo-50)', borderRadius: '0 12px 12px 0', fontSize: 14.5, color: 'var(--fg-1)', lineHeight: 1.65, fontStyle: 'italic' }}>
                "{claim.message}"
              </blockquote>
            </div>

            {/* Identifying marks */}
            {claim.identifying_marks && claim.identifying_marks.length > 0 && (
              <div className="laf-card">
                <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Identifying marks</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {claim.identifying_marks.map((mark, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 14px', borderRadius: 10, background: mark.checked ? '#ECFDF5' : 'var(--slate-50)', border: `1px solid ${mark.checked ? '#A7F3D0' : 'var(--border-subtle)'}` }}>
                      <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1, background: mark.checked ? '#059669' : 'var(--border-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {mark.checked ? (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5"/>
                          </svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--fg-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: mark.checked ? '#065F46' : 'var(--fg-3)' }}>{mark.label}</div>
                        {mark.detail && <div style={{ fontSize: 12.5, color: mark.checked ? '#059669' : 'var(--fg-4)', marginTop: 3, fontStyle: 'italic' }}>{mark.detail}</div>}
                        {!mark.checked && <div style={{ fontSize: 11, color: '#D97706', marginTop: 3, fontWeight: 600 }}>Not ticked — verify in person if needed</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proof photos */}
            {claim.photos && claim.photos.length > 0 && (
              <div className="laf-card">
                <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Proof photos</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {claim.photos.map((photo, i) => (
                    <a key={i} href={photo.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: 100, height: 100, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-subtle)', flexShrink: 0, textDecoration: 'none' }}>
                      <img src={photo.thumbnailUrl ?? photo.url} alt={`Proof photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Side-by-side comparison */}
            <div className="laf-card">
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Side-by-side comparison</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Found item */}
                <div style={{ background: 'var(--slate-50)', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 12 }}>Found item (original)</div>
                  <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                    <div>
                      <dt style={{ fontWeight: 600, color: 'var(--fg-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Title</dt>
                      <dd style={{ margin: 0, color: 'var(--fg-1)', fontWeight: 500 }}>{item.title}</dd>
                    </div>
                    <div>
                      <dt style={{ fontWeight: 600, color: 'var(--fg-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Category</dt>
                      <dd style={{ margin: 0, color: 'var(--fg-1)', fontWeight: 500, textTransform: 'capitalize' }}>{item.category}</dd>
                    </div>
                    {item.locationLabel && (
                      <div>
                        <dt style={{ fontWeight: 600, color: 'var(--fg-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Location</dt>
                        <dd style={{ margin: 0, color: 'var(--fg-1)', fontWeight: 500 }}>{item.locationLabel}</dd>
                      </div>
                    )}
                    <div>
                      <dt style={{ fontWeight: 600, color: 'var(--fg-3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Date reported</dt>
                      <dd style={{ margin: 0, color: 'var(--fg-1)', fontWeight: 500 }}>{formatDateShort(item.dateReported)}</dd>
                    </div>
                  </dl>
                </div>

                {/* Claim data */}
                <div style={{ background: 'var(--brand-indigo-50)', borderRadius: 12, padding: '14px 16px', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand-indigo-600)', marginBottom: 12 }}>Claim data</div>
                  <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                    <div>
                      <dt style={{ fontWeight: 600, color: 'var(--brand-indigo-600)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Claimant</dt>
                      <dd style={{ margin: 0, color: 'var(--fg-1)', fontWeight: 500 }}>{claim.claimant_name}</dd>
                    </div>
                    <div>
                      <dt style={{ fontWeight: 600, color: 'var(--brand-indigo-600)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Statement</dt>
                      <dd style={{ margin: 0, color: 'var(--fg-2)', lineHeight: 1.45, fontStyle: 'italic' }}>"{claim.message.slice(0, 120)}{claim.message.length > 120 ? '…' : ''}"</dd>
                    </div>
                    <div>
                      <dt style={{ fontWeight: 600, color: 'var(--brand-indigo-600)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Pickup method</dt>
                      <dd style={{ margin: 0, color: 'var(--fg-1)', fontWeight: 500 }}>{claim.pickup_method === 'in_person' ? 'In person' : 'By email'}</dd>
                    </div>
                    <div>
                      <dt style={{ fontWeight: 600, color: 'var(--brand-indigo-600)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Submitted</dt>
                      <dd style={{ margin: 0, color: 'var(--fg-1)', fontWeight: 500 }}>{formatDateShort(claim.created_at)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Pickup preferences */}
            <div className="laf-card">
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Pickup preferences</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                <div style={{ background: 'var(--slate-50)', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Method</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)' }}>
                    {claim.pickup_method === 'in_person' ? 'In person at the space' : 'Coordinate by email'}
                  </div>
                </div>
                <div style={{ background: 'var(--slate-50)', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Availability</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)' }}>
                    {claim.availability ?? <span style={{ color: 'var(--fg-4)', fontWeight: 400, fontStyle: 'italic' }}>Not specified</span>}
                  </div>
                </div>
                <div style={{ background: 'var(--slate-50)', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Contact</div>
                  <div style={{ fontSize: 13, color: 'var(--fg-1)', fontWeight: 500 }}>{claim.claimant_email}</div>
                  {claim.phone && <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginTop: 2 }}>{claim.phone}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Right rail — sticky */}
          <aside style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Your decision */}
            <div className="laf-card">
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Your decision</h3>

              {!isPending ? (
                <div style={{ padding: '14px 16px', borderRadius: 12, background: claim.status === 'approved' ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${claim.status === 'approved' ? '#A7F3D0' : '#FECACA'}`, marginBottom: 16 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: claim.status === 'approved' ? '#065F46' : '#991B1B' }}>
                    This claim has been <strong>{claim.status}</strong>.
                  </div>
                </div>
              ) : (
                <>
                  {actionError && (
                    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: 12.5, padding: '10px 12px', borderRadius: 10, marginBottom: 12 }}>
                      {actionError}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                    <button
                      type="button"
                      className="laf-btn laf-btn-emerald"
                      style={{ justifyContent: 'center', width: '100%' }}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      onClick={() => { setActionError(null); approveMutation.mutate(); }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                      {approveMutation.isPending ? 'Approving…' : 'Approve claim'}
                    </button>
                    <button
                      type="button"
                      className="laf-btn laf-btn-ghost"
                      style={{ justifyContent: 'center', width: '100%' }}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      onClick={() => window.open(`mailto:${claim.claimant_email}?subject=About your claim on "${item.title}"`, '_blank')}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>
                      </svg>
                      Ask a question
                    </button>
                    <button
                      type="button"
                      className="laf-btn laf-btn-danger"
                      style={{ justifyContent: 'center', width: '100%' }}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      onClick={() => { setActionError(null); rejectMutation.mutate(); }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                      </svg>
                      {rejectMutation.isPending ? 'Rejecting…' : 'Reject claim'}
                    </button>
                  </div>

                  <label style={{ display: 'block' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Private note (optional)</div>
                    <textarea
                      className="laf-textarea"
                      rows={3}
                      placeholder="Add a private note for your records…"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </label>
                  <div style={{ fontSize: 11.5, color: 'var(--fg-4)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    Only visible to managers
                  </div>
                </>
              )}
            </div>

            {/* Claimant history */}
            <div className="laf-card">
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--fg-3)' }}>Claimant history</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>Total claims filed</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-1)' }}>{Number(claim.claimant_total_claims)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>On other items</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg-1)' }}>{Number(claim.claimant_prior_claims)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                  <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>Member since</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)' }}>{formatDateShort(claim.claimant_member_since)}</span>
                </div>
              </div>
            </div>
          </aside>
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
