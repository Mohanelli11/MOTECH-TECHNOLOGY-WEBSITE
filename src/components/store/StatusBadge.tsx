import React from 'react';
import type { LicenseStatus, OrderStatus, ProductStatus } from '../../types/store';

const orderLabels: Record<OrderStatus, string> = {
  awaiting_payment: 'Awaiting payment',
  under_review: 'Under review',
  verified: 'Payment verified',
  rejected: 'Rejected'
};

const tone = {
  neutral: 'border-white/15 bg-white/5 text-silver',
  info: 'border-electric/30 bg-electric/10 text-electric',
  warn: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  good: 'border-tech/35 bg-tech/10 text-tech',
  bad: 'border-red-400/30 bg-red-400/10 text-red-300'
} as const;

type Tone = keyof typeof tone;

function Pill({ label, variant }: {label: string;variant: Tone;}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tone[variant]}`}>
      
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>);

}

export function OrderStatusBadge({ status }: {status: OrderStatus;}) {
  const variant: Tone =
  status === 'verified' ?
  'good' :
  status === 'under_review' ?
  'warn' :
  status === 'rejected' ?
  'bad' :
  'info';
  return <Pill label={orderLabels[status]} variant={variant} />;
}

export function ProductStatusBadge({ status }: {status: ProductStatus;}) {
  const map: Record<ProductStatus, {label: string;variant: Tone;}> = {
    available: { label: 'In stock', variant: 'good' },
    preorder: { label: 'Pre-order', variant: 'warn' },
    disabled: { label: 'Unavailable', variant: 'neutral' }
  };
  return <Pill label={map[status].label} variant={map[status].variant} />;
}

export function LicenseStatusBadge({ status }: {status: LicenseStatus;}) {
  return (
    <Pill
      label={status === 'active' ? 'Licence active' : 'Licence deactivated'}
      variant={status === 'active' ? 'good' : 'bad'} />);


}