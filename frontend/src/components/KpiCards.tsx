import React from 'react';
import { Metrics } from '../types';
import { BedDouble, CheckCircle2, AlertTriangle, Sparkles, Clock, Users } from 'lucide-react';

interface KpiCardsProps {
  metrics: Metrics;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Bed Capacity',
      value: metrics.totalBeds,
      subtext: 'Across 3 Wings',
      icon: BedDouble,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Available Beds',
      value: metrics.availableBeds,
      subtext: 'Ready for Admission',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Occupied Beds',
      value: metrics.occupiedBeds,
      subtext: `${Math.round((metrics.occupiedBeds / (metrics.totalBeds || 1)) * 100)}% Occupancy`,
      icon: Users,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
    {
      title: 'In Sanitation',
      value: metrics.cleaningBeds,
      subtext: 'Fast-Track Turnaround',
      icon: Sparkles,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'ER Triage Queue',
      value: metrics.waitingPatients,
      subtext: 'Patients Waiting',
      icon: Clock,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-headline text-slate-900 tracking-tight">
                {card.value}
              </span>
              <span className="text-xs text-slate-500 truncate">{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
