import React, { useState } from 'react';
import { CheckCircle2Icon, Loader2Icon, ShieldAlertIcon } from 'lucide-react';
import { api } from '../../lib/accessControl';
import { Turnstile } from '../../components/Turnstile';
import { useAuth } from '../../contexts/AuthContext';

const field =
'w-full rounded-xl border border-white/12 bg-navy-800/70 px-4 py-3 text-[14px] text-white placeholder:text-silver-dark/70 outline-none transition-colors focus:border-electric/70';

export function Profile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    company: user?.company ?? '',
    phone: user?.phone ?? ''
  });
  const [pw, setPw] = useState({ current: '', next: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState<'profile' | 'password' | null>(null);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    setBusy('profile');
    try {
      await api.updateProfile(form);
      refresh();
      setMsg('Profile updated.');
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Update failed.');
    } finally {
      setBusy(null);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    setBusy('password');
    try {
      await api.changePassword(pw.current, pw.next);
      setPw({ current: '', next: '' });
      setMsg('Password changed.');
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Update failed.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <form onSubmit={saveProfile} className="glass rounded-2xl p-6">
        <h2 className="font-display text-[15px] font-semibold text-white">
          Account details
        </h2>
        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="p-name" className="mb-2 block text-[12.5px] font-medium text-silver">
              Full name
            </label>
            <input
              id="p-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={field} />
            
          </div>
          <div>
            <label htmlFor="p-email" className="mb-2 block text-[12.5px] font-medium text-silver">
              Email (used for licences and receipts)
            </label>
            <input id="p-email" value={user?.email ?? ''} readOnly className={`${field} cursor-not-allowed opacity-60`} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-company" className="mb-2 block text-[12.5px] font-medium text-silver">
                Company
              </label>
              <input
                id="p-company"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                className={field} />
              
            </div>
            <div>
              <label htmlFor="p-phone" className="mb-2 block text-[12.5px] font-medium text-silver">
                Phone
              </label>
              <input
                id="p-phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={field} />
              
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={busy === 'profile'}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-electric px-5 py-3 text-[13px] font-semibold text-navy transition-colors hover:bg-electric-soft disabled:opacity-70">
          
          {busy === 'profile' && <Loader2Icon size={15} className="animate-spin" />}
          Save changes
        </button>
      </form>

      <form onSubmit={savePassword} className="glass rounded-2xl p-6">
        <h2 className="font-display text-[15px] font-semibold text-white">
          Password
        </h2>
        <p className="mt-2 text-[12.5px] text-silver">
          Your password protects licensed downloads — use a unique one.
        </p>
        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="p-cur" className="mb-2 block text-[12.5px] font-medium text-silver">
              Current password
            </label>
            <input
              id="p-cur"
              type="password"
              value={pw.current}
              onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              className={field} />
            
          </div>
          <div>
            <label htmlFor="p-new" className="mb-2 block text-[12.5px] font-medium text-silver">
              New password
            </label>
            <input
              id="p-new"
              type="password"
              value={pw.next}
              onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
              className={field} />
            
          </div>
          <Turnstile />
        </div>
        <button
          type="submit"
          disabled={busy === 'password'}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:border-electric/50 hover:text-electric disabled:opacity-70">
          
          {busy === 'password' && <Loader2Icon size={15} className="animate-spin" />}
          Change password
        </button>
      </form>

      <div aria-live="polite" className="lg:col-span-2">
        {msg &&
        <p className="inline-flex items-center gap-2 text-[12.5px] text-tech">
            <CheckCircle2Icon size={15} />
            {msg}
          </p>
        }
        {err &&
        <p className="inline-flex items-center gap-2 text-[12.5px] text-red-300">
            <ShieldAlertIcon size={15} />
            {err}
          </p>
        }
      </div>
    </div>);

}