import React from 'react';
import { CircuitBackground } from '../CircuitBackground';

type PageShellProps = {
  eyebrow: string;
  title: React.ReactNode;
  body?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

/** Standard inner-page frame: circuit header band + content well. */
export function PageShell({
  eyebrow,
  title,
  body,
  actions,
  children
}: PageShellProps) {
  return (
    <main className="min-h-screen bg-navy pb-24 pt-[74px]">
      <div className="relative isolate overflow-hidden border-b border-white/8 bg-navy-800/40">
        <CircuitBackground opacity={0.3} />
        <div
          aria-hidden="true"
          className="absolute -right-20 top-0 h-[320px] w-[320px] rounded-full bg-electric/12 blur-[140px]" />
        
        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-electric">
            <span className="h-px w-8 bg-electric/60" />
            {eyebrow}
          </span>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-display text-[1.9rem] font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {title}
              </h1>
              {body &&
              <p className="mt-4 text-[14.5px] leading-relaxed text-silver">
                  {body}
                </p>
              }
            </div>
            {actions}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">{children}</div>
    </main>);

}