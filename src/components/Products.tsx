import React from 'react';
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
      </div>
    </section>);

}