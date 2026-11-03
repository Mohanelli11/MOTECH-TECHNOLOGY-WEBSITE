import React, { useEffect, useMemo, useState } from 'react';
import { useCommerceSync } from '../../lib/useCommerceSync';
import {
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
{ label: 'Awaiting payment', value: 'awaiting_payment' },
{ label: 'Paid', value: 'verified' },
{ label: 'Revoked', value: 'rejected' }];


export function AdminOrders() {
  const tick = useCommerceSync();
  const [rows, setRows] = useState<Row[]>(() => api.adminOrders());
  useEffect(() => setRows(api.adminOrders()), [tick]);
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

  const revoke = async (id: string) => {
    setBusy(id);
    try {
      await api.adminSetOrderStatus(id, 'rejected', note[id] ?? '');
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
            { k: 'Paid on', v: o.status === 'verified' || o.reviewedAt ? formatDateTime(o.reviewedAt) : '—' },
            { k: 'Payment method', v: 'Paystack' },
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

              {o.adminNote &&
          <p className="mt-3 text-[12px] text-silver">
                  Admin note: <span className="text-white/90">{o.adminNote}</span>
                </p>
          }

              {o.status === 'verified' &&
          <div className="mt-5 flex flex-wrap items-center gap-3">
                <input
              aria-label={`Revocation note for ${o.id}`}
              value={note[o.id] ?? ''}
              onChange={(e) => setNote((n) => ({ ...n, [o.id]: e.target.value }))}
              placeholder="Reason (optional), e.g. refunded in Paystack"
              className="min-w-[220px] flex-1 rounded-full border border-white/12 bg-navy-800/70 px-4 py-2.5 text-[12.5px] text-white placeholder:text-silver-dark/70 outline-none focus:border-electric/70" />
            
                <button
              type="button"
              onClick={() => revoke(o.id)}
              disabled={busy === o.id}
              className="inline-flex items-center gap-2 rounded-full border border-red-400/35 bg-red-400/10 px-5 py-2.5 text-[12.5px] font-semibold text-red-300 transition-colors hover:bg-red-400/20 disabled:opacity-50">
              
                  {busy === o.id ? <Loader2Icon size={14} className="animate-spin" /> : <XCircleIcon size={14} />}
                  Revoke licence
                </button>
              </div>
          }
            </li>
        )}
        </ul>
      }
    </div>);

}