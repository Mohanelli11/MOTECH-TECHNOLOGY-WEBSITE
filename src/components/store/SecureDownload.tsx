import React, { useEffect, useState } from 'react';
import {
  DownloadIcon,
  FileLock2Icon,
  Loader2Icon,
  ShieldAlertIcon,
  TimerIcon } from
'lucide-react';
import { api } from '../../lib/accessControl';
import type { DownloadGrant, ProtectedFile } from '../../types/store';

/**
 * Requests a brokered, single-use grant then redeems it. The UI never sees or
 * constructs a resource location — only an opaque token with a countdown.
 */
export function SecureDownload({ file }: {file: ProtectedFile;}) {
  const [grant, setGrant] = useState<DownloadGrant | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [busy, setBusy] = useState<'grant' | 'redeem' | null>(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!grant) return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((grant.expiresAt - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) setGrant(null);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [grant]);

  const authorize = async () => {
    setError('');
    setDone(false);
    setBusy('grant');
    try {
      setGrant(await api.requestDownload(file.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to authorize download.');
    } finally {
      setBusy(null);
    }
  };

  const redeem = async () => {
    if (!grant) return;
    setError('');
    setBusy('redeem');
    try {
      const { fileName, body } = await api.redeemDownload(grant.token);
      const blob = new Blob([body], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      setGrant(null);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download failed.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-w-0">
      {!grant &&
      <button
        type="button"
        onClick={authorize}
        disabled={busy === 'grant'}
        className="inline-flex items-center gap-2 rounded-full bg-electric px-4 py-2 text-[12.5px] font-semibold text-navy transition-colors hover:bg-electric-soft disabled:opacity-70">
        
          {busy === 'grant' ?
        <Loader2Icon size={14} className="animate-spin" /> :

        <FileLock2Icon size={14} />
        }
          {busy === 'grant' ? 'Authorizing…' : 'Authorize download'}
        </button>
      }

      {grant &&
      <div className="flex flex-wrap items-center gap-2">
          <button
          type="button"
          onClick={redeem}
          disabled={busy === 'redeem'}
          className="inline-flex items-center gap-2 rounded-full bg-tech px-4 py-2 text-[12.5px] font-semibold text-navy transition-colors hover:bg-tech-soft disabled:opacity-70">
          
            {busy === 'redeem' ?
          <Loader2Icon size={14} className="animate-spin" /> :

          <DownloadIcon size={14} />
          }
            Download now
          </button>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-silver-dark">
            <TimerIcon size={12} />
            link expires in {remaining}s
          </span>
        </div>
      }

      {done &&
      <p className="mt-2 text-[11.5px] text-tech">
          Delivered. The link has been consumed and can’t be reused.
        </p>
      }
      {error &&
      <p className="mt-2 inline-flex items-start gap-1.5 text-[11.5px] text-red-300">
          <ShieldAlertIcon size={13} className="mt-px shrink-0" />
          {error}
        </p>
      }
    </div>);

}