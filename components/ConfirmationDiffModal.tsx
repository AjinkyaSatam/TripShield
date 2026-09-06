import React from 'react';
import { CheckCircle2, ArrowRight, X } from 'lucide-react';
import { formatINRDelta } from '@/lib/format';

interface ChangedBookingDiff {
  id: string;
  title: string;
  newTitle: string;
  type: string;
  previousStatus: string;
  newStatus: string;
  previousStartTime: string;
  newStartTime: string;
  costDelta: number;
  reason: string;
}

interface ConfirmationDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  diff: {
    totalCostDelta: number;
    timeDeltaMinutes: number;
    changedBookings: ChangedBookingDiff[];
  };
  planTitle: string;
}

export function ConfirmationDiffModal({
  isOpen,
  onClose,
  diff,
  planTitle,
}: ConfirmationDiffModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl space-y-6 text-slate-900 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Recovery Plan Applied Successfully
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              Itinerary Repaired & Live
            </h2>
            {planTitle && (
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Applied Plan: {planTitle}
              </p>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-center">
          <div>
            <span className="text-xs text-slate-500 font-bold block mb-1">Cost Adjustment</span>
            <span className={`text-lg font-black tabular-nums ${
              diff.totalCostDelta > 0
                ? 'text-red-600'
                : diff.totalCostDelta < 0
                ? 'text-emerald-600'
                : 'text-slate-800'
            }`}>
              {formatINRDelta(diff.totalCostDelta)}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500 font-bold block mb-1">Bookings Reconciled</span>
            <span className="text-lg font-black text-blue-600 tabular-nums">
              {diff.changedBookings.length} Node(s) Updated
            </span>
          </div>
        </div>

        {/* Diff List */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Live Dependency Changes:
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {diff.changedBookings.map((b) => (
              <div key={b.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{b.title}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black bg-blue-100 text-blue-700 border border-blue-200">
                    Rebooked
                  </span>
                </div>

                {b.newTitle !== b.title && (
                  <div className="text-red-600 flex items-center gap-1 font-bold">
                    <span>➜ Replacement:</span>
                    <span>{b.newTitle}</span>
                  </div>
                )}

                <p className="text-slate-600 text-[11px] leading-tight font-medium">
                  {b.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 px-4 rounded-xl bg-[#e41d2d] hover:bg-[#c51624] text-white font-black text-sm shadow-md shadow-red-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
        >
          <span>Return to Live Dashboard</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
