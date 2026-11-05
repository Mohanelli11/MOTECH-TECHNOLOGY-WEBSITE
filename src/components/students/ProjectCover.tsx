import React from 'react';
import { GraduationCapIcon } from 'lucide-react';

/** Cover image, or a themed placeholder when the admin has not uploaded one. */
export function ProjectCover({ src, alt, className = '' }: {src: string;alt: string;className?: string;}) {
  return src ?
  <img src={src} alt={alt} loading="lazy" className={`h-full w-full object-cover ${className}`} /> :

  <div className="relative flex h-full w-full items-center justify-center bg-navy-800">
      <div className="absolute inset-0 grid-lines opacity-60" aria-hidden="true" />
      <div className="absolute h-40 w-40 rounded-full bg-electric/15 blur-[60px]" aria-hidden="true" />
      <GraduationCapIcon size={38} className="relative text-electric" aria-label={alt} />
    </div>;

}
