import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateItemSchema, type CreateItemInput, ItemCategoryEnum, ItemTypeEnum } from '@laf/shared';
import { createItem } from '../api/items.api';
import { useState } from 'react';

export default function ReportItemPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateItemInput>({
    resolver: zodResolver(CreateItemSchema),
  });

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 3);
    setPhotos(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  async function onSubmit(data: CreateItemInput) {
    setSubmitError(null);
    try {
      await createItem(spaceId!, data, photos);
      qc.invalidateQueries({ queryKey: ['items', spaceId] });
      navigate(`/spaces/${spaceId}`);
    } catch {
      setSubmitError('Failed to submit the report. Please try again.');
    }
  }

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b shadow-sm px-6 py-3 flex items-center gap-3">
        <Link to={`/spaces/${spaceId}`} className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
          Cancel
        </Link>
        <span className="text-gray-200">|</span>
        <span className="text-sm font-semibold text-gray-800">Report an Item</span>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 sm:p-8 space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
            <select {...register('type')} className={inputClass}>
              {ItemTypeEnum.options.map((t) => (
                <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
            <input
              {...register('title')}
              placeholder="e.g. Black umbrella"
              className={inputClass}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select {...register('category')} className={inputClass}>
              {ItemCategoryEnum.options.map((c) => (
                <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Any details that might help identify it..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              {...register('locationLabel')}
              placeholder="e.g. Near the entrance"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Photos <span className="text-gray-400 font-normal">(up to 3)</span></label>
            <label className="flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors group">
              <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">📷</span>
              <span className="text-sm text-gray-500 group-hover:text-blue-600">Click to upload photos</span>
              <span className="text-xs text-gray-400 mt-0.5">JPEG, PNG or WebP</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
            {previews.length > 0 && (
              <div className="mt-3 flex gap-2">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt="" className="h-20 w-20 object-cover rounded-xl shadow-sm" />
                ))}
              </div>
            )}
          </div>

          {submitError && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-base hover:bg-blue-700 active:scale-[0.99] transition-all shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </main>
    </div>
  );
}
