import React, { useMemo } from 'react';
import { useCommerceSync } from '../../lib/useCommerceSync';

import { Link } from 'react-router-dom';
import { BadgeCheckIcon } from 'lucide-react';
import { LicenseStatusBadge } from '../../components/store/StatusBadge';
import { api, formatDate } from '../../lib/accessControl';

export function Licenses() {
  const tick = useCommerceSync();
  const licenses = useMemo(() => api.myLicenses(), [tick]);
  const products = useMemo(() => api.listProducts(true), [tick]);

  if (licenses.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <h2 className="font-display text-lg font-semibold text-white">
          No licences issued yet
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[13.5px] text-silver">
          A MOTECH Product Licence ID is issued automatically once your Paystack payment
          is confirmed.
        </p>
        <Link
          to="/store"
          className="mt-6 inline-flex rounded-full bg-electric px-5 py-3 text-[13px] font-semibold text-navy">
          
          Browse the store
        </Link>
      </div>);

  }

  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {licenses.map((l) => {
        const product = products.find((p) => p.id === l.productId);
        return (
          <li key={l.id} className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tech/10 text-tech">
                <BadgeCheckIcon size={18} />
              </span>
              <LicenseStatusBadge status={l.status} />
            </div>
            <h2 className="mt-5 font-display text-[15px] font-semibold text-white">
              {product?.name ?? l.productId}
            </h2>
            <p className="mt-3 font-mono text-[13px] font-semibold tracking-wide text-electric">
              {l.id}
            </p>
            <dl className="mt-4 space-y-1.5 text-[12.5px] text-silver">
              <div className="flex justify-between gap-4">
                <dt className="text-silver-dark">Issued</dt>
                <dd>{formatDate(l.issuedAt)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-silver-dark">Order</dt>
                <dd className="font-mono text-[11.5px]">{l.orderId}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-silver-dark">Scope</dt>
                <dd>Single organisation</dd>
              </div>
            </dl>
          </li>);

      })}
    </ul>);

}