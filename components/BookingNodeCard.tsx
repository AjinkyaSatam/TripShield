import React, { useState } from 'react';
import { Plane, Hotel, Car, Calendar, Ticket, ChevronDown, ChevronUp, Clock, MapPin, DollarSign, ShieldAlert, ArrowRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { GraphNode, GraphEdge } from '@/lib/graph/types';
import { formatINR } from '@/lib/format';

interface BookingNodeCardProps {
  node: GraphNode;
  outgoingEdge?: GraphEdge;
  isImpacted?: boolean;
  impactReason?: string;
  onSimulateDisruption?: (bookingId: string) => void;
  index: number;
}

export function BookingNodeCard({
  node,
  outgoingEdge,
  isImpacted,
  impactReason,
  onSimulateDisruption,
  index,
}: BookingNodeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'FLIGHT':
        return Plane;
      case 'HOTEL':
        return Hotel;
      case 'TRANSFER':
        return Car;
      case 'EVENT':
        return Calendar;
      case 'ACTIVITY':
      default:
        return Ticket;
    }
  };

  const Icon = getCategoryIcon(node.type);

  const formatTime = (d: Date | string) => {
    const date = new Date(d);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (d: Date | string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isDisrupted = node.status === 'disrupted';
  const isAtRisk = node.status === 'at_risk';
  const isRebooked = node.status === 'rebooked';

  let borderStyle = 'border-slate-200 hover:border-slate-300';
  let cardBg = 'bg-white';

  if (isDisrupted) {
    borderStyle = 'border-red-500 shadow-md shadow-red-100';
    cardBg = 'bg-red-50/30';
  } else if (isAtRisk) {
    borderStyle = 'border-amber-400 shadow-md shadow-amber-100';
    cardBg = 'bg-amber-50/30';
  } else if (isRebooked) {
    borderStyle = 'border-blue-500 shadow-md shadow-blue-100';
    cardBg = 'bg-blue-50/30';
  }

  return (
    <div className="relative group">
      {/* Node Card */}
      <div className={`rounded-2xl border transition-all duration-200 ${borderStyle} ${cardBg} shadow-xs hover:shadow-md overflow-hidden`}>
        <div className="p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Icon, Step Number, Title, Carrier */}
            <div className="flex items-start sm:items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                isDisrupted
                  ? 'bg-red-100 text-red-600 border border-red-200 animate-pulse'
                  : isAtRisk
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : isRebooked
                  ? 'bg-blue-100 text-blue-600 border border-blue-200'
                  : 'bg-red-50 text-red-600 border border-red-100'
              }`}>
                <Icon size={22} />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                    Leg #{index + 1}
                  </span>
                  <span className="text-xs text-red-600 font-bold tracking-wider uppercase font-mono">
                    {node.provider}
                  </span>
                  <StatusBadge status={node.status} size="sm" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {node.title}
                </h3>
              </div>
            </div>

            {/* Right: Times, Locations, Toggle */}
            <div className="flex items-center justify-between lg:justify-end gap-5">
              <div className="text-left lg:text-right">
                <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-900 font-mono">
                  <Clock size={15} className="text-red-600 shrink-0" />
                  <span>{formatTime(node.startTime)} – {formatTime(node.endTime)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 lg:justify-end mt-1 font-medium">
                  <MapPin size={13} className="text-slate-400" />
                  <span>{node.location}</span>
                  <span className="text-slate-300">•</span>
                  <span>{formatDate(node.startTime)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                  aria-label="Toggle details"
                >
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Impact Banner Warning */}
          {impactReason && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-800 animate-fadeIn">
              <ShieldAlert size={18} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-900 uppercase tracking-wide mr-1.5">Cascading Impact:</span>
                <span>{impactReason}</span>
              </div>
            </div>
          )}

          {/* Expandable Progressive Disclosure Drawer */}
          {isExpanded && (
            <div className="mt-5 pt-5 border-t border-slate-100 text-xs grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
              <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Policy & Cancellation
                </span>
                <p className="text-slate-800 leading-relaxed">{node.cancellationPolicy}</p>
                <div className="pt-1">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    node.refundable
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {node.refundable ? 'Fully Refundable' : 'Non-Refundable'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px]">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-sans">
                  Booking Specifications
                </span>
                {node.details ? (
                  <div className="space-y-1 text-slate-700">
                    {node.details.flightNumber && <div>Flight Code: <strong className="text-slate-900">{node.details.flightNumber}</strong> ({node.details.aircraft})</div>}
                    {node.details.seat && <div>Cabin Seat: <strong className="text-red-600">{node.details.seat}</strong></div>}
                    {node.details.roomType && <div>Accommodation: <strong className="text-slate-900">{node.details.roomType}</strong></div>}
                    {node.details.service && <div>Service Spec: <strong className="text-slate-900">{node.details.service}</strong></div>}
                    {node.details.venue && <div>Venue: <strong className="text-slate-900">{node.details.venue}</strong></div>}
                  </div>
                ) : (
                  <p className="text-slate-500 font-sans">Active reservation confirmed with provider</p>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Recorded Cost
                  </span>
                  <span className="text-xl font-black text-slate-900 font-mono flex items-center gap-0.5 mt-0.5">
                    {formatINR(node.cost)}
                  </span>
                </div>

                {onSimulateDisruption && node.status !== 'disrupted' && (
                  <button
                    onClick={() => onSimulateDisruption(node.id)}
                    className="mt-3 text-xs px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ShieldAlert size={14} />
                    <span>Simulate Delay Here</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Downstream Buffer Link Connector Bar */}
        {outgoingEdge && (
          <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <ArrowRight size={13} className="text-red-600" />
              <span className="capitalize font-bold text-slate-800">
                {outgoingEdge.relationType.replace(/_/g, ' ')}
              </span>
              <span className="text-slate-500">
                Slack: <strong className={`font-mono ${
                  outgoingEdge.bufferMinutes < outgoingEdge.minRequiredBufferMinutes
                    ? 'text-red-600 font-bold'
                    : outgoingEdge.bufferMinutes - outgoingEdge.minRequiredBufferMinutes <= 15
                    ? 'text-amber-600 font-bold'
                    : 'text-emerald-700 font-bold'
                }`}>{outgoingEdge.bufferMinutes}m</strong>
              </span>
            </div>

            <div className="text-slate-500 font-mono text-[11px]">
              Min Req: {outgoingEdge.minRequiredBufferMinutes}m
              {outgoingEdge.bufferMinutes < outgoingEdge.minRequiredBufferMinutes ? (
                <span className="ml-2 text-red-600 font-bold">(-{outgoingEdge.minRequiredBufferMinutes - outgoingEdge.bufferMinutes}m violation)</span>
              ) : (
                <span className="ml-2 text-emerald-600 font-bold">(+{outgoingEdge.bufferMinutes - outgoingEdge.minRequiredBufferMinutes}m headroom)</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
