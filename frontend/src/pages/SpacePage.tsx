import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { listItems } from '../api/items.api';
import { getSpace } from '../api/spaces.api';
import ItemCard from '../components/items/ItemCard';
import ItemFilters from '../components/items/ItemFilters';
import { useState } from 'react';
import type { ListItemsQuery, Item } from '@laf/shared';

const SPACE_TYPE_ICONS: Record<string, string> = {
  office: '🏢',
  gym: '🏋️',
  library: '📚',
  other: '📍',
};

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm px-6 py-3 flex items-center gap-3">
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Dashboard</Link>
        <span className="text-gray-200">/</span>
        <div className="flex items-center gap-2">
          {space && <span className="text-lg">{SPACE_TYPE_ICONS[space.type] ?? '📍'}</span>}
          <span className="text-sm font-semibold text-gray-900">{space?.name ?? '...'}</span>
        </div>
        <div className="ml-auto flex gap-2">
          {space?.member_role === 'manager' && (
            <Link
              to={`/spaces/${spaceId}/manage`}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Manager View
            </Link>
          )}
          <Link
            to={`/spaces/${spaceId}/settings`}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Settings
          </Link>
          <Link
            to={`/spaces/${spaceId}/report`}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            + Report Item
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <ItemFilters filters={filters} onChange={setFilters} />

        {isLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-52 animate-pulse ring-1 ring-gray-100" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-lg font-medium text-gray-700">No items found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or be the first to report an item.</p>
            <Link
              to={`/spaces/${spaceId}/report`}
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Report an Item
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
