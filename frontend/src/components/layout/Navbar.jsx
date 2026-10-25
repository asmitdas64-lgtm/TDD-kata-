import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { Shield, LogOut, User, CarFront, Warehouse } from 'lucide-react';

const navLinkClass = ({ isActive }) =>
  `flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 py-5 ${
    isActive ? 'text-white border-red-600' : 'text-zinc-400 border-transparent hover:text-white'
  }`;

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/vehicles" className="flex items-center gap-3 group min-w-0" aria-label="TDD Kata home">
          <div className="w-9 h-9 shrink-0 bg-red-600 group-hover:bg-red-500 transition-colors flex items-center justify-center">
            <CarFront className="w-5 h-5 text-white" strokeWidth={2.25} />
          </div>
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="font-mono font-bold text-[13px] sm:text-sm tracking-tight text-zinc-100 truncate">
              <span className="text-red-500">TDD Kata:</span> Car Dealership Inventory System
            </span>
            <span className="hidden sm:block text-[10px] text-zinc-500 font-mono tracking-[0.2em] uppercase">
              Red &middot; Green &middot; Refactor
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-5 shrink-0">
          <NavLink to="/vehicles" end className={navLinkClass}>
            <Warehouse className="w-4 h-4" />
            <span className="hidden md:inline">Showroom</span>
          </NavLink>

          {isAdmin && (
            <NavLink to="/admin/inventory" className={navLinkClass}>
              <Shield className="w-4 h-4" />
              <span className="hidden md:inline">Inventory Control</span>
            </NavLink>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400">
                <User className="w-3.5 h-3.5" />
                <span className="text-zinc-200 max-w-[140px] truncate">{user?.name || user?.email}</span>
                {isAdmin && (
                  <span className="bg-red-600/15 text-red-400 px-1.5 py-0.5 text-[10px] border border-red-600/40 font-bold uppercase">
                    Admin
                  </span>
                )}
              </div>
              <button
                id="logout-button"
                onClick={handleLogout}
                className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-zinc-800 pl-4">
              <Link
                to="/login"
                className="text-zinc-300 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-semibold uppercase tracking-wider px-3.5 py-2 transition-colors"
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
