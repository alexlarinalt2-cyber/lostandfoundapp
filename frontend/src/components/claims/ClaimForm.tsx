import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CreateClaimSchema, type CreateClaimInput } from '@laf/shared';
import { createClaim } from '../../api/claims.api';

interface Props {
  itemId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function ClaimForm({ itemId, onClose, onSubmitted }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateClaimInput>({
    resolver: zodResolver(CreateClaimSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: CreateClaimInput) => createClaim(itemId, data),
    onSuccess: onSubmitted,
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Submit a Claim</h2>
        <p className="text-sm text-gray-500 mb-4">Describe why this item belongs to you so the finder can verify.</p>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))}>
          <textarea
            {...register('message')}
            rows={4}
            placeholder="e.g. It has my initials engraved on the back..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
          {mutation.isError && <p className="mt-2 text-sm text-red-600">Failed to submit claim.</p>}

          <div className="mt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 py-2 rounded-md text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
