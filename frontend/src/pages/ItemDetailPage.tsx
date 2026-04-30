import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { getItem } from '../api/items.api';
import { listClaims, updateClaim } from '../api/claims.api';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import ClaimForm from '../components/claims/ClaimForm';
import type { Item } from '@laf/shared';

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-700',
  claimed: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-gray-100 text-gray-600',
  expired: 'bg-red-100 text-red-600',
};

export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showClaimForm, setShowClaimForm] = useState(false);

  const { data: item, isLoading } = useQuery<Item>({
    queryKey: ['item', itemId],
    queryFn: () => getItem(itemId!),
  });

  const { data: claims = [] } = useQuery({
    queryKey: ['claims', itemId],
    queryFn: () => listClaims(itemId!),
    enabled: item?.reportedBy === user?.id,
  });

  const claimMutation = useMutation({
    mutationFn: ({ claimId, status }: { claimId: string; status: 'approved' | 'rejected' }) =>
      updateClaim(itemId!, claimId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['item', itemId] }),
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!item) return <div className="p-8">Item not found.</div>;

  const isOwner = item.reportedBy === user?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <Link to={`/spaces/${item.spaceId}`} className="text-sm text-gray-500 hover:text-gray-700">Back</Link>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className={`text-xs font-semibold uppercase px-2 py-1 rounded-full ${item.type === 'lost' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {item.type}
              </span>
              <h1 className="mt-2 text-xl font-bold text-gray-900">{item.title}</h1>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[item.status]}`}>
              {item.status}
            </span>
          </div>

          {item.photos.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {item.photos.map((p) => (
                <img key={p.id} src={p.thumbnailUrl ?? p.url} alt="" className="h-32 w-32 object-cover rounded-md flex-shrink-0" />
              ))}
            </div>
          )}

          {item.description && <p className="text-gray-600 mb-4">{item.description}</p>}

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500">Category</dt><dd className="text-gray-900 capitalize">{item.category}</dd>
            {item.locationLabel && <><dt className="text-gray-500">Location</dt><dd className="text-gray-900">{item.locationLabel}</dd></>}
            <dt className="text-gray-500">Reported by</dt><dd className="text-gray-900">{item.reporterName}</dd>
            <dt className="text-gray-500">Date</dt><dd className="text-gray-900">{new Date(item.dateReported).toLocaleDateString()}</dd>
          </dl>

          {!isOwner && item.status === 'open' && item.type === 'found' && (
            <button
              onClick={() => setShowClaimForm(true)}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              This is mine
            </button>
          )}
        </div>

        {isOwner && claims.length > 0 && (
          <div className="mt-6 bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Claims ({claims.length})</h2>
            <div className="space-y-4">
              {claims.map((claim: { id: string; claimant_name: string; message: string; status: string }) => (
                <div key={claim.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{claim.claimant_name}</span>
                    <span className="text-xs text-gray-500 capitalize">{claim.status}</span>
                  </div>
                  <p className="text-sm text-gray-600">{claim.message}</p>
                  {claim.status === 'pending' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => claimMutation.mutate({ claimId: claim.id, status: 'approved' })}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => claimMutation.mutate({ claimId: claim.id, status: 'rejected' })}
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showClaimForm && (
        <ClaimForm
          itemId={itemId!}
          onClose={() => setShowClaimForm(false)}
          onSubmitted={() => { setShowClaimForm(false); qc.invalidateQueries({ queryKey: ['item', itemId] }); }}
        />
      )}
    </div>
  );
}
