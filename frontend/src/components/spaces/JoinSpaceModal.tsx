import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { JoinSpaceSchema, type JoinSpaceInput } from '@laf/shared';
import { joinSpace } from '../../api/spaces.api';

interface Props { onClose: () => void; onJoined: () => void; }

export default function JoinSpaceModal({ onClose, onJoined }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<JoinSpaceInput>({
    resolver: zodResolver(JoinSpaceSchema),
  });

  const mutation = useMutation({
    mutationFn: joinSpace,
    onSuccess: onJoined,
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Join a Space</h2>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invite Code</label>
          <input
            {...register('inviteCode')}
            placeholder="ABC123"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.inviteCode && <p className="mt-1 text-sm text-red-600">{errors.inviteCode.message}</p>}
          {mutation.isError && <p className="mt-2 text-sm text-red-600">Invalid invite code.</p>}

          <div className="mt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 py-2 rounded-md text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
              {mutation.isPending ? 'Joining...' : 'Join'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
