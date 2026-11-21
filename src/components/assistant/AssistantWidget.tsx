import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, BotIcon, Loader2Icon, SendIcon, SparklesIcon, Trash2Icon, XIcon } from 'lucide-react';
import {
  askAssistant,
  isSafeSitePath,
  parseMarkdown,
  type AssistantAction,
  type ChatMessage,
  type Inline } from
'../../lib/assistant';
import { useAuth } from '../../contexts/AuthContext';

type Turn = ChatMessage & {actions?: AssistantAction[];error?: boolean;};

const STORE_KEY = 'motech.assistant.v1';
const load = (): Turn[] => {
  try {
    const v = JSON.parse(sessionStorage.getItem(STORE_KEY) ?? '[]');
    return Array.isArray(v) ? v.slice(-20) : [];
  } catch {
    return [];
  }
};
const save = (t: Turn[]) => {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(t.slice(-20)));
  } catch {/* private mode */}
};

const starters = [
'What products does MOTECH offer?',
'How do I buy a smart meter?',
'How does the students marketplace work?',
'Explain how prepaid token metering works'];


function Inlines({ parts }: {parts: Inline[];}) {
  return (
    <>
      {parts.map((p, i) =>
      p.t === 'bold' ? <strong key={i} className="font-semibold text-white">{p.v}</strong> :
      p.t === 'italic' ? <em key={i} className="italic">{p.v}</em> :
      p.t === 'code' ? <code key={i} className="rounded bg-white/10 px-1 py-0.5 font-mono text-[11.5px] text-electric">{p.v}</code> :
      <React.Fragment key={i}>{p.v}</React.Fragment>
      )}
    </>);

}

function Markdown({ text }: {text: string;}) {
  return (
    <div className="space-y-2">
      {parseMarkdown(text).map((b, i) =>
      b.type === 'ul' ?
      <ul key={i} className="list-disc space-y-1 pl-5 marker:text-electric">
            {b.items.map((it, j) => <li key={j}><Inlines parts={it} /></li>)}
          </ul> :

      <p key={i}><Inlines parts={b.parts} /></p>
      )}
    </div>);

}

function goTo(navigate: ReturnType<typeof useNavigate>, path: string) {
  if (!isSafeSitePath(path)) return;
  const [p, hash] = path.split('#');
  navigate(p || '/');
  if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 350);else
  window.scrollTo({ top: 0 });
}

export function AssistantWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>(load);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    save(turns.filter((t) => !t.error));
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [turns, busy, open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const history: Turn[] = [...turns.filter((t) => !t.error), { role: 'user', content: q }];
    setTurns(history);
    setInput('');
    setBusy(true);
    try {
      const { reply, actions } = await askAssistant(
        history.map(({ role, content }) => ({ role, content })),
        user
      );
      setTurns([...history, { role: 'assistant', content: reply, actions }]);
    } catch (e) {
      setTurns([...history, { role: 'assistant', content: e instanceof Error ? e.message : 'Something went wrong.', error: true }]);
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    setTurns([]);
    save([]);
  };

  return (
    <>
      {!open &&
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the MOTECH assistant"
        className="fixed bottom-5 right-4 z-[70] inline-flex items-center gap-2 rounded-full bg-electric px-4 py-3.5 text-[13px] font-semibold text-navy shadow-glow transition-colors hover:bg-electric-soft sm:right-6">
        
          <SparklesIcon size={17} />
          <span className="hidden sm:inline">Ask MOTECH</span>
        </button>
      }

      {open &&
      <div
        role="dialog"
        aria-label="MOTECH assistant"
        className="fixed inset-x-0 bottom-0 z-[80] flex h-[min(640px,100dvh)] flex-col overflow-hidden border border-white/12 bg-navy shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-6 sm:w-[400px] sm:rounded-2xl">
        
          <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-navy-800/80 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-electric/15 text-electric"><BotIcon size={18} /></span>
              <div>
                <p className="font-display text-[14px] font-semibold text-white">MOTECH Assistant</p>
                <p className="text-[11px] text-silver-dark">Products, store, students &amp; account help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {turns.length > 0 &&
            <button type="button" onClick={clear} aria-label="Clear conversation" className="rounded-full p-2 text-silver hover:bg-white/10 hover:text-white">
                  <Trash2Icon size={15} />
                </button>
            }
              <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="rounded-full p-2 text-silver hover:bg-white/10 hover:text-white">
                <XIcon size={17} />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
            {turns.length === 0 &&
          <div>
                <p className="text-[13.5px] leading-relaxed text-silver">
                  Hello{user ? `, ${user.name.split(' ')[0]}` : ''}. I can explain MOTECH’s products and specifications,
                  guide you through buying and downloads, check your orders{user?.role === 'admin' ? ', and analyse sales and customers' : ''}, and
                  take you to the right page.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {starters.map((s) =>
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-white/12 px-3.5 py-2 text-left text-[12px] text-silver transition-colors hover:border-electric/50 hover:text-electric">
                
                      {s}
                    </button>
              )}
                </div>
              </div>
          }

            {turns.map((t, i) =>
          <div key={i} className={t.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
              t.role === 'user' ?
              'bg-electric text-navy' :
              t.error ?
              'border border-red-400/30 bg-red-400/10 text-red-200' :
              'border border-white/10 bg-white/[0.04] text-silver'}`
              }>
              
                  {t.role === 'user' ? <p className="whitespace-pre-wrap">{t.content}</p> : <Markdown text={t.content} />}
                  {t.actions && t.actions.length > 0 &&
              <div className="mt-3 flex flex-wrap gap-2">
                      {t.actions.map((a) => {
                  const cls = 'inline-flex items-center gap-1.5 rounded-full border border-electric/40 bg-electric/10 px-3.5 py-2 text-[12px] font-semibold text-electric transition-colors hover:bg-electric/20';
                  return a.type === 'link' ?
                  <a key={a.href} href={a.href} target="_blank" rel="noopener noreferrer" className={cls}>
                            {a.label}
                            <ArrowRightIcon size={13} />
                          </a> :

                  <button
                    key={a.path}
                    type="button"
                    onClick={() => {
                      goTo(navigate, a.path);
                      setOpen(false);
                    }}
                    className={cls}>
                    
                            {a.label}
                            <ArrowRightIcon size={13} />
                          </button>;

                })}
                    </div>
              }
                </div>
              </div>
          )}

            {busy &&
          <div className="flex items-center gap-2 text-[12px] text-silver-dark">
                <Loader2Icon size={14} className="animate-spin text-electric" /> Thinking…
              </div>
          }
            <div ref={endRef} />
          </div>

          <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="border-t border-white/10 bg-navy-800/60 p-3">
          
            <div className="flex items-end gap-2">
              <label htmlFor="assistant-input" className="sr-only">Ask the MOTECH assistant</label>
              <textarea
              id="assistant-input"
              ref={inputRef}
              value={input}
              rows={1}
              maxLength={1000}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask a question…"
              className="max-h-28 min-h-[44px] min-w-0 flex-1 resize-none rounded-2xl border border-white/12 bg-navy-800/70 px-4 py-3 text-[13px] text-white placeholder:text-silver-dark/70 outline-none focus:border-electric/70" />
            
              <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-electric text-navy transition-colors hover:bg-electric-soft disabled:opacity-50">
              
                <SendIcon size={16} />
              </button>
            </div>
            <p className="mt-2 text-center text-[10.5px] text-silver-dark">
              Automated assistant. For quotes, refunds and critical specs, confirm with MOTECH.
            </p>
          </form>
        </div>
      }
    </>);

}
