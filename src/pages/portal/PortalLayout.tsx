import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  BadgeCheckIcon,
  LibraryIcon,
  ReceiptTextIcon,
  UserCogIcon } from
'lucide-react';
import { PageShell } from '../../components/store/PageShell';
import { useAuth } from '../../contexts/AuthContext';

const tabs = [
{ to: '/portal/library', label: 'My Library', icon: LibraryIcon },
{ to: '/portal/orders', label: 'Orders & Payments', icon: ReceiptTextIcon },
{ to: '/portal/licenses', label: 'Licences', icon: BadgeCheckIcon },
{ to: '/portal/profile', label: 'Profile', icon: UserCogIcon }];


export function PortalLayout() {
  const { user } = useAuth();

  return (
    <PageShell
      eyebrow="Customer portal"
      title={
      <>
          Welcome back,{' '}
          <span className="text-electric">{user?.name?.split(' ')[0] ?? 'engineer'}</span>
        </>
      }
      body="Your purchased products, licences, payment history and protected documentation.">
      
      <nav aria-label="Portal sections" className="flex flex-wrap gap-2">
        {tabs.map(({ to, label, icon: Icon }) =>
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
          `inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[12.5px] font-semibold transition-colors ${
          isActive ?
          'border-electric/45 bg-electric/10 text-electric' :
          'border-white/12 text-silver hover:border-white/30 hover:text-white'}`

          }>
          
            <Icon size={14} />
            {label}
          </NavLink>
        )}
      </nav>

      <div className="mt-8">
        <Outlet />
      </div>
    </PageShell>);

}