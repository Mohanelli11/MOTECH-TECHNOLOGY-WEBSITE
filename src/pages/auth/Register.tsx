import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2Icon, ShieldAlertIcon, CheckCircle2Icon } from 'lucide-react';
import { Turnstile } from '../../components/Turnstile';
import { AuthShell } from './AuthShell';
import { useAuth } from '../../contexts/AuthContext';

const field =
'w-full rounded-xl border border-white/12 bg-navy-800/70 px-4 py-3 text-[14px] text-white placeholder:text-silver-dark/70 outline-none transition-colors focus:border-electric/70';

export function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    password: '',
    confirm: ''
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as {from?: string;} | null)?.from;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
  setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      const created = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        company: form.company,
        phone: form.phone
      });
      if (!created) {
        // The project requires email confirmation: no session until the link is clicked.
        setConfirmEmail(form.email.trim());
        return;
      }
      navigate(from ?? '/portal/library', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create account.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create your MOTECH account"
      subtitle="One account for purchases, licences, payment history and protected downloads."
      footer={
      <>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-electric">
            Sign in
          </Link>
        </>
      }>
      
      {confirmEmail ?
      <div className="text-center" role="status">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-tech/30 bg-tech/10 text-tech">
            <CheckCircle2Icon size={22} />
          </span>
          <p className="mt-5 text-[13.5px] text-silver">
            Account created. We sent a confirmation link to{' '}
            <span className="font-medium text-white">{confirmEmail}</span>. Open it,
            then sign in with the password you just chose.
          </p>
          <Link
          to="/login"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-electric px-6 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-electric-soft">
          
            Go to sign in
          </Link>
        </div> :

      <form onSubmit={submit} noValidate className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-2 block text-[12.5px] font-medium text-silver">
            Full name
          </label>
          <input id="name" required value={form.name} onChange={set('name')} placeholder="Jane Mwangi" className={field} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="company" className="mb-2 block text-[12.5px] font-medium text-silver">
              Company
            </label>
            <input id="company" value={form.company} onChange={set('company')} placeholder="Acme Engineering" className={field} />
          </div>
          <div>
            <label htmlFor="phone" className="mb-2 block text-[12.5px] font-medium text-silver">
              Phone
            </label>
            <input id="phone" value={form.phone} onChange={set('phone')} placeholder="+254 7xx xxx xxx" className={field} />
          </div>
        </div>
        <div>
          <label htmlFor="reg-email" className="mb-2 block text-[12.5px] font-medium text-silver">
            Email address
          </label>
          <input id="reg-email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@company.com" className={field} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="reg-password" className="mb-2 block text-[12.5px] font-medium text-silver">
              Password
            </label>
            <input id="reg-password" type="password" required autoComplete="new-password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" className={field} />
          </div>
          <div>
            <label htmlFor="reg-confirm" className="mb-2 block text-[12.5px] font-medium text-silver">
              Confirm password
            </label>
            <input id="reg-confirm" type="password" required autoComplete="new-password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" className={field} />
          </div>
        </div>

        <Turnstile />

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
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      }
    </AuthShell>);

}