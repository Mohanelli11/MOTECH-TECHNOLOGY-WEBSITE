import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Restoring() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-[13px] text-silver" role="status">
      Restoring your session…
    </div>);

}

export function RequireAuth({ children }: {children: React.ReactNode;}) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Restoring />;
  if (!user)
  return (
    <Navigate
      to="/login"
      replace
      state={{ from: location.pathname + location.search }} />);


  return <>{children}</>;
}

export function RequireAdmin({ children }: {children: React.ReactNode;}) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Restoring />;
  if (!user)
  return (
    <Navigate
      to="/login"
      replace
      state={{ from: location.pathname + location.search }} />);


  if (!isAdmin) return <Navigate to="/portal/library" replace />;
  return <>{children}</>;
}