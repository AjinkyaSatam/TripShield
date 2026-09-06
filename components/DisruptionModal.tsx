import React, { useState } from 'react';
import { GraphNode } from '@/lib/graph/types';
import { AlertOctagon, X, Zap } from 'lucide-react';

interface DisruptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: GraphNode[];
  selectedBookingId?: string | null;
  onSimulate: (data: {
    bookingId: string;
    type: string;
    delayMinutes: number;
    reason: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function DisruptionModal({
  isOpen,
  onClose,
  bookings,
  selectedBookingId,
  onSimulate,
  isLoading = false,
}: DisruptionModalProps) {
  const [bookingId, setBookingId] = useState(selectedBookingId || bookings[0]?.id || '');
  const [type, setType] = useState('delay');
  const [delayMinutes, setDelayMinutes] = useState(120);
  const [reason, setReason] = useState('Severe air traffic control ground stop and runway queue at SFO');

  if (!isOpen) return null;

  const applyPreset = (preset: 'core_demo' | 'train_cancel' | 'transfer_fail') => {
    if (preset === 'core_demo') {
      const flight = bookings.find((b) => b.title.includes('DL 412')) || bookings[0];
      if (flight) setBookingId(flight.id);
      setType('delay');
      setDelayMinutes(120);
      setReason('Severe air traffic control ground stop and runway congestion at SFO');
    } else if (preset === 'train_cancel') {
      const train = bookings.find((b) => b.title.includes('Eurostar')) || bookings[0];
      if (train) setBookingId(train.id);
      setType('cancellation');
      setDelayMinutes(999999);
      setReason('Eurotunnel power grid failure causing train service suspension');
    } else if (preset === 'transfer_fail') {
      const transfer = bookings.find((b) => b.type === 'TRANSFER') || bookings[0];
      if (transfer) setBookingId(transfer.id);
      setType('delay');
      setDelayMinutes(90);
      setReason('Heathrow express signaling fault & M4 motorway gridlock');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;
    await onSimulate({
      bookingId,
      type,
      delayMinutes: Number(delayMinutes),
      reason,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl space-y-6 text-slate-900 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-red-50 text-red-600 border border-red-200 shrink-0">
            <AlertOctagon size={26} />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
              Live Disruption Simulator
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Simulate Travel Incident
            </h2>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Quick Script Presets:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => applyPreset('core_demo')}
              className="p-3 rounded-2xl bg-red-50/70 border border-red-200 hover:border-red-400 text-red-700 text-xs font-medium text-left transition-colors cursor-pointer"
            >
              <span className="block font-black text-red-800">★ Flight Delay</span>
              <span className="text-slate-600">DL 412 (+120m)</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('train_cancel')}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium text-left transition-colors cursor-pointer"
            >
              <span className="block font-black text-slate-900">Eurostar</span>
              <span className="text-slate-500">Cancellation</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('transfer_fail')}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium text-left transition-colors cursor-pointer"
            >
              <span className="block font-black text-slate-900">LHR Transit</span>
              <span className="text-slate-500">90m Jam</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="block text-slate-700 font-bold">
              Target Booking Node
            </label>
            <select
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-900 focus:outline-none focus:border-red-500 font-medium"
            >
              {bookings.map((b, i) => (
                <option key={b.id} value={b.id}>
                  Leg {i + 1}: {b.title} ({b.provider})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold">
                Disruption Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-900 focus:outline-none focus:border-red-500 font-medium"
              >
                <option value="delay">Schedule Delay</option>
                <option value="cancellation">Leg Cancellation</option>
                <option value="weather">Severe Weather</option>
                <option value="overbooking">Carrier Overbooking</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-700 font-bold">
                Delay Duration
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  disabled={type === 'cancellation'}
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(Number(e.target.value))}
                  min={15}
                  max={720}
                  step={15}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-900 focus:outline-none focus:border-red-500 tabular-nums font-semibold disabled:opacity-40"
                />
                <span className="text-slate-500 font-medium">min</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-700 font-bold">
              Operational Incident Description
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-slate-900 focus:outline-none focus:border-red-500 font-medium"
              placeholder="e.g. Ground stop at origin airport"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-[#e41d2d] hover:bg-[#c51624] text-white font-black text-sm shadow-md shadow-red-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-3 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running Graph BFS Cascade...</span>
              </>
            ) : (
              <>
                <Zap size={16} />
                <span>Simulate & Trigger Ripple Analysis</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
