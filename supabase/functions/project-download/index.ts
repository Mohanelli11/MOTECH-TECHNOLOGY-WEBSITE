// Gives a PAID customer (or the admin) a short-lived download link for a project package.
// Deploy:  supabase functions deploy project-download
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { corsHeaders } from '../_shared/paystack.ts';

Deno.serve(async (req) => {
  const cors = corsHeaders(req.headers.get('origin'));
  const reply = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }
    });
    const { data: u } = await asUser.auth.getUser();
    if (!u.user) return reply({ error: 'Please sign in to continue.' }, 401);

    const { projectId } = await req.json();
    const db = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: me } = await db.from('profiles').select('role,disabled').eq('id', u.user.id).maybeSingle();
    if (!me || me.disabled) return reply({ error: 'This account cannot download files.' }, 403);

    if (me.role !== 'admin') {
      const { data: lic } = await db.from('licenses').select('id').eq('user_id', u.user.id)
        .eq('product_id', String(projectId)).eq('status', 'active').limit(1).maybeSingle();
      if (!lic) return reply({ error: 'Purchase this project to download it.' }, 403);
    }

    const { data: project } = await db.from('student_projects').select('title,file_path').eq('id', String(projectId)).maybeSingle();
    if (!project?.file_path) return reply({ error: 'The files for this project are not uploaded yet. Please contact MOTECH.' }, 404);

    const filename = project.file_path.split('/').pop() ?? 'project.zip';
    const { data: signed, error } = await db.storage.from('project-files').createSignedUrl(project.file_path, 300, { download: filename });
    if (error || !signed) return reply({ error: 'Could not prepare the download. Please try again.' }, 500);
    return reply({ url: signed.signedUrl, filename });
  } catch (e) {
    console.error('project-download', e);
    return reply({ error: 'Could not prepare the download. Please try again.' }, 500);
  }
});
