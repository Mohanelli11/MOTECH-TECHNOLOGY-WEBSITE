import React from 'react';
import { motion } from 'framer-motion';
import {
  ActivityIcon,
  BarChart3Icon,
  CpuIcon,
  FactoryIcon,
  GaugeIcon,
  LightbulbIcon,
  NetworkIcon,
  ZapIcon } from
'lucide-react';
import { SectionHeading } from './SectionHeading';
import { CircuitBackground } from './CircuitBackground';
import { coreAreas } from '../data/site';

const areaIcons = [
CpuIcon,
ZapIcon,
NetworkIcon,
BarChart3Icon,
ActivityIcon,
FactoryIcon,
GaugeIcon,
LightbulbIcon];


export function About() {
  return (
    <section
      id="about"
      className="relative isolate overflow-hidden border-t border-white/5 bg-navy py-24 sm:py-28">
      
      <CircuitBackground opacity={0.22} className="hidden lg:block" />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-electric/50 to-transparent" />
      

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div>
            <SectionHeading
              align="left"
              eyebrow="About Us"
              title={
              <>
                  About MOTECH{' '}
                  <span className="text-sheen">Embedded Engineering Ltd</span>
                </>
              } />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-7 space-y-5 text-[15px] leading-relaxed text-silver">
              
              <p>
                MOTECH Embedded Engineering Ltd is an innovative engineering
                company focused on designing intelligent embedded systems, IoT
                platforms, smart metering technologies, industrial monitoring
                solutions, network connectivity devices, and data analytics
                platforms.
              </p>
              <p className="border-l-2 border-tech/70 pl-5 text-white/90">
                Our mission is to build intelligent technologies that improve
                efficiency, connectivity, safety, and energy management for
                industries, commercial facilities, utilities, institutions, and
                homes.
              </p>
            </motion.div>
          </div>

          <motion.ul
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06 } }
            }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            
            {coreAreas.map((area, i) => {
              const Icon = areaIcons[i % areaIcons.length];
              return (
                <motion.li
                  key={area}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    show: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.45 }}
                  className="glass group flex items-center gap-3 rounded-xl px-4 py-4 transition-colors hover:border-electric/40">
                  
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-electric/10 text-electric transition-colors group-hover:bg-electric/20">
                    <Icon size={17} />
                  </span>
                  <span className="text-[13.5px] font-medium text-white">
                    {area}
                  </span>
                </motion.li>);

            })}
          </motion.ul>
        </div>
      </div>
    </section>);

}