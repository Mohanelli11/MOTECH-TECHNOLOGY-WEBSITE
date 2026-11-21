import { getSupabase } from './remote';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };
export type AssistantAction = { type: 'navigate'; path: string; label: string };

export const assistantAvailable = (): boolean => getSupabase() !== null;

/** Asks the server-side assistant. Throws an Error with a user-friendly message. */
export async function askAssistant(
messages: ChatMessage[],
path: string)
: Promise<{reply: string;actions: AssistantAction[];}> {
  const sb = getSupabase();
  if (!sb) throw new Error('The assistant is not available right now.');
  const { data, error } = await sb.functions.invoke('site-assistant', { body: { messages, path } });
  if (error) {
    let detail = '';
    try {
      const ctx = (error as {context?: Response;}).context;
      if (ctx && typeof ctx.json === 'function') detail = (await ctx.json())?.error ?? '';
    } catch {/* ignore */}
    throw new Error(detail || 'I could not reach the assistant. Please try again.');
  }
  if (!data || typeof data.reply !== 'string') throw new Error(data?.error ?? 'The assistant did not answer. Please try again.');
  const actions: AssistantAction[] = Array.isArray(data.actions) ?
  data.actions.filter((a: AssistantAction) => a && a.type === 'navigate' && isSafeSitePath(a.path)) :
  [];
  return { reply: data.reply, actions };
}

/** Defence in depth: the server already validates paths, the browser re-checks before navigating. */
export function isSafeSitePath(p: unknown): p is string {
  return typeof p === 'string' && p.startsWith('/') && !p.startsWith('//') && !/[\\\s:?@]/.test(p) && p.length <= 120;
}

/* ---- tiny, safe markdown: **bold**, `code`, "- " lists, paragraphs. Produces data, never HTML strings. ---- */
export type Inline = {t: 'text' | 'bold' | 'code';v: string;};
export type Block = {type: 'p';parts: Inline[];} | {type: 'ul';items: Inline[][];};

export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  for (const m of s.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ t: 'text', v: s.slice(last, i) });
    const tok = m[0];
    out.push(tok.startsWith('**') ? { t: 'bold', v: tok.slice(2, -2) } : { t: 'code', v: tok.slice(1, -1) });
    last = i + tok.length;
  }
  if (last < s.length) out.push({ t: 'text', v: s.slice(last) });
  return out;
}

export function parseMarkdown(src: string): Block[] {
  const blocks: Block[] = [];
  let list: Inline[][] | null = null;
  for (const raw of src.replace(/\r/g, '').split('\n')) {
    const line = raw.trim();
    const bullet = /^[-*•]\s+(.*)$/.exec(line) ?? /^\d+[.)]\s+(.*)$/.exec(line);
    if (bullet) {
      if (!list) {
        list = [];
        blocks.push({ type: 'ul', items: list });
      }
      list.push(parseInline(bullet[1]));
    } else {
      list = null;
      if (line) blocks.push({ type: 'p', parts: parseInline(line.replace(/^#{1,6}\s+/, '')) });
    }
  }
  return blocks;
}
