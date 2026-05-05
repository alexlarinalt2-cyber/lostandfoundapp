import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { listItems } from '../api/items.api';
import { getSpace } from '../api/spaces.api';
import ItemCard from '../components/items/ItemCard';
import ItemFilters from '../components/items/ItemFilters';
import { useState } from 'react';
import type { ListItemsQuery, Item } from '@laf/shared';

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
      <nav className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">Dashboard</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">{space?.name ?? '...'}</span>
        <div className="ml-auto flex gap-2">
          {space?.member_role === 'manager' && (
            <Link
              to={`/spaces/${spaceId}/manage`}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Manager View
            </Link>
          )}
          <Link
            to={`/spaces/${spaceId}/settings`}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Settings
          </Link>
          <Link
            to={`/spaces/${spaceId}/report`}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Report Item
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <ItemFilters filters={filters} onChange={setFilters} />

        {isLoading ? (
          <p className="text-gray-500 mt-6">Loading items...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No items found.</p>
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
