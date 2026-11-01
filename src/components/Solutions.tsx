import React from "react";
import { motion } from "framer-motion";
import { BarChart3Icon, CpuIcon, FactoryIcon, HeadphonesIcon, LightbulbIcon, ShieldCheckIcon, WorkflowIcon, ZapIcon, BoxIcon } from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { whyChoose } from "../data/site";
const icons: Record<string, BoxIcon> = {
  Lightbulb: LightbulbIcon,
  Cpu: CpuIcon,
  Factory: FactoryIcon,
  ShieldCheck: ShieldCheckIcon,
  Headphones: HeadphonesIcon,
  Workflow: WorkflowIcon,
  BarChart3: BarChart3Icon,
  Zap: ZapIcon
};
export function Solutions() {
  return <section id="solutions" className="relative isolate overflow-hidden border-t border-white/5 bg-navy py-24 sm:py-28">
      <div aria-hidden="true" className="absolute -left-40 top-1/3 h-[420px] w-[420px] rounded-full bg-tech/10 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow="Solutions" title={<>
              Why choose <span className="text-tech">MOTECH</span>
            </>} body="Eight engineering commitments that carry every deployment from prototype to production-grade rollout." />

        <motion.ul initial="hidden" whileInView="show" viewport={{
        once: true,
        margin: '-70px'
      }} variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.07
          }
        }
      }} className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyChoose.map((item) => {
          const Icon = icons[item.icon] ?? CpuIcon;
          return <motion.li key={item.title} variants={{
            hidden: {
              opacity: 0,
              y: 26
            },
            show: {
              opacity: 1,
              y: 0
            }
          }} transition={{
            duration: 0.5,
            ease: 'easeOut'
          }} whileHover={{
            y: -6
          }} className="glass group relative overflow-hidden rounded-2xl p-6 transition-colors hover:border-electric/40">
                <span aria-hidden="true" className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-electric/0 blur-2xl transition-colors duration-500 group-hover:bg-electric/25" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-navy-700 text-electric transition-colors group-hover:border-electric/40 group-hover:text-tech">
                  <Icon size={19} />
                </span>
                <h3 className="relative mt-5 font-display text-[15.5px] font-semibold text-white">
                  {item.title}
                </h3>
                <p className="relative mt-2.5 text-[13px] leading-relaxed text-silver">
                  {item.body}
                </p>
              </motion.li>;
        })}
        </motion.ul>
      </div>
    </section>;
}