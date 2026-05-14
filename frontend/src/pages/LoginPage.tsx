import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginSchema, type LoginInput } from '@laf/shared';
import { useState } from 'react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setError('');
    try {
      await login(data);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    }
  }

  return (
    <>
      <div className="atmosphere" aria-hidden="true" />

      {/* Decorative floating toasts */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {[
          { top: '14%', left: '7%', delay: '0s', icon: '★', iconClass: 'match', label: '82% match found', sub: 'Atlas Works HQ · 14 min ago' },
          { top: '62%', left: '6%', delay: '1.4s', icon: '✓', iconClass: 'found', label: 'Black umbrella found', sub: 'Reception · 2h ago' },
          { top: '18%', right: '7%', delay: '2.6s', icon: '✓', iconClass: 'found', label: 'Wallet returned to owner', sub: 'Mercer Library · Yesterday' },
          { top: '70%', right: '6%', delay: '3.8s', icon: '★', iconClass: 'match', label: 'New match suggestion', sub: 'PeakFit · Mission · 1m ago' },
        ].map((t, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: t.top, left: (t as { left?: string }).left, right: (t as { right?: string }).right,
            background: 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(14px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.7)',
            borderRadius: 16,
            padding: '14px 16px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 13,
            animation: `laf-floaty 8s cubic-bezier(0.22,1,0.36,1) infinite`,
            animationDelay: t.delay,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: t.iconClass === 'match' ? 'linear-gradient(135deg,#06B6D4,#4F46E5)' : 'linear-gradient(135deg,#D1FAE5,#A7F3D0)',
              color: t.iconClass === 'match' ? '#fff' : '#065F46',
              fontSize: 16, fontWeight: 700,
            }}>
              {t.icon}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--fg-1)' }}>{t.label}</div>
              <div style={{ fontSize: 11.5, color: 'var(--fg-3)', marginTop: 2 }}>{t.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="laf-auth-wrap">
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div className="laf-auth-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 3a8 8 0 1 0 8 8" /><path d="m21 21-4.3-4.3" />
              </svg>
              Lost &amp; Found
            </div>

            <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.022em', color: 'var(--fg-1)' }}>Welcome back.</h1>
            <p style={{ margin: '0 0 26px', fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.55 }}>
              Sign in to your spaces and pick up where you left off.
            </p>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: 13, padding: '10px 14px', borderRadius: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="laf-field">
                <label className="laf-label" htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="alex@atlasworks.co" className="laf-input" {...register('email')} />
                {errors.email && <p style={{ marginTop: 6, fontSize: 12.5, color: 'var(--color-danger)' }}>{errors.email.message}</p>}
              </div>

              <div className="laf-field">
                <label className="laf-label" htmlFor="pw">Password</label>
                <input id="pw" type="password" placeholder="••••••••" className="laf-input" {...register('password')} />
                {errors.password && <p style={{ marginTop: 6, fontSize: 12.5, color: 'var(--color-danger)' }}>{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="laf-btn laf-btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px 16px', fontSize: 14 }}
              >
                {isSubmitting ? 'Signing in…' : 'Sign in'}
                {!isSubmitting && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                )}
              </button>
            </form>

            <div style={{ marginTop: 18, textAlign: 'center', fontSize: 13, color: 'var(--fg-2)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--brand-indigo-600)', fontWeight: 600 }}>Create one</Link>
            </div>
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 20, fontSize: 13.5, color: 'var(--fg-2)', textAlign: 'center', lineHeight: 1.55, maxWidth: 380, marginLeft: 'auto', marginRight: 'auto' }}>
            <div style={{ display: 'inline-flex', gap: 2, color: '#F59E0B', marginBottom: 8 }}>
              {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
            </div>
            <div>"Three of our front-desk binders just disappeared. Now we reunite stuff in hours, not weeks."</div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--fg-3)' }}>— Maya R., Atlas Works</div>
          </div>
        </div>
      </div>
    </>
  );
}
