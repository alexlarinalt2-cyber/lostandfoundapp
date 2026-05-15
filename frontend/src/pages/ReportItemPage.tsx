import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateItemSchema, type CreateItemInput } from '@laf/shared';
import { createItem } from '../api/items.api';
import { useState } from 'react';

const CATEGORIES = [
  { id: 'bags',        label: 'Bag',         icon: <><path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M8 6V4a4 4 0 0 1 8 0v2"/></> },
  { id: 'electronics', label: 'Electronics', icon: <><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M12 18h.01"/></> },
  { id: 'keys',        label: 'Keys',        icon: <><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></> },
  { id: 'eyewear',     label: 'Eyewear',     icon: <><circle cx="6" cy="14" r="3"/><circle cx="18" cy="14" r="3"/><path d="M9 14 12 6l3 8"/></> },
  { id: 'wallet',      label: 'Wallet',      icon: <><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/></> },
  { id: 'clothing',    label: 'Clothing',    icon: <><path d="M6 3v6a6 6 0 0 0 12 0V3"/><path d="M4 21h16"/><path d="M12 15v6"/></> },
  { id: 'books',       label: 'Books',       icon: <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/> },
  { id: 'other',       label: 'Other',       icon: <circle cx="12" cy="12" r="9" /> },
];

export default function ReportItemPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('bags');
  const [selectedType, setSelectedType] = useState<'lost' | 'found'>('lost');

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<CreateItemInput>({
    resolver: zodResolver(CreateItemSchema),
    defaultValues: { type: 'lost', category: 'bags' },
  });

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 3);
    setPhotos(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
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

  function selectType(t: 'lost' | 'found') {
    setSelectedType(t);
    setValue('type', t);
  }

  function selectCategory(c: string) {
    setSelectedCategory(c);
    setValue('category', c as CreateItemInput['category']);
  }

  return (
    <>
      <div className="atmosphere soft" aria-hidden="true" />

      {/* Nav */}
      <nav className="laf-nav">
        <div className="laf-nav-inner">
          <Link to={`/spaces/${spaceId}`} className="laf-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-indigo-600)' }}>
              <path d="M11 3a8 8 0 1 0 8 8" /><path d="m21 21-4.3-4.3" />
            </svg>
            Lost &amp; Found
          </Link>

          <div className="laf-crumb">
            <Link to="/dashboard">Dashboard</Link>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sep"><path d="m9 18 6-6-6-6"/></svg>
            <Link to={`/spaces/${spaceId}`}>Space</Link>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sep"><path d="m9 18 6-6-6-6"/></svg>
            <span className="here">
              <span className="ic"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg></span>
              Report an item
            </span>
          </div>

          <div className="laf-nav-right">
            <Link to={`/spaces/${spaceId}`} className="laf-btn laf-btn-ghost laf-btn-sm" style={{ textDecoration: 'none' }}>Cancel</Link>
          </div>
        </div>
      </nav>

      <main className="laf-shell narrow">
        <header style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--brand-indigo-600)', marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            NEW REPORT
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.12, color: 'var(--fg-1)' }}>Tell us what happened.</h1>
          <p style={{ margin: 0, fontSize: 14.5, color: 'var(--fg-2)', lineHeight: 1.55, maxWidth: 580 }}>The more detail you add, the better the matches we can surface. You can edit this report any time.</p>
        </header>

        {/* Step rail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          {['Details', 'Photos', 'Review'].map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && <div style={{ flex: 1, height: 1.5, background: 'var(--border-1)', borderRadius: 99, width: 40 }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: i === 0 ? 'var(--fg-1)' : 'var(--fg-3)' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', border: i === 0 ? 'none' : '1.5px solid var(--border-1)', background: i === 0 ? 'var(--brand-indigo-600)' : '#fff', color: i === 0 ? '#fff' : 'var(--fg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, boxShadow: i === 0 ? '0 4px 12px -4px rgba(79,70,229,0.45)' : undefined }}>
                  {i + 1}
                </div>
                {step}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 32, alignItems: 'start' }}>
          {/* Form */}
          <form className="laf-card" onSubmit={handleSubmit(onSubmit as SubmitHandler<CreateItemInput>)}>
            <input type="hidden" {...register('type')} />
            <input type="hidden" {...register('category')} />

            {/* Type toggle */}
            <div className="laf-field">
              <label className="laf-label">I'm reporting an item that's…</label>
              <div className="laf-seg" style={{ width: '100%' }}>
                <button type="button" className={selectedType === 'lost' ? 'on' : ''} onClick={() => selectType('lost')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                  Lost (I lost it)
                </button>
                <button type="button" className={selectedType === 'found' ? 'on' : ''} onClick={() => selectType('found')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  Found (I found it)
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="laf-field">
              <label className="laf-label" htmlFor="title">What is it? <span className="hint">A short, descriptive title</span></label>
              <input id="title" type="text" placeholder="e.g. Black umbrella" className="laf-input" {...register('title')} />
              {errors.title && <p style={{ marginTop: 6, fontSize: 12.5, color: 'var(--color-danger)' }}>{errors.title.message}</p>}
            </div>

            {/* Category grid */}
            <div className="laf-field">
              <label className="laf-label">Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {CATEGORIES.map(cat => {
                  const isOn = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => selectCategory(cat.id)}
                      style={{
                        background: isOn ? 'var(--brand-indigo-50)' : '#fff',
                        border: isOn ? '1.5px solid var(--brand-indigo-600)' : '1px solid var(--border-subtle)',
                        borderRadius: 11, padding: '12px 10px', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        transition: 'all 140ms cubic-bezier(0.22,1,0.36,1)',
                      }}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: isOn ? 'var(--brand-indigo-600)' : 'var(--slate-100)', color: isOn ? '#fff' : 'var(--fg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">{cat.icon}</svg>
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: isOn ? 'var(--brand-indigo-700)' : 'var(--fg-2)' }}>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="laf-field">
              <label className="laf-label" htmlFor="desc">Description <span className="hint">Optional but recommended</span></label>
              <textarea id="desc" className="laf-textarea" placeholder="Any details that might help identify it…" {...register('description')} />
            </div>

            {/* Location */}
            <div className="laf-field">
              <label className="laf-label" htmlFor="loc">Last seen / found at</label>
              <input id="loc" type="text" placeholder="e.g. Near reception, floor 1" className="laf-input" {...register('locationLabel')} />
            </div>

            {/* Photos */}
            <div className="laf-field">
              <label className="laf-label">Photos <span className="hint">Up to 3 · JPEG / PNG / WebP</span></label>
              <label className="laf-dropzone" style={{ cursor: 'pointer' }}>
                <div className="ic">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z"/>
                    <circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>
                  </svg>
                </div>
                <div><strong style={{ color: 'var(--fg-1)', fontWeight: 600 }}>Drop a photo here</strong> or click to choose</div>
                <div style={{ fontSize: 11.5 }}>PNG, JPG up to 8 MB each</div>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>
              {previews.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  {previews.map((src, i) => (
                    <div key={i} style={{ width: 62, height: 62, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-subtle)', position: 'relative' }}>
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => { const p = previews.filter((_, j) => j !== i); setPreviews(p); setPhotos(photos.filter((_, j) => j !== i)); }} style={{ position: 'absolute', top: -5, right: -5, width: 18, height: 18, borderRadius: '50%', background: '#fff', border: '1px solid var(--border-subtle)', color: 'var(--fg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-xs)', fontSize: 12 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {submitError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: 13, padding: '10px 14px', borderRadius: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                {submitError}
              </div>
            )}

            {/* Submit */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 12, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                Your name will appear on this report.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link to={`/spaces/${spaceId}`} className="laf-btn laf-btn-ghost" style={{ textDecoration: 'none' }}>Cancel</Link>
                <button type="submit" disabled={isSubmitting} className="laf-btn laf-btn-primary">
                  {isSubmitting ? 'Submitting…' : 'Submit report'}
                  {!isSubmitting && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Live preview */}
          <aside style={{ position: 'sticky', top: 96, background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 18, boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <div style={{ aspectRatio: '5/4', background: selectedType === 'lost' ? 'radial-gradient(circle at 30% 30%, #FEE2E2 0%, #FCA5A5 95%)' : 'radial-gradient(circle at 30% 30%, #D1FAE5 0%, #6EE7B7 95%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {previews[0] ? (
                <img src={previews[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(15,23,42,0.45)' }}>
                  {CATEGORIES.find(c => c.id === selectedCategory)?.icon ?? <circle cx="12" cy="12" r="9" />}
                </svg>
              )}
            </div>
            <div style={{ padding: '16px 18px 18px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--brand-indigo-700)', background: 'var(--brand-indigo-50)', padding: '4px 9px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                Live preview
              </span>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <span className={`laf-pill ${selectedType === 'lost' ? 'laf-pill-lost' : 'laf-pill-found'}`}>{selectedType}</span>
                <span className="laf-pill laf-pill-neutral">{selectedCategory}</span>
              </div>
              <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: 'var(--fg-1)' }}>Your report title will appear here</p>
              <p style={{ margin: 0, fontSize: 12.5, color: 'var(--fg-3)', lineHeight: 1.5 }}>Location will appear here</p>
            </div>
            <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(248,250,252,0.6)', fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-indigo-600)', flexShrink: 0, marginTop: 1 }}>
                <path d="m12 3 2.6 5.3 5.9.9-4.3 4.2 1 5.8L12 16.5l-5.2 2.7 1-5.8L3.5 9.2l5.9-.9Z"/>
              </svg>
              We'll scan the last 30 days of found items in this space and notify you of any likely matches.
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
