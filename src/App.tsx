import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { site } from './data/site';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { RequireAdmin, RequireAuth } from './components/store/RouteGuards';
import { Home } from './pages/Home';
import { Store } from './pages/Store';
import { ProductDetail } from './pages/ProductDetail';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ResetPassword } from './pages/auth/ResetPassword';
import { PortalLayout } from './pages/portal/PortalLayout';
import { Library } from './pages/portal/Library';
import { Orders } from './pages/portal/Orders';
import { Licenses } from './pages/portal/Licenses';
import { Profile } from './pages/portal/Profile';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminDocumentation } from './pages/admin/AdminDocumentation';
import { AdminCustomers } from './pages/admin/AdminCustomers';

export function App() {
  // Set the browser tab icon (favicon) and title to the MOTECH logo.
  useEffect(() => {
    const head = document.head;
    const rels = ['icon', 'shortcut icon', 'apple-touch-icon'];
    const created: HTMLLinkElement[] = [];

    rels.forEach((rel) => {
      head.
      querySelectorAll<HTMLLinkElement>(`link[rel="${rel}"]`).
      forEach((el) => el.remove());
      const link = document.createElement('link');
      link.rel = rel;
      link.type = 'image/png';
      link.href = rel === 'apple-touch-icon' ? '/apple-touch-icon.png' : '/favicon-192.png';
      head.appendChild(link);
      created.push(link);
    });

    document.title = `${site.name} — ${site.motto}`;

    return () => {
      created.forEach((el) => el.remove());
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-full w-full bg-navy font-sans text-white antialiased">
          <a
            href="#home"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-electric focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-navy">
            
            Skip to content
          </a>
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/store" element={<Store />} />
            <Route path="/store/:slug" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/checkout/:slug"
              element={
              <RequireAuth>
                  <Checkout />
                </RequireAuth>
              } />
            
            <Route
              path="/portal"
              element={
              <RequireAuth>
                  <PortalLayout />
                </RequireAuth>
              }>
              
              <Route index element={<Navigate to="/portal/library" replace />} />
              <Route path="library" element={<Library />} />
              <Route path="orders" element={<Orders />} />
              <Route path="licenses" element={<Licenses />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route
              path="/admin"
              element={
              <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }>
              
              <Route index element={<AdminOverview />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="documentation" element={<AdminDocumentation />} />
              <Route path="customers" element={<AdminCustomers />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>);

}