import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, DownloadIcon, FolderOpenIcon, Loader2Icon, LockIcon } from 'lucide-react';
import { PageShell } from '../../components/store/PageShell';
import { OrderStatusBadge } from '../../components/store/StatusBadge';
import { api, formatDate, formatKes } from '../../lib/accessControl';
import { isProjectId, studentsApi } from '../../lib/students';
import { useCommerceSync } from '../../lib/useCommerceSync';

export function MyProjects() {
  const tick = useCommerceSync();
  const orders = useMemo(() => api.myOrders().filter((o) => isProjectId(o.productId)), [tick]);
  const licenses = useMemo(() => api.myLicenses(), [tick]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const download = async (projectId: string) => {
    setBusy(projectId);
    setError('');
    try {
      const { url } = await studentsApi.downloadUrl(projectId);
      window.location.assign(url); // the link carries a download header, so the page stays put
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not download.');
    } finally {
      setBusy('');
    }
  };

  return (
    <PageShell
      eyebrow="MOTECH for Engineering Students"
      title={<>My <span className="text-electric">projects</span></>}
      body="Projects you have bought. Downloads use short-lived secure links."
      actions={
      <Link to="/students" className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:border-tech/50 hover:text-tech">
          <FolderOpenIcon size={15} /> Browse projects
        </Link>
      }>
      
      {error && <p className="mb-5 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-[13px] text-red-300">{error}</p>}
      {orders.length === 0 ?
      <div className="glass rounded-2xl p-12 text-center">
          <p className="font-display text-lg font-semibold text-white">No projects yet</p>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] text-silver">Projects you buy will appear here with a download button.</p>
          <Link to="/students" className="mt-6 inline-flex rounded-full bg-electric px-5 py-3 text-[13px] font-semibold text-navy hover:bg-electric-soft">Browse projects</Link>
        </div> :

      <ul className="space-y-4">
          {orders.map((o) => {
          const lic = licenses.find((l) => l.orderId === o.id);
          const unlocked = o.status === 'verified' && lic?.status === 'active';
          return (
            <li key={o.id} className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
                <div className="min-w-0">
                  <p className="font-display text-[15px] font-semibold text-white">{o.productName}</p>
                  <p className="mt-1 font-mono text-[11px] text-silver-dark">
                    {o.id} · {formatDate(o.createdAt)} · {formatKes(o.amount)}
                  </p>
                  <div className="mt-2"><OrderStatusBadge status={o.status} /></div>
                </div>
                {unlocked ?
              <button
                type="button"
                onClick={() => download(o.productId)}
                disabled={busy === o.productId}
                className="inline-flex items-center gap-2 rounded-full bg-electric px-5 py-2.5 text-[13px] font-semibold text-navy transition-colors hover:bg-electric-soft disabled:opacity-60">
                
                    {busy === o.productId ? <Loader2Icon size={15} className="animate-spin" /> : <DownloadIcon size={15} />}
                    Download
                  </button> :
              o.status === 'awaiting_payment' ?
              <Link to="/portal/orders" className="inline-flex items-center gap-2 text-[12.5px] text-silver">
                    <ClockIcon size={14} /> Payment not completed
                  </Link> :

              <span className="inline-flex items-center gap-2 text-[12.5px] text-silver"><LockIcon size={14} /> Locked</span>
              }
              </li>);

        })}
        </ul>
      }
    </PageShell>);

}
