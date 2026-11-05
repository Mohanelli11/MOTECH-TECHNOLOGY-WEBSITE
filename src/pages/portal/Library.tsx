import React, { useMemo } from 'react';
import { useCommerceSync } from '../../lib/useCommerceSync';

import { Link } from 'react-router-dom';
import { ClockIcon, FileLock2Icon, LockIcon, StoreIcon } from 'lucide-react';
import { SecureDownload } from '../../components/store/SecureDownload';
import { OrderStatusBadge } from '../../components/store/StatusBadge';
import { api, formatDate } from '../../lib/accessControl';

export function Library() {
  const tick = useCommerceSync();
  const orders = useMemo(() => api.myOrders().filter((o) => !o.productId.startsWith('prj-')), [tick]);
  const licenses = useMemo(() => api.myLicenses(), [tick]);

  const items = orders.map((order) => {
    const product = api.
    listProducts(true).
    find((p) => p.id === order.productId);
    const license = licenses.find((l) => l.orderId === order.id);
    const unlocked = order.status === 'verified' && license?.status === 'active';
    return {
      order,
      product,
      license,
      unlocked,
      files: api.listProductFiles(order.productId)
    };
  });

  if (items.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-navy-700 text-electric">
          <FileLock2Icon size={20} />
        </span>
        <h2 className="mt-5 font-display text-lg font-semibold text-white">
          Your library is empty
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[13.5px] text-silver">
          Purchase a product or engineering package to receive a licence and access
          its protected documentation.
        </p>
        <Link
          to="/store"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-electric px-5 py-3 text-[13px] font-semibold text-navy transition-colors hover:bg-electric-soft">
          
          <StoreIcon size={15} />
          Browse the store
        </Link>
      </div>);

  }

  return (
    <ul className="space-y-5">
      {items.map(({ order, product, license, unlocked, files }) =>
      <li key={order.id} className="glass overflow-hidden rounded-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/8 p-6">
            <div className="flex min-w-0 gap-4">
              {product &&
            <img
              src={product.image}
              alt={product.name}
              className="h-16 w-24 shrink-0 rounded-xl border border-white/10 object-cover" />

            }
              <div className="min-w-0">
                <h2 className="font-display text-[15.5px] font-semibold text-white">
                  {order.productName}
                </h2>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-silver-dark">
                  {order.id} · ordered {formatDate(order.createdAt)}
                </p>
                {license &&
              <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/12 px-2.5 py-1 font-mono text-[10.5px] text-silver">
                    Licence {license.id}
                    <span className={license.status === 'active' ? 'text-tech' : 'text-red-300'}>
                      {license.status}
                    </span>
                  </p>
              }
              </div>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="p-6">
            {unlocked ?
          <ul className="divide-y divide-white/8">
                {files.map((f) =>
            <li
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
              
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-white">{f.title}</p>
                      <p className="mt-1 font-mono text-[10.5px] uppercase tracking-wider text-silver-dark">
                        {f.category} · {f.format} · {f.version} · {f.sizeLabel} ·
                        updated {formatDate(f.uploadedAt)}
                      </p>
                    </div>
                    <SecureDownload file={f} />
                  </li>
            )}
              </ul> :

          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-navy-800/60 p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-electric/10 text-electric">
                  {order.status === 'under_review' ?
              <ClockIcon size={18} /> :

              <LockIcon size={18} />
              }
                </span>
                <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-silver">
                  {order.status === 'under_review' &&
              'Your payment is being confirmed. Documentation unlocks as soon as Paystack reports it.'}
                  {order.status === 'awaiting_payment' &&
              'Payment not completed yet. Pay with Paystack to unlock the documentation.'}
                  {order.status === 'rejected' &&
              `This order was cancelled.${order.adminNote ? ` Note: ${order.adminNote}` : ''} Contact MOTECH to resolve it.`}
                  {order.status === 'verified' &&
              'Your licence for this product is currently deactivated. Contact MOTECH support.'}
                </p>
                {order.status === 'awaiting_payment' && product &&
            <Link
              to={`/checkout/${product.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-electric px-4 py-2.5 text-[12.5px] font-semibold text-navy transition-colors hover:bg-electric-soft">
              
                    Complete payment
                  </Link>
            }
              </div>
          }
          </div>
        </li>
      )}
    </ul>);

}