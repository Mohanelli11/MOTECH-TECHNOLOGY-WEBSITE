import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CreditCardIcon,
  DownloadIcon,
  FolderOpenIcon,
  Loader2Icon,
  SearchIcon,
  ShoppingCartIcon,
  PlayCircleIcon,
  UserPlusIcon } from
'lucide-react';
import { PageShell } from '../../components/store/PageShell';
import { ProjectCover } from '../../components/students/ProjectCover';
import { formatKes } from '../../lib/accessControl';
import { useProjects } from '../../lib/useProjects';
import { useAuth } from '../../contexts/AuthContext';
import { COPYRIGHT_NOTICE } from '../../components/students/DemoVideo';

const steps = [
{ icon: UserPlusIcon, title: 'Create your account', body: 'Free student account in under a minute.' },
{ icon: ShoppingCartIcon, title: 'Pick a project', body: 'Browse complete engineering projects.' },
{ icon: CreditCardIcon, title: 'Pay with Paystack', body: 'Card or M-Pesa, priced in KES.' },
{ icon: DownloadIcon, title: 'Download instantly', body: 'Your files unlock the moment payment is confirmed.' }];


export function StudentsHome() {
  const { projects, loading, error } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();
  const published = useMemo(() => projects.filter((p) => p.status === 'available'), [projects]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(published.map((p) => p.category)))], [published]);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const visible = published.filter((p) => {
    const q = query.trim().toLowerCase();
    return (
      (category === 'All' || p.category === category) && (
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))));

  });

  const buy = (slug: string) =>
  navigate(user ? `/students/checkout/${slug}` : '/login', {
    state: user ? undefined : { from: `/students/checkout/${slug}` }
  });

  return (
    <PageShell
      eyebrow="Marketplace"
      title={
      <>
          MOTECH for <span className="text-electric">Engineering Students</span>
        </>
      }
      body="Complete, ready-to-study engineering projects from MOTECH’s embedded-systems team. Create a free account, pay securely with Paystack, and download your project files straight away."
      actions={
      user ?
      <Link
        to="/students/my-projects"
        className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:border-tech/50 hover:text-tech">
        
            <FolderOpenIcon size={15} />
            My Projects
          </Link> :

      <Link
        to="/register"
        state={{ from: '/students' }}
        className="inline-flex items-center gap-2 rounded-full bg-electric px-5 py-3 text-[13px] font-semibold text-navy shadow-glow transition-colors hover:bg-electric-soft">
        
            <UserPlusIcon size={15} />
            Create student account
          </Link>
      }>
      
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ icon: Icon, title, body }, i) =>
        <li key={title} className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric/10 text-electric">
                <Icon size={18} />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-silver-dark">Step {i + 1}</span>
            </div>
            <h2 className="mt-4 font-display text-[15px] font-semibold text-white">{title}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-silver">{body}</p>
          </li>
        )}
      </ol>

      <div className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Project categories" className="flex flex-wrap gap-2">
          {categories.map((c) =>
          <button
            key={c}
            role="tab"
            aria-selected={category === c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full border px-4 py-2 text-[12.5px] font-medium transition-colors ${
            category === c ?
            'border-electric/45 bg-electric/10 text-electric' :
            'border-white/12 text-silver hover:border-white/25 hover:text-white'}`
            }>
            
              {c}
            </button>
          )}
        </div>
        <div className="relative w-full lg:w-72">
          <label htmlFor="project-search" className="sr-only">Search projects</label>
          <SearchIcon size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-silver-dark" />
          <input
            id="project-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="w-full rounded-full border border-white/12 bg-navy-800/70 py-2.5 pl-10 pr-4 text-[13px] text-white placeholder:text-silver-dark/70 outline-none transition-colors focus:border-electric/70" />
          
        </div>
      </div>

      {loading ?
      <div className="mt-16 flex justify-center text-electric">
          <Loader2Icon className="animate-spin" size={26} aria-label="Loading projects" />
        </div> :
      error ?
      <div className="glass mt-10 rounded-2xl p-12 text-center">
          <p className="font-display text-lg font-semibold text-white">Projects are unavailable</p>
          <p className="mt-2 text-[13.5px] text-silver">{error}</p>
        </div> :
      visible.length === 0 ?
      <div className="glass mt-10 rounded-2xl p-12 text-center">
          <p className="font-display text-lg font-semibold text-white">
            {published.length === 0 ? 'New projects are on the way' : 'No projects match that search'}
          </p>
          <p className="mt-2 text-[13.5px] text-silver">
            {published.length === 0 ?
          'Create your account now and check back soon.' :
          'Try a different keyword or clear the category filter.'}
          </p>
        </div> :

      <ul className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((p, i) =>
        <motion.li
          key={p.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: Math.min(i, 8) * 0.05 }}
          className="glass group flex flex-col overflow-hidden rounded-2xl transition-colors hover:border-electric/40">
          
              <div className="relative aspect-[16/10] overflow-hidden bg-navy-800">
                <ProjectCover src={p.imageUrl} alt={p.title} className="transition-transform duration-700 group-hover:scale-105" />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-electric/30 bg-navy/80 px-2.5 py-1 text-[11px] font-semibold text-electric backdrop-blur">
                  {p.level}
                </span>
                {p.demoVideoUrl &&
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-navy/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    <PlayCircleIcon size={12} className="text-electric" /> Demo video
                  </span>
            }
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-silver-dark">{p.category}</p>
                <h2 className="mt-2 font-display text-[16.5px] font-semibold leading-snug text-white">{p.title}</h2>
                <p className="mt-2.5 line-clamp-3 text-[13px] leading-relaxed text-silver">{p.summary}</p>
                {p.includes.length > 0 &&
            <ul className="mt-4 space-y-1.5">
                    {p.includes.slice(0, 3).map((f) =>
              <li key={f} className="flex items-start gap-2 text-[12.5px] text-white/80">
                        <BadgeCheckIcon size={13} className="mt-0.5 shrink-0 text-tech" />
                        {f}
                      </li>
              )}
                  </ul>
            }
                <div className="mt-auto pt-6">
                  <p className="font-display text-xl font-bold text-white">{formatKes(p.price)}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                  type="button"
                  onClick={() => buy(p.slug)}
                  className="inline-flex items-center gap-2 rounded-full bg-electric px-4 py-2.5 text-[12.5px] font-semibold text-navy transition-colors hover:bg-electric-soft">
                  
                      <ShoppingCartIcon size={14} />
                      Buy now
                    </button>
                    <Link
                  to={`/students/${p.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-4 py-2.5 text-[12.5px] font-semibold text-silver transition-colors hover:border-white/30 hover:text-white">
                  
                      View details
                      <ArrowRightIcon size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.li>
        )}
        </ul>
      }
      <p className="mt-14 border-t border-white/8 pt-6 text-center text-[11.5px] leading-relaxed text-silver-dark">
        {COPYRIGHT_NOTICE} All projects, demo videos, documentation and source code in this marketplace are the
        intellectual property of MOTECH and are licensed to the purchaser for personal study only. Copying, resale or
        redistribution is prohibited.
      </p>
    </PageShell>);

}
