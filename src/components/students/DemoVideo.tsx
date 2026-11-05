import React, { useEffect, useRef, useState } from 'react';
import { PlayCircleIcon, ShieldCheckIcon } from 'lucide-react';
import { site } from '../../data/site';

export const COPYRIGHT_NOTICE = `© ${new Date().getFullYear()} ${site.name}. All rights reserved.`;

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

/**
 * Demo player for a student project. Copyright-protected: visible © watermark, no download button,
 * no right-click save, no picture-in-picture. These are deterrents - a determined person can still
 * screen-record - so the legal notice below the player is the real protection.
 */
export function DemoVideo({ src, seconds, title }: {src: string;seconds: number | null;title: string;}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <section aria-label={`Demo video: ${title}`} className="glass overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 px-5 py-3.5">
        <h2 className="inline-flex items-center gap-2 font-display text-[15px] font-semibold text-white">
          <PlayCircleIcon size={17} className="text-electric" />
          Watch the demo
        </h2>
        {seconds ? <span className="font-mono text-[11px] text-silver-dark">{fmt(seconds)}</span> : null}
      </div>

      <div className="relative bg-black" onContextMenu={(e) => e.preventDefault()}>
        {failed ?
        <div className="flex aspect-video items-center justify-center p-6 text-center text-[13px] text-silver">
            The demo video could not be played. Please refresh the page or try another browser.
          </div> :

        <video
          ref={ref}
          src={src}
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onError={() => setFailed(true)}
          className="aspect-video w-full bg-black" />

        }
        {!failed &&
        <>
            <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-3 select-none rounded-md bg-black/45 px-2 py-1 font-mono text-[10px] tracking-[0.18em] text-white/80">
            
              © MOTECH
            </span>
            <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-16 left-3 select-none font-mono text-[10px] tracking-[0.18em] text-white/35">
            
              MOTECH EMBEDDED ENGINEERING · DEMO
            </span>
          </>
        }
      </div>

      <p className="flex items-start gap-2 px-5 py-4 text-[11.5px] leading-relaxed text-silver-dark">
        <ShieldCheckIcon size={14} className="mt-0.5 shrink-0 text-tech" />
        <span>
          {COPYRIGHT_NOTICE} This demo is provided for evaluation only. Copying, recording, re-uploading, sharing or
          selling this video or the project it shows, in whole or in part, without written permission from MOTECH is
          prohibited.
        </span>
      </p>
    </section>);

}
