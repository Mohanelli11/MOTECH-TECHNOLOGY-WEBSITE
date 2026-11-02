import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheckIcon,
  ClockIcon,
  FolderLockIcon,
  PackageIcon,
  UsersIcon,
  WalletIcon } from
'lucide-react';
import { api, formatDateTime, formatKes } from '../../lib/accessControl';
import { OrderStatusBadge } from '../../components/store/StatusBadge';

export function AdminOverview() {
  const stats = useMemo(() => api.adminStats(), []);
  const [customerCount, setCustomerCount] = useState<number>(stats.customers);
  useEffect(() => {
    let cancelled = false;
    api.
    adminCustomerCount().
    then((n) => {
      if (!cancelled) setCustomerCount(n);
    }).
    catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  const recent = useMemo(() => api.adminOrders().slice(0, 6), []);

  const cards = [
  { label: 'Awaiting verification', value: String(stats.pending), icon: ClockIcon, accent: 'text-amber-300' },
  { label: 'Verified revenue', value: formatKes(stats.revenue), icon: WalletIcon, accent: 'text-tech' },
  { label: 'Active licences', value: String(stats.activeLicenses), icon: BadgeCheckIcon, accent: 'text-electric' },
  { label: 'Customers', value: String(customerCount), icon: UsersIcon, accent: 'text-silver' },
  { label: 'Products', value: String(stats.products), icon: PackageIcon, accent: 'text-silver' },
  { label: 'Protected files', value: String(stats.files), icon: FolderLockIcon, accent: 'text-silver' }];


  return (
    <div className="space-y-8">
      <section>
        <h2 className="sr-only">Key metrics</h2>
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ label, value, icon: Icon, accent }, i) =>
          <div
            key={label}
            className={`glass rounded-2xl p-6 ${i === 0 ? 'sm:col-span-2 xl:col-span-1' : ''}`}>
            
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[12.5px] text-silver">{label}</dt>
                <Icon size={17} className={accent} />
              </div>
              <dd className={`mt-3 font-display font-bold text-white ${i === 0 ? 'text-3xl' : 'text-2xl'}`}>
                {value}
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section className="glass overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-6">
          <h2 className="font-display text-[15px] font-semibold text-white">
            Latest orders
          </h2>
          <Link
            to="/admin/orders"
            className="text-[12.5px] font-semibold text-electric">
            
            Open verification queue
          </Link>
        </div>
        {recent.length === 0 ?
        <p className="p-6 text-[13px] text-silver">No orders yet.</p> :

        <ul className="divide-y divide-white/8">
            {recent.map((o) =>
          <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium text-white">{o.productName}</p>
                  <p className="mt-1 font-mono text-[11px] text-silver-dark">
                    {o.id} · {o.customer?.email ?? 'unknown'} · {formatDateTime(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[13px] font-semibold text-white">
                    {formatKes(o.amount)}
                  </span>
                  <OrderStatusBadge status={o.status} />
                </div>
              </li>
          )}
          </ul>
        }
      </section>
    </div>);

}