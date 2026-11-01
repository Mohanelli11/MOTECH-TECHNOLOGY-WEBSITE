import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightIcon, CpuIcon, GaugeIcon, RadioIcon } from 'lucide-react';
import { CircuitBackground } from './CircuitBackground';
import { ParticleField } from './ParticleField';
import { site } from '../data/site';

const stats = [
{ value: '4', label: 'Flagship products' },
{ value: '10+', label: 'Industries served' },
{ value: '24/7', label: 'Remote monitoring' }];


const floatingChips = [
{ icon: CpuIcon, label: 'MCU firmware', top: '14%', left: '4%', delay: 0 },
{ icon: GaugeIcon, label: 'Power quality', top: '66%', left: '8%', delay: 0.6 },
{ icon: RadioIcon, label: 'GSM / WiFi', top: '24%', left: '84%', delay: 1.2 }];


export function Hero() {
  return (
    <section
      id="home"
      className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden bg-navy pt-28 pb-20">
      
      <div className="absolute inset-0 grid-lines" aria-hidden="true" />
      <CircuitBackground opacity={0.55} />
      <ParticleField />

      {/* glow blooms */}
      <div
        aria-hidden="true"
        className="absolute -left-40 top-10 h-[460px] w-[460px] rounded-full bg-electric/20 blur-[140px]" />
      
      <div
        aria-hidden="true"
        className="absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-tech/15 blur-[140px]" />
      
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy to-transparent" />
      

      {floatingChips.map(({ icon: Icon, label, top, left, delay }) =>
      <motion.div
        key={label}
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, y: [0, -14, 0] }}
        transition={{
          opacity: { duration: 0.8, delay },
          scale: { duration: 0.8, delay },
          y: { duration: 7, repeat: Infinity, ease: 'easeInOut', delay }
        }}
        style={{ top, left }}
        className="glass absolute hidden items-center gap-2 rounded-xl px-3 py-2 xl:flex">
        
          <Icon size={15} className="text-electric" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-silver">
            {label}
          </span>
        </motion.div>
      )}

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5">
            
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tech opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-tech" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-silver">
              {site.motto}
            </span>
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="mt-7 font-display text-[2.35rem] font-extrabold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[4rem]">
            
            Engineering the Future with{' '}
            <span className="relative whitespace-nowrap text-electric">
              Intelligent
              <svg
                aria-hidden="true"
                viewBox="0 0 300 12"
                className="absolute -bottom-2 left-0 w-full">
                
                <path
                  d="M2 8 Q150 0 298 8"
                  fill="none"
                  stroke="#59C414"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.8" />
                
              </svg>
            </span>{' '}
            Embedded Systems
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mt-8 max-w-2xl text-[15.5px] leading-relaxed text-silver sm:text-lg">
            
            MOTECH Embedded Engineering Ltd develops innovative Embedded
            Systems, Smart Energy Technologies, IoT Devices, Network Solutions,
            and Industrial Monitoring Systems that power tomorrow&apos;s
            connected world.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="mt-10 flex flex-wrap items-center gap-3">
            
            <a
              href="#products"
              className="group inline-flex items-center gap-2 rounded-full bg-electric px-6 py-3.5 text-sm font-semibold text-navy shadow-glow transition-all hover:bg-electric-soft">
              
              Explore Products
              <ArrowRightIcon
                size={17}
                className="transition-transform group-hover:translate-x-1" />
              
            </a>
            <a
              href="#contact"
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-tech/50 hover:text-tech">
              
              Contact Us
            </a>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-7">
            
            {stats.map((s) =>
            <div key={s.label}>
                <dt className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {s.value}
                </dt>
                <dd className="mt-1 text-[11px] uppercase tracking-[0.14em] text-silver-dark">
                  {s.label}
                </dd>
              </div>
            )}
          </motion.dl>
        </div>
      </div>
    </section>);

}