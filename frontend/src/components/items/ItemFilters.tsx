import type { ListItemsQuery } from '@laf/shared';
import { useState } from 'react';

interface Props {
  filters: Partial<ListItemsQuery>;
  onChange: (f: Partial<ListItemsQuery>) => void;
}

export default function ItemFilters({ filters, onChange }: Props) {
  const [search, setSearch] = useState(filters.search ?? '');

  function update(partial: Partial<ListItemsQuery>) {
    onChange({ ...filters, ...partial });
  }

  const activeType = filters.type;
  const hasFilters = !!(filters.type || filters.category || filters.status || filters.search);

  return (
    <div style={{ position: 'sticky', top: 64, zIndex: 5, background: 'rgba(248,250,252,0.9)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-subtle)', marginLeft: -32, marginRight: -32, paddingLeft: 32, paddingRight: 32 }}>
      <div style={{ maxWidth: '100%', padding: '14px 0', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>

        {/* Search */}
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)' }}>
            <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && update({ search: search || undefined })}
            placeholder="Search items, locations…"
            style={{ width: '100%', border: '1px solid var(--border-1)', background: '#fff', borderRadius: 11, padding: '9px 14px 9px 38px', fontFamily: 'inherit', fontSize: 13.5, color: 'var(--fg-1)', outline: 'none', transition: 'all 140ms cubic-bezier(0.22,1,0.36,1)' }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-indigo-600)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(79,70,229,0.15)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-1)'; e.currentTarget.style.boxShadow = ''; }}
          />
        </div>

        {/* Type chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button className={`laf-chip ${!activeType ? 'on' : ''}`} onClick={() => update({ type: undefined })}>All</button>
          <button className={`laf-chip ${activeType === 'lost' ? 'on-lost' : ''}`} onClick={() => update({ type: activeType === 'lost' ? undefined : 'lost' })}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
            </svg>
            Lost
          </button>
          <button className={`laf-chip ${activeType === 'found' ? 'on-found' : ''}`} onClick={() => update({ type: activeType === 'found' ? undefined : 'found' })}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            Found
          </button>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'var(--border-1)' }} />

        {/* Status filter */}
        <select
          value={filters.status ?? ''}
          onChange={e => update({ status: (e.target.value as ListItemsQuery['status']) || undefined })}
          style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 11, padding: '7px 12px', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, color: 'var(--fg-2)', cursor: 'pointer', outline: 'none' }}
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="claimed">Claimed</option>
          <option value="resolved">Resolved</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); onChange({}); }}
            style={{ background: 'transparent', border: 'none', fontSize: 12.5, color: 'var(--fg-3)', cursor: 'pointer', padding: '7px 4px' }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
