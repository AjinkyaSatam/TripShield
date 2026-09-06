'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, User, Building2, ArrowRight } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [tier, setTier] = useState('Diamond Shield VIP');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, password, tier }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="ambient-mesh" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-[#e41d2d] text-white flex items-center justify-center shadow-lg shadow-red-200 group-hover:scale-105 transition-transform">
            <Shield size={26} className="drop-shadow" />
          </div>
          <div className="text-left">
            <span className="text-xl font-black text-slate-900 tracking-tight block">TripShield AI</span>
            <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Traveler Registration</span>
          </div>
        </Link>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
          Create Traveler Account
        </h2>
        <p className="text-xs text-slate-500">
          Enroll in autonomous itinerary protection and multi-carrier disruption recovery.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white rounded-3xl p-7 sm:p-8 space-y-5 shadow-xl border border-slate-200">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <Shield size={16} className="text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold block">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rachel Sterling"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rachel.sterling@enterprise.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold block">Company / Organization</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 size={16} />
                </div>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Apex Global Ventures"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold block">Protection Tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-red-500 transition-colors"
              >
                <option value="Diamond Shield VIP">Diamond Shield VIP (Executive Re-routing)</option>
                <option value="Platinum Family Shield">Platinum Family Shield (Family Multi-leg)</option>
                <option value="Gold Shield Priority">Gold Shield Priority (Standard)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#e41d2d] hover:bg-[#c51624] text-white font-black text-sm shadow-lg shadow-red-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 pt-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Activate Shield</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Already registered? </span>
            <Link href="/login" className="text-red-600 font-bold hover:text-red-700 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
