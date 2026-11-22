import React, { useState, useEffect } from 'react';
import { Bed, WardType, BedStatus, Patient, Metrics } from '../types';
import api from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import { KpiCards } from '../components/KpiCards';
import { AssignPatientModal } from '../components/AssignPatientModal';
import { useAuth } from '../context/AuthContext';
import {
  Wind,
  Filter,
  CheckCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  UserCheck,
  UserX,
} from 'lucide-react';

interface LiveWardPageProps {
  beds: Bed[];
  setBeds: React.Dispatch<React.SetStateAction<Bed[]>>;
}

export const LiveWardPage: React.FC<LiveWardPageProps> = ({ beds, setBeds }) => {
  const { user } = useAuth();
  const [selectedWard, setSelectedWard] = useState<WardType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<BedStatus | 'ALL'>('ALL');
  const [waitingPatients, setWaitingPatients] = useState<Patient[]>([]);
  const [selectedBedForAssign, setSelectedBedForAssign] = useState<Bed | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    totalBeds: 18,
    availableBeds: 8,
    occupiedBeds: 6,
    cleaningBeds: 3,
    reservedBeds: 1,
    waitingPatients: 5,
    admittedPatients: 6,
  });

  // Fetch initial beds, triage queue, and metrics
  useEffect(() => {
    fetchBeds();
    fetchWaitingPatients();
    fetchMetrics();
  }, [selectedWard, statusFilter]);

  const fetchBeds = async () => {
    try {
      const params: any = {};
      if (selectedWard !== 'ALL') params.wardType = selectedWard;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await api.get('/beds', { params });
      setBeds(res.data);
    } catch (err) {
      console.error('Failed to fetch beds:', err);
    }
  };

  const fetchWaitingPatients = async () => {
    try {
      const res = await api.get('/triage');
      setWaitingPatients(res.data);
    } catch (err) {
      console.error('Failed to fetch triage queue:', err);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/metrics');
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  const handleDischarge = async (bedId: number) => {
    try {
      const res = await api.post(`/admissions/${bedId}/discharge`, {
        notes: 'Discharge cleared by clinical staff.',
        terminalId: user?.terminalId || 'WARD-TERM',
      });
      // Replace bed in state
      setBeds((prev) => prev.map((b) => (b.id === bedId ? res.data : b)));
      fetchMetrics();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to discharge patient.');
    }
  };

  const handleCleaned = async (bedId: number) => {
    try {
      const res = await api.patch(`/beds/${bedId}/status`, {
        status: 'AVAILABLE',
        terminalId: user?.terminalId || 'CLEANING-CREW',
      });
      setBeds((prev) => prev.map((b) => (b.id === bedId ? res.data : b)));
      fetchMetrics();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update bed status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top KPI Summary */}
      <KpiCards metrics={metrics} />

      {/* Ward Filter & Status Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Ward Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit">
          {(['ALL', 'ICU', 'GENERAL', 'ISOLATION'] as const).map((ward) => (
            <button
              key={ward}
              onClick={() => setSelectedWard(ward)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                selectedWard === ward
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ward === 'ALL' ? 'All Wings' : ward}
            </button>
          ))}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Filter className="w-4 h-4 text-slate-400" />
            <span>Filter Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-1.5 bg-white border"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="OCCUPIED">OCCUPIED</option>
            <option value="CLEANING">CLEANING</option>
            <option value="RESERVED">RESERVED</option>
          </select>
        </div>
      </div>

      {/* Bed Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {beds.map((bed) => {
          const isAvailable = bed.status === 'AVAILABLE';
          const isOccupied = bed.status === 'OCCUPIED';
          const isCleaning = bed.status === 'CLEANING';

          return (
            <div
              key={bed.id}
              className={`bg-white rounded-xl border p-4 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
                isAvailable
                  ? 'border-emerald-200/80 hover:border-emerald-400'
                  : isOccupied
                  ? 'border-slate-200 hover:border-slate-300'
                  : isCleaning
                  ? 'border-amber-200/80'
                  : 'border-blue-200/80'
              }`}
            >
              <div>
                {/* Bed Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-slate-900">
                      {bed.bedCode}
                    </span>
                    {bed.hasVentilator && (
                      <span
                        title="Equipped with Ventilator"
                        className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-mono font-semibold flex items-center gap-1"
                      >
                        <Wind className="w-3 h-3" /> Vent
                      </span>
                    )}
                  </div>
                  <StatusBadge status={bed.status} />
                </div>

                {/* Patient Summary or Available Prompt */}
                {bed.currentPatient ? (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">
                        {bed.currentPatient.fullName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold">
                        Acuity {bed.currentPatient.acuityLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {bed.currentPatient.chiefComplaint}
                    </p>
                    <div className="text-[10px] font-mono text-slate-400">
                      MRN: {bed.currentPatient.patientCode} • Age {bed.currentPatient.age}
                    </div>
                  </div>
                ) : isCleaning ? (
                  <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100 text-xs text-amber-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Terminal disinfection in progress</span>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50/30 rounded-lg border border-emerald-100/60 text-xs text-emerald-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Ready for patient placement</span>
                  </div>
                )}
              </div>

              {/* Bed Card Footer & Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Floor {bed.floorNumber} •{' '}
                  <span className="text-blue-600 font-semibold">v{bed.version}</span>
                </span>

                {isAvailable && (
                  <button
                    onClick={() => setSelectedBedForAssign(bed)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Assign
                  </button>
                )}

                {isOccupied && (
                  <button
                    onClick={() => handleDischarge(bed.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Discharge
                  </button>
                )}

                {isCleaning && (
                  <button
                    onClick={() => handleCleaned(bed.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Mark Ready
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assignment Modal */}
      {selectedBedForAssign && (
        <AssignPatientModal
          bed={selectedBedForAssign}
          waitingPatients={waitingPatients}
          onClose={() => setSelectedBedForAssign(null)}
          onSuccess={(updatedBed) => {
            setBeds((prev) => prev.map((b) => (b.id === updatedBed.id ? updatedBed : b)));
            fetchWaitingPatients();
            fetchMetrics();
          }}
          onRefreshBed={(latestBed) => {
            setSelectedBedForAssign(latestBed);
            setBeds((prev) => prev.map((b) => (b.id === latestBed.id ? latestBed : b)));
          }}
        />
      )}
    </div>
  );
};
