import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, ChevronDown, ChevronUp, Clock, Info } from 'lucide-react';
import { RiskWarning } from '@/lib/graph/types';

interface ProactiveRiskPanelProps {
  risks: RiskWarning[];
}

export function ProactiveRiskPanel({ risks }: ProactiveRiskPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!risks || risks.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-xs text-emerald-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>All dependency buffers are healthy. No proactive layover risks detected.</span>
        </div>
      </div>
    );
  }

  const highRisks = risks.filter((r) => r.severity === 'high');

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 overflow-hidden transition-all duration-200 shadow-xs">
      {/* Bar Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
            <AlertTriangle size={16} />
          </div>
          <div>
            <span className="text-xs font-black text-amber-950">
              Proactive Risk Warning: {risks.length} Tight Layover Connections Detected
            </span>
            <span className="text-[11px] text-amber-800/80 ml-2 hidden sm:inline font-medium">
              (Flagged proactively before any flights are delayed)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300 font-bold">
            {highRisks.length} High Risk
          </span>
          <button className="text-amber-800 hover:text-amber-950 p-1">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Risk Details */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-amber-200/80 space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {risks.map((risk) => (
              <div
                key={risk.id}
                className="p-4 rounded-xl bg-white border border-amber-200 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Clock size={14} className="text-red-600" />
                    <span>{risk.fromBooking.title.split('(')[0]} ➜ {risk.toBooking.title.split('(')[0]}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                    risk.severity === 'high'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {risk.headroomMinutes}m Headroom
                  </span>
                </div>

                <p className="text-[11px] text-slate-700 leading-snug font-medium">
                  {risk.message}
                </p>

                <div className="text-[11px] text-amber-950 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-start gap-2">
                  <Info size={14} className="shrink-0 mt-0.5 text-amber-600" />
                  <span>{risk.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
