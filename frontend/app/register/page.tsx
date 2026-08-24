'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import Link from 'next/link';
import { User, Mail, Phone, KeyRound, AlertCircle } from 'lucide-react';
import { GoldDivider } from '../../components/GoldDivider';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res: any = await api.post('/auth/register', {
        name,
        email,
        phone,
        password,
        role: 'CUSTOMER',
      });

      if (res.success) {
        login(res.data.token, res.data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <div className="bg-[#0E0E10] border border-[#D4AF37]/30 rounded-xl p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-wide">Register Account</h1>
          <p className="text-xs text-gray-400">Create a customer account for instant delivery tracking & order placement</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="input-field w-full pl-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="input-field w-full pl-9"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+18005550199"
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
            {submitting ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <GoldDivider />

        <div className="text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-[#D4AF37] hover:underline font-semibold">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
