import { Link } from 'react-router-dom';
import type { Item } from '@laf/shared';

interface Props { item: Item; }

/* Category → icon path */
function CategoryIcon({ category }: { category: string }) {
  const paths: Record<string, React.ReactNode> = {
    bag: <><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/></>,
    electronics: <><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M12 18h.01"/></>,
    keys: <><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></>,
    eyewear: <><circle cx="6" cy="14" r="3"/><circle cx="18" cy="14" r="3"/><path d="M9 14 12 6l3 8"/></>,
    wallet: <><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    clothing: <><path d="M6 3v6a6 6 0 0 0 12 0V3"/><path d="M4 21h16"/><path d="M12 15v6"/></>,
    books: <><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></>,
  };
  const d = paths[category] ?? <circle cx="12" cy="12" r="9" />;
  return (
    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(15,23,42,0.45)' }}>
      {d}
    </svg>
  );
}

export default function ItemCard({ item }: Props) {
  const thumb = item.photos[0]?.thumbnailUrl ?? item.photos[0]?.url;
  const isLost = item.type === 'lost';
  const isFound = item.type === 'found';

  const photoBg = isLost
    ? 'radial-gradient(circle at 30% 30%, #FEE2E2 0%, #FCA5A5 95%)'
    : isFound
    ? 'radial-gradient(circle at 30% 30%, #D1FAE5 0%, #6EE7B7 95%)'
    : 'radial-gradient(circle at 30% 30%, #DBE3FF 0%, #A5B4FC 95%)';

  return (
    <Link
      to={`/items/${item.id}`}
      style={{
        position: 'relative', background: '#fff', border: '1px solid var(--border-subtle)',
        borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 220ms cubic-bezier(0.22,1,0.36,1)',
        display: 'block', textDecoration: 'none',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; }}
    >
      {/* Photo area */}
      <div style={{ aspectRatio: '5/4', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: thumb ? undefined : photoBg }}>
        {thumb ? (
          <img src={thumb} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <CategoryIcon category={item.category} />
        )}

        {/* Corner pills */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5 }}>
          <span className={`laf-pill ${isLost ? 'laf-pill-lost' : 'laf-pill-found'}`} style={{ fontSize: 10, padding: '3px 8px', background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(8px)', boxShadow: '0 2px 6px rgba(15,23,42,0.08)', color: isLost ? '#991B1B' : '#065F46' }}>
            {item.type}
          </span>
          {item.status === 'resolved' && (
            <span className="laf-pill" style={{ fontSize: 10, padding: '3px 8px', background: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(8px)', color: '#065F46' }}>
              Resolved
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '13px 14px 14px' }}>
        <h4 style={{ margin: '0 0 4px', fontSize: 14.5, fontWeight: 600, color: 'var(--fg-1)', letterSpacing: '-0.008em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.title}
        </h4>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
          {item.locationLabel ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s-8-4.5-8-11.5A8 8 0 0 1 20 10.5C20 17.5 12 22 12 22Z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {item.locationLabel}
              <span style={{ width: 2.5, height: 2.5, borderRadius: '50%', background: 'var(--fg-4)', flexShrink: 0 }} />
            </>
          ) : null}
          {new Date(item.dateReported).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}
