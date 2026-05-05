import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listSpaces } from '../api/spaces.api';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import JoinSpaceModal from '../components/spaces/JoinSpaceModal';
import CreateSpaceModal from '../components/spaces/CreateSpaceModal';

const SPACE_TYPE_ICONS: Record<string, string> = {
  office: '🏢',
  gym: '🏋️',
  library: '📚',
  other: '📍',
};

const SPACE_TYPE_BORDER: Record<string, string> = {
  office:  'border-t-blue-500',
  gym:     'border-t-orange-400',
  library: 'border-t-purple-500',
  other:   'border-t-gray-400',
};

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const { data: spaces = [], isLoading, refetch } = useQuery({
    queryKey: ['spaces'],
    queryFn: listSpaces,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗂️</span>
          <h1 className="text-lg font-bold text-gray-900">Lost &amp; Found</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.displayName}</span>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
            Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Your Spaces</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowJoin(true)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Join Space
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
              + Create Space
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-28 animate-pulse ring-1 ring-gray-100" />
            ))}
          </div>
        ) : spaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🏛️</div>
            <p className="text-lg font-medium text-gray-700">No spaces yet</p>
            <p className="text-sm text-gray-400 mt-1">Join an existing space with an invite code, or create your own.</p>
            <div className="flex justify-center gap-3 mt-5">
              <button
                onClick={() => setShowJoin(true)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Join a Space
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create a Space
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space: { id: string; name: string; type: string; member_role: string; address?: string }) => (
              <Link
                key={space.id}
                to={`/spaces/${space.id}`}
                className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ring-1 ring-gray-100 border-t-4 ${SPACE_TYPE_BORDER[space.type] ?? 'border-t-gray-400'}`}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{SPACE_TYPE_ICONS[space.type] ?? '📍'}</span>
                      <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{space.type}</span>
                    </div>
                    {space.member_role === 'manager' && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Manager</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-base">{space.name}</h3>
                  {space.address && (
                    <p className="text-xs text-gray-400 mt-1 truncate">{space.address}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {showJoin && <JoinSpaceModal onClose={() => setShowJoin(false)} onJoined={() => { setShowJoin(false); refetch(); }} />}
      {showCreate && <CreateSpaceModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); refetch(); }} />}
    </div>
  );
}
