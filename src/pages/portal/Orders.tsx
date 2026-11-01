import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { OrderStatusBadge } from '../../components/store/StatusBadge';
import { api, formatDateTime, formatKes } from '../../lib/accessControl';

export function Orders() {
  const orders = useMemo(() => api.myOrders(), []);

  if (orders.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <h2 className="font-display text-lg font-semibold text-white">
          No payment history yet
        </h2>
        <p className="mt-2 text-[13.5px] text-silver">
          Orders and their verification status appear here.
        </p>
        <Link
          to="/store"
          className="mt-6 inline-flex rounded-full bg-electric px-5 py-3 text-[13px] font-semibold text-navy">
          
          Browse the store
        </Link>
      </div>);

  }

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <caption className="sr-only">Your orders and payment history</caption>
          <thead>
            <tr className="border-b border-white/10 bg-navy-800/60">
              {['Order', 'Product', 'Amount', 'Reference', 'Created', 'Licence', 'Status'].map(
                (h) =>
                <th
                  key={h}
                  scope="col"
                  className="whitespace-nowrap px-5 py-3.5 font-mono text-[10px] uppercase tracking-[0.18em] text-silver-dark">
                  
                    {h}
                  </th>

              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {orders.map((o) =>
            <tr key={o.id} className="transition-colors hover:bg-white/[0.03]">
                <td className="whitespace-nowrap px-5 py-4 font-mono text-[12px] text-white">
                  {o.id}
                </td>
                <td className="px-5 py-4 text-[13px] text-white/90">{o.productName}</td>
                <td className="whitespace-nowrap px-5 py-4 text-[13px] font-semibold text-white">
                  {formatKes(o.amount)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono text-[12px] text-silver">
                  {o.reference}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-[12.5px] text-silver">
                  {formatDateTime(o.createdAt)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono text-[11.5px] text-silver">
                  {o.licenseId ?? '—'}
                </td>
                <td className="px-5 py-4">
                  <OrderStatusBadge status={o.status} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}