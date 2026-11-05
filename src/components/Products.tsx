import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, GraduationCapIcon } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { ProductCard } from './ProductCard';
import { products } from '../data/products';

export function Products() {
  return (
    <section
      id="products"
      className="relative isolate overflow-hidden border-t border-white/5 bg-navy-800/40 py-24 sm:py-28">
      
      <div className="absolute inset-0 grid-lines opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Products"
          title={
          <>
              Engineered hardware, <span className="text-electric">cloud-connected</span>
            </>
          }
          body="Every MOTECH product ships as a complete system — instrumented hardware, secure firmware, and a dashboard your team can actually act on." />
        

        <div className="mt-16 space-y-8 lg:space-y-10">
          {products.map((product, i) =>
          <ProductCard
            key={product.id}
            product={product}
            reversed={i % 2 === 1} />

          )}
        </div>

        <div className="relative mt-14 overflow-hidden rounded-3xl border border-electric/25 bg-gradient-to-br from-electric/10 via-navy-800/60 to-tech/10 p-8 sm:p-10">
          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-electric/15 blur-[90px]" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-electric/30 bg-electric/10 text-electric">
                <GraduationCapIcon size={26} />
              </span>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-electric">Marketplace</p>
                <h3 className="mt-2 font-display text-2xl font-bold text-white">MOTECH for Engineering Students</h3>
                <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-silver">
                  Complete engineering projects from our embedded-systems team. Create a free student account, pay
                  securely with Paystack and download your project files.
                </p>
              </div>
            </div>
            <Link
              to="/students"
              className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-electric px-6 py-3.5 text-sm font-semibold text-navy shadow-glow transition-all hover:bg-electric-soft">
              
              Visit the marketplace
              <ArrowRightIcon size={17} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>);

}