import React, { useState } from 'react';
import { Bed, Patient } from '../types';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { AcuityBadge } from './StatusBadge';

interface AssignPatientModalProps {
  bed: Bed;
  waitingPatients: Patient[];
  allBeds: Bed[];
  onClose: () => void;
  onSuccess: () => void;
  onSelectAlternativeBed?: (newBed: Bed) => void;
}

export const AssignPatientModal: React.FC<AssignPatientModalProps> = ({
  bed,
  waitingPatients,
  allBeds,
  onClose,
  onSuccess,
  onSelectAlternativeBed,
}) => {
  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState<number>(
    waitingPatients[0]?.id || 0
  );
  const [attendingDoctor, setAttendingDoctor] = useState<string>('Dr. Arjun Mehta, MD');
  const [notes, setNotes] = useState<string>('Patient admitted via Emergency Department triage');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [conflictError, setConflictError] = useState<{
    message: string;
    latestBed?: Bed;
  } | null>(null);

  const alternativeBeds = allBeds.filter(
    (b) => b.id !== bed.id && b.status === 'AVAILABLE' && b.wardType === bed.wardType
  ).slice(0, 3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    setIsSubmitting(true);
    setConflictError(null);

    try {
      await api.post('/admissions', {
        bedId: bed.id,
        patientId: selectedPatientId,
        expectedVersion: bed.version,
        attendingDoctor,
        notes,
        terminalId: user?.terminalId || 'ER-DESK-1',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setConflictError({
          message:
            err.response.data?.message ||
            `Bed ${bed.bedCode} was modified concurrently by another terminal. Reloaded latest state.`,
          latestBed: err.response.data?.latestBed,
        });
      } else {
        alert(err.response?.data?.message || 'Failed to assign patient to bed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPatient = waitingPatients.find((p) => p.id === selectedPatientId);

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-surface-card rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto border border-border-subtle">
        {/* Top Bed Status Banner */}
        <div className="bg-surface-container-low px-6 py-3 flex items-center justify-between border-b border-border-subtle">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
            </span>
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono text-sm font-bold text-on-surface">
                Bed {bed.bedCode}
              </span>
              <span className="text-outline text-xs">•</span>
              <span className="text-xs text-emerald-700 font-semibold uppercase font-mono">
                {bed.status} (Ready for intake)
              </span>
              <span className="text-outline text-xs">•</span>
              <span className="text-xs text-on-surface-variant font-medium">
                {bed.wardType} Ward • Floor {bed.floorNumber}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 bg-surface-card px-2.5 py-1 rounded-md border border-border-subtle shadow-2xs">
            <span className="material-symbols-outlined text-primary text-[15px]">
              lock
            </span>
            <span className="font-mono text-xs text-primary font-bold">
              v{bed.version} (JPA Lock)
            </span>
          </div>
        </div>

        {/* Modal Header */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
          <div>
            <h2 className="font-headline font-bold text-xl text-on-surface">
              Assign Patient to {bed.bedCode}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Select an admitted ER patient to allocate to this monitored bed.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4">
          {/* Concurrency Conflict Banner (HTTP 409) */}
          {conflictError && (
            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex flex-col gap-3 animate-in shake duration-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[20px] font-bold">
                    priority_high
                  </span>
                </div>
                <div className="flex-1 text-sm text-red-950 leading-snug">
                  <p className="font-bold text-red-900 text-sm">
                    ⚠️ Concurrency Collision Detected (@Version Mismatch)
                  </p>
                  <p className="text-xs text-red-800 mt-1">
                    {bed.bedCode} was just assigned or locked by another hospital terminal.
                    Your optimistic lock version (v{bed.version}) is stale.
                  </p>
                </div>
              </div>

              {/* Suggested Free Beds */}
              {alternativeBeds.length > 0 && (
                <div className="flex flex-col gap-2 pt-2 border-t border-red-200">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Suggested free alternative beds ready for intake:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {alternativeBeds.map((altBed) => (
                      <button
                        key={altBed.id}
                        type="button"
                        onClick={() => {
                          if (onSelectAlternativeBed) {
                            onSelectAlternativeBed(altBed);
                          }
                        }}
                        className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-primary hover:bg-blue-50/50 transition-all text-left flex flex-col justify-between group shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-sm text-slate-900 group-hover:text-primary">
                            {altBed.bedCode}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                            v{altBed.version}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1">
                          Floor {altBed.floorNumber} • {altBed.hasVentilator ? 'Ventilator' : 'Standard'}
                        </span>
                        <span className="text-[11px] font-semibold text-primary mt-1 flex items-center gap-0.5">
                          <span>Select this bed</span>
                          <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Select Waiting Triage Patient */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Waiting Triage Patient <span className="text-red-500">*</span>
            </label>
            {waitingPatients.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 bg-slate-50">
                No waiting triage patients in ER queue. You can create a new patient in the ER Triage Queue page.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                  className="w-full py-2.5 px-3 bg-white border border-border-subtle rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                >
                  {waitingPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.patientCode}] {p.fullName} ({p.age}y) — Acuity {p.acuityLevel} — {p.chiefComplaint}
                    </option>
                  ))}
                </select>

                {/* Patient Summary Card */}
                {selectedPatient && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-border-subtle flex items-start justify-between text-xs">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{selectedPatient.fullName}</span>
                        <span className="font-mono text-slate-500">[{selectedPatient.patientCode}]</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">{selectedPatient.age}y / {selectedPatient.gender}</span>
                      </div>
                      <p className="text-slate-600">
                        <strong className="text-slate-800">Complaint:</strong> {selectedPatient.chiefComplaint}
                      </p>
                      {selectedPatient.vitalsSummary && (
                        <p className="font-mono text-[11px] text-slate-500">
                          <strong>Vitals:</strong> {selectedPatient.vitalsSummary}
                        </p>
                      )}
                    </div>
                    <AcuityBadge level={selectedPatient.acuityLevel} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Attending Physician & Terminal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Attending Physician
              </label>
              <input
                type="text"
                value={attendingDoctor}
                onChange={(e) => setAttendingDoctor(e.target.value)}
                className="w-full py-2 px-3 bg-white border border-border-subtle rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder="Dr. Full Name"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Operating Terminal
              </label>
              <input
                type="text"
                value={user?.terminalId || 'ER-DESK-1'}
                disabled
                className="w-full py-2 px-3 bg-slate-100 border border-border-subtle rounded-xl text-sm font-mono text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Admission Notes / Triage Handover
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full py-2 px-3 bg-white border border-border-subtle rounded-xl text-sm font-normal focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Clinical instructions, precautions, isolation requirements..."
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-border-subtle mt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <span className="material-symbols-outlined text-[15px] text-primary">verified</span>
              <span>Atomic JPA @Version Check v{bed.version}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || waitingPatients.length === 0}
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-primary hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Allocating...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Confirm Allocation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
