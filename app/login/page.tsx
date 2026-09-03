'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, Sparkles, Building2, CheckCircle2, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to switch to demo account');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="ambient-mesh" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-[#e41d2d] text-white flex items-center justify-center shadow-lg shadow-red-200 group-hover:scale-105 transition-transform">
            <Shield size={26} className="drop-shadow" />
          </div>
          <div className="text-left">
            <span className="text-xl font-black text-slate-900 tracking-tight block">TripShield AI</span>
            <span className="text-[10px] font-mono text-red-600 font-bold uppercase tracking-wider">Travel Resilience Platform</span>
          </div>
        </Link>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight pt-2">
          Traveler Sign In
        </h2>
        <p className="text-xs text-slate-500">
          Sign in to access your monitored itineraries and autonomous recovery shield.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white rounded-3xl p-7 sm:p-8 space-y-6 shadow-xl border border-slate-200">
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <Shield size={16} className="text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
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
                  placeholder="alex.mercer@stratos-ai.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 transition-colors font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-700 font-bold block">Password</label>
                <span className="text-[11px] text-slate-400">Default: Password123!</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#e41d2d] hover:bg-[#c51624] text-white font-black text-sm shadow-lg shadow-red-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts */}
          <div className="space-y-3 pt-2">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Or 1-Click Demo Accounts
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('alex.mercer@stratos-ai.com')}
                disabled={isLoading}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-red-50/60 border border-slate-200 hover:border-red-300 flex items-center justify-between text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                    AM
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block group-hover:text-red-600 transition-colors">
                      Alex Mercer (Primary Itinerary)
                    </span>
                    <span className="text-[10px] text-slate-500">Solo Executive • Diamond Shield VIP</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  Instant
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('elena.rostova@familytravel.io')}
                disabled={isLoading}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 flex items-center justify-between text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    ER
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block group-hover:text-emerald-600 transition-colors">
                      Elena Rostova (Tokyo & Kyoto)
                    </span>
                    <span className="text-[10px] text-slate-500">Family Leisure • Platinum Shield</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Instant
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('marcus.vance@techsummit.org')}
                disabled={isLoading}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 flex items-center justify-between text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
                    MV
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs block group-hover:text-amber-600 transition-colors">
                      Marcus Vance (Alps Forum)
                    </span>
                    <span className="text-[10px] text-slate-500">Group Coordinator • Gold Shield</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Instant
                </span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Don't have an account? </span>
            <Link href="/signup" className="text-red-600 font-bold hover:text-red-700 transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
