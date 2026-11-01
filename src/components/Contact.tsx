import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircleIcon,
  BuildingIcon,
  CheckCircle2Icon,
  Loader2Icon,
  MailIcon,
  MessageCircleIcon,
  PhoneIcon,
  SendIcon } from
'lucide-react';
import { SectionHeading } from './SectionHeading';
import { CircuitBackground } from './CircuitBackground';
import { site } from '../data/site';
import { formatEnquiry, mailtoLink, whatsappLink } from '../utils/contact';

type Status = 'idle' | 'sending' | 'sent' | 'whatsapp' | 'error';

type Fields = {name: string;email: string;subject: string;message: string;};

const empty: Fields = { name: '', email: '', subject: '', message: '' };

export function Contact() {
  const [fields, setFields] = useState<Fields>(empty);
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});

  const update = (key: keyof Fields) => (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
  {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (!fields.name.trim()) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
    next.email = 'Please enter a valid email address.';
    if (!fields.subject.trim()) next.subject = 'Please add a subject.';
    if (fields.message.trim().length < 10)
    next.message = 'Please share a little more detail (10+ characters).';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (!validate()) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    // Hand the composed enquiry to the visitor's email client, addressed to
    // the MOTECH inbox, so the message is genuinely delivered on send.
    window.location.href = mailtoLink(
      `[Website] ${fields.subject}`,
      formatEnquiry(fields)
    );
    window.setTimeout(() => setStatus('sent'), 900);
  };

  const onWhatsApp = () => {
    if (!validate()) {
      setStatus('error');
      return;
    }
    window.open(
      whatsappLink(formatEnquiry(fields)),
      '_blank',
      'noopener,noreferrer'
    );
    setStatus('whatsapp');
  };

  const inputClass = (invalid?: string) =>
  `w-full rounded-xl border bg-navy-800/70 px-4 py-3 text-[14px] text-white placeholder:text-silver-dark/70 outline-none transition-colors ${
  invalid ?
  'border-red-500/60 focus:border-red-400' :
  'border-white/12 focus:border-electric/70 focus:shadow-glow'}`;


  return (
    <section
      id="contact"
      className="relative isolate overflow-hidden border-t border-white/5 bg-navy py-24 sm:py-28">
      
      <CircuitBackground opacity={0.25} />
      <div
        aria-hidden="true"
        className="absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-tech/12 blur-[150px]" />
      

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Contact"
          title={
          <>
              Let&apos;s engineer your{' '}
              <span className="text-electric">next system</span>
            </>
          }
          body="Tell us about your site, your load, or the product you need. An engineer — not a call centre — replies." />
        

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric/10 text-electric">
                <BuildingIcon size={18} />
              </span>
              <h3 className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-silver-dark">
                Company
              </h3>
              <p className="mt-2 font-display text-[15.5px] font-semibold text-white">
                {site.name}
              </p>
              <p className="mt-1 text-[13px] text-silver">{site.motto}</p>
            </div>

            <a
              href={`mailto:${site.email}`}
              className="glass group block rounded-2xl p-6 transition-colors hover:border-electric/45">
              
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric/10 text-electric">
                <MailIcon size={18} />
              </span>
              <h3 className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-silver-dark">
                Email
              </h3>
              <p className="mt-2 break-all text-[14px] font-medium text-white transition-colors group-hover:text-electric">
                {site.email}
              </p>
            </a>

            <div className="glass rounded-2xl p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tech/10 text-tech">
                <PhoneIcon size={18} />
              </span>
              <h3 className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-silver-dark">
                Phone / WhatsApp
              </h3>
              <a
                href={whatsappLink(
                  `Hello MOTECH Embedded Engineering, I'd like to talk about your embedded and smart energy solutions.`
                )}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 inline-flex items-center gap-2 text-[14px] font-medium text-white transition-colors hover:text-tech">
                
                <MessageCircleIcon size={15} className="text-tech" />
                Chat on WhatsApp · {site.phone}
              </a>
              <a
                href={`tel:${site.phone}`}
                className="mt-2 block text-[12.5px] text-silver transition-colors hover:text-white">
                
                or call {site.phone}
              </a>
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            onSubmit={onSubmit}
            noValidate
            className="glass rounded-3xl p-6 sm:p-8">
            
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-[12.5px] font-medium text-silver">
                  
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={fields.name}
                  onChange={update('name')}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  placeholder="Jane Mwangi"
                  className={inputClass(errors.name)} />
                
                {errors.name &&
                <p id="name-error" className="mt-1.5 text-[11.5px] text-red-400">
                    {errors.name}
                  </p>
                }
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[12.5px] font-medium text-silver">
                  
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={fields.email}
                  onChange={update('email')}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  placeholder="you@company.com"
                  className={inputClass(errors.email)} />
                
                {errors.email &&
                <p id="email-error" className="mt-1.5 text-[11.5px] text-red-400">
                    {errors.email}
                  </p>
                }
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="subject"
                className="mb-2 block text-[12.5px] font-medium text-silver">
                
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                value={fields.subject}
                onChange={update('subject')}
                aria-invalid={Boolean(errors.subject)}
                aria-describedby={errors.subject ? 'subject-error' : undefined}
                placeholder="Smart energy meter deployment"
                className={inputClass(errors.subject)} />
              
              {errors.subject &&
              <p id="subject-error" className="mt-1.5 text-[11.5px] text-red-400">
                  {errors.subject}
                </p>
              }
            </div>

            <div className="mt-5">
              <label
                htmlFor="message"
                className="mb-2 block text-[12.5px] font-medium text-silver">
                
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={fields.message}
                onChange={update('message')}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'message-error' : undefined}
                placeholder="Tell us about your site, load profile or project timeline…"
                className={`${inputClass(errors.message)} resize-y`} />
              
              {errors.message &&
              <p id="message-error" className="mt-1.5 text-[11.5px] text-red-400">
                  {errors.message}
                </p>
              }
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex items-center gap-2 rounded-full bg-electric px-6 py-3.5 text-sm font-semibold text-navy shadow-glow transition-all hover:bg-electric-soft disabled:cursor-not-allowed disabled:opacity-70">
                
                {status === 'sending' ?
                <Loader2Icon size={17} className="animate-spin" /> :

                <SendIcon size={16} />
                }
                {status === 'sending' ? 'Opening email…' : 'Send Message'}
              </button>

              <button
                type="button"
                onClick={onWhatsApp}
                className="inline-flex items-center gap-2 rounded-full border border-tech/40 bg-tech/10 px-6 py-3.5 text-sm font-semibold text-tech transition-colors hover:bg-tech hover:text-navy">
                
                <MessageCircleIcon size={16} />
                Send via WhatsApp
              </button>

              <div aria-live="polite" className="text-[12.5px]">
                {status === 'sent' &&
                <span className="inline-flex items-center gap-2 text-tech">
                    <CheckCircle2Icon size={15} />
                    Your email app is open with the message addressed to{' '}
                    {site.email} — press send there.
                  </span>
                }
                {status === 'whatsapp' &&
                <span className="inline-flex items-center gap-2 text-tech">
                    <CheckCircle2Icon size={15} />
                    WhatsApp is open with your message — press send in the chat.
                  </span>
                }
                {status === 'error' && Object.keys(errors).length > 0 &&
                <span className="inline-flex items-center gap-2 text-red-400">
                    <AlertCircleIcon size={15} />
                    Please fix the highlighted fields.
                  </span>
                }
              </div>
            </div>
          </motion.form>
        </div>
      </div>
    </section>);

}