import React, { useState } from 'react';
import { Bed, Patient, ConflictResponse } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { X, AlertTriangle, CheckCircle, RefreshCw, UserCheck } from 'lucide-react';

interface AssignPatientModalProps {
  bed: Bed;
  waitingPatients: Patient[];
  onClose: () => void;
  onSuccess: (bed: Bed) => void;
  onRefreshBed: (bed: Bed) => void;
}

export const AssignPatientModal: React.FC<AssignPatientModalProps> = ({
  bed,
  waitingPatients,
  onClose,
  onSuccess,
  onRefreshBed,
}) => {
  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>(
    waitingPatients.length > 0 ? waitingPatients[0].id : ''
  );
  const [attendingDoctor, setAttendingDoctor] = useState('Dr. Priya Sharma');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Filter patients recommended for this ward or any if no exact match
  const filteredPatients = waitingPatients.filter(
    (p) => !p.recommendedWard || p.recommendedWard === bed.wardType
  );
  const patientsToDisplay = filteredPatients.length > 0 ? filteredPatients : waitingPatients;

  const handleAssign = async () => {
    if (!selectedPatientId) return;
    setLoading(true);
    setConflictError(null);

    try {
      await api.post('/admissions', {
        bedId: bed.id,
        patientId: Number(selectedPatientId),
        expectedVersion: bed.version,
        attendingDoctor,
        notes,
        terminalId: user?.terminalId || 'ER-DESK-1',
      });

      // Get latest bed status and close modal
      const res = await api.get(`/beds/${bed.id}`);
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409) {
        // Concurrency conflict handled cleanly!
        const conflictData: ConflictResponse = err.response.data;
        setConflictError(
          conflictData.message ||
            'Bed state updated by another terminal. Concurrency collision resolved cleanly.'
        );
        if (conflictData.latestBed) {
          onRefreshBed(conflictData.latestBed);
        } else {
          // Fallback fetch latest
          api.get(`/beds/${bed.id}`).then((r) => onRefreshBed(r.data));
        }
      } else {
        setConflictError(
          err.response?.data?.message || 'Failed to allocate bed. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-mono font-bold text-sm">
              {bed.bedCode}
            </div>
            <div>
              <h3 className="font-headline font-bold text-slate-900 text-base">
                Assign Bed Allocation
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {bed.wardType} Ward • Floor {bed.floorNumber} •{' '}
                <span className="text-blue-600 font-semibold">@Version v{bed.version}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflict Alert Banner */}
        {conflictError && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block text-amber-800">
                Optimistic Locking Guard Triggered (HTTP 409)
              </span>
              <span>{conflictError}</span>
              <div className="mt-2 text-[11px] text-amber-700 font-mono">
                Bed card has been auto-refreshed with latest server state.
              </div>
            </div>
          </div>
        )}

        {/* Modal Form */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Waiting Patient
            </label>
            {patientsToDisplay.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-200">
                No waiting patients in triage queue.
              </p>
            ) : (
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                className="w-full text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2.5 bg-white border"
              >
                {patientsToDisplay.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.patientCode}] {p.fullName} (Age {p.age}, Acuity {p.acuityLevel} -{' '}
                    {p.chiefComplaint.substring(0, 30)}...)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Attending Doctor
            </label>
            <input
              type="text"
              value={attendingDoctor}
              onChange={(e) => setAttendingDoctor(e.target.value)}
              className="w-full text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2.5 bg-white border"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Admission Clinical Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Immediate clinical protocol, monitoring intervals, ventilator instructions..."
              className="w-full text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2.5 bg-white border"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span className="font-mono">Expected JPA Version:</span>
            <span className="font-mono font-bold text-blue-700 px-2 py-0.5 bg-white rounded border border-blue-200">
              v{bed.version}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={loading || patientsToDisplay.length === 0 || bed.status !== 'AVAILABLE'}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Allocating...
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                Confirm Bed Allocation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
