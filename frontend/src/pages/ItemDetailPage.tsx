import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getItem, deleteItem, updateItem } from '../api/items.api';
import { getSpace } from '../api/spaces.api';
import { listClaims, updateClaim } from '../api/claims.api';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import ClaimForm from '../components/claims/ClaimForm';
import type { Item } from '@laf/shared';

const STATUS_COLORS: Record<string, string> = {
  open:     'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300',
  claimed:  'bg-amber-100 text-amber-700 ring-1 ring-amber-300',
  resolved: 'bg-gray-100 text-gray-500 ring-1 ring-gray-300',
  expired:  'bg-red-100 text-red-600 ring-1 ring-red-300',
};

export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [showClaimForm, setShowClaimForm] = useState(false);

  const { data: item, isLoading } = useQuery<Item>({
    queryKey: ['item', itemId],
    queryFn: () => getItem(itemId!),
  });

  const { data: space } = useQuery({
    queryKey: ['space', item?.spaceId],
    queryFn: () => getSpace(item!.spaceId),
    enabled: !!item,
  });

  const isOwner = item?.reportedBy === user?.id;
  const isManager = space?.member_role === 'manager';
  const canManage = isOwner || isManager;

  const { data: claims = [] } = useQuery({
    queryKey: ['claims', itemId],
    queryFn: () => listClaims(itemId!),
    enabled: isOwner,
  });

  const claimMutation = useMutation({
    mutationFn: ({ claimId, status }: { claimId: string; status: 'approved' | 'rejected' }) =>
      updateClaim(itemId!, claimId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['item', itemId] }),
  });

  const resolveMutation = useMutation({
    mutationFn: () => updateItem(itemId!, { status: 'resolved' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['item', itemId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(itemId!),
    onSuccess: () => navigate(`/spaces/${item!.spaceId}`),
  });

  function handleDelete() {
    if (window.confirm('Delete this item? This cannot be undone.')) deleteMutation.mutate();
  }

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading...</div>
  );
  if (!item) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Item not found.</div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm px-6 py-3 flex items-center">
        <Link to={`/spaces/${item.spaceId}`} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
          ← Back to space
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {item.photos.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {item.photos.map((p) => (
              <img key={p.id} src={p.thumbnailUrl ?? p.url} alt=""
                className="h-56 w-56 object-cover rounded-2xl flex-shrink-0 shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="w-full h-48 rounded-2xl flex items-center justify-center text-6xl
            bg-gradient-to-br from-blue-50 to-indigo-100 text-indigo-200">
            {item.type === 'lost' ? '🔍' : '📦'}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full
              ${item.type === 'lost'
                ? 'bg-red-100 text-red-700 ring-1 ring-red-300'
                : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'}`}>
              {item.type}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[item.status]}`}>
              {item.status}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h1>

          {item.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-5">{item.description}</p>
          )}

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm border-t border-gray-100 pt-4">
            <dt className="text-gray-400 font-medium">Category</dt>
            <dd className="text-gray-800 capitalize">{item.category}</dd>
            {item.locationLabel && (
              <>
                <dt className="text-gray-400 font-medium">Location</dt>
                <dd className="text-gray-800">{item.locationLabel}</dd>
              </>
            )}
            <dt className="text-gray-400 font-medium">Reported by</dt>
            <dd className="text-gray-800">{item.reporterName}</dd>
            <dt className="text-gray-400 font-medium">Date</dt>
            <dd className="text-gray-800">{new Date(item.dateReported).toLocaleDateString()}</dd>
          </dl>

          <div className="mt-6 flex flex-col gap-3">
            {!isOwner && item.status === 'open' && item.type === 'found' && (
              <button
                onClick={() => setShowClaimForm(true)}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                This is mine — Submit a Claim
              </button>
            )}

            {canManage && item.status !== 'resolved' && (
              <button
                onClick={() => resolveMutation.mutate()}
                disabled={resolveMutation.isPending}
                className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {resolveMutation.isPending ? 'Marking...' : 'Mark as Resolved'}
              </button>
            )}

            {canManage && (
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="w-full border border-red-200 text-red-600 py-2.5 rounded-xl font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Item'}
              </button>
            )}

            {deleteMutation.isError && (
              <p className="text-sm text-red-600 text-center">Failed to delete. You may not have permission.</p>
            )}
          </div>
        </div>

        {isOwner && claims.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Claims ({claims.length})</h2>
            <div className="space-y-3">
              {claims.map((claim: { id: string; claimant_name: string; message: string; status: string }) => (
                <div key={claim.id} className="rounded-xl ring-1 ring-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{claim.claimant_name}</span>
                    <span className="text-xs text-gray-400 capitalize">{claim.status}</span>
                  </div>
                  <p className="text-sm text-gray-600">{claim.message}</p>
                  {claim.status === 'pending' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => claimMutation.mutate({ claimId: claim.id, status: 'approved' })}
                        className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => claimMutation.mutate({ claimId: claim.id, status: 'rejected' })}
                        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
