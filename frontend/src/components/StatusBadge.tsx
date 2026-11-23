import React from 'react';
import { BedStatus } from '../types';

interface StatusBadgeProps {
  status: BedStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'AVAILABLE':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Available'
        };
      case 'OCCUPIED':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-500',
          label: 'Occupied'
        };
      case 'CLEANING':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Cleaning'
        };
      case 'RESERVED':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Reserved'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: status
        };
    }
  };

  const { bg, dot, label } = getBadgeStyle();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium tracking-wide uppercase ${bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
      {label}
    </span>
  );
};

export const AcuityBadge: React.FC<{ level: number }> = ({ level }) => {
  switch (level) {
    case 1:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-100 text-red-800 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          Level 1 - Resuscitation
        </span>
      );
    case 2:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-orange-100 text-orange-800 border border-orange-200">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          Level 2 - Emergent
        </span>
      );
    case 3:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Level 3 - Urgent
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Level 4 - Less Urgent
        </span>
      );
  }
};
