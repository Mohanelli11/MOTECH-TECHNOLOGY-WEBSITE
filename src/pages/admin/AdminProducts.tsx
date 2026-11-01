import React, { useState } from 'react';
import {
  ImageIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon } from
'lucide-react';
import { ProductStatusBadge } from '../../components/store/StatusBadge';
import { api, formatKes } from '../../lib/accessControl';
import type { ProductStatus, StoreProduct } from '../../types/store';

const field =
'w-full rounded-xl border border-white/12 bg-navy-800/70 px-4 py-2.5 text-[13px] text-white placeholder:text-silver-dark/70 outline-none focus:border-electric/70';

const blank = (): StoreProduct => ({
  id: `prd-${Math.random().toString(36).slice(2, 8)}`,
  slug: '',
  name: '',
  category: 'Digital Engineering Package',
  summary: '',
  description: '',
  image: '',
  price: 0,
  currency: 'KES',
  status: 'available',
  features: [],
  applications: [],
  specs: [],
  hardware: [],
  software: [],
  architecture: []
});

function slugify(value: string): string {
  return value.
  toLowerCase().
  replace(/[^a-z0-9]+/g, '-').
  replace(/^-|-$/g, '');
}

export function AdminProducts() {
  const [products, setProducts] = useState(() => api.listProducts(true));
  const [draft, setDraft] = useState<StoreProduct | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    try {
      await api.adminSaveProduct({
        ...draft,
        slug: draft.slug || slugify(draft.name),
        price: Number(draft.price) || 0
      });
      setProducts(api.listProducts(true));
      setDraft(null);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    await api.adminDeleteProduct(id);
    setProducts(api.listProducts(true));
  };

  const toggle = async (p: StoreProduct) => {
    const next: ProductStatus = p.status === 'disabled' ? 'available' : 'disabled';
    await api.adminSaveProduct({ ...p, status: next });
    setProducts(api.listProducts(true));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-silver">
          {products.length} products in the catalogue
        </p>
        <button
          type="button"
          onClick={() => setDraft(blank())}
          className="inline-flex items-center gap-2 rounded-full bg-electric px-5 py-2.5 text-[12.5px] font-semibold text-navy transition-colors hover:bg-electric-soft">
          
          <PlusIcon size={15} />
          Create product
        </button>
      </div>

      {draft &&
      <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-[15px] font-semibold text-white">
            {products.some((p) => p.id === draft.id) ? 'Edit product' : 'New product'}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="a-name" className="mb-2 block text-[12px] text-silver">Name</label>
              <input id="a-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={field} />
            </div>
            <div>
              <label htmlFor="a-cat" className="mb-2 block text-[12px] text-silver">Category</label>
              <input id="a-cat" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className={field} />
            </div>
            <div>
              <label htmlFor="a-price" className="mb-2 block text-[12px] text-silver">Price (KES)</label>
              <input id="a-price" type="number" min={0} value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} className={field} />
            </div>
            <div>
              <label htmlFor="a-status" className="mb-2 block text-[12px] text-silver">Availability</label>
              <select
              id="a-status"
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as ProductStatus })}
              className={field}>
              
                <option value="available">Available</option>
                <option value="preorder">Pre-order</option>
                <option value="disabled">Disabled (hidden)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="a-img" className="mb-2 block text-[12px] text-silver">
                Product image URL
              </label>
              <div className="flex gap-2">
                <input id="a-img" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} placeholder="https://…" className={field} />
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/12 bg-navy-800 text-silver-dark">
                  {draft.image ?
                <img src={draft.image} alt="" className="h-full w-full object-cover" /> :

                <ImageIcon size={16} />
                }
                </span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="a-sum" className="mb-2 block text-[12px] text-silver">Summary</label>
              <input id="a-sum" value={draft.summary} onChange={(e) => setDraft({ ...draft, summary: e.target.value })} className={field} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="a-desc" className="mb-2 block text-[12px] text-silver">Description</label>
              <textarea id="a-desc" rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={`${field} resize-y`} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="a-feat" className="mb-2 block text-[12px] text-silver">
                Features (one per line)
              </label>
              <textarea
              id="a-feat"
              rows={3}
              value={draft.features.join('\n')}
              onChange={(e) => setDraft({ ...draft, features: e.target.value.split('\n').filter(Boolean) })}
              className={`${field} resize-y`} />
            
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="a-app" className="mb-2 block text-[12px] text-silver">
                Applications (one per line)
              </label>
              <textarea
              id="a-app"
              rows={3}
              value={draft.applications.join('\n')}
              onChange={(e) => setDraft({ ...draft, applications: e.target.value.split('\n').filter(Boolean) })}
              className={`${field} resize-y`} />
            
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
            type="button"
            onClick={save}
            disabled={busy || !draft.name}
            className="inline-flex items-center gap-2 rounded-full bg-tech px-5 py-2.5 text-[12.5px] font-semibold text-navy transition-colors hover:bg-tech-soft disabled:opacity-60">
            
              {busy && <Loader2Icon size={14} className="animate-spin" />}
              Save product
            </button>
            <button
            type="button"
            onClick={() => setDraft(null)}
            className="rounded-full border border-white/12 px-5 py-2.5 text-[12.5px] font-semibold text-silver transition-colors hover:text-white">
            
              Cancel
            </button>
          </div>
        </section>
      }

      <ul className="space-y-3">
        {products.map((p) =>
        <li
          key={p.id}
          className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
          
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-navy-800">
                {p.image ?
              <img src={p.image} alt="" className="h-full w-full object-cover" /> :

              <ImageIcon size={16} className="text-silver-dark" />
              }
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-semibold text-white">{p.name}</p>
                <p className="mt-1 font-mono text-[10.5px] uppercase tracking-wider text-silver-dark">
                  {p.category} · {api.listProductFiles(p.id).length} protected files
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[13px] font-semibold text-white">{formatKes(p.price)}</span>
              <ProductStatusBadge status={p.status} />
              <button
              type="button"
              onClick={() => setDraft(p)}
              aria-label={`Edit ${p.name}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 text-silver transition-colors hover:border-electric/45 hover:text-electric">
              
                <PencilIcon size={14} />
              </button>
              <button
              type="button"
              onClick={() => toggle(p)}
              className="rounded-full border border-white/12 px-3.5 py-2 text-[12px] font-semibold text-silver transition-colors hover:text-white">
              
                {p.status === 'disabled' ? 'Enable' : 'Disable'}
              </button>
              <button
              type="button"
              onClick={() => remove(p.id)}
              aria-label={`Delete ${p.name}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-400/30 text-red-300 transition-colors hover:bg-red-400/10">
              
                <Trash2Icon size={14} />
              </button>
            </div>
          </li>
        )}
      </ul>
    </div>);

}