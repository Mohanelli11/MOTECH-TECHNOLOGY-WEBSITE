import { site } from '../data/site';

/** Digits-only international number required by wa.me links. */
export const whatsappNumber = site.phone.replace(/[^\d]/g, '');

/** Build a WhatsApp chat link with an optional pre-filled message. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Build a mailto link to the company inbox with subject and body pre-filled. */
export function mailtoLink(subject: string, body: string): string {
  return `mailto:${site.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

/** Format a contact-form submission as a plain-text email/WhatsApp body. */
export function formatEnquiry(fields: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  return [
  `Name: ${fields.name}`,
  `Email: ${fields.email}`,
  `Subject: ${fields.subject}`,
  '',
  fields.message,
  '',
  '— Sent from the MOTECH Embedded Engineering website'].
  join('\n');
}