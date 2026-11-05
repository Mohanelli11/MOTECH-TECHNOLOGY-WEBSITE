import React, { useState } from 'react';
import { GraduationCapIcon, Loader2Icon, PencilIcon, PlusIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { formatKes } from '../../lib/accessControl';
import { checkDemoVideo, MAX_DEMO_SECONDS, newProjectId, slugify, studentsApi, type Project, type ProjectStatus } from '../../lib/students';
import { useProjects } from '../../lib/useProjects';

const field =
'w-full rounded-xl border border-white/12 bg-navy-800/70 px-4 py-2.5 text-[13px] text-white placeholder:text-silver-dark/70 outline-none focus:border-electric/70';

type Draft = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  level: string;
  price: string;
  status: ProjectStatus;
  tags: string;
  includes: string;
  imageUrl: string;
  filePath: string | null;
  demoVideoUrl: string;
  demoVideoPath: string | null;
  demoDuration: number | null;
  isNew: boolean;
};

const blank = (): Draft => ({
  id: newProjectId(), slug: '', title: '', summary: '', description: '', category: 'Embedded Systems',
  level: 'Final-year', price: '', status: 'draft', tags: '', includes: '', imageUrl: '', filePath: null, demoVideoUrl: '', demoVideoPath: null, demoDuration: null, isNew: true
});

const toDraft = (p: Project): Draft => ({
  id: p.id, slug: p.slug, title: p.title, summary: p.summary, description: p.description, category: p.category,
  level: p.level, price: String(p.price), status: p.status, tags: p.tags.join(', '), includes: p.includes.join('\n'),
  imageUrl: p.imageUrl, filePath: p.filePath, demoVideoUrl: p.demoVideoUrl, demoVideoPath: p.demoVideoPath, demoDuration: p.demoDuration, isNew: false
});

const statusTone: Record<ProjectStatus, string> = {
  available: 'border-tech/35 bg-tech/10 text-tech',
  draft: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  disabled: 'border-red-400/30 bg-red-400/10 text-red-300'
};

export function AdminStudents() {
  const { projects, loading, error: loadError, reload } = useProjects();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [pack, setPack] = useState<File | null>(null);
  const [demo, setDemo] = useState<File | null>(null);
  const [demoNote, setDemoNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const open = (d: Draft) => {
    setDraft(d);
    setImage(null);
    setPack(null);
    setDemo(null);
    setDemoNote('');
    setError('');
  };

  const pickDemo = async (f: File | null) => {
    setDemo(null);
    setDemoNote('');
    if (!f) return;
    try {
      const problem = await checkDemoVideo(f);
      if (problem) return setDemoNote(problem);
      setDemo(f);
      setDemoNote(`Ready: ${f.name} (${(f.size / 1048576).toFixed(1)} MB)`);
    } catch (e) {
      setDemoNote(e instanceof Error ? e.message : 'Could not read the video.');
    }
  };

  const save = async () => {
    if (!draft) return;
    const price = Number(draft.price);
    if (!draft.title.trim()) return setError('Enter a title.');
    if (!Number.isFinite(price) || price < 0) return setError('Enter a valid price in KES.');
    if (draft.status === 'available' && !draft.filePath && !pack)
    return setError('Upload the project package (a .zip) before publishing, or keep it as Draft.');
    setBusy(true);
    setError('');
    try {
      await studentsApi.save(
        {
          id: draft.id,
          slug: draft.slug || slugify(draft.title) + (draft.isNew ? '-' + draft.id.slice(4, 8) : ''),
          title: draft.title.trim(),
          summary: draft.summary.trim(),
          description: draft.description.trim(),
          category: draft.category.trim() || 'General',
          level: draft.level.trim() || 'Final-year',
          price,
          currency: 'KES',
          status: draft.status,
          tags: draft.tags.split(',').map((t) => t.trim()).filter(Boolean),
          includes: draft.includes.split('\n').map((t) => t.trim()).filter(Boolean),
          imageUrl: draft.imageUrl,
          filePath: draft.filePath,
          demoVideoUrl: draft.demoVideoUrl,
          demoVideoPath: draft.demoVideoPath,
          demoDuration: draft.demoDuration
        },
        { image, package: pack, demo }
      );
      setDraft(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p: Project) => {
    if (!window.confirm(`Delete "${p.title}"? Existing buyers' orders are kept, but the files are removed.`)) return;
    try {
      await studentsApi.remove(p);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete.');
    }
  };

  const set = (k: keyof Draft, v: string) => setDraft((d) => d ? { ...d, [k]: v } : d);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Student projects</h2>
          <p className="mt-1 text-[13px] text-silver">Add projects for the “MOTECH for Engineering Students” marketplace. Only published projects are visible to students.</p>
        </div>
        <button type="button" onClick={() => open(blank())} className="inline-flex items-center gap-2 rounded-full bg-electric px-5 py-2.5 text-[13px] font-semibold text-navy hover:bg-electric-soft">
          <PlusIcon size={15} /> Add project
        </button>
      </div>

      {(error || loadError) && !draft && <p className="mt-4 text-[13px] text-red-300">{error || loadError}</p>}

      {draft &&
      <div className="glass mt-6 rounded-2xl p-6">
          <h3 className="font-display text-[15px] font-semibold text-white">{draft.isNew ? 'New project' : 'Edit project'}</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2 text-[12px] text-silver">Title
              <input className={`${field} mt-1.5`} value={draft.title} onChange={(e) => set('title', e.target.value)} />
            </label>
            <label className="text-[12px] text-silver">Category
              <input className={`${field} mt-1.5`} value={draft.category} onChange={(e) => set('category', e.target.value)} />
            </label>
            <label className="text-[12px] text-silver">Level
              <input className={`${field} mt-1.5`} value={draft.level} onChange={(e) => set('level', e.target.value)} placeholder="e.g. Final-year" />
            </label>
            <label className="text-[12px] text-silver">Price (KES)
              <input className={`${field} mt-1.5`} inputMode="decimal" value={draft.price} onChange={(e) => set('price', e.target.value)} />
            </label>
            <label className="text-[12px] text-silver">Status
              <select className={`${field} mt-1.5`} value={draft.status} onChange={(e) => set('status', e.target.value)}>
                <option value="draft">Draft (hidden)</option>
                <option value="available">Published</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>
            <label className="md:col-span-2 text-[12px] text-silver">Short summary
              <input className={`${field} mt-1.5`} value={draft.summary} onChange={(e) => set('summary', e.target.value)} />
            </label>
            <label className="md:col-span-2 text-[12px] text-silver">Full description
              <textarea rows={5} className={`${field} mt-1.5`} value={draft.description} onChange={(e) => set('description', e.target.value)} />
            </label>
            <label className="text-[12px] text-silver">What the student gets (one per line)
              <textarea rows={4} className={`${field} mt-1.5`} value={draft.includes} onChange={(e) => set('includes', e.target.value)} placeholder={'Project report\nSource code\nCircuit diagrams'} />
            </label>
            <label className="text-[12px] text-silver">Tags (comma separated)
              <textarea rows={4} className={`${field} mt-1.5`} value={draft.tags} onChange={(e) => set('tags', e.target.value)} placeholder="IoT, ESP32, Arduino" />
            </label>
            <div className="text-[12px] text-silver">
              Cover image {draft.imageUrl && !image && <span className="text-tech">(uploaded)</span>}
              <label className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-3 text-[12.5px] hover:border-electric/50">
                <UploadIcon size={15} /> {image ? image.name : 'Choose an image (JPG/PNG)'}
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
              </label>
            </div>
            <div className="md:col-span-2 text-[12px] text-silver">
              Demo video <span className="text-silver-dark">(MP4 or WebM, maximum {MAX_DEMO_SECONDS / 60} minutes and 50 MB)</span>
              {draft.demoVideoUrl && !demo && <span className="text-tech"> (uploaded{draft.demoDuration ? `, ${Math.floor(draft.demoDuration / 60)}:${String(draft.demoDuration % 60).padStart(2, '0')}` : ''})</span>}
              <label className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-3 text-[12.5px] hover:border-electric/50">
                <UploadIcon size={15} /> {demo ? demo.name : 'Choose a demo video'}
                <input type="file" accept="video/mp4,video/webm" className="sr-only" onChange={(e) => pickDemo(e.target.files?.[0] ?? null)} />
              </label>
              {demoNote && <p className={`mt-1.5 ${demo ? 'text-tech' : 'text-red-300'}`}>{demoNote}</p>}
              {draft.demoVideoUrl && !demo && !draft.isNew &&
              <button
                type="button"
                onClick={async () => {
                  const p = projects.find((x) => x.id === draft.id);
                  if (!p || !window.confirm('Remove the demo video from this project?')) return;
                  try {
                    await studentsApi.removeDemo(p);
                    setDraft({ ...draft, demoVideoUrl: '', demoVideoPath: null, demoDuration: null });
                    await reload();
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Could not remove the video.');
                  }
                }}
                className="mt-2 text-[12px] font-semibold text-red-300 hover:underline">
                  Remove current demo video
                </button>
              }
              <p className="mt-1.5 text-silver-dark">Longer videos are rejected. Shown to students with a © watermark and copyright notice.</p>
            </div>
            <div className="text-[12px] text-silver">
              Project package {draft.filePath && !pack && <span className="text-tech">(uploaded)</span>}
              <label className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-3 text-[12.5px] hover:border-electric/50">
                <UploadIcon size={15} /> {pack ? pack.name : 'Choose the .zip students will download'}
                <input type="file" accept=".zip,.rar,.7z,.pdf" className="sr-only" onChange={(e) => setPack(e.target.files?.[0] ?? null)} />
              </label>
            </div>
          </div>
          {error && <p className="mt-4 text-[12.5px] text-red-300">{error}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-electric px-6 py-2.5 text-[13px] font-semibold text-navy hover:bg-electric-soft disabled:opacity-60">
              {busy && <Loader2Icon size={14} className="animate-spin" />} Save project
            </button>
            <button type="button" onClick={() => setDraft(null)} className="rounded-full border border-white/12 px-6 py-2.5 text-[13px] font-semibold text-silver hover:text-white">Cancel</button>
          </div>
        </div>
      }

      {loading ?
      <div className="mt-10 flex justify-center text-electric"><Loader2Icon className="animate-spin" size={24} /></div> :
      projects.length === 0 ?
      <div className="glass mt-6 rounded-2xl p-12 text-center text-[13.5px] text-silver">
          <GraduationCapIcon className="mx-auto mb-3 text-electric" size={28} />
          No projects yet. Click “Add project” to create the first one.
        </div> :

      <ul className="mt-6 space-y-3">
          {projects.map((p) =>
        <li key={p.id} className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-5">
              <div className="min-w-0">
                <p className="font-display text-[15px] font-semibold text-white">{p.title}</p>
                <p className="mt-1 text-[12px] text-silver">{p.category} · {p.level} · {formatKes(p.price)} · {p.filePath ? 'package uploaded' : 'no package yet'}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusTone[p.status]}`}>{p.status === 'available' ? 'Published' : p.status}</span>
                <button type="button" aria-label={`Edit ${p.title}`} onClick={() => open(toDraft(p))} className="rounded-full border border-white/12 p-2 text-silver hover:text-white"><PencilIcon size={14} /></button>
                <button type="button" aria-label={`Delete ${p.title}`} onClick={() => remove(p)} className="rounded-full border border-red-400/30 p-2 text-red-300 hover:bg-red-400/10"><Trash2Icon size={14} /></button>
              </div>
            </li>
        )}
        </ul>
      }
    </div>);

}
