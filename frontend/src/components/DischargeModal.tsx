import React, { useState } from 'react';
import { Bed } from '../types';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

interface DischargeModalProps {
  bed: Bed;
  onClose: () => void;
  onSuccess: () => void;
}

export const DischargeModal: React.FC<DischargeModalProps> = ({ bed, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<string>('Patient discharged in stable condition. Bed sent for decontamination.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleDischarge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post(`/admissions/${bed.id}/discharge`, {
        terminalId: user?.terminalId || 'ICU-STATION-A',
        notes,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to discharge patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-surface-card rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto border border-border-subtle">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 flex items-start justify-between border-b border-border-subtle">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="font-headline font-bold text-xl text-on-surface">
                Release Bed {bed.bedCode}?
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                {bed.wardType} Ward • Floor {bed.floorNumber}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200">
                v{bed.version}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleDischarge} className="px-6 py-4 flex flex-col gap-4">
          {/* Patient Details Summary */}
          {bed.currentPatient ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-border-subtle flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {bed.currentPatient.fullName}
                </span>
                <span className="font-mono text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-semibold">
                  MRN: {bed.currentPatient.patientCode}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-1">
                <div>
                  <span className="font-medium text-slate-500">Age:</span> {bed.currentPatient.age} yrs
                </div>
                <div>
                  <span className="font-medium text-slate-500">Acuity:</span> Level {bed.currentPatient.acuityLevel}
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-slate-500">Complaint:</span> {bed.currentPatient.chiefComplaint}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-500">
              Bed is currently marked as {bed.status}.
            </div>
          )}

          {/* Workflow Alert */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
            <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">
              cleaning_services
            </span>
            <div>
              Releasing this bed will mark the patient as <strong>DISCHARGED</strong> and transition the bed to <strong>CLEANING</strong> status. Environmental services will be notified via STOMP WebSocket.
            </div>
          </div>

          {/* Discharge Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Discharge Disposition & Sanitization Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full py-2 px-3 bg-white border border-border-subtle rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Discharge summary, housekeeping instructions..."
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                  <span>Confirm Release & Mark Cleaning</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
