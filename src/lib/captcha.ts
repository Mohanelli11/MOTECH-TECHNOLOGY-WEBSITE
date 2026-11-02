/**
 * Cloudflare Turnstile support. Active only when VITE_TURNSTILE_SITE_KEY is set;
 * otherwise nothing is rendered and no token is sent (Supabase CAPTCHA must then be off).
 * Tokens are single use, so the widget is reset after every attempt.
 */
export const turnstileSiteKey: string = (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '').trim();
export const captchaEnabled = turnstileSiteKey.length > 0;

let token: string | undefined;
let resetWidget: (() => void) | undefined;

export function setCaptchaToken(t: string | undefined) {
  token = t;
}
export function registerCaptchaReset(fn: (() => void) | undefined) {
  resetWidget = fn;
}
/** Token for the next auth call, or undefined when CAPTCHA is off. */
export function getCaptchaToken(): string | undefined {
  return captchaEnabled ? token : undefined;
}
/** Throws a friendly error if CAPTCHA is on and not solved yet. */
export function requireCaptcha(): string | undefined {
  if (!captchaEnabled) return undefined;
  if (!token) throw new Error('Please complete the security check and try again.');
  return token;
}
/** Call after every auth attempt: the used token is now invalid. */
export function consumeCaptcha() {
  token = undefined;
  resetWidget?.();
}
