'use client';

import React from 'react';
import { FileText, Printer, Copy, Calendar, ShieldCheck, Download } from 'lucide-react';
import { GraphNode, ImpactAnalysisResult } from '@/lib/graph/types';
import { formatINR } from '@/lib/format';

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  travelerDisplayName: string;
  travelerDisplayTier: string;
  company?: string;
  tripName?: string;
  nodes: GraphNode[];
  activeImpact: ImpactAnalysisResult | null;
  rebookedCount: number;
  showToast: (msg: string) => void;
  onExportICal?: () => void;
}

export function AuditReportModal({
  isOpen,
  onClose,
  travelerDisplayName,
  travelerDisplayTier,
  company = 'Enterprise Corp',
  tripName = 'Active Itinerary',
  nodes,
  activeImpact,
  rebookedCount,
  showToast,
  onExportICal,
}: AuditReportModalProps) {
  if (!isOpen) return null;

  const totalCost = nodes.reduce((acc, n) => acc + (n.cost || 0), 0);

  const handleCopyAuditLog = () => {
    const logContent = [
      `TRIPSHIELD RECOVERY COMPLIANCE AUDIT`,
      `===================================`,
      `Traveler: ${travelerDisplayName} (${travelerDisplayTier})`,
      `Company: ${company}`,
      `Itinerary: ${tripName}`,
      `Generated: ${new Date().toLocaleString()}`,
      `Total Bookings: ${nodes.length}`,
      `Total Fare: ${formatINR(totalCost)}`,
      `Reconciled Nodes: ${rebookedCount}`,
      `Disruption Status: ${activeImpact ? 'ACTIVE DISRUPTION' : 'PROTECTED & RESOLVED'}`,
      `Insurance Delta: Priority Shield Zero-Deductible Policy Applied`,
      `Emergency Dispatch: +91 98200 45192 (Automated Push Active)`,
    ].join('\n');

    navigator.clipboard.writeText(logContent);
    showToast('Detailed audit log copied to clipboard for expense filing.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn print:p-0 print:bg-white">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 space-y-5 text-slate-900 relative shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-2">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors print:hidden cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-50 text-red-600 border border-red-200 print:hidden">
            <FileText size={24} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
              Compliance Audit Document
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              TripShield Disruption Recovery Audit
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Official reconciliation certificate for corporate travel & insurance filing.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-700">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-medium text-slate-500">Traveler Profile:</span>
            <span className="text-slate-900 font-bold">{travelerDisplayName} ({travelerDisplayTier})</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-medium text-slate-500">Corporate Account:</span>
            <span className="text-slate-900 font-semibold">{company}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-medium text-slate-500">Active Itinerary:</span>
            <span className="text-slate-900 font-semibold">{tripName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-medium text-slate-500">Total Monitored Nodes:</span>
            <span className="text-slate-900 font-bold tabular-nums">
              {nodes.length} Bookings ({formatINR(totalCost)})
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-medium text-slate-500">Incident Recovery Status:</span>
            <span className={`font-bold ${
              activeImpact
                ? 'text-red-600'
                : rebookedCount > 0
                ? 'text-blue-600'
                : 'text-emerald-600'
            }`}>
              {activeImpact
                ? `Active Incident (${activeImpact.impactedNodes.length + 1} impacted)`
                : rebookedCount > 0
                ? `Healed (${rebookedCount} node(s) reconciled)`
                : 'Schedule Normal (Zero Disruption)'}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="font-medium text-slate-500">Emergency Dispatch:</span>
            <span className="text-slate-900 font-bold">+91 98200 45192 (Automated Push Active)</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-slate-500">Corporate Insurance Delta:</span>
            <span className="text-emerald-700 font-bold">₹0 Deductible (Priority Shield Protected)</span>
          </div>
        </div>

        {/* Reconciliation Log Details */}
        {nodes.some((n) => n.status !== 'confirmed') && (
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Incident Node Reconciliations:
            </span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {nodes
                .filter((n) => n.status !== 'confirmed')
                .map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{n.title}</span>
                      <span className="text-[11px] text-slate-500">{n.provider} • {n.location}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        n.status === 'rebooked' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {n.status}
                      </span>
                      <span className="text-[11px] font-bold text-slate-900 block tabular-nums mt-0.5">
                        {formatINR(n.cost)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2 print:hidden flex-wrap sm:flex-nowrap">
          {onExportICal && (
            <button
              onClick={onExportICal}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs border border-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="Download iCal calendar file (.ics)"
            >
              <Download size={15} />
              <span>Export .ICS</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs border border-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Printer size={15} />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={handleCopyAuditLog}
            className="flex-1 py-3 px-4 rounded-xl bg-[#e41d2d] hover:bg-[#c51624] text-white font-black text-xs shadow-md shadow-red-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Copy size={15} />
            <span>Copy Full Audit Log</span>
          </button>
        </div>
      </div>
    </div>
  );
}
