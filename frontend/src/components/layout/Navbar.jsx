import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { Shield, LogOut, User, Warehouse, Flame } from 'lucide-react';

const navLinkClass = ({ isActive }) =>
  `relative flex items-center space-x-2 text-xs font-mono uppercase tracking-wider transition-all py-5 border-b-2 ${
    isActive
      ? 'text-white border-lime-400 font-bold drop-shadow-[0_0_8px_rgba(163,230,53,0.5)]'
      : 'text-red-100/75 border-transparent hover:text-white hover:border-red-400/50'
  }`;

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#4d090e] via-[#6e1219] to-[#46080d] border-b border-black/70 shadow-2xl relative overflow-hidden select-none">
      {/* 1. Cockpit Shift-Light / Rev-Limiter Hairline Strip at Top */}
      <div className="absolute top-0 inset-x-0 h-[3px] flex items-center justify-between z-20 pointer-events-none opacity-80">
        <div className="h-full w-1/3 bg-gradient-to-r from-emerald-500/50 via-amber-400/60 to-red-500" />
        <div className="h-full w-1/3 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 animate-pulse" />
        <div className="h-full w-1/3 bg-gradient-to-r from-red-600 via-amber-400/60 to-emerald-500/50" />
      </div>

      {/* 2. Micro Carbon-Weave & Racing Grille Pattern Texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.09]"
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(0,0,0,0.8) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(0,0,0,0.8) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.8) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.8) 75%)
          `,
          backgroundSize: '8px 8px'
        }}
      />

      {/* 3. Subtle Ambient Crimson Glow behind Logo */}
      <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-48 h-24 bg-red-500/20 blur-2xl rounded-full pointer-events-none" />

      {/* 4. Slanted Racing Hash Slits (Subtle Motorsport Watermark in center) */}
      <div
        aria-hidden="true"
        className="absolute right-1/4 inset-y-0 w-32 pointer-events-none opacity-[0.07] flex gap-2 -skew-x-12"
      >
        <div className="w-2.5 h-full bg-white" />
        <div className="w-2.5 h-full bg-white" />
        <div className="w-2.5 h-full bg-white" />
      </div>

      {/* Main Bar Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 relative z-10">
        {/* Brand Lockup with Aerodynamic Chamfer */}
        <Link
          to="/vehicles"
          className="flex items-center gap-3.5 group min-w-0"
          aria-label="TDD Kata home"
        >
          {/* Logo with racing badge border and subtle forward pitch */}
          <div className="relative">
            <div className="w-10 h-10 shrink-0 overflow-hidden border border-black/60 shadow-lg shadow-black/60 group-hover:border-lime-400 transition-all duration-300 transform -skew-x-3 group-hover:scale-105">
              <img
                src="/tdd-logo.png"
                alt="TDD Official Logo"
                className="w-full h-full object-cover scale-105"
              />
            </div>
            {/* Corner neon tick */}
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-lime-400 rotate-45 border border-black pointer-events-none opacity-90" />
          </div>

          <div className="flex flex-col min-w-0 leading-none">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-sm sm:text-base tracking-tight text-white drop-shadow-sm flex items-center gap-1.5">
                <span className="text-lime-300 tracking-wider">TDD&reg;</span>
                <span className="font-extrabold uppercase tracking-tight">Car Dealership</span>
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation & Actions */}
        <nav className="flex items-center gap-6 shrink-0">
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
            <div className="flex items-center gap-3 border-l border-red-900/60 pl-4">
              <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-white">
                <div className="w-5 h-5 rounded-full bg-black/40 border border-red-400/40 flex items-center justify-center">
                  <User className="w-3 h-3 text-red-200" />
                </div>
                <span className="text-white font-semibold max-w-[130px] truncate">
                  {user?.name || user?.email}
                </span>
                {isAdmin && (
                  <span className="bg-black/50 text-lime-300 px-1.5 py-0.5 text-[9px] border border-lime-400/40 font-bold uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </div>
              <button
                id="logout-button"
                onClick={handleLogout}
                className="p-1.5 text-red-200/80 hover:text-white hover:bg-black/30 transition-all rounded"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-red-900/60 pl-4">
              <Link
                to="/login"
                className="text-white/90 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors font-semibold px-2 py-1"
              >
                Sign In
              </Link>

              {/* Cockpit Starter Button */}
              <Link
                to="/register"
                className="relative group bg-zinc-950 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-2 transition-all border border-black shadow-md hover:border-lime-400/80 hover:shadow-lime-400/10 flex items-center space-x-1.5 cursor-pointer"
              >
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full group-hover:bg-lime-400 transition-colors animate-pulse" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* 5. Bottom Carbon Splitter Hairline */}
      <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-black/80 via-red-500/40 to-black/80" />
    </header>
  );
};

export default Navbar;
