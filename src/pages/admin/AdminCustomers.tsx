import React, { useState } from 'react';
import { KeyRoundIcon, SearchIcon, UserXIcon } from 'lucide-react';
import { LicenseStatusBadge } from '../../components/store/StatusBadge';
import { api, formatDate, formatKes } from '../../lib/accessControl';

export function AdminCustomers() {
  const [customers, setCustomers] = useState(() => api.adminCustomers());
  const [licenses, setLicenses] = useState(() => api.adminLicenses());
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = () => {
    setCustomers(api.adminCustomers());
    setLicenses(api.adminLicenses());
  };

  const q = query.trim().toLowerCase();
  const visible = customers.filter(
    (c) =>
    !q ||
    c.name.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q) ||
    c.company.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-5">
      <div className="relative w-full lg:w-80">
        <label htmlFor="cust-search" className="sr-only">
          Search customers
        </label>
        <SearchIcon
          size={15}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-silver-dark" />
        
        <input
          id="cust-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, email or company…"
          className="w-full rounded-full border border-white/12 bg-navy-800/70 py-2.5 pl-10 pr-4 text-[13px] text-white placeholder:text-silver-dark/70 outline-none focus:border-electric/70" />
        
      </div>

      {visible.length === 0 ?
      <p className="glass rounded-2xl p-10 text-center text-[13.5px] text-silver">
          No customer accounts yet.
        </p> :

      <ul className="space-y-3">
          {visible.map((c) => {
          const own = licenses.filter((l) => l.userId === c.id);
          const open = expanded === c.id;
          return (
            <li key={c.id} className="glass rounded-2xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-white">
                      {c.name}
                      {c.disabled &&
                    <span className="ml-2 rounded-full border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-[10.5px] font-semibold text-red-300">
                          disabled
                        </span>
                    }
                    </p>
                    <p className="mt-1 font-mono text-[10.5px] text-silver-dark">
                      {c.email} · {c.company || 'no company'} · joined{' '}
                      {formatDate(c.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-silver">
                    <span>
                      {c.verified}/{c.orders} verified
                    </span>
                    <span className="font-semibold text-white">{formatKes(c.spend)}</span>
                    <span>{c.licenses} active licences</span>
                    <button
                    type="button"
                    onClick={() => setExpanded(open ? null : c.id)}
                    className="rounded-full border border-white/12 px-3.5 py-2 text-[12px] font-semibold text-silver transition-colors hover:text-white">
                    
                      {open ? 'Hide access' : 'View access'}
                    </button>
                    <button
                    type="button"
                    onClick={async () => {
                      await api.adminResetAccess(c.id);
                      refresh();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3.5 py-2 text-[12px] font-semibold text-silver transition-colors hover:border-amber-300/45 hover:text-amber-300">
                    
                      <KeyRoundIcon size={13} />
                      Reset access
                    </button>
                    <button
                    type="button"
                    onClick={async () => {
                      await api.adminSetUserDisabled(c.id, !c.disabled);
                      refresh();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-400/30 px-3.5 py-2 text-[12px] font-semibold text-red-300 transition-colors hover:bg-red-400/10">
                    
                      <UserXIcon size={13} />
                      {c.disabled ? 'Enable' : 'Disable'}
                    </button>
                  </div>
                </div>

                {open &&
              <ul className="mt-5 space-y-2 border-t border-white/8 pt-5">
                    {own.length === 0 &&
                <li className="text-[12.5px] text-silver">
                        No licences issued to this customer.
                      </li>
                }
                    {own.map((l) =>
                <li
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-navy-800/60 px-4 py-3">
                  
                        <span className="font-mono text-[12px] text-white">{l.id}</span>
                        <span className="text-[12.5px] text-silver">
                          {api.listProducts(true).find((p) => p.id === l.productId)?.name ??
                    l.productId}
                        </span>
                        <div className="flex items-center gap-3">
                          <LicenseStatusBadge status={l.status} />
                          <button
                      type="button"
                      onClick={async () => {
                        await api.adminSetLicenseStatus(
                          l.id,
                          l.status === 'active' ? 'deactivated' : 'active'
                        );
                        refresh();
                      }}
                      className="rounded-full border border-white/12 px-3 py-1.5 text-[11.5px] font-semibold text-silver transition-colors hover:text-white">
                      
                            {l.status === 'active' ? 'Deactivate' : 'Reactivate'}
                          </button>
                        </div>
                      </li>
                )}
                  </ul>
              }
              </li>);

        })}
        </ul>
      }
    </div>);

}