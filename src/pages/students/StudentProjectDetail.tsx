import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, BadgeCheckIcon, Loader2Icon, ShoppingCartIcon, TagIcon } from 'lucide-react';
import { PageShell } from '../../components/store/PageShell';
import { ProjectCover } from '../../components/students/ProjectCover';
import { DemoVideo } from '../../components/students/DemoVideo';
import { formatKes } from '../../lib/accessControl';
import { studentsApi, studentsAvailable, type Project } from '../../lib/students';
import { useAuth } from '../../contexts/AuthContext';

export function StudentProjectDetail() {
  const { slug = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');

  useEffect(() => {
    let live = true;
    if (!studentsAvailable()) {
      setState('error');
      return;
    }
    studentsApi.getBySlug(slug).
    then((p) => {
      if (!live) return;
      setProject(p);
      setState(p ? 'ready' : 'missing');
    }).
    catch(() => live && setState('error'));
    return () => {
      live = false;
    };
  }, [slug]);

  const buy = () =>
  navigate(user ? `/students/checkout/${slug}` : '/login', {
    state: user ? undefined : { from: `/students/checkout/${slug}` }
  });

  return (
    <PageShell
      eyebrow="MOTECH for Engineering Students"
      title={project ? project.title : 'Project'}
      actions={
      <Link
        to="/students"
        className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 text-[13px] font-semibold text-white transition-colors hover:border-tech/50 hover:text-tech">
        
          <ArrowLeftIcon size={15} />
          All projects
        </Link>
      }>
      
      {state === 'loading' &&
      <div className="flex justify-center py-16 text-electric"><Loader2Icon className="animate-spin" size={26} /></div>
      }
      {(state === 'missing' || state === 'error') &&
      <div className="glass rounded-2xl p-12 text-center">
          <p className="font-display text-lg font-semibold text-white">
            {state === 'missing' ? 'Project not found' : 'This project could not be loaded'}
          </p>
          <p className="mt-2 text-[13.5px] text-silver">It may have been removed. Browse the other projects instead.</p>
        </div>
      }
      {state === 'ready' && project &&
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
          <div className="space-y-6">
            {project.demoVideoUrl ?
            <DemoVideo src={project.demoVideoUrl} seconds={project.demoDuration} title={project.title} /> :

            <div className="glass overflow-hidden rounded-2xl">
                <div className="aspect-[16/9] bg-navy-800">
                  <ProjectCover src={project.imageUrl} alt={project.title} />
                </div>
              </div>
            }
            <section className="glass rounded-2xl p-6">
              <h2 className="font-display text-[15px] font-semibold text-white">About this project</h2>
              <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-silver">
                {project.description || project.summary}
              </p>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24">
            <section className="glass rounded-2xl p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-silver-dark">
                {project.category} · {project.level}
              </p>
              <p className="mt-3 font-display text-3xl font-bold text-white">{formatKes(project.price)}</p>
              <button
              type="button"
              onClick={buy}
              disabled={project.status !== 'available'}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-electric px-6 py-3.5 text-sm font-semibold text-navy shadow-glow transition-colors hover:bg-electric-soft disabled:opacity-60">
              
                <ShoppingCartIcon size={16} />
                {project.status === 'available' ? user ? 'Buy now' : 'Sign in to buy' : 'Not available'}
              </button>
              <p className="mt-3 text-[12px] leading-relaxed text-silver-dark">
                Pay with card or M-Pesa on Paystack. Your download unlocks as soon as the payment is confirmed.
              </p>
              {!user &&
            <p className="mt-3 text-[12.5px] text-silver">
                  New here?{' '}
                  <Link to="/register" state={{ from: `/students/${slug}` }} className="font-semibold text-electric">
                    Create a free account
                  </Link>
                </p>
            }
            </section>

            {project.includes.length > 0 &&
          <section className="glass rounded-2xl p-6">
                <h2 className="font-display text-[15px] font-semibold text-white">What you get</h2>
                <ul className="mt-4 space-y-2.5">
                  {project.includes.map((f) =>
              <li key={f} className="flex items-start gap-2.5 text-[13px] text-white/85">
                      <BadgeCheckIcon size={15} className="mt-0.5 shrink-0 text-tech" />
                      {f}
                    </li>
              )}
                </ul>
              </section>
          }
            {project.tags.length > 0 &&
          <div className="flex flex-wrap gap-2">
                {project.tags.map((t) =>
            <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-[11.5px] text-silver">
                    <TagIcon size={11} /> {t}
                  </span>
            )}
              </div>
          }
          </aside>
        </div>
      }
    </PageShell>);

}
