import React from 'react';
import { AlertOctagon, ArrowRight, ShieldAlert, Sparkles, Clock } from 'lucide-react';
import { ImpactAnalysisResult } from '@/lib/graph/types';

interface ImpactBannerProps {
  impact: ImpactAnalysisResult;
  onViewRecoveryPlans: () => void;
  isLoadingPlans?: boolean;
}

export function ImpactBanner({
  impact,
  onViewRecoveryPlans,
  isLoadingPlans = false,
}: ImpactBannerProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-[#e41d2d] via-rose-600 to-red-700 p-6 sm:p-8 text-white shadow-xl shadow-red-200/50 relative overflow-hidden mb-8 animate-fadeIn border border-red-400/30">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Disruption Incident Headline */}
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-white/20 text-white border border-white/30 shrink-0">
              <AlertOctagon size={24} className="animate-pulse" />
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-widest text-red-700 bg-white px-3 py-1 rounded-full shadow-xs">
                Travel Disruption Detected
              </span>
              <span className="text-xs text-white/90">
                Logged at: {new Date(impact.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {impact.disruptedBooking.title}
          </h2>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-white/90 flex-wrap font-medium">
            <span className="flex items-center gap-1.5 text-white font-bold tabular-nums bg-black/20 px-2.5 py-0.5 rounded-lg">
              <Clock size={16} />
              +{impact.delayMinutes} min arrival delay
            </span>
            <span>•</span>
            <span>{impact.disruptedBooking.location}</span>
            <span>•</span>
            <span className="bg-amber-400 text-slate-900 font-extrabold px-2.5 py-0.5 rounded-lg shadow-xs">
              {impact.impactedNodes.length} Downstream Bookings Cascade-Impacted
            </span>
          </div>
        </div>

        {/* Right: Primary Call To Action */}
        <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={onViewRecoveryPlans}
            disabled={isLoadingPlans}
            className="px-7 py-4 rounded-2xl bg-white text-red-600 hover:bg-slate-100 font-black text-sm shadow-xl shadow-red-900/30 flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-70 cursor-pointer"
          >
            {isLoadingPlans ? (
              <>
                <div className="w-5 h-5 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                <span>Finding Alternative Flights & Hotels...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} className="text-amber-500" />
                <span>See AI Recovery Options</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Impact Breakdown Cards */}
      <div className="mt-6 pt-6 border-t border-white/20">
        <h4 className="text-xs font-black text-white/90 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ShieldAlert size={16} />
          Graph BFS Cascade Impacted Bookings ({impact.impactedNodes.length} Detected):
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {impact.impactedNodes.map((item, idx) => (
            <div
              key={item.bookingId}
              className="p-4 rounded-2xl bg-white text-slate-900 border border-red-100 shadow-md text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                  Ripple #{idx + 1}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${
                  item.severity === 'disrupted'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {item.severity}
                </span>
              </div>

              <div className="font-bold text-sm text-slate-900 truncate" title={item.booking.title}>
                {item.booking.title}
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
