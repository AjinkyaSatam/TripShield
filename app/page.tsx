'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Zap,
  RotateCcw,
  Sparkles,
  GitFork,
  ListFilter,
  Calendar,
  User,
  ArrowRight,
  Plane,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  ChevronDown,
  Layers,
  Activity,
  Check,
  FileText,
  Phone,
  Filter,
  Hotel,
  Car,
  Ticket,
  ExternalLink,
} from 'lucide-react';
import { GraphNode, GraphEdge, ImpactAnalysisResult, RiskWarning } from '@/lib/graph/types';
import { FormattedRecoveryOption, GeneratedRecoveryPlan } from '@/lib/recovery/types';
import { StatusBadge } from '@/components/StatusBadge';
import { BookingNodeCard } from '@/components/BookingNodeCard';
import { ItineraryGraph } from '@/components/ItineraryGraph';
import { ImpactBanner } from '@/components/ImpactBanner';
import { RecoveryPlanCard } from '@/components/RecoveryPlanCard';
import { ProactiveRiskPanel } from '@/components/ProactiveRiskPanel';
import { DisruptionModal } from '@/components/DisruptionModal';
import { ConfirmationDiffModal } from '@/components/ConfirmationDiffModal';
import { TravelerAuthModal, PRESET_TRAVELERS, TravelerProfile } from '@/components/TravelerAuthModal';

export default function TripShieldApp() {
  const router = useRouter();

  // Trips & Graph State
  const [allTrips, setAllTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [trip, setTrip] = useState<any>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [proactiveRisks, setProactiveRisks] = useState<RiskWarning[]>([]);
  const [activeImpact, setActiveImpact] = useState<ImpactAnalysisResult | null>(null);
  const [activeDisruptionId, setActiveDisruptionId] = useState<string | null>(null);
  const [recoveryPlan, setRecoveryPlan] = useState<GeneratedRecoveryPlan | null>(null);

  // User Auth Profile State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // UI Filters & View Mode
  const [viewMode, setViewMode] = useState<'timeline' | 'graph'>('timeline');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [simulateTargetId, setSimulateTargetId] = useState<string | null>(null);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [appliedDiff, setAppliedDiff] = useState<any>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Loading States
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isGeneratingPlans, setIsGeneratingPlans] = useState(false);
  const [isApplyingPlan, setIsApplyingPlan] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Error checking user session:', err);
    }
  };

  const loadTrips = async (targetTripId?: string) => {
    try {
      setIsLoadingTrip(true);
      const res = await fetch('/api/trips');
      const data = await res.json();

      if (data.success && data.trips && data.trips.length > 0) {
        setAllTrips(data.trips);
        const tripToLoad = targetTripId
          ? data.trips.find((t: any) => t.id === targetTripId) || data.trips[0]
          : data.trips[0];

        setSelectedTripId(tripToLoad.id);
        await loadTripDetails(tripToLoad.id);
      }
    } catch (err) {
      console.error('Error loading trips:', err);
    } finally {
      setIsLoadingTrip(false);
    }
  };

  const loadTripDetails = async (tripId: string) => {
    try {
      setIsLoadingTrip(true);
      const detailRes = await fetch(`/api/trips/${tripId}`);
      const detailData = await detailRes.json();

      if (detailData.success) {
        setTrip(detailData.trip);
        setNodes(detailData.graph.nodes);
        setEdges(detailData.graph.edges);
        setProactiveRisks(detailData.proactiveRisks || []);

        const activeDisrupt = detailData.trip.disruptions?.find((d: any) => d.status === 'active');
        if (activeDisrupt) {
          setActiveDisruptionId(activeDisrupt.id);
          const impactRes = await fetch(`/api/disruptions/${activeDisrupt.id}/impact`);
          const impactData = await impactRes.json();
          if (impactData.success) {
            setActiveImpact(impactData.impact);
          }
        } else {
          setActiveImpact(null);
          setActiveDisruptionId(null);
          setRecoveryPlan(null);
        }
      }
    } catch (err) {
      console.error('Error loading trip details:', err);
    } finally {
      setIsLoadingTrip(false);
    }
  };

  useEffect(() => {
    loadUser();
    loadTrips();
  }, []);

  const handleTripSwitch = (tripId: string) => {
    setSelectedTripId(tripId);
    loadTripDetails(tripId);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleResetDemo = async () => {
    try {
      setIsResetting(true);
      const res = await fetch('/api/seed/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActiveImpact(null);
        setActiveDisruptionId(null);
        setRecoveryPlan(null);
        setAppliedDiff(null);
        await loadTrips(data.trip?.id);
        showToast('Demo environment reset to initial state.');
      }
    } catch (err) {
      console.error('Error resetting demo:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSimulateDisruption = async (payload: {
    bookingId: string;
    type: string;
    delayMinutes: number;
    reason: string;
  }) => {
    try {
      setIsSimulating(true);
      const res = await fetch('/api/disruptions/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          tripId: trip?.id,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setActiveDisruptionId(data.disruptionEvent.id);
        setActiveImpact(data.impact);
        setIsSimulateModalOpen(false);
        setRecoveryPlan(null);
        await loadTripDetails(trip.id);
        showToast(`Disruption detected: ${data.impact.impactedNodes.length} downstream bookings cascade-impacted.`);
      }
    } catch (err) {
      console.error('Error simulating disruption:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleGenerateRecoveryPlans = async () => {
    if (!activeDisruptionId) return;

    try {
      setIsGeneratingPlans(true);
      const res = await fetch(`/api/disruptions/${activeDisruptionId}/recovery-plans`);
      const data = await res.json();

      if (data.success) {
        setRecoveryPlan(data.plan);
        showToast(`Recovery plans generated via ${data.source === 'claude_ai' ? 'Claude 3.5 Sonnet' : 'Autonomous Rule Engine'}.`);
        setTimeout(() => {
          document.getElementById('recovery-plans-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } catch (err) {
      console.error('Error generating recovery plans:', err);
    } finally {
      setIsGeneratingPlans(false);
    }
  };

  const handleApplyPlan = async (optionId?: string) => {
    if (!recoveryPlan) return;

    try {
      setIsApplyingPlan(true);
      const targetPlanId = recoveryPlan.id || recoveryPlan.planId;
      const res = await fetch(`/api/recovery-plans/${targetPlanId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      });
      const data = await res.json();

      if (data.success) {
        setAppliedDiff(data.diff);
        setIsDiffModalOpen(true);
        setActiveImpact(null);
        setActiveDisruptionId(null);
        setRecoveryPlan(null);
        await loadTripDetails(trip.id);
        showToast('Itinerary repaired! All cascading conflicts resolved.');
      }
    } catch (err) {
      console.error('Error applying recovery plan:', err);
    } finally {
      setIsApplyingPlan(false);
    }
  };

  const filteredNodes = nodes.filter((n) => {
    if (selectedCategoryFilter === 'ALL') return true;
    return n.type.toUpperCase() === selectedCategoryFilter;
  });

  const confirmedCount = nodes.filter((n) => n.status === 'confirmed').length;
  const atRiskCount = nodes.filter((n) => n.status === 'at_risk').length;
  const disruptedCount = nodes.filter((n) => n.status === 'disrupted').length;
  const rebookedCount = nodes.filter((n) => n.status === 'rebooked').length;

  const outgoingEdgeMap = new Map<string, GraphEdge>();
  edges.forEach((e) => outgoingEdgeMap.set(e.fromBookingId, e));

  const impactReasonMap = new Map<string, string>();
  activeImpact?.impactedNodes.forEach((n) => impactReasonMap.set(n.bookingId, n.reason));

  const travelerDisplayName = currentUser?.name || 'Alex Mercer';
  const travelerDisplayTier = currentUser?.tier || 'Diamond Shield VIP';

  return (
    <main className="min-h-screen pb-24 relative bg-[#f4f6fa] text-slate-900 font-sans">
      <div className="ambient-mesh" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#e41d2d] text-white text-xs font-bold shadow-xl flex items-center gap-2.5 animate-bounce">
          <Sparkles size={16} className="text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MakeMyTrip Style White & Red Top Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#e41d2d] text-white flex items-center justify-center shadow-md shadow-red-200 shrink-0">
              <Shield size={24} className="drop-shadow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900">TripShield</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-mono uppercase">
                  MakeMyTrip AI
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Shield Active
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">11 Nodes Monitored</span>
              </div>
            </div>
          </div>

          {/* Center Trip Selector */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-2xl text-xs font-semibold">
            <span className="text-slate-500 font-mono text-[10px] uppercase">Itinerary:</span>
            <select
              value={selectedTripId}
              onChange={(e) => handleTripSwitch(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer pr-2"
            >
              {allTrips.map((t) => (
                <option key={t.id} value={t.id} className="bg-white text-slate-900">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Audit Report */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="View & Export Disruption Recovery Audit Report"
            >
              <FileText size={14} className="text-red-600" />
              <span className="hidden sm:inline">Audit Log</span>
            </button>

            {/* Reset Demo */}
            <button
              onClick={handleResetDemo}
              disabled={isResetting}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              title="Reset itinerary and seed database"
            >
              <RotateCcw size={14} className={isResetting ? 'animate-spin' : ''} />
              <span className="hidden md:inline">Reset</span>
            </button>

            {/* Simulate Disruption Trigger */}
            <button
              onClick={() => {
                setSimulateTargetId(null);
                setIsSimulateModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#e41d2d] hover:bg-[#c51624] text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-red-200 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Zap size={14} className="fill-white" />
              <span>Simulate Disruption</span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-900 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#e41d2d] text-white flex items-center justify-center text-xs font-black shadow-xs">
                  {travelerDisplayName.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <ChevronDown size={14} className="text-slate-500 pr-1" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl p-2.5 shadow-xl border border-slate-200 z-50 text-xs space-y-1 animate-fadeIn">
                  <div className="p-2.5 border-b border-slate-100 space-y-0.5">
                    <span className="font-bold text-slate-900 block text-sm">{travelerDisplayName}</span>
                    <span className="text-[11px] text-slate-500 block truncate">{currentUser?.email || 'alex.mercer@stratos-ai.com'}</span>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-mono">
                      {travelerDisplayTier}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Switch Traveler Persona</span>
                    <User size={14} className="text-slate-400" />
                  </button>

                  <Link
                    href="/login"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-between"
                  >
                    <span>Sign In With Credentials</span>
                    <ExternalLink size={14} className="text-slate-400" />
                  </Link>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Sign Out</span>
                    <LogOut size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-7 relative z-10">
        {/* Trip Overview Hero Header */}
        {trip && (
          <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-md relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5 text-slate-900 font-bold bg-slate-100 px-2.5 py-1 rounded-full">
                    <User size={13} className="text-red-600" />
                    <span>Traveler: {travelerDisplayName}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Calendar size={13} className="text-red-600" />
                    <span>Sep 15 – Sep 18, 2026</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-red-600 font-bold font-mono">11 Connected Legs</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {trip.name}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Interdependent executive corridor: <strong className="text-slate-900">San Francisco (SFO) → New York (JFK) → London (LHR) → Paris (CDG)</strong>. Dependency edges actively safeguard connection windows, transfers, and hotel check-in cutoffs.
                </p>
              </div>

              {/* Status Summary KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center min-w-[100px]">
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700 block mb-1">
                    Confirmed
                  </span>
                  <span className="text-2xl font-black text-emerald-800 font-mono">
                    {confirmedCount}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center min-w-[100px]">
                  <span className="text-[10px] uppercase font-black tracking-wider text-amber-800 block mb-1">
                    At Risk
                  </span>
                  <span className="text-2xl font-black text-amber-800 font-mono">
                    {atRiskCount}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center min-w-[100px]">
                  <span className="text-[10px] uppercase font-black tracking-wider text-red-700 block mb-1">
                    Disrupted
                  </span>
                  <span className="text-2xl font-black text-red-700 font-mono">
                    {disruptedCount}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center min-w-[100px]">
                  <span className="text-[10px] uppercase font-black tracking-wider text-blue-700 block mb-1">
                    Rebooked
                  </span>
                  <span className="text-2xl font-black text-blue-700 font-mono">
                    {rebookedCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Screen 5: Proactive Risk Panel */}
        <ProactiveRiskPanel risks={proactiveRisks} />

        {/* Screen 2: Active Disruption Alert / BFS Cascade View */}
        {activeImpact && (
          <ImpactBanner
            impact={activeImpact}
            onViewRecoveryPlans={handleGenerateRecoveryPlans}
            isLoadingPlans={isGeneratingPlans}
          />
        )}

        {/* Screen 3: AI Recovery Plan Comparison */}
        {recoveryPlan && (
          <section id="recovery-plans-section" className="space-y-5 pt-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200">
                    <Sparkles size={18} />
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    AI Recovery Plan Comparison
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Candidate inventory ranked across cost delta, arrival drift, and downstream schedule protection.
                </p>
              </div>

              <div className="text-xs text-slate-600 flex items-center gap-2">
                <span>Ranked Engine:</span>
                <span className="font-mono text-red-700 font-bold px-3 py-1 rounded-full bg-red-50 border border-red-200">
                  {recoveryPlan.source === 'claude_ai' ? 'Claude 3.5 Sonnet' : 'Autonomous Rule Engine'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recoveryPlan.options.map((option, index) => (
                <RecoveryPlanCard
                  key={option.id || index}
                  option={option}
                  onApply={handleApplyPlan}
                  isApplying={isApplyingPlan}
                  isRecommended={option.rank === 1}
                />
              ))}
            </div>
          </section>
        )}

        {/* Screen 1: Trip Dashboard (Timeline View ↔ Graph View Toggle & Category Filters) */}
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Itinerary Navigation & Topology
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Filter by booking category or toggle between chronological timeline and interactive graph view.
              </p>
            </div>

            {/* Category Filter Pills & Toggle */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 text-xs font-semibold shadow-xs">
                <button
                  onClick={() => setSelectedCategoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedCategoryFilter === 'ALL'
                      ? 'bg-[#e41d2d] text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({nodes.length})
                </button>
                <button
                  onClick={() => setSelectedCategoryFilter('FLIGHT')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedCategoryFilter === 'FLIGHT'
                      ? 'bg-[#e41d2d] text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Flights
                </button>
                <button
                  onClick={() => setSelectedCategoryFilter('HOTEL')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedCategoryFilter === 'HOTEL'
                      ? 'bg-[#e41d2d] text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hotels
                </button>
                <button
                  onClick={() => setSelectedCategoryFilter('TRANSFER')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedCategoryFilter === 'TRANSFER'
                      ? 'bg-[#e41d2d] text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Transfers
                </button>
              </div>

              {/* Timeline ↔ Graph Toggle Buttons */}
              <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    viewMode === 'timeline'
                      ? 'bg-[#e41d2d] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ListFilter size={15} />
                  <span>Timeline</span>
                </button>

                <button
                  onClick={() => setViewMode('graph')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    viewMode === 'graph'
                      ? 'bg-[#e41d2d] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GitFork size={15} />
                  <span>Graph (DAG)</span>
                </button>
              </div>
            </div>
          </div>

          {/* View Render Area */}
          {isLoadingTrip ? (
            <div className="p-20 rounded-3xl border border-slate-200 bg-white text-center space-y-3 shadow-xs">
              <div className="w-10 h-10 border-2 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Resolving itinerary graph topology...</p>
            </div>
          ) : viewMode === 'graph' ? (
            <ItineraryGraph
              nodes={nodes}
              edges={edges}
              impact={activeImpact}
              onSimulateDisruption={(bookingId) => {
                setSimulateTargetId(bookingId);
                setIsSimulateModalOpen(true);
              }}
            />
          ) : (
            <div className="space-y-4">
              {filteredNodes.map((node, index) => (
                <BookingNodeCard
                  key={node.id}
                  node={node}
                  index={index}
                  outgoingEdge={outgoingEdgeMap.get(node.id)}
                  isImpacted={impactReasonMap.has(node.id)}
                  impactReason={impactReasonMap.get(node.id)}
                  onSimulateDisruption={(bookingId) => {
                    setSimulateTargetId(bookingId);
                    setIsSimulateModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disruption Simulator Modal */}
      <DisruptionModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        bookings={nodes}
        selectedBookingId={simulateTargetId}
        onSimulate={handleSimulateDisruption}
        isLoading={isSimulating}
      />

      {/* Screen 4: Confirmation Diff Modal */}
      {appliedDiff && (
        <ConfirmationDiffModal
          isOpen={isDiffModalOpen}
          onClose={() => setIsDiffModalOpen(false)}
          diff={appliedDiff}
          planTitle="Selected Recovery Option"
        />
      )}

      {/* Traveler Login / Persona Switcher Modal */}
      <TravelerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentTraveler={
          PRESET_TRAVELERS.find((t) => t.email === currentUser?.email) || {
            id: currentUser?.id || 'traveler_alex_mercer',
            name: currentUser?.name || 'Alex Mercer',
            email: currentUser?.email || 'alex.mercer@stratos-ai.com',
            role: currentUser?.role || 'Solo Executive Traveler',
            tier: currentUser?.tier || 'Diamond Shield VIP',
            avatarBg: 'bg-[#e41d2d] text-white',
            badge: 'Executive Fast-Track',
            company: currentUser?.company || 'Stratos AI Corp',
          }
        }
        onSelectTraveler={async (traveler) => {
          try {
            await fetch('/api/auth/demo-switch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: traveler.email }),
            });
            await loadUser();
            showToast(`Active traveler changed to ${traveler.name} (${traveler.tier})`);
          } catch (err) {
            console.error('Error switching demo traveler:', err);
          }
        }}
      />

      {/* Executive Disruption Audit Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 space-y-5 text-slate-900 relative shadow-2xl border border-slate-200">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-red-50 text-red-600 border border-red-200">
                <FileText size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  Compliance Audit Document
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  TripShield Disruption Recovery Audit
                </h2>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span>Traveler Profile:</span>
                <span className="text-slate-900 font-bold">{travelerDisplayName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span>Active Itinerary:</span>
                <span className="text-slate-900">{trip?.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span>Autonomous Healing Protocol:</span>
                <span className="text-emerald-600 font-bold">BFS Cascade Multi-Leg Enabled</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span>Traveler Emergency SMS Dispatch:</span>
                <span className="text-red-600 font-bold">+91 98200 45192 (Dispatched)</span>
              </div>
              <div className="flex justify-between">
                <span>Corporate Travel Insurance Delta:</span>
                <span className="text-slate-900 font-bold">₹0 Deductible (Priority Shield Protected)</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`TripShield Audit Report - ${travelerDisplayName} - ${trip?.name}`);
                  showToast('Audit report copied to clipboard for expense filing.');
                  setIsReportModalOpen(false);
                }}
                className="w-full py-3.5 rounded-xl bg-[#e41d2d] hover:bg-[#c51624] text-white font-black text-xs shadow-md shadow-red-200 transition-all cursor-pointer"
              >
                Copy Executive Incident Log & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
