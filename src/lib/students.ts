import { getSupabase } from './remote';

export type ProjectStatus = 'available' | 'draft' | 'disabled';

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  level: string;
  price: number;
  currency: 'KES';
  status: ProjectStatus;
  imageUrl: string;
  tags: string[];
  includes: string[];
  filePath: string | null;
  createdAt: string;
};

type Row = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  level: string;
  price: number | string;
  status: ProjectStatus;
  image_url: string;
  tags: string[] | null;
  includes: string[] | null;
  file_path: string | null;
  created_at: string;
};

const fromRow = (r: Row): Project => ({
  id: r.id,
  slug: r.slug,
  title: r.title,
  summary: r.summary,
  description: r.description,
  category: r.category,
  level: r.level,
  price: Number(r.price),
  currency: 'KES',
  status: r.status,
  imageUrl: r.image_url,
  tags: r.tags ?? [],
  includes: r.includes ?? [],
  filePath: r.file_path,
  createdAt: r.created_at
});

export const isProjectId = (id: string): boolean => id.startsWith('prj-');

export const studentsAvailable = (): boolean => getSupabase() !== null;

function sb() {
  const c = getSupabase();
  if (!c) throw new Error('The students marketplace is not available right now.');
  return c;
}

const fail = (e: {message?: string;} | null, fallback: string): never => {
  const m = e?.message ?? '';
  if (/duplicate key|already exists/i.test(m)) throw new Error('A project with that web address already exists. Change the title slightly.');
  if (/row-level security|permission denied/i.test(m)) throw new Error('Only the administrator can do that.');
  if (/fetch|network/i.test(m)) throw new Error('Could not reach the server. Check your connection and try again.');
  throw new Error(fallback);
};

export const slugify = (s: string): string =>
s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'project';

export const newProjectId = (): string => {
  const b = crypto.getRandomValues(new Uint8Array(5));
  return 'prj-' + Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
};

export const studentsApi = {
  /** Published projects for everyone; the administrator also gets drafts (RLS decides). */
  async list(): Promise<Project[]> {
    const { data, error } = await sb().from('student_projects').select('*').order('created_at', { ascending: false });
    if (error) fail(error, 'Could not load projects.');
    return ((data ?? []) as Row[]).map(fromRow);
  },

  async getBySlug(slug: string): Promise<Project | null> {
    const { data, error } = await sb().from('student_projects').select('*').eq('slug', slug).maybeSingle();
    if (error) fail(error, 'Could not load the project.');
    return data ? fromRow(data as Row) : null;
  },

  async save(
  p: Omit<Project, 'createdAt' | 'filePath' | 'imageUrl'> & {imageUrl?: string;filePath?: string | null;},
  files: {image?: File | null;package?: File | null;} = {})
  : Promise<void> {
    const c = sb();
    let imageUrl = p.imageUrl ?? '';
    let filePath = p.filePath ?? null;

    if (files.image) {
      const path = `${p.id}/${Date.now()}-${files.image.name.replace(/[^\w.-]+/g, '_')}`;
      const up = await c.storage.from('project-images').upload(path, files.image, { upsert: true, contentType: files.image.type });
      if (up.error) fail(up.error, 'Could not upload the cover image.');
      imageUrl = c.storage.from('project-images').getPublicUrl(path).data.publicUrl;
    }
    if (files.package) {
      const path = `${p.id}/${files.package.name.replace(/[^\w.-]+/g, '_')}`;
      const up = await c.storage.from('project-files').upload(path, files.package, { upsert: true, contentType: files.package.type || 'application/octet-stream' });
      if (up.error) fail(up.error, 'Could not upload the project package.');
      if (filePath && filePath !== path) await c.storage.from('project-files').remove([filePath]);
      filePath = path;
    }

    const { error } = await c.from('student_projects').upsert({
      id: p.id,
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      description: p.description,
      category: p.category,
      level: p.level,
      price: p.price,
      currency: 'KES',
      status: p.status,
      image_url: imageUrl,
      tags: p.tags,
      includes: p.includes,
      file_path: filePath,
      updated_at: new Date().toISOString()
    });
    if (error) fail(error, 'Could not save the project.');
  },

  async remove(p: Project): Promise<void> {
    const c = sb();
    const { error } = await c.from('student_projects').delete().eq('id', p.id);
    if (error) fail(error, 'Could not delete the project.');
    if (p.filePath) await c.storage.from('project-files').remove([p.filePath]);
  },

  /** Short-lived download link; the server checks the payment/licence first. */
  async downloadUrl(projectId: string): Promise<{url: string;filename: string;}> {
    const { data, error } = await sb().functions.invoke('project-download', { body: { projectId } });
    if (error) {
      let detail = '';
      try {
        const ctx = (error as {context?: Response;}).context;
        if (ctx && typeof ctx.json === 'function') detail = (await ctx.json())?.error ?? '';
      } catch {/* ignore */}
      throw new Error(detail || 'Could not prepare the download. Please try again.');
    }
    if (!data?.url) throw new Error(data?.error ?? 'Could not prepare the download.');
    return data as { url: string; filename: string; };
  }
};
