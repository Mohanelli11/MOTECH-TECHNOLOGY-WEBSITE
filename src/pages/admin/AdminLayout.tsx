import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  FolderLockIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  PackageIcon,
  ReceiptTextIcon,
  UsersIcon } from
'lucide-react';
import { PageShell } from '../../components/store/PageShell';

const tabs = [
{ to: '/admin', label: 'Overview', icon: LayoutDashboardIcon, end: true },
{ to: '/admin/orders', label: 'Orders & Payments', icon: ReceiptTextIcon },
{ to: '/admin/products', label: 'Products', icon: PackageIcon },
{ to: '/admin/documentation', label: 'Documentation', icon: FolderLockIcon },
{ to: '/admin/customers', label: 'Customers', icon: UsersIcon },
{ to: '/admin/students', label: 'Student Projects', icon: GraduationCapIcon }];


export function AdminLayout() {
  return (
    <PageShell
      eyebrow="MOTECH Admin Portal"
      title={
      <>
          Marketplace <span className="text-electric">administration</span>
        </>
      }
      body="Track Paystack payments, revoke licences, manage products and upload protected documentation.">
      
      <nav aria-label="Admin sections" className="flex flex-wrap gap-2">
        {tabs.map(({ to, label, icon: Icon, end }) =>
        <NavLink
          key={to}
          to={to}
          end={end}
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