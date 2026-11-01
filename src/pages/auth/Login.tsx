import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LockIcon, Loader2Icon, MailIcon, ShieldAlertIcon } from 'lucide-react';
import { AuthShell } from './AuthShell';
import { useAuth } from '../../contexts/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as {from?: string;} | null)?.from;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(email, password);
      navigate(from ?? (user.role === 'admin' ? '/admin' : '/portal/library'), {
        replace: true
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Sign in to your account"
      subtitle="Access your purchased products, licences and protected documentation."
      footer={
      <>
          Don’t have an account?{' '}
          <Link to="/register" className="font-semibold text-electric">
            Create one
          </Link>
        </>
      }>
      
      <form onSubmit={submit} noValidate className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-[12.5px] font-medium text-silver">
            Email address
          </label>
          <div className="relative">
            <MailIcon
              size={15}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-silver-dark" />
            
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="w-full rounded-xl border border-white/12 bg-navy-800/70 py-3 pl-10 pr-4 text-[14px] text-white placeholder:text-silver-dark/70 outline-none transition-colors focus:border-electric/70" />
            
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="text-[12.5px] font-medium text-silver">
              Password
            </label>
            <Link to="/reset-password" className="text-[11.5px] font-medium text-electric">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockIcon
              size={15}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-silver-dark" />
            
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/12 bg-navy-800/70 py-3 pl-10 pr-4 text-[14px] text-white placeholder:text-silver-dark/70 outline-none transition-colors focus:border-electric/70" />
            
          </div>
        </div>

        {error &&
        <p className="flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-[12.5px] text-red-300">
            <ShieldAlertIcon size={14} className="mt-0.5 shrink-0" />
            {error}
          </p>
        }

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-electric px-6 py-3.5 text-sm font-semibold text-navy shadow-glow transition-colors hover:bg-electric-soft disabled:opacity-70">
          
          {busy && <Loader2Icon size={16} className="animate-spin" />}
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </AuthShell>);

}