import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx';
import { GARAGE_BACKGROUND } from './utils/vehicleImages.js';

import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { VehicleListPage } from './pages/VehicleListPage.jsx';
import { VehicleDetailPage } from './pages/VehicleDetailPage.jsx';
import { AdminInventoryPage } from './pages/AdminInventoryPage.jsx';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="relative min-h-screen text-[#fafafa] flex flex-col font-sans selection:bg-red-600 selection:text-white">
          {/* Ambient garage canvas */}
          <div aria-hidden="true" className="fixed inset-0 -z-10 bg-[#09090b]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-60"
              style={{ backgroundImage: `url("${GARAGE_BACKGROUND}")` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/80 to-zinc-950" />
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-red-950/25 to-transparent" />
          </div>

          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/vehicles" replace />} />

              {/* Public showroom */}
              <Route path="/vehicles" element={<VehicleListPage />} />
              <Route path="/vehicles/:id" element={<VehicleDetailPage />} />

              {/* Authentication */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Admin only */}
              <Route element={<ProtectedRoute adminOnly={true} />}>
                <Route path="/admin/inventory" element={<AdminInventoryPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/vehicles" replace />} />
            </Routes>
          </main>

          <footer className="border-t border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md py-6 text-center text-xs font-mono text-zinc-500">
            <p className="uppercase tracking-widest">
              TDD Kata: Car Dealership Inventory System &bull; {new Date().getFullYear()}
            </p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
