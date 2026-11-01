import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRightIcon,
  CheckIcon,
  LayoutDashboardIcon,
  MailIcon,
  MessageCircleIcon,
  SparklesIcon } from
'lucide-react';
import type { Product } from '../data/products';
import { site } from '../data/site';
import { mailtoLink, whatsappLink } from '../utils/contact';

const accentMap = {
  blue: {
    text: 'text-electric',
    border: 'hover:border-electric/45',
    chipBg: 'bg-electric/10 text-electric-soft border-electric/25',
    bullet: 'text-electric',
    glow: 'bg-electric/20'
  },
  green: {
    text: 'text-tech',
    border: 'hover:border-tech/45',
    chipBg: 'bg-tech/10 text-tech-soft border-tech/25',
    bullet: 'text-tech',
    glow: 'bg-tech/20'
  }
} as const;

export function ProductCard({
  product,
  reversed



}: {product: Product;reversed: boolean;}) {
  const a = accentMap[product.accent];

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-90px' }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
      className={`glass relative overflow-hidden rounded-3xl p-6 transition-colors sm:p-8 lg:p-10 ${a.border}`}>
      
      <div
        aria-hidden="true"
        className={`absolute -right-24 -top-24 h-64 w-64 rounded-full blur-[110px] ${a.glow}`} />
      

      <div
        className={`relative grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12 ${
        reversed ? 'lg:[&>*:first-child]:order-2' : ''}`
        }>
        
        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-navy-800">
            <img
              src={product.image}
              alt={`${product.name} product illustration`}
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.05]" />
            
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent" />
            
            <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-navy/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-silver backdrop-blur">
              Product {product.index}
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-display text-2xl font-bold leading-tight text-white sm:text-[1.75rem]">
            {product.name}
          </h3>
          <p className={`mt-2 text-[13px] font-medium ${a.text}`}>
            {product.tagline}
          </p>
          <p className="mt-5 text-[14.5px] leading-relaxed text-silver">
            {product.description}
          </p>

          <div className="mt-7">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.24em] text-silver-dark">
              Features
            </h4>
            <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {product.features.map((f) =>
              <li key={f} className="flex items-start gap-2 text-[13.5px] text-white/85">
                  <CheckIcon
                  size={14}
                  className={`mt-0.5 shrink-0 ${a.bullet}`} />
                
                  {f}
                </li>
              )}
            </ul>
          </div>

          <div className="mt-7">
            <h4 className="font-mono text-[10px] uppercase tracking-[0.24em] text-silver-dark">
              Applications
            </h4>
            <ul className="mt-3 flex flex-wrap gap-2">
              {product.applications.map((app) =>
              <li
                key={app}
                className={`rounded-full border px-3 py-1 text-[12px] font-medium ${a.chipBg}`}>
                
                  {app}
                </li>
              )}
            </ul>
          </div>

          {product.benefits &&
          <div className="mt-7">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.24em] text-silver-dark">
                Benefits
              </h4>
              <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {product.benefits.map((b) =>
              <li
                key={b}
                className="flex items-start gap-2 text-[13.5px] text-white/85">
                
                    <SparklesIcon
                  size={14}
                  className={`mt-0.5 shrink-0 ${a.bullet}`} />
                
                    {b}
                  </li>
              )}
              </ul>
            </div>
          }

          {product.dashboard &&
          <a
            href={product.dashboard.url}
            target="_blank"
            rel="noreferrer noopener"
            className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-electric px-6 py-3.5 text-sm font-semibold text-navy shadow-glow transition-all hover:bg-electric-soft sm:w-auto">
            
              <LayoutDashboardIcon size={17} />
              {product.dashboard.label}
              <ArrowUpRightIcon
              size={16}
              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            
            </a>
          }

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
            <a
              href={mailtoLink(
                `Enquiry: ${product.name}`,
                `Hello MOTECH Embedded Engineering,\n\nI'd like more information about the ${product.name}.\n\nName:\nCompany:\nSite / application:\n\nThank you.`
              )}
              className="glass inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:border-tech/50 hover:text-tech">
              
              <MailIcon size={15} />
              Contact About {product.name.split(' ').slice(0, 2).join(' ')}
            </a>
            <a
              href={whatsappLink(
                `Hello MOTECH, I'd like more information about the ${product.name}.`
              )}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 px-1 text-[13px] font-medium text-silver transition-colors hover:text-tech">
              
              <MessageCircleIcon size={14} className="text-tech" />
              WhatsApp {site.phone}
            </a>
          </div>
        </div>
      </div>
    </motion.article>);

}