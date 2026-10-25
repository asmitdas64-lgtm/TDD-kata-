import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { Shield, LogOut, User, Warehouse } from 'lucide-react';

const navLinkClass = ({ isActive }) =>
  `flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 py-5 ${
    isActive ? 'text-white border-white font-bold' : 'text-red-100/80 border-transparent hover:text-white'
  }`;

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#4d0c11] bg-[#6e1319] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/vehicles" className="flex items-center gap-3 group min-w-0" aria-label="TDD Kata home">
          <div className="w-10 h-10 shrink-0 overflow-hidden border border-black/40 shadow-md shadow-black/40">
            <img src="/tdd-logo.png" alt="TDD Official Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="font-mono font-bold text-sm sm:text-base tracking-tight text-white truncate flex items-center gap-1.5">
              <span className="text-lime-300 font-extrabold tracking-wider">TDD&reg;</span>
              <span>Car Dealership Inventory</span>
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-5 shrink-0">
          <NavLink to="/vehicles" end className={navLinkClass}>
            <Warehouse className="w-4 h-4 text-white" />
            <span className="hidden md:inline">Showroom</span>
          </NavLink>

          {isAdmin && (
            <NavLink to="/admin/inventory" className={navLinkClass}>
              <Shield className="w-4 h-4 text-white" />
              <span className="hidden md:inline">Inventory Control</span>
            </NavLink>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3 border-l border-red-800/80 pl-4">
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-white">
                <User className="w-3.5 h-3.5 text-white" />
                <span className="text-white font-semibold max-w-[140px] truncate">{user?.name || user?.email}</span>
                {isAdmin && (
                  <span className="bg-black/35 text-lime-300 px-1.5 py-0.5 text-[10px] border border-white/20 font-bold uppercase">
                    Admin
                  </span>
                )}
              </div>
              <button
                id="logout-button"
                onClick={handleLogout}
                className="p-1.5 text-red-200 hover:text-white transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-red-800/80 pl-4">
              <Link
                to="/login"
                className="text-white hover:text-red-200 text-xs font-mono uppercase tracking-wider transition-colors font-semibold"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-black hover:bg-zinc-950 text-white text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-2 transition-colors border border-black/50 shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
