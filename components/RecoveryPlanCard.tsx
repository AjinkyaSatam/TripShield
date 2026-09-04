import React, { useState } from 'react';
import { FormattedRecoveryOption, RecoveryAction } from '@/lib/recovery/types';
import { Sparkles, Check, ChevronDown, ChevronUp, DollarSign, Clock, ShieldCheck, AlertCircle, ArrowRight, Award } from 'lucide-react';
import { formatINR, formatINRDelta } from '@/lib/format';

interface RecoveryPlanCardProps {
  option: FormattedRecoveryOption;
  onApply: (optionId?: string) => void;
  isApplying?: boolean;
  isRecommended?: boolean;
}

export function RecoveryPlanCard({
  option,
  onApply,
  isApplying = false,
  isRecommended = false,
}: RecoveryPlanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTimeDelta = (mins: number) => {
    if (mins === 0) return 'On Schedule';
    const sign = mins > 0 ? '+' : '-';
    const abs = Math.abs(mins);
    const hours = Math.floor(abs / 60);
    const remMins = abs % 60;
    if (hours === 0) return `${sign}${remMins}m`;
    return `${sign}${hours}h ${remMins > 0 ? `${remMins}m` : ''}`;
  };

  const radius = 22;
  const stroke = 3.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (option.convenienceScore / 100) * circumference;

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 flex flex-col justify-between bg-white relative overflow-hidden group ${
        isRecommended
          ? 'border-red-500 shadow-xl shadow-red-100/70 ring-2 ring-red-500/20'
          : 'border-slate-200 hover:border-slate-300 shadow-md'
      }`}
    >
      {/* Top Banner for Recommended Option */}
      {isRecommended && (
        <div className="bg-gradient-to-r from-[#e41d2d] via-rose-600 to-red-600 text-white text-[11px] font-black uppercase tracking-widest py-2 px-4 text-center flex items-center justify-center gap-1.5 shadow-sm">
          <Award size={15} className="text-amber-300" />
          <span>#1 Recommended Recovery Choice</span>
        </div>
      )}

      <div className="p-6 sm:p-7 space-y-5">
        {/* Title, Rank & Radial Score Gauge */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Option #{option.rank}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                {option.itineraryDisruptionPct === 0 ? '100% Itinerary Protected' : `${Math.round((1 - option.itineraryDisruptionPct) * 100)}% Preserved`}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
              {option.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {option.description}
            </p>
          </div>

          {/* Radial Convenience Gauge */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  stroke="#f1f5f9"
                  strokeWidth={stroke}
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r={radius}
                  stroke={isRecommended ? '#e41d2d' : option.convenienceScore >= 80 ? '#10b981' : '#f59e0b'}
                  strokeWidth={stroke}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-black tabular-nums text-slate-900">
                  {option.convenienceScore}
                </span>
                <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Rationale Box */}
        <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 text-xs text-slate-800">
          <div className="flex items-start gap-2.5">
            <Sparkles size={16} className="text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold text-red-700 block text-[10px] uppercase tracking-widest">
                AI Recovery Rationale
              </span>
              <p className="italic text-slate-700 leading-relaxed text-xs">
                &ldquo;{option.rationale}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Cost Impact</span>
            <span className={`text-base font-black tabular-nums ${
              option.costDelta > 0
                ? 'text-red-600'
                : option.costDelta < 0
                ? 'text-emerald-600'
                : 'text-slate-800'
            }`}>
              {formatINRDelta(option.costDelta)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Time Drift</span>
            <span className="text-base font-black text-slate-800 tabular-nums">
              {formatTimeDelta(option.timeDelta)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Total Fare</span>
            <span className="text-base font-black text-slate-900 tabular-nums">
              {formatINR(option.totalCost)}
            </span>
          </div>
        </div>

        {/* Caveats pill */}
        {option.caveats && (
          <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
            <AlertCircle size={14} className="shrink-0 text-amber-600" />
            <span className="truncate">{option.caveats}</span>
          </div>
        )}

        {/* Expandable Step-by-Step Actions */}
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span>Included Healing Actions ({option.actions.length})</span>
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {isExpanded && (
            <div className="space-y-2 mt-2 pt-2 border-t border-slate-200 text-xs">
              {option.actions.map((act, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-blue-100 text-blue-600 mt-0.5 shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900">
                      {act.actionType.toUpperCase()}: {act.targetBookingTitle}
                    </span>
                    {act.newTitle && (
                      <p className="text-red-600 font-bold text-[11px]">➜ {act.newTitle}</p>
                    )}
                    <p className="text-slate-500 text-[11px] leading-tight">{act.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200">
        <button
          onClick={() => onApply(option.id)}
          disabled={isApplying}
          className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all duration-200 flex items-center justify-center gap-2.5 shadow-md cursor-pointer ${
            isRecommended
              ? 'bg-[#e41d2d] hover:bg-[#c51624] text-white shadow-red-200 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-slate-900 hover:bg-slate-800 text-white'
          } disabled:opacity-50`}
        >
          {isApplying ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Applying Updates & Recomputing Graph...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              <span>Apply This Recovery Plan</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
