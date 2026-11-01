import React, { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckIcon,
  FileLock2Icon,
  LockIcon,
  ShoppingCartIcon } from
'lucide-react';
import { PageShell } from '../components/store/PageShell';
import { ProductStatusBadge } from '../components/store/StatusBadge';
import { api, formatKes } from '../lib/accessControl';
import { useAuth } from '../contexts/AuthContext';
import type { SpecRow } from '../types/store';

function SpecTable({ title, rows }: {title: string;rows: SpecRow[];}) {
  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-display text-[15px] font-semibold text-white">{title}</h3>
      <dl className="mt-4 divide-y divide-white/8">
        {rows.map((r) =>
        <div key={r.label} className="flex flex-wrap gap-x-6 gap-y-1 py-2.5">
            <dt className="w-44 shrink-0 text-[12.5px] text-silver-dark">
              {r.label}
            </dt>
            <dd className="flex-1 text-[13px] text-white/90">{r.value}</dd>
          </div>
        )}
      </dl>
    </div>);

}

export function ProductDetail() {
  const { slug = '' } = useParams();
  const product = useMemo(() => api.getProduct(slug), [slug]);
  const files = useMemo(
    () => product ? api.listProductFiles(product.id) : [],
    [product]
  );
  const navigate = useNavigate();
  const { user } = useAuth();
  const owns = product ? api.hasAccess(product.id) : false;

  if (!product) {
    return (
      <PageShell eyebrow="MOTECH Store" title="Product not found">
        <Link
          to="/store"
          className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-electric">
          
          <ArrowLeftIcon size={15} /> Back to the store
        </Link>
      </PageShell>);

  }

  const purchase = () =>
  navigate(user ? `/checkout/${product.slug}` : '/login', {
    state: user ? undefined : { from: `/checkout/${product.slug}` }
  });

  return (
    <PageShell
      eyebrow={product.category}
      title={product.name}
      body={product.summary}
      actions={
      <div className="flex flex-col items-start gap-3 sm:items-end">
          <ProductStatusBadge status={product.status} />
          <p className="font-display text-2xl font-bold text-white">
            {formatKes(product.price)}
          </p>
          <button
          type="button"
          onClick={purchase}
          className="inline-flex items-center gap-2 rounded-full bg-electric px-6 py-3 text-[13px] font-semibold text-navy shadow-glow transition-colors hover:bg-electric-soft">
          
            <ShoppingCartIcon size={15} />
            Purchase this product
          </button>
        </div>
      }>
      
      <Link
        to="/store"
        className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-silver transition-colors hover:text-white">
        
        <ArrowLeftIcon size={14} /> All products
      </Link>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-start">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-navy-800">
            <img
              src={product.image}
              alt={product.name}
              className="aspect-[16/10] w-full object-cover" />
            
          </div>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-lg font-semibold text-white">
              Product overview
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-silver">
              {product.description}
            </p>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-lg font-semibold text-white">
              System architecture overview
            </h2>
            <ol className="mt-4 space-y-4">
              {product.architecture.map((step, i) =>
              <li key={step} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-electric/30 bg-electric/10 font-mono text-[11px] font-semibold text-electric">
                    {i + 1}
                  </span>
                  <p className="text-[13.5px] leading-relaxed text-silver">{step}</p>
                </li>
              )}
            </ol>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <SpecTable title="Technical specifications" rows={product.specs} />
            <SpecTable title="Hardware specifications" rows={product.hardware} />
          </div>
          <SpecTable title="Software specifications" rows={product.software} />
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-[15px] font-semibold text-white">
              Features
            </h2>
            <ul className="mt-4 space-y-2">
              {product.features.map((f) =>
              <li key={f} className="flex items-start gap-2 text-[13px] text-white/85">
                  <CheckIcon size={14} className="mt-0.5 shrink-0 text-tech" />
                  {f}
                </li>
              )}
            </ul>
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-[15px] font-semibold text-white">
              Applications
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {product.applications.map((a) =>
              <li
                key={a}
                className="rounded-full border border-electric/25 bg-electric/10 px-3 py-1 text-[12px] font-medium text-electric-soft">
                
                  {a}
                </li>
              )}
            </ul>
          </section>

          <section className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-[15px] font-semibold text-white">
                Available documentation
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-silver-dark">
                <LockIcon size={11} /> Protected
              </span>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-silver">
              {files.length} licensed resource{files.length === 1 ? '' : 's'} are
              included. Titles are listed for reference — files are released only
              after payment verification.
            </p>
            <ul className="mt-4 divide-y divide-white/8">
              {files.map((f) =>
              <li key={f.id} className="flex items-start gap-3 py-3">
                  <FileLock2Icon size={15} className="mt-0.5 shrink-0 text-silver-dark" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-white/90">
                      {f.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-wider text-silver-dark">
                      {f.category} · {f.format} · {f.version}
                    </p>
                  </div>
                </li>
              )}
            </ul>

            {owns ?
            <Link
              to="/portal/library"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-tech px-5 py-3 text-[13px] font-semibold text-navy transition-colors hover:bg-tech-soft">
              
                Access in My Library
              </Link> :

            <p className="mt-5 flex items-start gap-2 rounded-xl border border-white/10 bg-navy-800/60 p-4 text-[12.5px] text-silver">
                <LockIcon size={14} className="mt-0.5 shrink-0 text-electric" />
                Purchase and payment verification are required before any download
                link is issued.
              </p>
            }
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-[15px] font-semibold text-white">
              Pricing
            </h2>
            <p className="mt-3 font-display text-2xl font-bold text-white">
              {formatKes(product.price)}
            </p>
            <p className="mt-1 text-[12px] text-silver-dark">
              Payable by bank transfer to I&amp;M Bank Kenya Ltd · excl. VAT
            </p>
            <button
              type="button"
              onClick={purchase}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-electric px-5 py-3 text-[13px] font-semibold text-navy transition-colors hover:bg-electric-soft">
              
              <ShoppingCartIcon size={15} />
              Purchase
            </button>
          </section>
        </div>
      </div>
    </PageShell>);

}