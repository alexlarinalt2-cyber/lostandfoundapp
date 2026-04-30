import { ItemCategoryEnum, ItemTypeEnum, ItemStatusEnum, type ListItemsQuery } from '@laf/shared';
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

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && update({ search: search || undefined })}
        placeholder="Search items..."
        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <select
        value={filters.type ?? ''}
        onChange={(e) => update({ type: (e.target.value as ListItemsQuery['type']) || undefined })}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      >
        <option value="">All types</option>
        {ItemTypeEnum.options.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
      </select>

      <select
        value={filters.category ?? ''}
        onChange={(e) => update({ category: (e.target.value as ListItemsQuery['category']) || undefined })}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      >
        <option value="">All categories</option>
        {ItemCategoryEnum.options.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
      </select>

      <select
        value={filters.status ?? ''}
        onChange={(e) => update({ status: (e.target.value as ListItemsQuery['status']) || undefined })}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
      >
        <option value="">All statuses</option>
        {ItemStatusEnum.options.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
      </select>

      {(filters.type || filters.category || filters.status || filters.search) && (
        <button
          onClick={() => { setSearch(''); onChange({}); }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear
        </button>
      )}
    </div>
  );
}
