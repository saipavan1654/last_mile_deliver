'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import Link from 'next/link';
import { Truck, KeyRound, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { GoldDivider } from '../../components/GoldDivider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res: any = await api.post('/auth/login', { email, password });
      if (res.success) {
        login(res.data.token, res.data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillQuickCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Password123!');
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <div className="bg-[#0E0E10] border border-[#D4AF37]/30 rounded-xl p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="p-3 rounded-full bg-[#141417] border border-[#D4AF37]/40 w-fit mx-auto text-[#D4AF37]">
            <Truck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Sign In to Platform</h1>
          <p className="text-xs text-gray-400">Access Customer, Agent, or Admin Logistics Portal</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="input-field w-full pl-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field w-full pl-9"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#D4AF37] hover:bg-[#F0C75E] text-black font-bold py-2.5 rounded-md transition-all shadow-md text-sm disabled:opacity-50 mt-2"
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <GoldDivider />

        {/* DEMO QUICK PRESET BUTTONS */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-[#D4AF37] font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> <span>Quick Demo Accounts (1-Click Fill)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              onClick={() => fillQuickCredentials('customer@lastmile.com')}
              className="p-2 rounded bg-[#141417] border border-gray-700 hover:border-[#D4AF37] text-left text-gray-300 transition-all"
            >
              👤 Customer
            </button>

            <button
              onClick={() => fillQuickCredentials('admin@lastmile.com')}
              className="p-2 rounded bg-[#141417] border border-gray-700 hover:border-[#D4AF37] text-left text-gray-300 transition-all"
            >
              🛡️ System Admin
            </button>

            <button
              onClick={() => fillQuickCredentials('agent1@lastmile.com')}
              className="p-2 rounded bg-[#141417] border border-gray-700 hover:border-[#D4AF37] text-left text-gray-300 transition-all"
            >
              🚚 Agent (Zone A)
            </button>

            <button
              onClick={() => fillQuickCredentials('agent2@lastmile.com')}
              className="p-2 rounded bg-[#141417] border border-gray-700 hover:border-[#D4AF37] text-left text-gray-300 transition-all"
            >
              🚚 Agent (Zone C)
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-[#D4AF37] hover:underline font-semibold">
            Register Customer Account
          </Link>
        </div>

      </div>
    </div>
  );
}
