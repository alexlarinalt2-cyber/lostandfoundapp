import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { listItems } from '../api/items.api';
import { listSpaceClaims } from '../api/spaces.api';
import { updateClaim } from '../api/claims.api';
import type { Item } from '@laf/shared';

function exportCsv(items: Item[]) {
  const headers = ['ID', 'Type', 'Status', 'Title', 'Category', 'Location', 'Reported By', 'Date'];
  const rows = items.map((i) => [
    i.id, i.type, i.status, i.title, i.category,
    i.locationLabel ?? '', i.reporterName, new Date(i.dateReported).toLocaleDateString(),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'items.csv'; a.click();
  URL.revokeObjectURL(url);
}

const TYPE_PILL: Record<string, string> = {
  lost: 'laf-pill-lost', found: 'laf-pill-found',
};
const STATUS_PILL: Record<string, string> = {
  open: 'laf-pill-emerald', claimed: 'laf-pill-amber', resolved: 'laf-pill-neutral', expired: 'laf-pill-neutral',
};

function getInitials(name: string) {
  if (!name) return '??';
  return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function ManagerDashboardPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['items', spaceId, 'all'],
    queryFn: () => listItems(spaceId!, { limit: 100 }),
  });

  const items: Item[] = data?.items ?? [];

  const { data: allClaims = [] } = useQuery({
    queryKey: ['space-claims', spaceId],
    queryFn: () => listSpaceClaims(spaceId!),
    enabled: !!spaceId,
  });

  const claimsByItem: Record<string, any[]> = (allClaims as any[]).reduce((acc: Record<string, any[]>, c: any) => {
    (acc[c.item_id] ??= []).push(c);
    return acc;
  }, {});

  const claimActionMutation = useMutation({
    mutationFn: ({ itemId, claimId, status }: { itemId: string; claimId: string; status: 'approved' | 'rejected' }) =>
      updateClaim(itemId, claimId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['space-claims', spaceId] });
      qc.invalidateQueries({ queryKey: ['items', spaceId] });
    },
  });

  const COL_COUNT = 8; // Type, Title, Category, Location, Reporter, Date, Claims, Status

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
            <Link to={`/spaces/${spaceId}`}>Space</Link>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sep"><path d="m9 18 6-6-6-6" /></svg>
            <span className="here">Manager Dashboard</span>
          </div>

          <div className="laf-nav-right">
            <button
              className="laf-btn laf-btn-ghost laf-btn-sm"
              onClick={() => exportCsv(items)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </nav>

      <main className="laf-shell">
        <header style={{ marginBottom: 28 }}>
          <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--fg-1)' }}>
            Manager Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--fg-3)' }}>
            {items.length} item{items.length !== 1 ? 's' : ''} · manage reports and claims
          </p>
        </header>

        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--fg-3)', fontSize: 14 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--brand-indigo-600)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
            Loading items…
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Type', 'Title', 'Category', 'Location', 'Reporter', 'Date', 'Claims', 'Status'].map((h) => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--fg-2)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const itemClaims: any[] = claimsByItem[item.id] ?? [];
                  const pendingClaims = itemClaims.filter((c: any) => c.status === 'pending');
                  const approvedClaim = itemClaims.find((c: any) => c.status === 'approved');
                  const isExpanded = expandedItem === item.id;

                  return (
                    <>
                      <tr
                        key={item.id}
                        style={{ borderTop: '1px solid var(--border-subtle)', transition: 'background 120ms' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--slate-50)')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                      >
                        {/* Type */}
                        <td style={{ padding: '12px 14px' }}>
                          <span className={`laf-pill ${item.type === 'lost' ? 'laf-pill-lost' : 'laf-pill-found'}`} style={{ fontSize: 10.5 }}>
                            {item.type}
                          </span>
                        </td>

                        {/* Title */}
                        <td style={{ padding: '12px 14px', maxWidth: 200 }}>
                          <Link to={`/items/${item.id}`} style={{ color: 'var(--brand-indigo-600)', fontWeight: 600, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
                            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                            {item.title}
                          </Link>
                        </td>

                        {/* Category */}
                        <td style={{ padding: '12px 14px', color: 'var(--fg-2)', textTransform: 'capitalize' }}>{item.category}</td>

                        {/* Location */}
                        <td style={{ padding: '12px 14px', color: 'var(--fg-2)' }}>{item.locationLabel ?? '—'}</td>

                        {/* Reporter */}
                        <td style={{ padding: '12px 14px', color: 'var(--fg-2)' }}>{item.reporterName}</td>

                        {/* Date */}
                        <td style={{ padding: '12px 14px', color: 'var(--fg-2)', whiteSpace: 'nowrap' }}>
                          {new Date(item.dateReported).toLocaleDateString()}
                        </td>

                        {/* Claims */}
                        <td style={{ padding: '12px 14px' }}>
                          {itemClaims.length === 0 ? (
                            <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>—</span>
                          ) : approvedClaim ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--brand-emerald-500)', fontWeight: 600 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                              Approved
                            </span>
                          ) : (
                            <button
                              onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--brand-indigo-600)', background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', transition: 'all 130ms' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#E0E7FF'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#EEF2FF'; }}
                            >
                              {/* Stacked avatar initials */}
                              <div style={{ display: 'flex', marginRight: 2 }}>
                                {pendingClaims.slice(0, 3).map((c: any, i: number) => (
                                  <div key={c.id} style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#A5B4FC,#6366F1)', color: '#fff', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #EEF2FF', marginLeft: i > 0 ? -6 : 0, zIndex: 3 - i }}>
                                    {getInitials(c.claimant_name ?? '')}
                                  </div>
                                ))}
                              </div>
                              {pendingClaims.length} pending
                              <svg
                                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                                style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </button>
                          )}
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 14px' }}>
                          <span className={`laf-pill ${STATUS_PILL[item.status] ?? 'laf-pill-neutral'}`} style={{ fontSize: 10.5 }}>
                            {item.status}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded claims drawer */}
                      {isExpanded && (
                        <tr key={`${item.id}-drawer`}>
                          <td colSpan={COL_COUNT} style={{ padding: '0 14px 14px', background: 'rgba(248,250,252,0.6)' }}>
                            <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 14, overflow: 'hidden' }}>
                              {/* Drawer header */}
                              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: 'var(--fg-2)', letterSpacing: '0.08em' }}>
                                  Claims · {itemClaims.length} total
                                </span>
                                <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--fg-3)' }}>
                                  {pendingClaims.length} pending review
                                </span>
                              </div>

                              {/* Each claim */}
                              {itemClaims.map((claim: any) => (
                                <div key={claim.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderTop: '1px solid var(--border-subtle)' }}>
                                  {/* Avatar */}
                                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#A5B4FC,#6366F1)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {getInitials(claim.claimant_name ?? '')}
                                  </div>

                                  {/* Body */}
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                                      <strong style={{ fontSize: 13.5, color: 'var(--fg-1)' }}>{claim.claimant_name}</strong>
                                      <span className={`laf-pill ${claim.status === 'pending' ? 'laf-pill-amber' : claim.status === 'approved' ? 'laf-pill-emerald' : 'laf-pill-neutral'}`} style={{ fontSize: 10 }}>
                                        {claim.status}
                                      </span>
                                      <span style={{ fontSize: 11.5, color: 'var(--fg-3)' }}>
                                        {new Date(claim.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    {claim.message && (
                                      <p style={{ margin: 0, fontSize: 12.5, color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500 }}>
                                        "{claim.message}"
                                      </p>
                                    )}
                                  </div>

                                  {/* Actions */}
                                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                    <button
                                      className="laf-btn laf-btn-ghost laf-btn-sm"
                                      onClick={() => navigate(`/items/${item.id}/claims/${claim.id}/review`)}
                                    >
                                      Review
                                    </button>
                                    {claim.status === 'pending' && (
                                      <>
                                        <button
                                          className="laf-btn laf-btn-emerald laf-btn-sm"
                                          onClick={() => claimActionMutation.mutate({ itemId: item.id, claimId: claim.id, status: 'approved' })}
                                          disabled={claimActionMutation.isPending}
                                        >
                                          Approve
                                        </button>
                                        <button
                                          className="laf-btn laf-btn-ghost laf-btn-sm"
                                          style={{ color: 'var(--color-danger)' }}
                                          onClick={() => claimActionMutation.mutate({ itemId: item.id, claimId: claim.id, status: 'rejected' })}
                                          disabled={claimActionMutation.isPending}
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}
                                    {claim.status === 'approved' && (
                                      <button
                                        className="laf-btn laf-btn-ghost laf-btn-sm"
                                        onClick={() => navigate(`/items/${item.id}/claims/${claim.id}/pickup`)}
                                      >
                                        View thread →
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}

                {items.length === 0 && (
                  <tr>
                    <td colSpan={COL_COUNT} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 14 }}>
                      No items reported yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
          <Link to={`/spaces/${spaceId}`} style={{ color: 'var(--fg-3)', textDecoration: 'none', fontSize: 13 }}>Back to Space</Link>
          <Link to={`/spaces/${spaceId}/settings`} style={{ color: 'var(--fg-3)', textDecoration: 'none', fontSize: 13 }}>Settings</Link>
        </div>
      </footer>
    </>
  );
}
