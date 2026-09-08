'use client';

import React, { useState } from 'react';
import {
  Phone,
  MessageSquare,
  Shield,
  Send,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Radio,
  Sparkles,
  X,
  Copy,
} from 'lucide-react';
import { GraphNode, ImpactAnalysisResult } from '@/lib/graph/types';
import { generateICSContent, triggerICSDownload } from '@/lib/export/ical';

interface EmergencyDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  travelerName: string;
  phone?: string;
  tripName?: string;
  nodes: GraphNode[];
  impact: ImpactAnalysisResult | null;
  showToast: (msg: string) => void;
}

export function EmergencyDispatchModal({
  isOpen,
  onClose,
  travelerName,
  phone = '+91 98200 45192',
  tripName = 'European AI Summit & London Client Tour',
  nodes,
  impact,
  showToast,
}: EmergencyDispatchModalProps) {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'sms' | 'voice'>('whatsapp');
  const [livePings, setLivePings] = useState<string[]>([
    'Shield Active: Live flight telemetry radar connected to JFK ATC.',
  ]);

  if (!isOpen) return null;

  const isDisrupted = Boolean(impact);
  const impactedCount = impact ? impact.impactedNodes.length + 1 : 0;

  const handleSimulateRadarPing = () => {
    const pings = [
      `[Radar ${new Date().toLocaleTimeString()}] SFO Tower reports ground flow management +15m. Layover headroom remaining: 90m.`,
      `[Radar ${new Date().toLocaleTimeString()}] British Airways Speedbird ops confirmed gate B32 ready at LHR.`,
      `[Radar ${new Date().toLocaleTimeString()}] Weather front over North Atlantic cleared. ETA drift minimal.`,
      `[Radar ${new Date().toLocaleTimeString()}] The Savoy London confirmed Executive Suite guaranteed hold.`,
    ];
    const randomPing = pings[Math.floor(Math.random() * pings.length)];
    setLivePings((prev) => [randomPing, ...prev.slice(0, 4)]);
    showToast('Live ATC radar packet received & evaluated.');
  };

  const handleExportICS = () => {
    const icsString = generateICSContent(tripName, travelerName, nodes);
    const filename = `${tripName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_itinerary.ics`;
    triggerICSDownload(filename, icsString);
    showToast('Downloaded .ics calendar file with latest itinerary timings.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 space-y-6 text-slate-900 relative shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Radio size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Live Alert Stream & Dispatch
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {phone}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Traveler Emergency Dispatch Center
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Autonomous mobile notifications, real-time gate updates, and WhatsApp conciergerie.
            </p>
          </div>
        </div>

        {/* Channel Selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'whatsapp'
                ? 'bg-[#25D366] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare size={13} />
            <span>WhatsApp Stream</span>
          </button>

          <button
            onClick={() => setActiveTab('sms')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sms'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send size={13} />
            <span>SMS Gate Alerts</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'voice'
                ? 'bg-[#e41d2d] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Phone size={13} />
            <span>VIP Voice Hotline</span>
          </button>
        </div>

        {/* Mock Phone Message Thread */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3 font-sans">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
              Encrypted Channel • TripShield AI Bot
            </span>
          </div>

          {/* Standard Confirmation message */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#e41d2d] text-white flex items-center justify-center shrink-0 text-xs font-black shadow-xs">
              TS
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm shadow-xs max-w-md text-xs space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span>TripShield Autonomous Dispatch</span>
                <span>08:15</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Hello <strong>{travelerName}</strong>! Your itinerary for <em>{tripName}</em> is actively protected with zero-deductible disruption recovery. 11 flight, transfer, and hotel nodes monitored.
              </p>
            </div>
          </div>

          {/* Disruption Alert Message if active */}
          {isDisrupted ? (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 text-xs font-black shadow-xs animate-bounce">
                ⚠️
              </div>
              <div className="bg-red-50 border border-red-200 p-3 rounded-2xl rounded-tl-sm shadow-xs max-w-md text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-red-700 font-black">
                  <span>🚨 HIGH PRIORITY DISRUPTION ALERT</span>
                  <span>Just now</span>
                </div>
                <p className="text-red-900 font-bold leading-relaxed">
                  Cascading disruption detected on root leg: {impact?.disruptedBooking?.title || impact?.reason || 'Scheduled Leg'}. Total {impactedCount} bookings affected downstream.
                </p>
                <div className="p-2 bg-white/80 rounded-xl border border-red-200 text-[11px] text-slate-700 space-y-0.5">
                  <span className="font-bold text-red-700 block">Actions Automatically Initiated:</span>
                  <span>• The Savoy London: Auto late-arrival hold guaranteed</span><br />
                  <span>• Chauffeur: Airport transfer driver notified of schedule drift</span><br />
                  <span>• AI Rebooking Engine: 3 multi-objective recovery plans generated</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-black shadow-xs">
                ✓
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl rounded-tl-sm shadow-xs max-w-md text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold">
                  <span>Radar Health: Normal</span>
                  <span>Just now</span>
                </div>
                <p className="text-emerald-900 text-[11px] leading-relaxed">
                  All flights operating on schedule. No missed layovers detected. Layover headroom across all legs is within green thresholds.
                </p>
              </div>
            </div>
          )}

          {/* Dynamic Radar Live Pings */}
          {livePings.map((ping, idx) => (
            <div key={idx} className="flex items-start gap-2.5 opacity-90">
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 text-[10px] font-bold">
                ATC
              </div>
              <div className="bg-white border border-slate-200 p-2.5 rounded-2xl rounded-tl-sm text-[11px] text-slate-600 shadow-xs max-w-md">
                {ping}
              </div>
            </div>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap pt-1">
          <button
            onClick={handleSimulateRadarPing}
            className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>Simulate Radar Pulse</span>
          </button>

          <button
            onClick={handleExportICS}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Export Calendar (.ICS)</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `[TripShield Push Alert] Itinerary: ${tripName} | Traveler: ${travelerName} | Monitored Legs: ${nodes.length} | Status: ${isDisrupted ? 'DISRUPTION HEALING IN PROGRESS' : 'ALL LEGS NORMAL'} | Emergency Hotline: ${phone}`
              );
              showToast('Traveler dispatch brief copied to clipboard.');
            }}
            className="py-2.5 px-4 rounded-xl bg-[#e41d2d] hover:bg-[#c51624] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-200 transition-all cursor-pointer"
          >
            <Copy size={14} />
            <span>Copy Dispatch Brief</span>
          </button>
        </div>
      </div>
    </div>
  );
}
