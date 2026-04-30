import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listSpaces } from '../api/spaces.api';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import JoinSpaceModal from '../components/spaces/JoinSpaceModal';
import CreateSpaceModal from '../components/spaces/CreateSpaceModal';

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
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Lost &amp; Found</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.displayName}</span>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">Sign out</button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Your Spaces</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowJoin(true)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Join Space
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Space
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : spaces.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">You haven't joined any spaces yet.</p>
            <p className="text-sm mt-1">Create one or join with an invite code.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space: { id: string; name: string; type: string; member_role: string }) => (
              <Link
                key={space.id}
                to={`/spaces/${space.id}`}
                className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{space.type}</span>
                  {space.member_role === 'manager' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Manager</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">{space.name}</h3>
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
