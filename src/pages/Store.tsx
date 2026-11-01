import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  FileLock2Icon,
  SearchIcon,
  ShoppingCartIcon } from
'lucide-react';
import { PageShell } from '../components/store/PageShell';
import { ProductStatusBadge } from '../components/store/StatusBadge';
import { api, formatKes } from '../lib/accessControl';
import { useAuth } from '../contexts/AuthContext';

export function Store() {
  const products = useMemo(() => api.listProducts(), []);
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const visible = products.filter((p) => {
    const matchCat = category === 'All' || p.category === category;
    const q = query.trim().toLowerCase();
    const matchQuery =
    !q ||
    p.name.toLowerCase().includes(q) ||
    p.summary.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  const purchase = (slug: string) => {
    navigate(user ? `/checkout/${slug}` : '/login', {
      state: user ? undefined : { from: `/checkout/${slug}` }
    });
  };

  return (
    <PageShell
      eyebrow="MOTECH Store"
      title={
      <>
          Products &amp; <span className="text-electric">engineering packages</span>
        </>
      }
      body="Order MOTECH hardware or licensed digital engineering packages. Protected documentation, firmware and design files unlock only after MOTECH verifies your bank payment."
      actions={
      <Link
        to="/portal/library"
        className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:border-tech/50 hover:text-tech">
        
          <FileLock2Icon size={15} />
          My Library
        </Link>
      }>
      
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Product categories" className="flex flex-wrap gap-2">
          {categories.map((c) =>
          <button
            key={c}
            role="tab"
            aria-selected={category === c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full border px-4 py-2 text-[12.5px] font-medium transition-colors ${
            category === c ?
            'border-electric/45 bg-electric/10 text-electric' :
            'border-white/12 text-silver hover:border-white/25 hover:text-white'}`
            }>
            
              {c}
            </button>
          )}
        </div>

        <div className="relative w-full lg:w-72">
          <label htmlFor="store-search" className="sr-only">
            Search products
          </label>
          <SearchIcon
            size={15}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-silver-dark" />
          
          <input
            id="store-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-full border border-white/12 bg-navy-800/70 py-2.5 pl-10 pr-4 text-[13px] text-white placeholder:text-silver-dark/70 outline-none transition-colors focus:border-electric/70" />
          
        </div>
      </div>

      {visible.length === 0 ?
      <div className="glass mt-10 rounded-2xl p-12 text-center">
          <p className="font-display text-lg font-semibold text-white">
            No products match that search
          </p>
          <p className="mt-2 text-[13.5px] text-silver">
            Try a different keyword or clear the category filter.
          </p>
        </div> :

      <ul className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((p, i) =>
        <motion.li
          key={p.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: i * 0.05 }}
          className="glass group flex flex-col overflow-hidden rounded-2xl transition-colors hover:border-electric/40">
          
              <div className="relative aspect-[16/10] overflow-hidden bg-navy-800">
                <img
              src={p.image}
              alt={`${p.name}`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy" />
            
                <span className="absolute left-3 top-3">
                  <ProductStatusBadge status={p.status} />
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-silver-dark">
                  {p.category}
                </p>
                <h2 className="mt-2 font-display text-[16.5px] font-semibold leading-snug text-white">
                  {p.name}
                </h2>
                <p className="mt-2.5 text-[13px] leading-relaxed text-silver">
                  {p.summary}
                </p>

                <ul className="mt-4 space-y-1.5">
                  {p.features.slice(0, 3).map((f) =>
              <li
                key={f}
                className="flex items-start gap-2 text-[12.5px] text-white/80">
                
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-tech" />
                      {f}
                    </li>
              )}
                </ul>

                <div className="mt-auto pt-6">
                  <p className="font-display text-xl font-bold text-white">
                    {formatKes(p.price)}
                    <span className="ml-1.5 font-sans text-[11px] font-medium text-silver-dark">
                      excl. VAT
                    </span>
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                  type="button"
                  onClick={() => purchase(p.slug)}
                  className="inline-flex items-center gap-2 rounded-full bg-electric px-4 py-2.5 text-[12.5px] font-semibold text-navy transition-colors hover:bg-electric-soft">
                  
                      <ShoppingCartIcon size={14} />
                      Purchase
                    </button>
                    <Link
                  to={`/store/${p.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-4 py-2.5 text-[12.5px] font-semibold text-silver transition-colors hover:border-white/30 hover:text-white">
                  
                      View Details
                      <ArrowRightIcon size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.li>
        )}
        </ul>
      }
    </PageShell>);

}