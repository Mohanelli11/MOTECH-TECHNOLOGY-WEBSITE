import React, { useEffect, useRef } from 'react';
import { captchaEnabled, registerCaptchaReset, setCaptchaToken, turnstileSiteKey } from '../lib/captcha';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let loading: Promise<void> | undefined;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        loading = undefined;
        reject(new Error('Turnstile failed to load'));
      };
      document.head.appendChild(s);
    });
  }
  return loading;
}

/** Renders the Cloudflare Turnstile check; renders nothing when no site key is configured. */
export function Turnstile() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!captchaEnabled) return;
    let id: string | undefined;
    let cancelled = false;
    setCaptchaToken(undefined);
    loadScript().
    then(() => {
      if (cancelled || !ref.current || !window.turnstile) return;
      id = window.turnstile.render(ref.current, {
        sitekey: turnstileSiteKey,
        theme: 'dark',
        callback: (t: string) => setCaptchaToken(t),
        'expired-callback': () => setCaptchaToken(undefined),
        'error-callback': () => setCaptchaToken(undefined)
      });
      registerCaptchaReset(() => {
        if (id && window.turnstile) window.turnstile.reset(id);
      });
    }).
    catch(() => {});
    return () => {
      cancelled = true;
      registerCaptchaReset(undefined);
      setCaptchaToken(undefined);
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, []);

  if (!captchaEnabled) return null;
  return <div ref={ref} className="flex min-h-[65px] justify-center" />;
}
