import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CreditCardIcon, Loader2Icon, LockIcon, ShieldAlertIcon, SmartphoneIcon } from 'lucide-react';
import { PageShell } from '../components/store/PageShell';
import { api, formatKes } from '../lib/accessControl';
import { useCommerceSync } from '../lib/useCommerceSync';
import { useAuth } from '../contexts/AuthContext';

function Row({ label, value }: {label: string;value: string;}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 py-3 last:border-0">
      <span className="text-[12.5px] text-silver-dark">{label}</span>
      <span className="break-all text-right font-mono text-[13px] font-medium text-white">{value}</span>
    </div>);

}

export function Checkout() {
  const { slug = '' } = useParams();
  const { user } = useAuth();
  const tick = useCommerceSync();
  const product = useMemo(() => api.getProduct(slug), [slug, tick]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // If the customer comes back from Paystack with the back button, never leave the button stuck.
  useEffect(() => {
    const reset = () => setBusy(false);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  const pay = async () => {
    if (!product) return;
    setBusy(true);
    setError('');
    try {
      const { authorizationUrl } = await api.startPayment(product.id);
      window.location.assign(authorizationUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the payment.');
      setBusy(false);
    }
  };

  const unavailable = product?.status === 'disabled';

  return (
    <PageShell
      eyebrow="Secure checkout"
      title={
      <>
          Pay securely with <span className="text-electric">Paystack</span>
        </>
      }
      body="Review your order, then pay by card or M-Pesa on Paystack’s secure page. Your licence is issued and downloads unlock the moment Paystack confirms the payment.">
      
      {!product ?
      <p className="glass flex items-start gap-2 rounded-2xl p-5 text-[13px] text-red-300">
          <ShieldAlertIcon size={15} className="mt-0.5 shrink-0" />
          Product not found.
        </p> :

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-[15px] font-semibold text-white">Customer information</h2>
            <div className="mt-4">
              <Row label="Name" value={user?.name ?? '—'} />
              <Row label="Email" value={user?.email ?? '—'} />
              <Row label="Company" value={user?.company || '—'} />
              <Row label="Phone" value={user?.phone || '—'} />
            </div>
          </section>

          <div className="space-y-6">
            <section className="glass rounded-2xl p-6">
              <h2 className="font-display text-[15px] font-semibold text-white">Order summary</h2>
              <div className="mt-4 flex gap-4">
                <img
                src={product.image}
                alt={product.name}
                className="h-20 w-28 shrink-0 rounded-xl border border-white/10 object-cover" />
              
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-white">{product.name}</p>
                  <p className="mt-1 text-[12.5px] text-silver">{product.category}</p>
                </div>
              </div>
              <div className="mt-5">
                <Row label="Amount due" value={formatKes(product.price)} />
                <Row label="Currency" value="KES" />
              </div>
            </section>

            <section className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric/10 text-electric">
                  <CreditCardIcon size={18} />
                </span>
                <h2 className="font-display text-[15px] font-semibold text-white">Payment</h2>
              </div>
              <ul className="mt-4 flex flex-wrap gap-2 text-[12px] text-silver">
                <li className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5">
                  <CreditCardIcon size={13} /> Card
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5">
                  <SmartphoneIcon size={13} /> M-Pesa
                </li>
              </ul>

              {error && <p className="mt-4 text-[12.5px] text-red-300">{error}</p>}
              {unavailable &&
            <p className="mt-4 text-[12.5px] text-red-300">This product is not currently available.</p>
            }

              <button
              type="button"
              onClick={pay}
              disabled={busy || unavailable}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-electric px-6 py-3.5 text-sm font-semibold text-navy shadow-glow transition-colors hover:bg-electric-soft disabled:cursor-not-allowed disabled:opacity-60">
              
                {busy ? <Loader2Icon size={16} className="animate-spin" /> : <LockIcon size={15} />}
                {busy ? 'Opening Paystack…' : `Pay ${formatKes(product.price)} with Paystack`}
              </button>
              <p className="mt-4 flex items-start gap-2 text-[11.5px] leading-relaxed text-silver-dark">
                <ShieldAlertIcon size={13} className="mt-0.5 shrink-0" />
                You will be taken to Paystack to pay. MOTECH never sees or stores your card details. No
                protected files are released until Paystack confirms the payment.
              </p>
              <Link to="/portal/orders" className="mt-3 inline-block text-[12px] font-semibold text-electric">
                View payment history
              </Link>
            </section>
          </div>
        </div>
      }
    </PageShell>);

}
