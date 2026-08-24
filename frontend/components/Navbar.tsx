'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { Truck, LogOut, User as UserIcon, Shield, Package, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-[#D4AF37]/20 bg-[#080808]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#997B15] text-black font-bold">
              <Truck className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-wider text-white group-hover:text-[#D4AF37] transition-colors">
                LAST-MILE
              </span>
              <span className="block text-[10px] tracking-widest text-[#D4AF37] uppercase font-semibold">
                Delivery Tracker
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
              Home
            </Link>

            {user?.role === 'CUSTOMER' && (
              <>
                <Link href="/customer/dashboard" className="text-gray-300 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" /> Dashboard
                </Link>
                <Link href="/customer/orders/create" className="text-gray-300 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#D4AF37]" /> Create Delivery
                </Link>
              </>
            )}

            {user?.role === 'DELIVERY_AGENT' && (
              <Link href="/agent/dashboard" className="text-gray-300 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#D4AF37]" /> Agent Portal
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <>
                <Link href="/admin/dashboard" className="text-gray-300 hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4 text-[#D4AF37]" /> Admin Overview
                </Link>
                <Link href="/admin/orders" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                  Orders
                </Link>
                <Link href="/admin/zones" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                  Zones & Areas
                </Link>
                <Link href="/admin/rate-cards" className="text-gray-300 hover:text-[#D4AF37] transition-colors">
                  Rate Cards & COD
                </Link>
              </>
            )}
          </div>

          {/* User Profile / Auth Action */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <span className="block text-xs font-semibold text-white">{user.name}</span>
                  <span className="block text-[10px] text-[#D4AF37] uppercase tracking-wider font-mono">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-md bg-[#141417] text-gray-400 hover:text-red-400 hover:bg-red-950/30 border border-gray-800 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-300 hover:text-[#D4AF37] px-3 py-1.5 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold text-black bg-[#D4AF37] hover:bg-[#F0C75E] px-4 py-1.5 rounded-md transition-all shadow-md shadow-[#D4AF37]/10"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};
