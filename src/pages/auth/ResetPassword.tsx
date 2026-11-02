import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2Icon, Loader2Icon, ShieldAlertIcon } from 'lucide-react';
import { Turnstile } from '../../components/Turnstile';
import { AuthShell } from './AuthShell';
import { api } from '../../lib/accessControl';

const field =
'w-full rounded-xl border border-white/12 bg-navy-800/70 px-4 py-3 text-[14px] text-white placeholder:text-silver-dark/70 outline-none transition-colors focus:border-electric/70';

const primaryBtn =
'inline-flex w-full items-center justify-center gap-2 rounded-full bg-electric px-6 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-electric-soft disabled:opacity-70';

/**
 * Password reset when accounts live in the shared database: a reset LINK is emailed to the
 * account holder; opening it lets them choose a new password. Nothing sensitive is shown on screen.
 */
function EmailReset() {
  const [step, setStep] = useState<'request' | 'sent' | 'newpass' | 'done'>(
    () => api.recovery().active ? 'newpass' : 'request'
  );
  const [linkError, setLinkError] = useState(() => api.recovery().error ?? '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // The reset link is processed asynchronously after the page loads; pick it up when ready.
  useEffect(() => {
    if (step !== 'request') return;
    let tries = 0;
    const timer = window.setInterval(() => {
      const r = api.recovery();
      if (r.active) {
        setStep('newpass');
        window.clearInterval(timer);
      } else if (r.error) {
        setLinkError(r.error);
        window.clearInterval(timer);
      } else if (++tries > 15) {
        window.clearInterval(timer);
      }
    }, 300);
    return () => window.clearInterval(timer);
  }, [step]);

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.requestPasswordReset(email);
      setStep('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setBusy(false);
    }
  };

  const choose = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await api.completeRecovery(password);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle={step === 'newpass' ? 'Choose a new password for your account.' : 'We email you a secure link to choose a new password.'}
      footer={
      <>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-electric">
            Back to sign in
          </Link>
        </>
      }>
      
      {step === 'request' &&
      <form onSubmit={request} noValidate className="space-y-4">
          {linkError &&
        <p className="flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-[12.5px] text-red-300" role="alert">
              <ShieldAlertIcon size={14} className="mt-0.5 shrink-0" />
              {linkError}
            </p>
        }
          <div>
            <label htmlFor="rst-email" className="mb-2 block text-[12.5px] font-medium text-silver">
              Email address
            </label>
            <input id="rst-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={field} />
          </div>
          {error && <p className="text-[12.5px] text-red-300">{error}</p>}
          <button type="submit" disabled={busy} className={primaryBtn}>
            {busy && <Loader2Icon size={16} className="animate-spin" />}
            Email me a reset link
          </button>
        </form>
      }

      {step === 'sent' &&
      <div className="text-center" role="status">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-tech/30 bg-tech/10 text-tech">
            <CheckCircle2Icon size={22} />
          </span>
          <p className="mt-5 text-[13.5px] text-silver">
            If an account exists for <span className="font-medium text-white">{email}</span>,
            a reset link is on its way. It can take a minute — check your spam folder too.
          </p>
          <button type="button" onClick={() => setStep('request')} className="mt-6 text-[13px] font-semibold text-electric">
            Use a different email
          </button>
        </div>
      }

      {step === 'newpass' &&
      <form onSubmit={choose} noValidate className="space-y-4">
          <div>
            <label htmlFor="rst-new" className="mb-2 block text-[12.5px] font-medium text-silver">
              New password
            </label>
            <input id="rst-new" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className={field} />
          </div>
          <div>
            <label htmlFor="rst-confirm" className="mb-2 block text-[12.5px] font-medium text-silver">
              Confirm new password
            </label>
            <input id="rst-confirm" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} />
          </div>
          {error &&
        <p className="flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-[12.5px] text-red-300" role="alert">
              <ShieldAlertIcon size={14} className="mt-0.5 shrink-0" />
              {error}
            </p>
        }
          <button type="submit" disabled={busy} className={primaryBtn}>
            {busy && <Loader2Icon size={16} className="animate-spin" />}
            Save new password
          </button>
        </form>
      }

      {step === 'done' &&
      <div className="text-center" role="status">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-tech/30 bg-tech/10 text-tech">
            <CheckCircle2Icon size={22} />
          </span>
          <p className="mt-5 text-[13.5px] text-silver">
            Your password has been updated. It is saved to your account, so you can sign in
            with it from any device.
          </p>
          <button type="button" onClick={() => navigate('/login')} className={`mt-6 ${primaryBtn}`}>
            Go to sign in
          </button>
        </div>
      }
    </AuthShell>);

}

/** Browser-only demo flow, used only while the shared accounts database is not configured. */
function LocalReset() {
  const [step, setStep] = useState<'request' | 'confirm' | 'done'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [issued, setIssued] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      setIssued(await api.requestPasswordReset(email));
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.');
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.completePasswordReset(email, code, password);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We issue a one-time reset code, then you choose a new password."
      footer={
      <>
          Remembered it?{' '}
          <Link to="/login" className="font-semibold text-electric">
            Back to sign in
          </Link>
        </>
      }>
      
      {step === 'request' &&
      <form onSubmit={request} noValidate className="space-y-4">
          <div>
            <label htmlFor="rst-email" className="mb-2 block text-[12.5px] font-medium text-silver">
              Email address
            </label>
            <input
            id="rst-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={field} />
          
          </div>
          <Turnstile />
          {error &&
        <p className="text-[12.5px] text-red-300">{error}</p>
        }
          <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-electric px-6 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-electric-soft disabled:opacity-70">
          
            {busy && <Loader2Icon size={16} className="animate-spin" />}
            Send reset code
          </button>
        </form>
      }

      {step === 'confirm' &&
      <form onSubmit={confirm} noValidate className="space-y-4">
          <div className="rounded-xl border border-electric/25 bg-electric/10 p-4">
            <p className="text-[12.5px] text-silver">
              A reset code was issued for{' '}
              <span className="font-medium text-white">{email}</span>. In production
              it is emailed only to the account holder — shown here for the demo:
            </p>
            <p className="mt-2 font-mono text-[13px] font-semibold text-electric">
              {issued}
            </p>
          </div>
          <div>
            <label htmlFor="rst-code" className="mb-2 block text-[12.5px] font-medium text-silver">
              Reset code
            </label>
            <input id="rst-code" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="MTRST-XXXXXXXXXX" className={field} />
          </div>
          <div>
            <label htmlFor="rst-pass" className="mb-2 block text-[12.5px] font-medium text-silver">
              New password
            </label>
            <input id="rst-pass" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className={field} />
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-electric px-6 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-electric-soft disabled:opacity-70">
          
            {busy && <Loader2Icon size={16} className="animate-spin" />}
            Set new password
          </button>
        </form>
      }

      {step === 'done' &&
      <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-tech/30 bg-tech/10 text-tech">
            <CheckCircle2Icon size={22} />
          </span>
          <p className="mt-5 text-[13.5px] text-silver">
            Your password has been updated. You can now sign in.
          </p>
          <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-electric px-6 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-electric-soft">
          
            Go to sign in
          </button>
        </div>
      }
    </AuthShell>);

}

export function ResetPassword() {
  return api.isRemote() ? <EmailReset /> : <LocalReset />;
}
