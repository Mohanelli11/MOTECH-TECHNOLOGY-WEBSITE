import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { About } from '../components/About';
import { Products } from '../components/Products';
import { Solutions } from '../components/Solutions';
import { Industries } from '../components/Industries';
import { EnergyDashboard } from '../components/EnergyDashboard';
import { StorePromo } from '../components/StorePromo';
import { Contact } from '../components/Contact';

export function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const el = document.querySelector(hash);
    if (el) {
      window.requestAnimationFrame(() =>
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      );
    }
  }, [hash]);

  return (
    <main>
      <Hero />
      <About />
      <Products />
      <StorePromo />
      <Solutions />
      <Industries />
      <EnergyDashboard />
      <Contact />
    </main>);

}