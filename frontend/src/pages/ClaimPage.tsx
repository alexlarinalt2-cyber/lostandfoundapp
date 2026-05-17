import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getItem } from '../api/items.api';
import { getSpace } from '../api/spaces.api';
import { createClaim } from '../api/claims.api';
import type { Item } from '@laf/shared';

const IDENTIFYING_MARKS = [
  'A unique sticker, patch, or pin',
  'Initials or a name tag',
  'A specific piece of damage',
  'An attached keychain or accessory',
  'Specific contents inside',
];

const AVAILABILITY_OPTIONS = [
  'Weekdays 9am–5pm',
  'Weekday evenings',
  'Weekends',
  'Any time – flexible',
  'By appointment only',
];

interface MarkState {
  label: string;
  checked: boolean;
  detail: string;
}

function CategoryIcon({ category }: { category: string }) {
  const paths: Record<string, React.ReactNode> = {
    bag: <><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/></>,
    electronics: <><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M12 18h.01"/></>,
    keys: <><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></>,
    eyewear: <><circle cx="6" cy="14" r="3"/><circle cx="18" cy="14" r="3"/><path d="M9 14 12 6l3 8"/></>,
    wallet: <><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    clothing: <><path d="M6 3v6a6 6 0 0 0 12 0V3"/><path d="M4 21h16"/><path d="M12 15v6"/></>,
    books: <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>,
  };
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--fg-2)' }}>
      {paths[category] ?? <circle cx="12" cy="12" r="9" />}
    </svg>
  );
}

export default function ClaimPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();

  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [pickupMethod, setPickupMethod] = useState<'in_person' | 'email'>('in_person');
  const [marks, setMarks] = useState<MarkState[]>(
    IDENTIFYING_MARKS.map(label => ({ label, checked: false, detail: '' }))
  );
  const [charCount, setCharCount] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<{ message: string; phone?: string; availability?: string }>({
    defaultValues: { message: '', phone: '', availability: '' },
  });

  const messageValue = watch('message');

  const { data: item, isLoading } = useQuery<Item>({
    queryKey: ['item', itemId],
    queryFn: () => getItem(itemId!),
  });

  const { data: space } = useQuery({
    queryKey: ['space', item?.spaceId],
    queryFn: () => getSpace(item!.spaceId),
    enabled: !!item,
  });

  const mutation = useMutation({
    mutationFn: (vars: { message: string; phone?: string; availability?: string }) => {
      const identifyingMarks = marks.filter(m => m.checked).map(m => ({
        label: m.label,
        checked: true,
        detail: m.detail || undefined,
      }));
      return createClaim(
        itemId!,
        {
          message: vars.message,
          identifyingMarks,
          pickupMethod,
          phone: vars.phone || undefined,
          availability: vars.availability || undefined,
        },
        photos,
      );
    },
    onSuccess: () => navigate(`/items/${itemId}`),
    onError: () => setSubmitError('Failed to submit claim. Please try again.'),
  });

  function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 4 - photos.length;
    const newFiles = files.slice(0, remaining);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setPhotos(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  }

  function removePhoto(i: number) {
    URL.revokeObjectURL(previews[i]);
    setPhotos(prev => prev.filter((_, j) => j !== i));
    setPreviews(prev => prev.filter((_, j) => j !== i));
  }

  function toggleMark(i: number) {
    setMarks(prev => prev.map((m, j) => j === i ? { ...m, checked: !m.checked } : m));
  }

  function updateMarkDetail(i: number, detail: string) {
    setMarks(prev => prev.map((m, j) => j === i ? { ...m, detail } : m));
  }

  function onSubmit(data: { message: string; phone?: string; availability?: string }) {
    if (!confirmed) {
      setSubmitError('Please confirm that this item belongs to you.');
      return;
    }
    setSubmitError(null);
    mutation.mutate(data);
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--slate-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)' }}>
        Loading…
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--slate-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-3)' }}>
        Item not found.
      </div>
    );
  }

  const spaceName = (space as { name?: string } | undefined)?.name ?? 'Space';

  return (
    <>
      <div className="atmosphere soft" aria-hidden="true" />

      {/* Nav */}
      <nav className="laf-nav">
        <div className="laf-nav-inner">
          <Link to="/dashboard" className="laf-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-indigo-600)' }}>
              <path d="M11 3a8 8 0 1 0 8 8" /><path d="m21 21-4.3-4.3" />
            </svg>
            Lost &amp; Found
          </Link>

          <div className="laf-crumb">
            <Link to="/dashboard">Dashboard</Link>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sep"><path d="m9 18 6-6-6-6"/></svg>
            <Link to={`/spaces/${item.spaceId}`}>{spaceName}</Link>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sep"><path d="m9 18 6-6-6-6"/></svg>
            <Link to={`/items/${itemId}`}>{item.title}</Link>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sep"><path d="m9 18 6-6-6-6"/></svg>
            <span className="here">
              <span className="ic">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12h6"/><path d="M12 9v6"/><circle cx="12" cy="12" r="10"/>
                </svg>
              </span>
              Claim
            </span>
          </div>

          <div className="laf-nav-right">
            <Link to={`/items/${itemId}`} className="laf-btn laf-btn-ghost laf-btn-sm" style={{ textDecoration: 'none' }}>Cancel</Link>
          </div>
        </div>
      </nav>

      <main className="laf-shell" style={{ paddingBottom: 60 }}>
        {/* Page header */}
        <header style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--brand-indigo-600)', marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12h6"/><path d="M12 9v6"/><circle cx="12" cy="12" r="10"/>
            </svg>
            SUBMIT CLAIM
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12, color: 'var(--fg-1)' }}>
            Tell us why this is yours.
          </h1>
          <p style={{ margin: 0, fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.55, maxWidth: 560 }}>
            The more proof you provide, the faster the manager can verify and approve your claim.
          </p>
        </header>

        {/* Step rail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          {['Your proof', 'Pickup', 'Review'].map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && <div style={{ height: 1.5, background: 'var(--border-1)', borderRadius: 99, width: 40 }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: i === 0 ? 'var(--fg-1)' : 'var(--fg-3)' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  border: i === 0 ? 'none' : '1.5px solid var(--border-1)',
                  background: i === 0 ? 'var(--brand-indigo-600)' : '#fff',
                  color: i === 0 ? '#fff' : 'var(--fg-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11.5, fontWeight: 700,
                  boxShadow: i === 0 ? '0 4px 12px -4px rgba(79,70,229,0.45)' : undefined,
                }}>
                  {i + 1}
                </div>
                {step}
              </div>
            </div>
          ))}
        </div>

        {/* Claiming strip */}
        <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '14px 18px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'radial-gradient(circle at 30% 30%, #D1FAE5 0%, #6EE7B7 95%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {item.photos.length > 0 ? (
              <img src={item.photos[0].thumbnailUrl ?? item.photos[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
            ) : (
              <CategoryIcon category={item.category} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand-indigo-600)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>You're claiming</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
            {item.locationLabel && (
              <div style={{ fontSize: 12.5, color: 'var(--fg-3)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s-8-4.5-8-11.5A8 8 0 0 1 20 10.5C20 17.5 12 22 12 22Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {item.locationLabel}
              </div>
            )}
          </div>
          <span className="laf-pill laf-pill-found" style={{ flexShrink: 0 }}>found</span>
        </div>

        {/* 2-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 32, alignItems: 'start' }}>
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Why section */}
            <div className="laf-card" style={{ marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, letterSpacing: '-0.012em', color: 'var(--fg-1)' }}>
                Why do you believe this is yours?
              </h2>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.5 }}>
                Be specific — mention unique details, when you last had it, or any distinguishing features.
              </p>
              <div style={{ position: 'relative' }}>
                <textarea
                  {...register('message', {
                    required: 'Please describe why this item belongs to you.',
                    minLength: { value: 10, message: 'Please write at least 10 characters.' },
                    maxLength: { value: 1000, message: 'Maximum 1000 characters.' },
                  })}
                  className="laf-textarea"
                  rows={5}
                  placeholder="e.g. I left my black backpack near the main entrance last Tuesday. It has a yellow keychain and my initials on the inside label…"
                  style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box' }}
                  onChange={e => setCharCount(e.target.value.length)}
                />
                <div style={{ position: 'absolute', bottom: 10, right: 14, fontSize: 11.5, color: charCount > 900 ? '#DC2626' : 'var(--fg-4)' }}>
                  {charCount}/1000
                </div>
              </div>
              {errors.message && (
                <p style={{ marginTop: 6, fontSize: 12.5, color: 'var(--color-danger)' }}>{errors.message.message}</p>
              )}
            </div>

            {/* Identifying marks */}
            <div className="laf-card" style={{ marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, letterSpacing: '-0.012em', color: 'var(--fg-1)' }}>
                Identifying marks
              </h2>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.5 }}>
                Check all that apply, and add details to help the manager verify.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {marks.map((mark, i) => (
                  <div key={mark.label} style={{ border: `1.5px solid ${mark.checked ? 'var(--brand-indigo-600)' : 'var(--border-subtle)'}`, borderRadius: 12, padding: '12px 14px', background: mark.checked ? 'var(--brand-indigo-50)' : '#fff', transition: 'all 140ms' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                      <div
                        onClick={() => toggleMark(i)}
                        style={{
                          width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                          border: mark.checked ? 'none' : '1.5px solid var(--border-1)',
                          background: mark.checked ? 'var(--brand-indigo-600)' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all 120ms',
                        }}
                      >
                        {mark.checked && (
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5"/>
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: 13.5, fontWeight: 500, color: mark.checked ? 'var(--brand-indigo-700)' : 'var(--fg-1)' }} onClick={() => toggleMark(i)}>
                        {mark.label}
                      </span>
                    </label>
                    {mark.checked && (
                      <input
                        type="text"
                        className="laf-input"
                        placeholder="Add details (optional)…"
                        value={mark.detail}
                        onChange={e => updateMarkDetail(i, e.target.value)}
                        style={{ marginTop: 10, marginLeft: 28 }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Proof photos */}
            <div className="laf-card" style={{ marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, letterSpacing: '-0.012em', color: 'var(--fg-1)' }}>
                Proof photos
              </h2>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.5 }}>
                Upload up to 4 photos — receipts, old photos with the item, etc.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ width: 88, height: 88, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-subtle)', position: 'relative', flexShrink: 0 }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(15,23,42,0.7)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {photos.length < 4 && (
                  <label style={{ width: 88, height: 88, borderRadius: 14, border: '2px dashed var(--border-1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', color: 'var(--fg-3)', fontSize: 11.5, fontWeight: 500, flexShrink: 0, transition: 'border-color 120ms' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14"/><path d="M5 12h14"/>
                    </svg>
                    Add photo
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoAdd} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>

            {/* Pickup preference */}
            <div className="laf-card" style={{ marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 600, letterSpacing: '-0.012em', color: 'var(--fg-1)' }}>
                Pickup preference
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
                {[
                  { value: 'in_person' as const, label: 'In person, at the space', icon: <><path d="M12 22s-8-4.5-8-11.5A8 8 0 0 1 20 10.5C20 17.5 12 22 12 22Z"/><circle cx="12" cy="10" r="3"/></> },
                  { value: 'email' as const, label: 'Coordinate by email', icon: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></> },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPickupMethod(opt.value)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 14,
                      border: `1.5px solid ${pickupMethod === opt.value ? 'var(--brand-indigo-600)' : 'var(--border-subtle)'}`,
                      background: pickupMethod === opt.value ? 'var(--brand-indigo-50)' : '#fff',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 140ms',
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: pickupMethod === opt.value ? 'var(--brand-indigo-600)' : 'var(--slate-100)', color: pickupMethod === opt.value ? '#fff' : 'var(--fg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{opt.icon}</svg>
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: pickupMethod === opt.value ? 'var(--brand-indigo-700)' : 'var(--fg-1)', lineHeight: 1.3 }}>{opt.label}</span>
                  </button>
                ))}
              </div>

              {/* Phone + availability side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="laf-field" style={{ margin: 0 }}>
                  <label className="laf-label" htmlFor="phone">
                    Phone <span className="hint">Optional</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="laf-input"
                    placeholder="+1 (555) 000-0000"
                    {...register('phone')}
                  />
                </div>
                <div className="laf-field" style={{ margin: 0 }}>
                  <label className="laf-label" htmlFor="availability">
                    When can you stop by?
                  </label>
                  <select id="availability" className="laf-input" {...register('availability')}>
                    <option value="">Select availability…</option>
                    {AVAILABILITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Confirm + submit */}
            <div className="laf-card">
              {/* Confirmation checkbox */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 20 }}>
                <div
                  onClick={() => setConfirmed(c => !c)}
                  style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                    border: confirmed ? 'none' : '1.5px solid var(--border-1)',
                    background: confirmed ? 'var(--brand-indigo-600)' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 120ms',
                  }}
                >
                  {confirmed && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: 14, color: 'var(--fg-1)', lineHeight: 1.5 }}>
                  I confirm this item belongs to me, and the information I've provided is accurate to the best of my knowledge.
                </span>
              </label>

              {submitError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: 13, padding: '10px 14px', borderRadius: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>
                  </svg>
                  {submitError}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Only manager sees your details
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/items/${itemId}`} className="laf-btn laf-btn-ghost" style={{ textDecoration: 'none' }}>Cancel</Link>
                  <button
                    type="submit"
                    disabled={mutation.isPending || !confirmed}
                    className="laf-btn laf-btn-primary"
                    style={{ opacity: !confirmed ? 0.55 : 1 }}
                  >
                    {mutation.isPending ? 'Submitting…' : 'Submit claim'}
                    {!mutation.isPending && (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Right rail */}
          <aside style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* How it works */}
            <div className="laf-card">
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-2)' }}>
                How a claim works
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { n: 1, title: 'Submit proof', desc: 'Tell us why this is yours and provide any identifying marks or photos.', color: 'var(--brand-indigo-600)' },
                  { n: 2, title: 'Manager reviews', desc: 'A space manager will review your claim within 1–2 business days.', color: '#0891B2' },
                  { n: 3, title: 'Pickup approved', desc: 'If approved, you\'ll get instructions on how and where to collect the item.', color: '#059669' },
                ].map(step => (
                  <div key={step.n} style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: step.color, color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {step.n}
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 2 }}>{step.title}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.5 }}>{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust card */}
            <div style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', border: '1px solid #A7F3D0', borderRadius: 18, padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#065F46' }}>Your info stays private</h3>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#065F46', lineHeight: 1.55, opacity: 0.85 }}>
                Your contact details and proof statement are only visible to the space manager — never to other members or the public.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="laf-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M11 3a8 8 0 1 0 8 8" /><path d="m21 21-4.3-4.3" /></svg>
          <span>© 2026 Lost &amp; Found</span>
        </div>
        <div style={{ display: 'flex', gap: 18 }}>
          <a href="#" style={{ color: 'var(--fg-3)' }}>Help</a>
          <a href="#" style={{ color: 'var(--fg-3)' }}>Privacy</a>
          <a href="#" style={{ color: 'var(--fg-3)' }}>Terms</a>
        </div>
      </footer>
    </>
  );
}
