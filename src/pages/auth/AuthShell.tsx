import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon } from 'lucide-react';
import { CircuitBackground } from '../../components/CircuitBackground';
import { site } from '../../data/site';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="relative isolate flex min-h-screen items-center overflow-hidden bg-navy px-5 pb-16 pt-[110px] sm:px-8">
      <CircuitBackground opacity={0.3} />
      <div
        aria-hidden="true"
        className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-electric/15 blur-[150px]" />
      
      <div className="relative mx-auto w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-navy-800">
            <img
              src={site.logo}
              alt="MOTECH logo"
              className="h-full w-full scale-[1.55] object-contain" />
            
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            MOTECH
          </span>
        </Link>

        <div className="glass rounded-3xl p-7 sm:p-8">
          <h1 className="font-display text-[1.55rem] font-bold leading-tight text-white">
            {title}
          </h1>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-silver">
            {subtitle}
          </p>
          <div className="mt-7">{children}</div>
          {footer &&
          <p className="mt-6 text-center text-[13px] text-silver">{footer}</p>
          }
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-silver-dark">
          <ShieldCheckIcon size={12} className="text-tech" />
          Authenticated access · licensed downloads
        </p>
      </div>
    </main>);

}