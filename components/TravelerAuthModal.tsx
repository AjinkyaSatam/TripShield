import React, { useState } from 'react';
import { Shield, Check, ArrowRight, X, Lock } from 'lucide-react';

export interface TravelerProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  tier: string;
  avatarBg: string;
  badge: string;
  company?: string;
}

export const PRESET_TRAVELERS: TravelerProfile[] = [
  {
    id: 'traveler_alex_mercer',
    name: 'Alex Mercer',
    email: 'alex.mercer@stratos-ai.com',
    role: 'Solo Executive Traveler',
    tier: 'Diamond Shield VIP',
    avatarBg: 'bg-[#e41d2d] text-white',
    badge: 'Executive Fast-Track',
    company: 'Stratos AI Corp',
  },
  {
    id: 'traveler_elena_rostova',
    name: 'Elena Rostova',
    email: 'elena.rostova@familytravel.io',
    role: 'Family Leisure Traveler',
    tier: 'Platinum Family Shield',
    avatarBg: 'bg-emerald-600 text-white',
    badge: 'Family Multi-Leg',
    company: 'Private Family Itinerary',
  },
  {
    id: 'traveler_marcus_vance',
    name: 'Marcus Vance',
    email: 'marcus.vance@techsummit.org',
    role: 'Group & Event Coordinator',
    tier: 'Gold Shield Priority',
    avatarBg: 'bg-amber-600 text-white',
    badge: 'Multi-Seat Group',
    company: 'Global Tech Summits',
  },
];

interface TravelerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTraveler: TravelerProfile;
  onSelectTraveler: (traveler: TravelerProfile) => void;
}

export function TravelerAuthModal({
  isOpen,
  onClose,
  currentTraveler,
  onSelectTraveler,
}: TravelerAuthModalProps) {
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const newProfile: TravelerProfile = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      email: customEmail.trim() || `${customName.toLowerCase().replace(/\s+/g, '.')}@tripshield.ai`,
      role: 'Custom Traveler',
      tier: 'TripShield Member',
      avatarBg: 'bg-red-600 text-white',
      badge: 'Protected',
    };
    onSelectTraveler(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl p-7 sm:p-8 space-y-6 text-slate-900 relative shadow-2xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#e41d2d] flex items-center justify-center shadow-lg shadow-red-200">
            <Shield size={30} className="text-white" />
          </div>
          <div>
            <span className="text-[11px] font-black tracking-widest text-red-600 uppercase bg-red-50 px-3 py-1 rounded-full border border-red-200">
              TripShield Traveler Identity
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
              Select Demo Traveler Profile
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Switch traveler profiles to test live dependency graph healing under various trip constraints.
            </p>
          </div>
        </div>

        {/* Personas List */}
        {!isCustomMode ? (
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Choose Persona:
            </span>
            {PRESET_TRAVELERS.map((t) => {
              const isSelected = currentTraveler.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectTraveler(t);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group ${
                    isSelected
                      ? 'bg-red-50/60 border-red-500 shadow-sm ring-1 ring-red-500/30'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl ${t.avatarBg} flex items-center justify-center font-bold text-base shadow-xs`}>
                      {t.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                          {t.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {t.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">{t.role} • {t.company}</p>
                      <span className="text-[11px] text-red-600 font-bold">{t.tier}</span>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
                      <ArrowRight size={16} />
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => setIsCustomMode(true)}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-red-600 font-bold transition-colors text-center block mt-2 cursor-pointer"
            >
              Or enter custom traveler credentials →
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold block">Traveler Full Name</label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Jordan Hayes"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-bold block">Email / Corporate ID</label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="e.g. jordan.hayes@enterprise.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 rounded-xl bg-[#e41d2d] hover:bg-[#c51624] text-white font-bold transition-all shadow-md shadow-red-200 cursor-pointer"
              >
                Sign In Traveler
              </button>
            </div>
          </form>
        )}

        {/* Security & Shield Active Note */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Lock size={12} className="text-emerald-600" />
            <span>Encrypted Itinerary Sync</span>
          </div>
          <span className="text-red-600 font-bold">Autonomous AI Shield: Active</span>
        </div>
      </div>
    </div>
  );
}
