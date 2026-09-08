'use client';

import React, { useState } from 'react';
import { Plane, Hotel, Car, Calendar, Ticket, Plus, Sparkles, X, IndianRupee } from 'lucide-react';

interface AddBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBooking: (bookingData: any) => Promise<void>;
  isLoading: boolean;
  tripStartDate?: string;
}

const PRESET_TEMPLATES = [
  {
    type: 'TRANSFER',
    provider: 'Blacklane VIP Chauffeur',
    title: 'Airport Transfer: LHR Terminal 5 → The Savoy',
    location: 'LHR Airport to Central London',
    cost: 11500,
    offsetStartHours: 24,
    durationHours: 1.5,
  },
  {
    type: 'HOTEL',
    provider: 'Claridge\'s London',
    title: 'Executive Suite Check-In: Claridge\'s',
    location: 'Mayfair, London',
    cost: 95000,
    offsetStartHours: 26,
    durationHours: 20,
  },
  {
    type: 'FLIGHT',
    provider: 'Air France',
    title: 'Flight LHR → CDG (AF 1681)',
    location: 'London (LHR) to Paris (CDG)',
    cost: 28500,
    offsetStartHours: 48,
    durationHours: 1.25,
  },
  {
    type: 'EVENT',
    provider: 'World Economic Forum',
    title: 'Private Investor Dinner: Le Gabriel',
    location: 'Paris, France',
    cost: 18000,
    offsetStartHours: 52,
    durationHours: 3,
  },
];

export function AddBookingModal({
  isOpen,
  onClose,
  onAddBooking,
  isLoading,
  tripStartDate,
}: AddBookingModalProps) {
  const defaultBaseDate = tripStartDate ? new Date(tripStartDate) : new Date('2026-09-16T10:00:00Z');

  const formatForInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [type, setType] = useState<'FLIGHT' | 'HOTEL' | 'TRANSFER' | 'EVENT' | 'ACTIVITY'>('TRANSFER');
  const [provider, setProvider] = useState('Uber Black Executive');
  const [title, setTitle] = useState('VIP Chauffeur Transfer');
  const [location, setLocation] = useState('Central London');
  const [cost, setCost] = useState('9500');
  const [startTime, setStartTime] = useState(formatForInput(new Date(defaultBaseDate.getTime() + 2 * 3600 * 1000)));
  const [endTime, setEndTime] = useState(formatForInput(new Date(defaultBaseDate.getTime() + 3.5 * 3600 * 1000)));
  const [cancellationPolicy, setCancellationPolicy] = useState('Free cancellation up to 4 hours before pickup');
  const [refundable, setRefundable] = useState(true);

  if (!isOpen) return null;

  const handleApplyPreset = (template: typeof PRESET_TEMPLATES[0]) => {
    setType(template.type as any);
    setProvider(template.provider);
    setTitle(template.title);
    setLocation(template.location);
    setCost(String(template.cost));
    const start = new Date(defaultBaseDate.getTime() + template.offsetStartHours * 3600 * 1000);
    const end = new Date(start.getTime() + template.durationHours * 3600 * 1000);
    setStartTime(formatForInput(start));
    setEndTime(formatForInput(end));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddBooking({
      type,
      provider,
      title,
      location,
      cost: parseFloat(cost) || 0,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      cancellationPolicy,
      refundable,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 space-y-5 text-slate-900 relative shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-50 text-red-600 border border-red-200">
            <Plus size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
              DAG Node Insertion
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Add Custom Booking Leg
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Automatically calculate time deltas, buffer headroom, and link dependency edges.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <Sparkles size={12} className="text-amber-500" />
            <span>Quick Fill Templates:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {PRESET_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyPreset(tpl)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
              >
                {tpl.title.split(':')[0]}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Category Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Booking Category
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'FLIGHT', label: 'Flight', icon: Plane },
                { id: 'HOTEL', label: 'Hotel', icon: Hotel },
                { id: 'TRANSFER', label: 'Transfer', icon: Car },
                { id: 'EVENT', label: 'Event', icon: Calendar },
                { id: 'ACTIVITY', label: 'Activity', icon: Ticket },
              ].map((cat) => {
                const Icon = cat.icon;
                const isSelected = type === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setType(cat.id as any)}
                    className={`py-2 px-2 rounded-xl flex flex-col items-center gap-1 border font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#e41d2d] text-white border-red-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-[10px]">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Booking Title / Flight #
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flight DEL → LHR (AI 161)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Carrier / Provider
              </label>
              <input
                type="text"
                required
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="e.g. Air India, Taj Hotels"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 font-medium"
              />
            </div>
          </div>

          {/* Location & Cost in INR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Location / Route
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. London Heathrow (LHR)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Fare Cost in INR (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="e.g. 24500"
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Start & End Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Start Time (UTC / Local)
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                End / Arrival Time
              </label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 font-medium"
              />
            </div>
          </div>

          {/* Cancellation Policy */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Cancellation & Rebooking Policy
            </label>
            <input
              type="text"
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="refundable-check"
              checked={refundable}
              onChange={(e) => setRefundable(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <label htmlFor="refundable-check" className="text-xs text-slate-600 font-medium cursor-pointer">
              Fare is refundable / eligible for zero-deductible insurance shield
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#e41d2d] hover:bg-[#c51624] text-white font-black shadow-md shadow-red-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Inferring Topology...</span>
              ) : (
                <>
                  <Plus size={15} />
                  <span>Insert Node & Rebuild DAG</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
