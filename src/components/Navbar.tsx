import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  GraduationCapIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  LogOutIcon,
  MenuIcon,
  ShieldIcon,
  StoreIcon,
  UserIcon,
  XIcon } from
'lucide-react';
import { navLinks, site } from '../data/site';
import { useAuth } from '../contexts/AuthContext';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('#home');
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const onHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      if (!onHome) return;
      const current = navLinks.
      map((l) => ({ href: l.href, el: document.querySelector(l.href) })).
      filter((s) => s.el).
      reduce<string>((acc, s) => {
        const top = (s.el as HTMLElement).getBoundingClientRect().top;
        return top <= 140 ? s.href : acc;
      }, '#home');
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onHome]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const goToSection = (href: string) => {
    setOpen(false);
    if (onHome) {
      document.
      querySelector(href)?.
      scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate(`/${href}`);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
      scrolled || !onHome ?
      'border-b border-white/10 bg-navy/90 backdrop-blur-xl' :
      'border-b border-transparent bg-transparent'}`
      }>
      
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-navy-800">
            <img
              src={site.logo}
              alt={`${site.shortName} logo`}
              className="h-full w-full scale-[1.55] object-contain transition-transform duration-500 group-hover:scale-[1.7]" />
            
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[17px] font-extrabold tracking-tight text-white">
              MOTECH
            </span>
            <span className="block font-mono text-[9px] uppercase tracking-[0.28em] text-silver-dark">
              Embedded Eng.
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = onHome && active === link.href;
              return (
                <li key={link.href}>
                  <button
                    type="button"
                    onClick={() => goToSection(link.href)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`relative rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${
                    isActive ? 'text-white' : 'text-silver hover:text-white'}`
                    }>
                    
                    {link.label}
                    {isActive &&
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 -z-10 rounded-full border border-electric/40 bg-electric/10" />

                    }
                  </button>
                </li>);

            })}
            <li>
              <Link
                to="/students"
                className={`ml-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium transition-colors ${
                pathname.startsWith('/students') ?
                'border-electric/45 bg-electric/10 text-electric' :
                'border-white/12 text-silver hover:border-electric/40 hover:text-electric'}`
                }>
                
                <GraduationCapIcon size={14} />
                Students
              </Link>
            </li>
            <li>
              <Link
                to="/store"
                className={`ml-1 inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[13px] font-medium transition-colors ${
                pathname.startsWith('/store') ?
                'border-tech/45 bg-tech/10 text-tech' :
                'border-white/12 text-silver hover:border-tech/40 hover:text-tech'}`
                }>
                
                <StoreIcon size={14} />
                Store
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {user ?
          <div className="hidden items-center gap-2 sm:flex">
              {isAdmin ?
            <Link
              to="/admin"
              className="glass inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:border-electric/50 hover:text-electric">
              
                  <ShieldIcon size={14} />
                  Admin
                </Link> :

            <Link
              to="/portal/library"
              className="glass inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:border-electric/50 hover:text-electric">
              
                  <LibraryIcon size={14} />
                  My Library
                </Link>
            }
              <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              aria-label="Sign out"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-silver transition-colors hover:border-red-400/40 hover:text-red-300">
              
                <LogOutIcon size={15} />
              </button>
            </div> :

          <Link
            to="/login"
            className="hidden items-center gap-1.5 rounded-full border border-white/12 px-4 py-2.5 text-[13px] font-semibold text-silver transition-colors hover:border-electric/45 hover:text-white sm:inline-flex">
            
              <UserIcon size={14} />
              Sign in
            </Link>
          }

          <button
            type="button"
            onClick={() => goToSection('#contact')}
            className="hidden rounded-full bg-electric px-5 py-2.5 text-[13px] font-semibold text-navy shadow-glow transition-colors hover:bg-electric-soft lg:inline-flex">
            
            Request Demo
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white transition-colors hover:border-electric/50 hover:text-electric xl:hidden">
            
            {open ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="max-h-[calc(100vh-74px)] overflow-y-auto border-t border-white/10 bg-navy/95 backdrop-blur-xl xl:hidden">
          
            <nav aria-label="Mobile" className="px-5 py-4 sm:px-8">
              <ul className="space-y-1">
                {navLinks.map((link) =>
              <li key={link.href}>
                    <button
                  type="button"
                  onClick={() => goToSection(link.href)}
                  className="block w-full rounded-lg px-3 py-3 text-left text-[15px] font-medium text-silver transition-colors hover:bg-white/5 hover:text-white">
                  
                      {link.label}
                    </button>
                  </li>
              )}
                <li>
                  <Link
                  to="/students"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-[15px] font-medium text-electric transition-colors hover:bg-white/5">
                  
                    <GraduationCapIcon size={16} />
                    MOTECH for Engineering Students
                  </Link>
                </li>
                <li>
                  <Link
                  to="/store"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-[15px] font-medium text-tech transition-colors hover:bg-white/5">
                  
                    <StoreIcon size={16} />
                    Store & Documentation
                  </Link>
                </li>
                <li>
                  {user ?
                <Link
                  to={isAdmin ? '/admin' : '/portal/library'}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-[15px] font-medium text-silver transition-colors hover:bg-white/5 hover:text-white">
                  
                      <LayoutDashboardIcon size={16} />
                      {isAdmin ? 'Admin Portal' : 'My Library'}
                    </Link> :

                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-[15px] font-medium text-silver transition-colors hover:bg-white/5 hover:text-white">
                  
                      <UserIcon size={16} />
                      Sign in / Create account
                    </Link>
                }
                </li>
              </ul>
              <button
              type="button"
              onClick={() => goToSection('#contact')}
              className="mt-3 block w-full rounded-full bg-electric px-5 py-3 text-center text-sm font-semibold text-navy">
              
                Request Demo
              </button>
              {user &&
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
                navigate('/');
              }}
              className="mt-2 block w-full rounded-full border border-white/12 px-5 py-3 text-center text-sm font-semibold text-silver">
              
                  Sign out
                </button>
            }
            </nav>
          </motion.div>
        }
      </AnimatePresence>
    </header>);

}