import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateSpaceSchema, type UpdateSpaceInput } from '@laf/shared';
import { getSpace, listMembers, updateSpace, updateMemberRole, removeMember, leaveSpace } from '../api/spaces.api';
import { useAuth } from '../context/AuthContext';

export default function SpaceSettingsPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: space, isLoading } = useQuery({
    queryKey: ['space', spaceId],
    queryFn: () => getSpace(spaceId!),
  });

  const isManager = space?.member_role === 'manager';

  const { data: members = [] } = useQuery({
    queryKey: ['members', spaceId],
    queryFn: () => listMembers(spaceId!),
    enabled: isManager,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateSpaceInput>({
    resolver: zodResolver(UpdateSpaceSchema),
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateSpaceInput) => updateSpace(spaceId!, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['space', spaceId] }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'member' | 'manager' }) =>
      updateMemberRole(spaceId!, userId, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members', spaceId] }),
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeMember(spaceId!, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members', spaceId] }),
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveSpace(spaceId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['spaces'] });
      navigate('/');
    },
  });

  function copyInviteCode() {
    if (!space?.invite_code) return;
    navigator.clipboard.writeText(space.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">Dashboard</Link>
        <span className="text-gray-300">/</span>
        <Link to={`/spaces/${spaceId}`} className="text-sm text-gray-500 hover:text-gray-700">{space?.name ?? '...'}</Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">Settings</span>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Invite Code */}
        <section className="bg-white rounded-lg border p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Invite Code</h2>
          <p className="text-sm text-gray-500 mb-4">Share this code with people you want to invite.</p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl tracking-widest text-gray-900 bg-gray-100 px-4 py-2 rounded-md">
              {space?.invite_code}
            </span>
            <button
              onClick={copyInviteCode}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </section>

        {/* Edit Space (managers only) */}
        {isManager && (
          <section className="bg-white rounded-lg border p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Space Details</h2>
            <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  {...register('name')}
                  defaultValue={space?.name}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address (optional)</label>
                <input
                  {...register('address')}
                  defaultValue={space?.address ?? ''}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {updateMutation.isSuccess && <p className="text-sm text-green-600">Saved.</p>}
              {updateMutation.isError && <p className="text-sm text-red-600">Failed to save.</p>}
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </section>
        )}

        {/* Members (managers only) */}
        {isManager && (
          <section className="bg-white rounded-lg border p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Members</h2>
            <ul className="divide-y">
              {members.map((m: { id: string; display_name: string; role: string }) => (
                <li key={m.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.display_name}</p>
                    <span className={`text-xs ${m.role === 'manager' ? 'text-blue-600' : 'text-gray-400'}`}>
                      {m.role}
                    </span>
                  </div>
                  {m.id !== user?.id && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => roleMutation.mutate({ userId: m.id, role: m.role === 'manager' ? 'member' : 'manager' })}
                        disabled={roleMutation.isPending}
                        className="text-xs px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        {m.role === 'manager' ? 'Demote' : 'Promote'}
                      </button>
                      <button
                        onClick={() => removeMutation.mutate(m.id)}
                        disabled={removeMutation.isPending}
                        className="text-xs px-3 py-1 border border-red-200 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Leave Space (members only) */}
        {!isManager && (
          <section className="bg-white rounded-lg border p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Leave Space</h2>
            <p className="text-sm text-gray-500 mb-4">You will lose access to this space and its items.</p>
            <button
              onClick={() => { if (confirm('Are you sure you want to leave this space?')) leaveMutation.mutate(); }}
              disabled={leaveMutation.isPending}
              className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
            >
              {leaveMutation.isPending ? 'Leaving...' : 'Leave Space'}
            </button>
          </section>
        )}

      </main>
    </div>
  );
}
