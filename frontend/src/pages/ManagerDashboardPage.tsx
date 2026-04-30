import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { listItems } from '../api/items.api';
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

const STATUS_COLORS: Record<string, string> = {
  open: 'text-green-700 bg-green-50',
  claimed: 'text-yellow-700 bg-yellow-50',
  resolved: 'text-gray-600 bg-gray-50',
  expired: 'text-red-600 bg-red-50',
};

export default function ManagerDashboardPage() {
  const { spaceId } = useParams<{ spaceId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['items', spaceId, 'all'],
    queryFn: () => listItems(spaceId!, { limit: 50 }),
  });

  const items: Item[] = data?.items ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <Link to={`/spaces/${spaceId}`} className="text-sm text-gray-500 hover:text-gray-700">Back to Space</Link>
        <span className="text-sm font-semibold text-gray-900">Manager Dashboard</span>
        <button
          onClick={() => exportCsv(items)}
          className="ml-auto px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Export CSV
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Type', 'Title', 'Category', 'Location', 'Reporter', 'Date', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold uppercase px-1.5 py-0.5 rounded ${item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/items/${item.id}`} className="text-blue-600 hover:underline">{item.title}</Link>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-600">{item.category}</td>
                    <td className="px-4 py-3 text-gray-600">{item.locationLabel ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.reporterName}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(item.dateReported).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
