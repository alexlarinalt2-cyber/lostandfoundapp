import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RegisterSchema, type RegisterInput } from '@laf/shared';
import { useState } from 'react';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setError('');
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (e: unknown) {
      setError((e as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Registration failed');
    }
  }

  return (
    <>
      <div className="atmosphere soft" aria-hidden="true" />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>

        {/* Left: branded poster */}
        <div style={{
          position: 'relative', padding: '48px 56px', display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(160deg, #312E81 0%, #4F46E5 55%, #06B6D4 110%)',
          color: '#fff', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(500px 280px at 80% 10%, rgba(255,255,255,0.18), transparent 60%), radial-gradient(400px 280px at -10% 80%, rgba(6,182,212,0.4), transparent 60%)',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 15, position: 'relative' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'brightness(0) invert(1)' }}>
              <path d="M11 3a8 8 0 1 0 8 8" /><path d="m21 21-4.3-4.3" />
            </svg>
            Lost &amp; Found
          </div>

          <div style={{ marginTop: 'auto', position: 'relative' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: 36, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Recover what matters.</h2>
            <p style={{ margin: 0, fontSize: 15.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.55, maxWidth: 440 }}>
              Join thousands of teams who turned their lost-property chaos into community accountability.
            </p>
            <div style={{ display: 'flex', gap: 32, marginTop: 32 }}>
              {[['18,400', 'ITEMS REUNITED'], ['94%', 'MATCH ACCURACY'], ['3.2 h', 'AVG TIME TO MATCH']].map(([v, k]) => (
                <div key={k}>
                  <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6, letterSpacing: '0.04em' }}>{k}</div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 32, background: 'rgba(255,255,255,0.14)',
              backdropFilter: 'blur(14px) saturate(180%)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 18, padding: 18, display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>★</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>"My laptop bag got matched within an hour."</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>— Jules T., Mercer Library member</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
          <div style={{ width: '100%', maxWidth: 420 }}>
            <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--fg-1)' }}>Create your account</h1>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.55 }}>Free for individuals. Spaces are invite-based.</p>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: 13, padding: '10px 14px', borderRadius: 12, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="laf-field">
                <label className="laf-label" htmlFor="name">Full name</label>
                <input id="name" type="text" placeholder="Alex Mendoza" className="laf-input" {...register('displayName')} />
                {errors.displayName && <p style={{ marginTop: 6, fontSize: 12.5, color: 'var(--color-danger)' }}>{errors.displayName.message}</p>}
              </div>

              <div className="laf-field">
                <label className="laf-label" htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="alex@atlasworks.co" className="laf-input" {...register('email')} />
                {errors.email && <p style={{ marginTop: 6, fontSize: 12.5, color: 'var(--color-danger)' }}>{errors.email.message}</p>}
              </div>

              <div className="laf-field">
                <label className="laf-label" htmlFor="pw">
                  Password <span className="hint">8+ characters</span>
                </label>
                <input id="pw" type="password" placeholder="••••••••••" className="laf-input" {...register('password')} />
                {errors.password && <p style={{ marginTop: 6, fontSize: 12.5, color: 'var(--color-danger)' }}>{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="laf-btn laf-btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px 16px', fontSize: 14, marginTop: 6 }}
              >
                {isSubmitting ? 'Creating account…' : 'Create account'}
                {!isSubmitting && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                )}
              </button>

              <p style={{ marginTop: 10, fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.55 }}>
                By creating an account you agree to our Terms and Privacy Policy.
              </p>
            </form>

            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--fg-2)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--brand-indigo-600)', fontWeight: 600 }}>Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
