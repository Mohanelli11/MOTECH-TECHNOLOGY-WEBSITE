import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  FileLock2Icon,
  ReceiptTextIcon,
  ShieldCheckIcon } from
'lucide-react';
import { SectionHeading } from './SectionHeading';
import { CircuitBackground } from './CircuitBackground';

const journey = [
{
  icon: ReceiptTextIcon,
  title: 'Select & order',
  body: 'Browse hardware and engineering packages, priced in KES.'
},
{
  icon: ShieldCheckIcon,
  title: 'Bank payment',
  body: 'Pay to the MOTECH I&M account quoting your payment reference.'
},
{
  icon: BadgeCheckIcon,
  title: 'Licence issued',
  body: 'Once MOTECH verifies the payment, a licence ID is issued to you.'
},
{
  icon: FileLock2Icon,
  title: 'Secure download',
  body: 'Protected documentation unlocks in your library via expiring links.'
}];


export function StorePromo() {
  return (
    <section className="relative isolate overflow-hidden border-t border-white/5 bg-navy py-24 sm:py-28">
      <CircuitBackground opacity={0.24} />
      <div
        aria-hidden="true"
        className="absolute right-0 top-1/4 h-[380px] w-[380px] rounded-full bg-electric/12 blur-[150px]" />
      
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Store & Documentation Portal"
          title={
          <>
              Purchase products and{' '}
              <span className="text-electric">licensed documentation</span>
            </>
          }
          body="A professional engineering marketplace: order devices or digital design packages, pay by bank transfer, and receive licensed access to protected manuals, firmware and design files." />
        

        <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {journey.map(({ icon: Icon, title, body }, i) =>
          <motion.li
            key={title}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
            className="glass relative rounded-2xl p-6">
            
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-navy-700 text-electric">
                <Icon size={19} />
              </span>
              <h3 className="mt-5 font-display text-[15.5px] font-semibold text-white">
                {title}
              </h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-silver">
                {body}
              </p>
              <span
              aria-hidden="true"
              className="absolute right-5 top-5 font-mono text-[11px] text-silver-dark">
              
                0{i + 1}
              </span>
            </motion.li>
          )}
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            to="/store"
            className="group inline-flex items-center gap-2 rounded-full bg-electric px-6 py-3.5 text-sm font-semibold text-navy shadow-glow transition-colors hover:bg-electric-soft">
            
            Enter the MOTECH store
            <ArrowRightIcon
              size={17}
              className="transition-transform group-hover:translate-x-1" />
            
          </Link>
          <Link
            to="/portal/library"
            className="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-tech/50 hover:text-tech">
            
            My Library
          </Link>
        </div>
      </div>
    </section>);

}