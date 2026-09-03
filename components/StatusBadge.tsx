import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, RefreshCw, XCircle } from 'lucide-react';

export type StatusType = 'confirmed' | 'at_risk' | 'disrupted' | 'rebooked' | 'cancelled' | string;

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const normStatus = status.toLowerCase();

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = CheckCircle2;
  let label = 'Confirmed';

  switch (normStatus) {
    case 'confirmed':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
      Icon = CheckCircle2;
      label = 'Confirmed';
      break;
    case 'at_risk':
      bg = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
      Icon = AlertTriangle;
      label = 'At Risk';
      break;
    case 'disrupted':
      bg = 'bg-red-50 text-red-700 border-red-200 animate-pulse font-bold';
      Icon = AlertOctagon;
      label = 'Disrupted';
      break;
    case 'rebooked':
      bg = 'bg-blue-50 text-blue-700 border-blue-200 font-semibold';
      Icon = RefreshCw;
      label = 'Rebooked';
      break;
    case 'cancelled':
      bg = 'bg-slate-100 text-slate-600 border-slate-300';
      Icon = XCircle;
      label = 'Cancelled';
      break;
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-xs font-medium px-3 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3.5 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 13,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors shadow-xs ${bg} ${sizeClasses} ${className}`}
      role="status"
    >
      <Icon size={iconSizes} className="shrink-0" />
      <span>{label}</span>
    </span>
  );
}
