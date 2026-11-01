import React from "react";
import { motion } from "framer-motion";
import { Building2Icon, FactoryIcon, GraduationCapIcon, HeartPulseIcon, LandmarkIcon, NetworkIcon, PlugZapIcon, RadioTowerIcon, SproutIcon, SunIcon, BoxIcon } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { industries } from "../data/site";
const icons: Record<string, BoxIcon> = {
  PlugZap: PlugZapIcon,
  Sun: SunIcon,
  Factory: FactoryIcon,
  Building2: Building2Icon,
  GraduationCap: GraduationCapIcon,
  Landmark: LandmarkIcon,
  HeartPulse: HeartPulseIcon,
  Network: NetworkIcon,
  RadioTower: RadioTowerIcon,
  Sprout: SproutIcon
};
export function Industries() {
  return <section id="industries" className="relative isolate overflow-hidden border-t border-white/5 bg-navy-800/40 py-24 sm:py-28">
      <div className="absolute inset-0 grid-lines opacity-50" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="Industries Served" title={<>
              Deployed across{' '}
              <span className="text-sheen">critical infrastructure</span>
            </>} />

        <motion.ul initial="hidden" whileInView="show" viewport={{
        once: true,
        margin: '-70px'
      }} variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.05
          }
        }
      }} className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {industries.map((item) => {
          const Icon = icons[item.icon] ?? NetworkIcon;
          return <motion.li key={item.label} variants={{
            hidden: {
              opacity: 0,
              scale: 0.9
            },
            show: {
              opacity: 1,
              scale: 1
            }
          }} transition={{
            duration: 0.45,
            ease: 'easeOut'
          }} className="glass group flex flex-col items-center gap-3 rounded-2xl px-4 py-7 text-center transition-colors hover:border-tech/45">
                <motion.span whileHover={{
              rotate: -8,
              scale: 1.12
            }} transition={{
              type: 'spring',
              stiffness: 320,
              damping: 14
            }} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-navy-700 text-tech shadow-[0_0_0_0_rgba(89,196,20,0)] transition-shadow group-hover:shadow-glow-green">
                  <Icon size={20} />
                </motion.span>
                <span className="text-[12.5px] font-medium leading-snug text-white">
                  {item.label}
                </span>
              </motion.li>;
        })}
        </motion.ul>
      </div>
    </section>;
}