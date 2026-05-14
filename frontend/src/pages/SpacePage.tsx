import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { listItems } from '../api/items.api';
import { getSpace } from '../api/spaces.api';
import ItemCard from '../components/items/ItemCard';
import ItemFilters from '../components/items/ItemFilters';
import { useState } from 'react';
import type { ListItemsQuery, Item } from '@laf/shared';

function getInitials(name: string) {
  return name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
}

const SPACE_TYPE_STYLES: Record<string, { iconBg: string; iconColor: string }> = {
  office:    { iconBg: '#EEF2FF', iconColor: '#4338CA' },
  gym:       { iconBg: '#FFFBEB', iconColor: '#B45309' },
  library:   { iconBg: '#F5F3FF', iconColor: '#6D28D9' },
  coworking: { iconBg: '#ECFEFF', iconColor: '#0E7490' },
  other:     { iconBg: '#EEF2FF', iconColor: '#4338CA' },
};

function SpaceTypeIcon({ type }: { type: string }) {
  if (type === 'gym') return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 6.5 17.5 17.5"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/>
      <path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>
    </svg>
  );
  if (type === 'library') return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
    </svg>
  );
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V7l9-4 9 4v14"/><path d="M3 21h18"/><path d="M9 9h.01"/><path d="M9 13h.01"/><path d="M9 17h.01"/><path d="M15 9h.01"/><path d="M15 13h.01"/><path d="M15 17h.01"/>
    </svg>
  );
}

export default function SpacePage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [filters, setFilters] = useState<Partial<ListItemsQuery>>({});

  const { data: space } = useQuery({
    queryKey: ['space', spaceId],
    queryFn: () => getSpace(spaceId!),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['items', spaceId, filters],
    queryFn: () => listItems(spaceId!, filters),
  });

  const items: Item[] = data?.items ?? [];
  const isManager = space?.member_role === 'manager';
  const st = SPACE_TYPE_STYLES[space?.type ?? 'other'] ?? SPACE_TYPE_STYLES.other;

  return (
    <>
      <div className="atmosphere soft" aria-hidden="true" />

      {/* Nav */}
      <nav className="laf-nav">
        <div className="laf-nav-inner">
          <Link to="/" className="laf-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-indigo-600)' }}>
              <path d="M11 3a8 8 0 1 0 8 8" /><path d="m21 21-4.3-4.3" />
            </svg>
            Lost &amp; Found
          </Link>

          <div className="laf-crumb">
            <Link to="/">Dashboard</Link>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sep"><path d="m9 18 6-6-6-6"/></svg>
            <span className="here">
              <span className="ic">
                <SpaceTypeIcon type={space?.type ?? 'office'} />
              </span>
              {space?.name ?? '…'}
            </span>
          </div>

          <div className="laf-nav-right">
            {isManager && (
              <Link to={`/spaces/${spaceId}/manage`} className="laf-btn laf-btn-ghost laf-btn-sm" style={{ textDecoration: 'none' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
                </svg>
                Manager view
              </Link>
            )}
            <Link to={`/spaces/${spaceId}/settings`} className="laf-btn laf-btn-ghost laf-btn-sm" style={{ textDecoration: 'none' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
              </svg>
              Settings
            </Link>
            <Link to={`/spaces/${spaceId}/report`} className="laf-btn laf-btn-primary laf-btn-sm" style={{ textDecoration: 'none' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14"/><path d="M5 12h14"/>
              </svg>
              Report an item
            </Link>
          </div>
        </div>
      </nav>

      {/* Space banner */}
      <section style={{ position: 'relative', zIndex: 1, background: 'radial-gradient(600px 320px at 8% 0%, rgba(99,102,241,0.20), transparent 60%), radial-gradient(500px 280px at 90% 100%, rgba(6,182,212,0.18), transparent 60%), linear-gradient(180deg,#FFFFFF 0%,#F8FAFC 100%)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 32px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: st.iconBg, color: st.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)' }}>
                <SpaceTypeIcon type={space?.type ?? 'office'} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.022em', lineHeight: 1.1, color: 'var(--fg-1)' }}>{space?.name ?? '…'}</h1>
                  {isManager && <span className="laf-pill laf-pill-indigo">Manager</span>}
                </div>
                {space?.address && (
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--fg-2)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-3)' }}>
                      <path d="M12 22s-8-4.5-8-11.5A8 8 0 0 1 20 10.5C20 17.5 12 22 12 22Z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {space.address}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
            {[
              { label: 'Total items', value: items.length, iconBg: '#EEF2FF', iconColor: 'var(--brand-indigo-700)', icon: <path d="M21 8H3"/><path d="M21 16H3"/><path d="M3 12h18"/> },
              { label: 'Open lost', value: items.filter(i => i.type === 'lost' && i.status === 'open').length, iconBg: '#FEE2E2', iconColor: '#991B1B', icon: <><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></> },
              { label: 'Found', value: items.filter(i => i.type === 'found').length, iconBg: '#D1FAE5', iconColor: '#065F46', icon: <path d="M20 6 9 17l-5-5"/> },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.7)', borderRadius: 14, padding: '14px 16px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: s.iconBg, color: s.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.018em', color: 'var(--fg-1)', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter row */}
      <div className="laf-shell" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <ItemFilters filters={filters} onChange={setFilters} />
      </div>

      {/* Results + grid */}
      <div className="laf-shell" style={{ paddingTop: 24 }}>
        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 16, aspectRatio: '5/4', border: '1px solid var(--border-subtle)' }} className="animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg,#EEF2FF,#CFFAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--brand-indigo-600)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--fg-1)', margin: '0 0 8px' }}>No items found</p>
            <p style={{ fontSize: 14, color: 'var(--fg-3)', margin: '0 0 24px' }}>Try adjusting your filters or be the first to report an item.</p>
            <Link to={`/spaces/${spaceId}/report`} className="laf-btn laf-btn-primary" style={{ textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14"/><path d="M5 12h14"/>
              </svg>
              Report an item
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ fontSize: 13, color: 'var(--fg-2)' }}>
                Showing <strong style={{ color: 'var(--fg-1)' }}>{items.length}</strong> items
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="laf-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <path d="M11 3a8 8 0 1 0 8 8" /><path d="m21 21-4.3-4.3" />
          </svg>
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
