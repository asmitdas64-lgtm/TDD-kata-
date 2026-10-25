import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Navbar } from './components/layout/Navbar.jsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx';

import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { VehicleListPage } from './pages/VehicleListPage.jsx';
import { VehicleDetailPage } from './pages/VehicleDetailPage.jsx';
import { AdminInventoryPage } from './pages/AdminInventoryPage.jsx';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans selection:bg-red-600 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Default Redirect to Vehicles Showroom */}
              <Route path="/" element={<Navigate to="/vehicles" replace />} />

              {/* Public Showroom Routes */}
              <Route path="/vehicles" element={<VehicleListPage />} />
              <Route path="/vehicles/:id" element={<VehicleDetailPage />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute adminOnly={true} />}>
                <Route path="/admin/inventory" element={<AdminInventoryPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/vehicles" replace />} />
            </Routes>
          </main>

          <footer className="border-t border-zinc-900 bg-[#09090b] py-6 text-center text-xs font-mono text-zinc-600">
            <p className="uppercase tracking-widest">
              APEX AUTOMOTIVE ATELIER &copy; {new Date().getFullYear()} &bull; ALL RIGHTS RESERVED
            </p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
