import React, { useMemo, useState } from 'react';
import {
  FileLock2Icon,
  Loader2Icon,
  ShieldCheckIcon,
  Trash2Icon,
  UploadCloudIcon } from
'lucide-react';
import { api, formatDate } from '../../lib/accessControl';
import type { DocCategory } from '../../types/store';

const field =
'w-full rounded-xl border border-white/12 bg-navy-800/70 px-4 py-2.5 text-[13px] text-white placeholder:text-silver-dark/70 outline-none focus:border-electric/70';

const categories: DocCategory[] = [
'Technical Manual',
'Firmware',
'Schematics & PCB',
'Software',
'Design Package',
'Commissioning'];


export function AdminDocumentation() {
  const products = useMemo(() => api.listProducts(true), []);
  const [files, setFiles] = useState(() => api.adminAllFiles());
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [form, setForm] = useState({
    title: '',
    category: categories[0],
    format: 'PDF',
    sizeLabel: '',
    version: 'v1.0'
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({
      ...f,
      title: f.title || file.name.replace(/\.[^.]+$/, ''),
      format: (file.name.split('.').pop() ?? 'PDF').toUpperCase(),
      sizeLabel:
      file.size > 1024 * 1024 ?
      `${(file.size / (1024 * 1024)).toFixed(1)} MB` :
      `${Math.max(1, Math.round(file.size / 1024))} KB`
    }));
  };

  const upload = async () => {
    setBusy(true);
    setError('');
    try {
      await api.adminUploadFile({ ...form, productId });
      setFiles(api.adminAllFiles());
      setForm({ title: '', category: categories[0], format: 'PDF', sizeLabel: '', version: 'v1.0' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    await api.adminDeleteFile(id);
    setFiles(api.adminAllFiles());
  };

  const visible = files.filter((f) => filter === 'all' || f.productId === filter);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.35fr] xl:items-start">
      <section className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric/10 text-electric">
            <UploadCloudIcon size={18} />
          </span>
          <h2 className="font-display text-[15px] font-semibold text-white">
            Upload protected resource
          </h2>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="d-product" className="mb-2 block text-[12px] text-silver">
              Attach to product
            </label>
            <select
              id="d-product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className={field}>
              
              {products.map((p) =>
              <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              )}
            </select>
          </div>

          <label
            htmlFor="d-file"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-white/20 bg-navy-800/50 px-6 py-7 text-center transition-colors hover:border-electric/50">
            
            <FileLock2Icon size={19} className="text-electric" />
            <span className="text-[13px] font-medium text-white">
              Select file to protect
            </span>
            <span className="text-[11.5px] text-silver-dark">
              Stored privately — never served from a public path
            </span>
            <input id="d-file" type="file" onChange={onFile} className="sr-only" />
          </label>

          <div>
            <label htmlFor="d-title" className="mb-2 block text-[12px] text-silver">Title</label>
            <input id="d-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="SEM-100 Technical Manual" className={field} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="d-cat" className="mb-2 block text-[12px] text-silver">Category</label>
              <select
                id="d-cat"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as DocCategory })}
                className={field}>
                
                {categories.map((c) =>
                <option key={c} value={c}>
                    {c}
                  </option>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="d-ver" className="mb-2 block text-[12px] text-silver">Version</label>
              <input id="d-ver" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className={field} />
            </div>
            <div>
              <label htmlFor="d-fmt" className="mb-2 block text-[12px] text-silver">Format</label>
              <input id="d-fmt" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} className={field} />
            </div>
            <div>
              <label htmlFor="d-size" className="mb-2 block text-[12px] text-silver">Size</label>
              <input id="d-size" value={form.sizeLabel} onChange={(e) => setForm({ ...form, sizeLabel: e.target.value })} placeholder="8.4 MB" className={field} />
            </div>
          </div>

          {error && <p className="text-[12.5px] text-red-300">{error}</p>}

          <button
            type="button"
            onClick={upload}
            disabled={busy || !form.title || !productId}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-electric px-5 py-3 text-[13px] font-semibold text-navy transition-colors hover:bg-electric-soft disabled:opacity-60">
            
            {busy && <Loader2Icon size={15} className="animate-spin" />}
            Upload to protected storage
          </button>

          <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-silver-dark">
            <ShieldCheckIcon size={13} className="mt-0.5 shrink-0 text-tech" />
            Resources are registered by metadata only. Delivery always goes through
            the access-control broker, which checks authentication, ownership,
            payment verification and licence scope before issuing an expiring link.
          </p>
        </div>
      </section>

      <section className="glass overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-6">
          <h2 className="font-display text-[15px] font-semibold text-white">
            Protected file manager
          </h2>
          <select
            aria-label="Filter by product"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-full border border-white/12 bg-navy-800/70 px-4 py-2 text-[12.5px] text-white outline-none focus:border-electric/70">
            
            <option value="all">All products</option>
            {products.map((p) =>
            <option key={p.id} value={p.id}>
                {p.name}
              </option>
            )}
          </select>
        </div>

        {visible.length === 0 ?
        <p className="p-6 text-[13px] text-silver">No protected files here yet.</p> :

        <ul className="divide-y divide-white/8">
            {visible.map((f) =>
          <li key={f.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium text-white">{f.title}</p>
                  <p className="mt-1 font-mono text-[10.5px] uppercase tracking-wider text-silver-dark">
                    {products.find((p) => p.id === f.productId)?.name ?? f.productId} ·{' '}
                    {f.category} · {f.format} · {f.version} · {f.sizeLabel} ·{' '}
                    {formatDate(f.uploadedAt)}
                  </p>
                </div>
                <button
              type="button"
              onClick={() => remove(f.id)}
              aria-label={`Delete ${f.title}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-400/30 text-red-300 transition-colors hover:bg-red-400/10">
              
                  <Trash2Icon size={14} />
                </button>
              </li>
          )}
          </ul>
        }
      </section>
    </div>);

}