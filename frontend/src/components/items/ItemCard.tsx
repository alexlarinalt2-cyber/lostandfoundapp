import { Link } from 'react-router-dom';
import type { Item } from '@laf/shared';

interface Props { item: Item; }

const TYPE_STYLES: Record<string, string> = {
  lost: 'bg-red-100 text-red-700',
  found: 'bg-green-100 text-green-700',
};
const STATUS_STYLES: Record<string, string> = {
  open: 'bg-green-50 text-green-600',
  claimed: 'bg-yellow-50 text-yellow-700',
  resolved: 'bg-gray-100 text-gray-500',
  expired: 'bg-red-50 text-red-500',
};

export default function ItemCard({ item }: Props) {
  const thumb = item.photos[0]?.thumbnailUrl ?? item.photos[0]?.url;

  return (
    <Link to={`/items/${item.id}`} className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
      {thumb ? (
        <img src={thumb} alt={item.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-300 text-3xl">?</div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold uppercase px-1.5 py-0.5 rounded ${TYPE_STYLES[item.type]}`}>{item.type}</span>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${STATUS_STYLES[item.status]}`}>{item.status}</span>
        </div>
        <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
        <p className="text-xs text-gray-500 mt-1 capitalize">{item.category}{item.locationLabel ? ` · ${item.locationLabel}` : ''}</p>
        <p className="text-xs text-gray-400 mt-1">{new Date(item.dateReported).toLocaleDateString()}</p>
      </div>
    </Link>
  );
}
