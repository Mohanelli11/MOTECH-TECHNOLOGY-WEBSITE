import React from 'react';
import { motion } from 'framer-motion';

type SectionHeadingProps = {
  eyebrow: string;
  title: React.ReactNode;
  body?: string;
  align?: 'left' | 'center';
};

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = 'center'
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className={
      align === 'center' ?
      'mx-auto max-w-3xl text-center' :
      'max-w-3xl text-left'
      }>
      
      <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-electric">
        <span className="h-px w-8 bg-electric/60" />
        {eyebrow}
      </span>
      <h2 className="mt-4 font-display text-[1.9rem] font-bold leading-tight tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {body &&
      <p className="mt-5 text-[15px] leading-relaxed text-silver">{body}</p>
      }
    </motion.div>);

}