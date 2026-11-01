import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BanknoteIcon,
  CheckCircle2Icon,
  CopyIcon,
  FileUpIcon,
  Loader2Icon,
  ShieldAlertIcon,
  UploadCloudIcon } from
'lucide-react';
import { PageShell } from '../components/store/PageShell';
import { OrderStatusBadge } from '../components/store/StatusBadge';
import { api, formatKes } from '../lib/accessControl';
import { bankDetails } from '../data/catalog';
import { useAuth } from '../contexts/AuthContext';
import type { Order, StoreProduct } from '../types/store';

function Row({ label, value, copy }: {label: string;value: string;copy?: boolean;}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 py-3 last:border-0">
      <span className="text-[12.5px] text-silver-dark">{label}</span>
      <span className="flex items-center gap-2 font-mono text-[13px] font-medium text-white">
        {value}
        {copy &&
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          }}
          aria-label={`Copy ${label}`}
          className="text-silver-dark transition-colors hover:text-electric">
          
            {copied ? <CheckCircle2Icon size={14} className="text-tech" /> : <CopyIcon size={14} />}
          </button>
        }
      </span>
    </div>);

}

export function Checkout() {
  const { slug = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const created = useRef(false);
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [proofName, setProofName] = useState('');
  const [proofSize, setProofSize] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (created.current) return;
    created.current = true;
    const p = api.getProduct(slug);
    if (!p) {
      setError('Product not found.');
      return;
    }
    setProduct(p);
    api.
    createOrder(p.id).
    then(setOrder).
    catch((e) => setError(e instanceof Error ? e.message : 'Could not open order.'));
  }, [slug]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofName(file.name);
    setProofSize(`${Math.max(1, Math.round(file.size / 1024))} KB`);
  };

  const submitProof = async () => {
    if (!order || !proofName) return;
    setBusy(true);
    setError('');
    try {
      setOrder(
        await api.submitPaymentProof(order.id, {
          fileName: proofName,
          sizeLabel: proofSize,
          uploadedAt: new Date().toISOString(),
          note: note.trim()
        })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell
      eyebrow="Secure checkout"
      title={
      <>
          Complete your <span className="text-electric">bank payment</span>
        </>
      }
      body="Transfer the exact amount to the MOTECH account below, quoting your payment reference. Upload your confirmation and MOTECH will verify it — access and your licence are issued on verification."
      actions={order ? <OrderStatusBadge status={order.status} /> : undefined}>
      
      {error && !order &&
      <p className="glass flex items-start gap-2 rounded-2xl p-5 text-[13px] text-red-300">
          <ShieldAlertIcon size={15} className="mt-0.5 shrink-0" />
          {error}
        </p>
      }

      {!order && !error &&
      <p className="glass inline-flex items-center gap-2 rounded-2xl p-5 text-[13px] text-silver">
          <Loader2Icon size={15} className="animate-spin text-electric" />
          Generating your order and payment reference…
        </p>
      }

      {order && product &&
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="space-y-6">
            <section className="glass rounded-2xl p-6">
              <h2 className="font-display text-[15px] font-semibold text-white">
                Customer information
              </h2>
              <div className="mt-4">
                <Row label="Name" value={user?.name ?? '—'} />
                <Row label="Email" value={user?.email ?? '—'} />
                <Row label="Company" value={user?.company || '—'} />
                <Row label="Phone" value={user?.phone || '—'} />
              </div>
            </section>

            <section className="glass rounded-2xl p-6">
              <h2 className="font-display text-[15px] font-semibold text-white">
                Order summary
              </h2>
              <div className="mt-4 flex gap-4">
                <img
                src={product.image}
                alt={product.name}
                className="h-20 w-28 shrink-0 rounded-xl border border-white/10 object-cover" />
              
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-white">{product.name}</p>
                  <p className="mt-1 text-[12.5px] text-silver">{product.category}</p>
                  <p className="mt-2 font-display text-lg font-bold text-white">
                    {formatKes(order.amount)}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <Row label="Order number" value={order.id} copy />
                <Row label="Payment reference" value={order.reference} copy />
                <Row label="Amount due" value={formatKes(order.amount)} />
                <Row label="Currency" value="KES" />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric/10 text-electric">
                  <BanknoteIcon size={18} />
                </span>
                <h2 className="font-display text-[15px] font-semibold text-white">
                  Bank payment details
                </h2>
              </div>
              <div className="mt-5">
                <Row label="Bank" value={bankDetails.bank} />
                <Row label="Account name" value={bankDetails.accountName} />
                <Row label="Account number" value={bankDetails.accountNumber} copy />
                <Row label="Currency" value={bankDetails.currency} />
                <Row label="Reference" value={order.reference} copy />
              </div>
              <ol className="mt-5 space-y-2.5 rounded-xl border border-white/10 bg-navy-800/60 p-4 text-[12.5px] leading-relaxed text-silver">
                <li>1. Transfer {formatKes(order.amount)} to the account above.</li>
                <li>2. Quote reference <span className="font-mono text-white">{order.reference}</span> in the transfer narrative.</li>
                <li>3. Upload your bank confirmation / deposit slip below.</li>
                <li>4. MOTECH verifies the payment and issues your licence and download access.</li>
              </ol>
            </section>

            <section className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tech/10 text-tech">
                  <UploadCloudIcon size={18} />
                </span>
                <h2 className="font-display text-[15px] font-semibold text-white">
                  Payment confirmation
                </h2>
              </div>

              {order.status === 'awaiting_payment' ?
            <div className="mt-5 space-y-4">
                  <label
                htmlFor="proof"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-navy-800/50 px-6 py-8 text-center transition-colors hover:border-electric/50">
                
                    <FileUpIcon size={20} className="text-electric" />
                    <span className="text-[13px] font-medium text-white">
                      {proofName || 'Upload deposit slip or transfer confirmation'}
                    </span>
                    <span className="text-[11.5px] text-silver-dark">
                      PDF, PNG or JPG {proofSize && `· ${proofSize}`}
                    </span>
                    <input
                  id="proof"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={onFile}
                  className="sr-only" />
                
                  </label>

                  <div>
                    <label htmlFor="pnote" className="mb-2 block text-[12.5px] font-medium text-silver">
                      Note for the verification team (optional)
                    </label>
                    <textarea
                  id="pnote"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Transfer made from Equity ending 4412 on 17 Aug…"
                  className="w-full resize-y rounded-xl border border-white/12 bg-navy-800/70 px-4 py-3 text-[13.5px] text-white placeholder:text-silver-dark/70 outline-none transition-colors focus:border-electric/70" />
                
                  </div>

                  {error && <p className="text-[12.5px] text-red-300">{error}</p>}

                  <button
                type="button"
                onClick={submitProof}
                disabled={!proofName || busy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-electric px-6 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-electric-soft disabled:cursor-not-allowed disabled:opacity-60">
                
                    {busy && <Loader2Icon size={16} className="animate-spin" />}
                    Submit for verification
                  </button>
                </div> :

            <div className="mt-5 rounded-xl border border-white/10 bg-navy-800/60 p-5">
                  <p className="flex items-start gap-2 text-[13px] text-silver">
                    <CheckCircle2Icon size={15} className="mt-0.5 shrink-0 text-tech" />
                    {order.status === 'verified' ?
                'Payment verified. Your licence has been issued and downloads are unlocked.' :
                'Your confirmation is with the MOTECH verification team. You’ll see the licence in My Library once approved.'}
                  </p>
                  {order.proof &&
              <p className="mt-3 font-mono text-[11.5px] text-silver-dark">
                      {order.proof.fileName} · {order.proof.sizeLabel}
                    </p>
              }
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                  to="/portal/orders"
                  className="inline-flex items-center gap-2 rounded-full bg-electric px-5 py-2.5 text-[12.5px] font-semibold text-navy transition-colors hover:bg-electric-soft">
                  
                      View payment history
                    </Link>
                    <button
                  type="button"
                  onClick={() => navigate('/store')}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-2.5 text-[12.5px] font-semibold text-silver transition-colors hover:border-white/30 hover:text-white">
                  
                      Continue browsing
                    </button>
                  </div>
                </div>
            }
            </section>

            <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-silver-dark">
              <ShieldAlertIcon size={13} className="mt-0.5 shrink-0" />
              No protected files are released at checkout. Download links are issued
              only after MOTECH confirms the payment against this reference.
            </p>
          </div>
        </div>
      }
    </PageShell>);

}