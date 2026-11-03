import { useEffect, useState } from 'react';
import { api } from './accessControl';

/**
 * Refreshes this device's copy of orders, licences and prices from the shared database on mount.
 * Returns a counter that changes once fresh data has arrived - use it as a dependency.
 */
export function useCommerceSync(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    api.
    syncCommerce().
    then(() => live && setTick((t) => t + 1)).
    catch(() => {/* offline: keep what this device already has */});
    return () => {
      live = false;
    };
  }, []);
  return tick;
}
