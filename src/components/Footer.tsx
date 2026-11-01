import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckIcon,
  FacebookIcon,
  GithubIcon,
  LinkedinIcon,
  MailIcon,
  MessageCircleIcon,
  PhoneIcon,
  TwitterIcon,
  YoutubeIcon } from
'lucide-react';
import { navLinks, site } from '../data/site';
import { products } from '../data/products';
import { whatsappLink } from '../utils/contact';

const quickLinks = [
{ label: 'Store & Documentation', href: '/store' },
{ label: 'My Library', href: '/portal/library' },
{ label: 'Sign in / Register', href: '/login' },
{ label: 'Request Demo', href: '/#contact' },
{ label: 'Energy Dashboard', href: '/#energy-dashboard' },
{ label: 'Industries Served', href: '/#industries' }];


const socials = [
{ label: 'LinkedIn', Icon: LinkedinIcon },
{ label: 'X', Icon: TwitterIcon },
{ label: 'Facebook', Icon: FacebookIcon },
{ label: 'YouTube', Icon: YoutubeIcon },
{ label: 'GitHub', Icon: GithubIcon }];


export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const onSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="relative isolate overflow-hidden border-t border-white/10 bg-[#050C16]">
      <div className="absolute inset-0 grid-lines opacity-40" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/60 to-transparent" />
      

      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-navy-800">
                <img
                  src={site.logo}
                  alt={`${site.shortName} logo`}
                  className="h-full w-full scale-[1.55] object-contain" />
                
              </span>
              <span className="font-display text-[17px] font-extrabold tracking-tight text-white">
                MOTECH
              </span>
            </div>
            <p className="mt-5 text-[13.5px] leading-relaxed text-silver">
              {site.name} designs intelligent embedded systems, smart energy
              technologies, IoT devices and industrial monitoring platforms.
            </p>
            <div className="mt-6 space-y-2.5">
              <a
                href={`mailto:${site.email}`}
                className="flex items-center gap-2.5 break-all text-[13px] text-silver transition-colors hover:text-electric">
                
                <MailIcon size={14} className="shrink-0 text-electric" />
                {site.email}
              </a>
              <a
                href={whatsappLink(
                  `Hello MOTECH Embedded Engineering, I'd like to make an enquiry.`
                )}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2.5 text-[13px] text-silver transition-colors hover:text-tech">
                
                <MessageCircleIcon size={14} className="shrink-0 text-tech" />
                WhatsApp {site.phone}
              </a>
              <a
                href={`tel:${site.phone}`}
                className="flex items-center gap-2.5 text-[13px] text-silver transition-colors hover:text-white">
                
                <PhoneIcon size={14} className="shrink-0 text-silver-dark" />
                Call {site.phone}
              </a>
            </div>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.24em] text-silver-dark">
              Navigation
            </h3>
            <ul className="mt-5 space-y-3">
              {navLinks.map((l) =>
              <li key={l.href}>
                  <Link
                  to={`/${l.href}`}
                  className="text-[13.5px] text-silver transition-colors hover:text-white">
                  
                    {l.label}
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.24em] text-silver-dark">
              Products
            </h3>
            <ul className="mt-5 space-y-3">
              {products.map((p) =>
              <li key={p.id}>
                  <Link
                  to="/store"
                  className="text-[13.5px] text-silver transition-colors hover:text-white">
                  
                    {p.name}
                  </Link>
                </li>
              )}
            </ul>

            <h3 className="mt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-silver-dark">
              Quick Links
            </h3>
            <ul className="mt-5 space-y-3">
              {quickLinks.map((l) =>
              <li key={l.label}>
                  <Link
                  to={l.href}
                  className="text-[13.5px] text-silver transition-colors hover:text-white">
                  
                    {l.label}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.24em] text-silver-dark">
              Newsletter
            </h3>
            <p className="mt-5 text-[13.5px] leading-relaxed text-silver">
              Product releases, firmware notes and energy engineering insights.
            </p>
            <form onSubmit={onSubscribe} className="mt-5">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSubscribed(false);
                  }}
                  placeholder="you@company.com"
                  className="w-full rounded-full border border-white/12 bg-navy-800/70 px-4 py-2.5 text-[13px] text-white placeholder:text-silver-dark/70 outline-none transition-colors focus:border-electric/70" />
                
                <button
                  type="submit"
                  className="rounded-full bg-tech px-5 py-2.5 text-[13px] font-semibold text-navy transition-colors hover:bg-tech-soft">
                  
                  Subscribe
                </button>
              </div>
              <p aria-live="polite" className="mt-2 h-4 text-[11.5px] text-tech">
                {subscribed &&
                <span className="inline-flex items-center gap-1.5">
                    <CheckIcon size={13} /> You&apos;re subscribed.
                  </span>
                }
              </p>
            </form>

            <ul className="mt-6 flex flex-wrap gap-2">
              {socials.map(({ label, Icon }) =>
              <li key={label}>
                  <a
                  href="#home"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/12 text-silver transition-colors hover:border-electric/50 hover:text-electric">
                  
                    <Icon size={15} />
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-3 border-t border-white/10 pt-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-[12.5px] text-silver-dark">
            © 2026 {site.name}. All Rights Reserved.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
            {site.motto}
          </p>
        </div>
      </div>
    </footer>);

}