import React, { useState, useEffect, useMemo } from 'react';
import { Patient, WardType, Gender } from '../types';
import api from '../api/client';
import { AcuityBadge } from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';

const DEFAULT_TRIAGE_QUEUE: Patient[] = [
  { id: 1, patientCode: 'ER-2041', fullName: 'Eleanor Vance', age: 54, gender: 'F', chiefComplaint: 'Severe chest pain radiating to left arm', vitalsSummary: 'BP: 148/92, HR: 102, SpO2: 95%', acuityLevel: 1, recommendedWard: 'ICU', status: 'WAITING', arrivalTime: new Date().toISOString() },
  { id: 2, patientCode: 'ER-2042', fullName: 'James Wilson', age: 29, gender: 'M', chiefComplaint: 'Motor vehicle accident, compound tibia fracture', vitalsSummary: 'BP: 124/80, HR: 88, SpO2: 98%', acuityLevel: 2, recommendedWard: 'GENERAL', status: 'WAITING', arrivalTime: new Date().toISOString() },
  { id: 3, patientCode: 'ER-2043', fullName: 'Priya Sharma', age: 62, gender: 'F', chiefComplaint: 'High fever, productive cough, SpO2 91%', vitalsSummary: 'BP: 130/84, HR: 96, SpO2: 91%', acuityLevel: 2, recommendedWard: 'ISOLATION', status: 'WAITING', arrivalTime: new Date().toISOString() },
  { id: 4, patientCode: 'ER-2044', fullName: 'Marcus Brody', age: 71, gender: 'M', chiefComplaint: 'Transient ischemic attack symptoms, resolved', vitalsSummary: 'BP: 160/95, HR: 74, SpO2: 97%', acuityLevel: 3, recommendedWard: 'GENERAL', status: 'WAITING', arrivalTime: new Date().toISOString() },
];

export const ErTriagePage: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>(DEFAULT_TRIAGE_QUEUE);
  const [selectedAcuity, setSelectedAcuity] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New patient intake form state
  const [fullName, setFullName] = useState<string>('');
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState<Gender>('M');
  const [acuityLevel, setAcuityLevel] = useState<number>(2);
  const [chiefComplaint, setChiefComplaint] = useState<string>('');
  const [vitalsSummary, setVitalsSummary] = useState<string>('BP: 138/88, HR: 94, SpO2: 96%');
  const [recommendedWard, setRecommendedWard] = useState<WardType>('ICU');

  const fetchTriagePatients = async () => {
    try {
      const res = await api.get<Patient[]>('/triage');
      if (Array.isArray(res.data)) {
        setPatients(res.data);
      }
    } catch (err) {
      console.warn('Backend triage queue unavailable; using baseline:', err);
    }
  };

  useEffect(() => {
    fetchTriagePatients();
  }, []);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !chiefComplaint) return;

    setIsSubmitting(true);
    try {
      await api.post('/triage', {
        fullName,
        age: Number(age),
        gender,
        chiefComplaint,
        vitalsSummary,
        acuityLevel: Number(acuityLevel),
        recommendedWard,
      });
      setFullName('');
      setChiefComplaint('');
      setIsFormOpen(false);
      fetchTriagePatients();
    } catch (err: any) {
      // Local optimistic addition if backend offline
      const newPatient: Patient = {
        id: Date.now(),
        patientCode: `ER-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName,
        age: Number(age),
        gender,
        chiefComplaint,
        vitalsSummary,
        acuityLevel: Number(acuityLevel),
        recommendedWard,
        status: 'WAITING',
        arrivalTime: new Date().toISOString(),
      };
      setPatients((prev) => [newPatient, ...(Array.isArray(prev) ? prev : [])]);
      setFullName('');
      setChiefComplaint('');
      setIsFormOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const safePatients = useMemo(() => {
    return Array.isArray(patients) ? patients : DEFAULT_TRIAGE_QUEUE;
  }, [patients]);

  // Filter queue
  const waitingList = useMemo(() => {
    return safePatients.filter((p) => p.status === 'WAITING');
  }, [safePatients]);

  const filteredQueue = useMemo(() => {
    return waitingList.filter((p) => {
      const matchesAcuity = selectedAcuity === 'ALL' || p.acuityLevel === selectedAcuity;
      const matchesSearch =
        !searchQuery ||
        p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesAcuity && matchesSearch;
    });
  }, [waitingList, selectedAcuity, searchQuery]);

  // Acuity Breakdown
  const level1Count = waitingList.filter((p) => p.acuityLevel === 1).length;
  const level2Count = waitingList.filter((p) => p.acuityLevel === 2).length;
  const level3Count = waitingList.filter((p) => p.acuityLevel === 3).length;
  const level4Count = waitingList.filter((p) => p.acuityLevel === 4).length;

  return (
    <div className="w-full flex flex-col gap-6 p-6">
      {/* Operational Context Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-border-subtle shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-xs font-bold text-slate-800">
              {waitingList.length} Active Waiting
            </span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Prioritized clinical intake powered by Emergency Severity Index (ESI)
          </div>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-blue-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-[0.99]"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isFormOpen ? 'close' : 'person_add'}
          </span>
          <span>{isFormOpen ? 'Close Intake Form' : 'New Emergency Intake'}</span>
        </button>
      </div>

      {/* Acuity Level Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Level 1 */}
        <div
          onClick={() => setSelectedAcuity(selectedAcuity === 1 ? 'ALL' : 1)}
          className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-xs ${
            selectedAcuity === 1
              ? 'bg-red-50 border-red-400 ring-2 ring-red-400'
              : 'bg-white border-red-200/80 hover:bg-red-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-red-700 mb-1">
            <span className="font-mono text-xs font-bold uppercase">Level 1 - Resuscitation</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline font-bold text-2xl text-red-700">{level1Count}</span>
            <span className="text-xs text-red-600 font-medium">Immediate</span>
          </div>
        </div>

        {/* Level 2 */}
        <div
          onClick={() => setSelectedAcuity(selectedAcuity === 2 ? 'ALL' : 2)}
          className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-xs ${
            selectedAcuity === 2
              ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-400'
              : 'bg-white border-orange-200/80 hover:bg-orange-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-orange-700 mb-1">
            <span className="font-mono text-xs font-bold uppercase">Level 2 - Emergent</span>
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline font-bold text-2xl text-orange-700">{level2Count}</span>
            <span className="text-xs text-orange-600 font-medium">&lt; 15 min</span>
          </div>
        </div>

        {/* Level 3 */}
        <div
          onClick={() => setSelectedAcuity(selectedAcuity === 3 ? 'ALL' : 3)}
          className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-xs ${
            selectedAcuity === 3
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400'
              : 'bg-white border-amber-200/80 hover:bg-amber-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="font-mono text-xs font-bold uppercase">Level 3 - Urgent</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline font-bold text-2xl text-amber-700">{level3Count}</span>
            <span className="text-xs text-amber-600 font-medium">&lt; 60 min</span>
          </div>
        </div>

        {/* Level 4 */}
        <div
          onClick={() => setSelectedAcuity(selectedAcuity === 4 ? 'ALL' : 4)}
          className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-xs ${
            selectedAcuity === 4
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400'
              : 'bg-white border-emerald-200/80 hover:bg-emerald-50/50'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="font-mono text-xs font-bold uppercase">Level 4 - Less Urgent</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline font-bold text-2xl text-emerald-700">{level4Count}</span>
            <span className="text-xs text-emerald-600 font-medium">&lt; 120 min</span>
          </div>
        </div>
      </div>

      {/* Collapsible New Patient Intake Form */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border border-primary/30 p-6 shadow-lg animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-4">
            <div>
              <h2 className="font-headline font-bold text-lg text-slate-900">
                New Emergency Patient Intake
              </h2>
              <p className="text-xs text-slate-500">
                Register triage patient directly into the waiting queue.
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form onSubmit={handleCreatePatient} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700 uppercase">Patient Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                required
                className="py-2 px-3 border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase">Age *</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  min={1}
                  max={120}
                  required
                  className="py-2 px-3 border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="py-2 px-2.5 border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="M">Male (M)</option>
                  <option value="F">Female (F)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Acuity Level */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700 uppercase">Acuity Level (ESI) *</label>
              <select
                value={acuityLevel}
                onChange={(e) => setAcuityLevel(Number(e.target.value))}
                className="py-2 px-3 border border-border-subtle rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={1}>Level 1 - Resuscitation (Immediate Life Threat)</option>
                <option value={2}>Level 2 - Emergent (High Risk / Severe Pain)</option>
                <option value={3}>Level 3 - Urgent (Multiple Resources Needed)</option>
                <option value={4}>Level 4 - Less Urgent (Single Resource)</option>
              </select>
            </div>

            {/* Chief Complaint */}
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="font-bold text-slate-700 uppercase">Chief Complaint / Symptoms *</label>
              <input
                type="text"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="e.g. Acute chest pain with radiation to left arm, diaphoresis"
                required
                className="py-2 px-3 border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Recommended Ward */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700 uppercase">Target Ward</label>
              <select
                value={recommendedWard}
                onChange={(e) => setRecommendedWard(e.target.value as WardType)}
                className="py-2 px-3 border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ICU">ICU (Intensive Care)</option>
                <option value="GENERAL">General Ward</option>
                <option value="ISOLATION">Isolation Unit</option>
              </select>
            </div>

            {/* Vitals Summary */}
            <div className="md:col-span-3 flex flex-col gap-1">
              <label className="font-bold text-slate-700 uppercase">Vitals Telemetry Summary</label>
              <input
                type="text"
                value={vitalsSummary}
                onChange={(e) => setVitalsSummary(e.target.value)}
                placeholder="BP: 120/80, HR: 82, SpO2: 98%, Temp: 98.6F"
                className="py-2 px-3 border border-border-subtle rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-xl bg-primary hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-1.5"
              >
                {isSubmitting ? 'Registering...' : 'Register Triage Intake'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Prioritized Waiting Queue Table */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-xs overflow-hidden flex flex-col">
        {/* Table Controls */}
        <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-headline font-bold text-base text-slate-900">
              Prioritized Live Queue
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {filteredQueue.length} Patients
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex items-center min-w-[200px]">
              <span className="material-symbols-outlined absolute left-2.5 text-slate-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name, MRN..."
                className="w-full py-1.5 pl-8 pr-3 text-xs rounded-xl border border-border-subtle bg-slate-50 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-border-subtle font-mono uppercase text-slate-500 text-[11px]">
                <th className="py-3 px-4">Patient Code / Name</th>
                <th className="py-3 px-3">Age / Sex</th>
                <th className="py-3 px-3">Acuity Priority</th>
                <th className="py-3 px-4">Chief Complaint</th>
                <th className="py-3 px-4">Vitals Telemetry</th>
                <th className="py-3 px-3">Target Ward</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No waiting triage patients matching filter.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-primary text-xs">
                          {patient.patientCode}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {patient.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {patient.age}y / {patient.gender}
                    </td>
                    <td className="py-3.5 px-3">
                      <AcuityBadge level={patient.acuityLevel} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-[240px] truncate" title={patient.chiefComplaint}>
                      {patient.chiefComplaint}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {patient.vitalsSummary || 'Standard Vitals'}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {patient.recommendedWard || 'GENERAL'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate('/')}
                        className="px-3 py-1.5 rounded-lg bg-primary hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-2xs inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[15px]">bed</span>
                        <span>Allocate Bed</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
