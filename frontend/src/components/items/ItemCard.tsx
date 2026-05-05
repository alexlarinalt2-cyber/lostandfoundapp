import { Link } from 'react-router-dom';
import type { Item } from '@laf/shared';

interface Props { item: Item; }

const TYPE_STYLES: Record<string, string> = {
  lost:  'bg-red-100 text-red-700 ring-1 ring-red-300 font-bold',
  found: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 font-bold',
};
const STATUS_STYLES: Record<string, string> = {
  open:     'bg-emerald-50 text-emerald-600',
  claimed:  'bg-amber-50 text-amber-700',
  resolved: 'bg-gray-100 text-gray-400',
  expired:  'bg-red-50 text-red-500',
};

export default function ItemCard({ item }: Props) {
  const thumb = item.photos[0]?.thumbnailUrl ?? item.photos[0]?.url;

  return (
    <Link to={`/items/${item.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ring-1 ring-gray-100">
      {thumb ? (
        <img src={thumb} alt={item.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 flex items-center justify-center text-4xl bg-gradient-to-br from-slate-50 to-blue-50 text-blue-200">
          {item.type === 'lost' ? '🔍' : '📦'}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-xs uppercase px-2.5 py-0.5 rounded-full ${TYPE_STYLES[item.type]}`}>{item.type}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status]}`}>{item.status}</span>
        </div>
        <h3 className="font-semibold text-gray-900 truncate text-base leading-snug">{item.title}</h3>
        <p className="text-xs text-gray-400 mt-1 capitalize">{item.category}{item.locationLabel ? ` · ${item.locationLabel}` : ''}</p>
        <p className="text-xs text-gray-300 mt-1">{new Date(item.dateReported).toLocaleDateString()}</p>
      </div>
    </Link>
  );
}
