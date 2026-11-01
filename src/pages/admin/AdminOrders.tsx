import React, { useMemo, useState } from 'react';
import {
  CheckCircle2Icon,
  FileTextIcon,
  Loader2Icon,
  SearchIcon,
  XCircleIcon } from
'lucide-react';
import { OrderStatusBadge } from '../../components/store/StatusBadge';
import { api, formatDateTime, formatKes } from '../../lib/accessControl';
import type { Order, OrderStatus, User } from '../../types/store';

type Row = Order & {customer: User | null;};

const filters: Array<{label: string;value: 'all' | OrderStatus;}> = [
{ label: 'All', value: 'all' },
{ label: 'Under review', value: 'under_review' },
{ label: 'Awaiting payment', value: 'awaiting_payment' },
{ label: 'Verified', value: 'verified' },
{ label: 'Rejected', value: 'rejected' }];


export function AdminOrders() {
  const [rows, setRows] = useState<Row[]>(() => api.adminOrders());
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState('');
  const [note, setNote] = useState<Record<string, string>>({});

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchFilter = filter === 'all' || r.status === filter;
      const matchQuery =
      !q ||
      [r.id, r.reference, r.productName, r.customer?.name, r.customer?.email].
      filter(Boolean).
      some((v) => String(v).toLowerCase().includes(q));
      return matchFilter && matchQuery;
    });
  }, [rows, filter, query]);

  const setStatus = async (id: string, status: 'verified' | 'rejected') => {
    setBusy(id);
    try {
      await api.adminSetOrderStatus(id, status, note[id] ?? '');
      setRows(api.adminOrders());
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) =>
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full border px-4 py-2 text-[12.5px] font-medium transition-colors ${
            filter === f.value ?
            'border-electric/45 bg-electric/10 text-electric' :
            'border-white/12 text-silver hover:border-white/30 hover:text-white'}`
            }>
            
              {f.label}
            </button>
          )}
        </div>
        <div className="relative w-full lg:w-80">
          <label htmlFor="order-search" className="sr-only">
            Search orders
          </label>
          <SearchIcon
            size={15}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-silver-dark" />
          
          <input
            id="order-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Order ID, reference, customer…"
            className="w-full rounded-full border border-white/12 bg-navy-800/70 py-2.5 pl-10 pr-4 text-[13px] text-white placeholder:text-silver-dark/70 outline-none focus:border-electric/70" />
          
        </div>
      </div>

      {visible.length === 0 ?
      <p className="glass rounded-2xl p-10 text-center text-[13.5px] text-silver">
          No orders match this view.
        </p> :

      <ul className="space-y-4">
          {visible.map((o) =>
        <li key={o.id} className="glass rounded-2xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display text-[15px] font-semibold text-white">
                    {o.productName}
                  </p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-silver-dark">
                    {o.id} · {formatDateTime(o.createdAt)}
                  </p>
                </div>
                <OrderStatusBadge status={o.status} />
              </div>

              <dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
            { k: 'Customer', v: o.customer?.name ?? '—' },
            { k: 'Email', v: o.customer?.email ?? '—' },
            { k: 'Amount', v: formatKes(o.amount) },
            { k: 'Payment reference', v: o.reference },
            { k: 'Payment date', v: o.proof ? formatDateTime(o.proof.uploadedAt) : '—' },
            { k: 'Reviewed', v: formatDateTime(o.reviewedAt) },
            { k: 'Licence', v: o.licenseId ?? '—' },
            { k: 'Company', v: o.customer?.company || '—' }].
            map((cell) =>
            <div key={cell.k}>
                    <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-silver-dark">
                      {cell.k}
                    </dt>
                    <dd className="mt-1 break-words text-[12.5px] text-white/90">{cell.v}</dd>
                  </div>
            )}
              </dl>

              <div className="mt-5 rounded-xl border border-white/10 bg-navy-800/60 p-4">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-silver-dark">
                  Uploaded payment proof
                </p>
                {o.proof ?
            <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-3 py-1.5 text-[12.5px] text-white">
                      <FileTextIcon size={14} className="text-electric" />
                      {o.proof.fileName}
                      <span className="text-silver-dark">{o.proof.sizeLabel}</span>
                    </span>
                    {o.proof.note &&
              <span className="text-[12.5px] text-silver">“{o.proof.note}”</span>
              }
                  </div> :

            <p className="mt-2 text-[12.5px] text-silver">
                    No proof uploaded yet.
                  </p>
            }
              </div>

              {o.adminNote &&
          <p className="mt-3 text-[12px] text-silver">
                  Admin note: <span className="text-white/90">{o.adminNote}</span>
                </p>
          }

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <input
              aria-label={`Verification note for ${o.id}`}
              value={note[o.id] ?? ''}
              onChange={(e) => setNote((n) => ({ ...n, [o.id]: e.target.value }))}
              placeholder="Verification note (optional)"
              className="min-w-[220px] flex-1 rounded-full border border-white/12 bg-navy-800/70 px-4 py-2.5 text-[12.5px] text-white placeholder:text-silver-dark/70 outline-none focus:border-electric/70" />
            
                <button
              type="button"
              onClick={() => setStatus(o.id, 'verified')}
              disabled={busy === o.id || o.status === 'verified'}
              className="inline-flex items-center gap-2 rounded-full bg-tech px-5 py-2.5 text-[12.5px] font-semibold text-navy transition-colors hover:bg-tech-soft disabled:opacity-50">
              
                  {busy === o.id ?
              <Loader2Icon size={14} className="animate-spin" /> :

              <CheckCircle2Icon size={14} />
              }
                  Approve payment
                </button>
                <button
              type="button"
              onClick={() => setStatus(o.id, 'rejected')}
              disabled={busy === o.id || o.status === 'rejected'}
              className="inline-flex items-center gap-2 rounded-full border border-red-400/35 bg-red-400/10 px-5 py-2.5 text-[12.5px] font-semibold text-red-300 transition-colors hover:bg-red-400/20 disabled:opacity-50">
              
                  <XCircleIcon size={14} />
                  Reject
                </button>
              </div>
            </li>
        )}
        </ul>
      }
    </div>);

}