import React from 'react';
import { motion } from 'framer-motion';
import {
  ActivityIcon,
  ArrowUpRightIcon,
  GaugeIcon,
  LayoutDashboardIcon,
  WalletIcon } from
'lucide-react';
import { CircuitBackground } from './CircuitBackground';
import { SectionHeading } from './SectionHeading';
import { site } from '../data/site';

const capabilities = [
{
  icon: ActivityIcon,
  title: 'Live consumption',
  body: 'Per-meter load curves streaming in near real time.'
},
{
  icon: WalletIcon,
  title: 'Prepaid tokens',
  body: 'Issue, track and reconcile token-based billing.'
},
{
  icon: GaugeIcon,
  title: 'Remote control',
  body: 'Disconnect, reconnect and set thresholds remotely.'
}];


export function EnergyDashboard() {
  return (
    <section
      id="energy-dashboard"
      className="relative isolate overflow-hidden border-t border-white/5 bg-navy py-24 sm:py-28">
      
      <CircuitBackground opacity={0.28} />
      <div
        aria-hidden="true"
        className="absolute right-0 top-10 h-[420px] w-[420px] rounded-full bg-electric/15 blur-[150px]" />
      

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Energy Dashboard"
              title={
              <>
                  Energy Management{' '}
                  <span className="text-electric">Dashboard</span>
                </>
              }
              body="A single control room for your metering estate — monitor consumption, manage prepaid tokens, run analytics and act on alerts from anywhere." />
            

            <ul className="mt-9 space-y-4">
              {capabilities.map(({ icon: Icon, title, body }) =>
              <motion.li
                key={title}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-70px' }}
                transition={{ duration: 0.5 }}
                className="flex items-start gap-4">
                
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-electric/25 bg-electric/10 text-electric">
                    <Icon size={18} />
                  </span>
                  <span>
                    <span className="block text-[14.5px] font-semibold text-white">
                      {title}
                    </span>
                    <span className="mt-1 block text-[13px] text-silver">
                      {body}
                    </span>
                  </span>
                </motion.li>
              )}
            </ul>

            <a
              href={site.dashboardUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="group mt-10 inline-flex items-center gap-2 rounded-full bg-electric px-6 py-3.5 text-sm font-semibold text-navy shadow-glow transition-all hover:bg-electric-soft">
              
              <LayoutDashboardIcon size={17} />
              Open Energy Management Dashboard
              <ArrowUpRightIcon
                size={16}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="glass rounded-3xl p-4 sm:p-5">
            
            <div className="mb-4 flex items-center justify-between px-1.5">
              <div className="flex items-center gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-tech/70" />
              </div>
              <span className="hidden rounded-md border border-white/10 bg-navy-800 px-3 py-1 font-mono text-[9.5px] text-silver-dark sm:block">
                motech · smart meter platform
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-tech/30 bg-tech/10 px-2.5 py-1 text-[10.5px] font-semibold text-tech">
                <span className="h-1.5 w-1.5 rounded-full bg-tech" />
                Live
              </span>
            </div>

            <a
              href={site.dashboardUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="group relative block overflow-hidden rounded-2xl border border-white/12 bg-navy-800">
              
              <img
                src={site.dashboardPreview}
                alt="MoTech SmartMeter platform dashboard showing total meters, prepaid and postpaid counts, daily revenue and total network consumption chart"
                className="w-full transition-transform duration-700 group-hover:scale-[1.03]"
                loading="lazy" />
              
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-navy/80 px-3 py-1.5 text-[11.5px] font-semibold text-white opacity-0 backdrop-blur transition-opacity duration-500 group-hover:opacity-100">
                Open the live platform
                <ArrowUpRightIcon size={13} />
              </span>
            </a>

            <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
              {[
              { k: 'Total meters', v: '1,248' },
              { k: 'Prepaid', v: '856' },
              { k: 'Revenue today', v: 'Ksh 248,750' }].
              map((m) =>
              <div key={m.k}>
                  <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-silver-dark">
                    {m.k}
                  </dt>
                  <dd className="mt-1 font-display text-base font-semibold text-white">
                    {m.v}
                  </dd>
                </div>
              )}
            </dl>
          </motion.div>
        </div>
      </div>
    </section>);

}