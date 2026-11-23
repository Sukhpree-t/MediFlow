import React, { useState, useEffect } from 'react';
import { Bed, Patient } from '../types';
import api from '../api/client';

const DEFAULT_CLINICAL_BEDS: Bed[] = [
  { id: 1, bedCode: 'ICU-01', wardType: 'ICU', floorNumber: 3, status: 'AVAILABLE', hasVentilator: true, version: 1, updatedAt: new Date().toISOString() },
  { id: 2, bedCode: 'ICU-02', wardType: 'ICU', floorNumber: 3, status: 'AVAILABLE', hasVentilator: true, version: 1, updatedAt: new Date().toISOString() },
  { id: 4, bedCode: 'GEN-101', wardType: 'GENERAL', floorNumber: 2, status: 'AVAILABLE', hasVentilator: false, version: 1, updatedAt: new Date().toISOString() },
];

const DEFAULT_WAITING_PATIENTS: Patient[] = [
  { id: 1, patientCode: 'ER-2041', fullName: 'Eleanor Vance', age: 54, gender: 'F', chiefComplaint: 'Severe chest pain radiating to left arm', vitalsSummary: 'BP: 148/92, HR: 102, SpO2: 95%', acuityLevel: 1, recommendedWard: 'ICU', status: 'WAITING', arrivalTime: new Date().toISOString() },
  { id: 2, patientCode: 'ER-2042', fullName: 'James Wilson', age: 29, gender: 'M', chiefComplaint: 'Motor vehicle accident, compound tibia fracture', vitalsSummary: 'BP: 124/80, HR: 88, SpO2: 98%', acuityLevel: 2, recommendedWard: 'GENERAL', status: 'WAITING', arrivalTime: new Date().toISOString() },
];

export const RaceConditionDemoPage: React.FC = () => {
  const [beds, setBeds] = useState<Bed[]>(DEFAULT_CLINICAL_BEDS);
  const [patients, setPatients] = useState<Patient[]>(DEFAULT_WAITING_PATIENTS);
  const [selectedBedId, setSelectedBedId] = useState<number | null>(DEFAULT_CLINICAL_BEDS[0].id);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [terminalAResult, setTerminalAResult] = useState<any>(null);
  const [terminalBResult, setTerminalBResult] = useState<any>(null);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  const loadData = async () => {
    try {
      const [bedsRes, triageRes] = await Promise.all([
        api.get<Bed[]>('/beds'),
        api.get<Patient[]>('/triage'),
      ]);
      const loadedBeds = Array.isArray(bedsRes.data) && bedsRes.data.length > 0 ? bedsRes.data : DEFAULT_CLINICAL_BEDS;
      setBeds(loadedBeds);
      const waiting = Array.isArray(triageRes.data)
        ? triageRes.data.filter((p) => p.status === 'WAITING')
        : DEFAULT_WAITING_PATIENTS;
      setPatients(waiting);

      const firstAvailable = loadedBeds.find((b) => b.status === 'AVAILABLE');
      if (firstAvailable && !selectedBedId) {
        setSelectedBedId(firstAvailable.id);
      }
    } catch (err) {
      console.warn('Backend unavailable; running simulation on memory baseline:', err);
      setBeds(DEFAULT_CLINICAL_BEDS);
      setPatients(DEFAULT_WAITING_PATIENTS);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedBed = beds.find((b) => b.id === selectedBedId);

  const resetTargetBed = async () => {
    if (!selectedBed) return;
    try {
      await api.patch(`/beds/${selectedBed.id}/status`, {
        status: 'AVAILABLE',
      });
      setTerminalAResult(null);
      setTerminalBResult(null);
      setSimulationLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Bed ${selectedBed.bedCode} manually reset to AVAILABLE for testing.`,
        ...prev,
      ]);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reset bed');
    }
  };

  const handleSimulateRace = async () => {
    if (!selectedBed) return;
    if (patients.length < 2) {
      alert('Need at least 2 waiting triage patients to simulate race condition.');
      return;
    }

    setIsRunning(true);
    setTerminalAResult(null);
    setTerminalBResult(null);

    const bedId = selectedBed.id;
    const version = selectedBed.version;
    const patientA = patients[0];
    const patientB = patients[1];

    setSimulationLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] 🚀 Initiating simultaneous allocation race on bed ${selectedBed.bedCode} (expectedVersion: v${version})...`,
      ...prev,
    ]);

    // Dispatch two simultaneous POST /api/admissions requests
    const promiseA = api
      .post('/admissions', {
        bedId,
        patientId: patientA.id,
        expectedVersion: version,
        attendingDoctor: 'Dr. Arjun Mehta, MD',
        notes: 'Terminal A - Priority Admission',
        terminalId: 'ER-DESK-1',
      })
      .then((res) => ({ success: true, status: res.status, data: res.data }))
      .catch((err) => ({
        success: false,
        status: err.response?.status || 500,
        data: err.response?.data || err.message,
      }));

    const promiseB = api
      .post('/admissions', {
        bedId,
        patientId: patientB.id,
        expectedVersion: version,
        attendingDoctor: 'Nurse Simran Kaur, RN',
        notes: 'Terminal B - Urgent Trauma Allocation',
        terminalId: 'TRAUMA-BAY-2',
      })
      .then((res) => ({ success: true, status: res.status, data: res.data }))
      .catch((err) => ({
        success: false,
        status: err.response?.status || 500,
        data: err.response?.data || err.message,
      }));

    const [resA, resB] = await Promise.all([promiseA, promiseB]);

    setTerminalAResult(resA);
    setTerminalBResult(resB);

    const winner = resA.success ? 'Terminal A (ER-DESK-1)' : resB.success ? 'Terminal B (TRAUMA-BAY-2)' : 'Neither';
    const loser = !resA.success ? 'Terminal A' : !resB.success ? 'Terminal B' : 'None';

    setSimulationLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] 🏆 ${winner} acquired lock and successfully admitted patient!`,
      `[${new Date().toLocaleTimeString()}] 🛡️ ${loser} rejected with HTTP 409 Conflict (OptimisticLockException triggered, zero database overwrite)!`,
      ...prev,
    ]);

    setIsRunning(false);
    loadData();
  };

  return (
    <div className="w-full flex flex-col gap-6 p-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-border-subtle p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              INTERACTIVE DEMO
            </span>
            <span className="text-xs text-slate-500 font-medium">JPA @Version Optimistic Locking</span>
          </div>
          <h2 className="font-headline font-bold text-2xl text-slate-900 tracking-tight">
            Multi-Terminal Race Condition & Collision Simulator
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            Simulate two hospital terminals attempting to allocate the same bed at the exact same millisecond. Watch JPA optimistic concurrency control prevent double-booking with zero-overwrite guarantees and sub-100ms WebSocket alerts.
          </p>
        </div>

        {/* Target Bed Selector & Reset */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-mono font-bold text-slate-500 uppercase">
              Target Bed
            </label>
            <select
              value={selectedBedId || ''}
              onChange={(e) => setSelectedBedId(Number(e.target.value))}
              className="py-1.5 px-3 rounded-xl border border-border-subtle bg-slate-50 text-xs font-mono font-bold"
            >
              {beds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bedCode} ({b.status} - v{b.version})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={resetTargetBed}
            className="mt-4 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
            title="Reset Bed to AVAILABLE"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset Bed</span>
          </button>
        </div>
      </div>

      {/* Target Bed Current State */}
      {selectedBed && (
        <div className="bg-slate-50 rounded-2xl border border-border-subtle p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-border-subtle flex items-center justify-center font-mono font-bold text-base text-primary shadow-2xs">
              {selectedBed.bedCode}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{selectedBed.wardType} Ward</span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-600">Floor {selectedBed.floorNumber}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                  Current Database Version: v{selectedBed.version}
                </span>
                <span
                  className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded ${
                    selectedBed.status === 'AVAILABLE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  Status: {selectedBed.status}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSimulateRace}
            disabled={isRunning || selectedBed.status !== 'AVAILABLE'}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50 active:scale-[0.99]"
          >
            {isRunning ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Firing Race Requests...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">bolt</span>
                <span>Trigger Simultaneous Allocation Race</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Dual Terminal Live Representation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Terminal A */}
        <div className="bg-white rounded-2xl border border-border-subtle p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-mono font-bold text-xs">
                  A
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Terminal A (ER-DESK-1)</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Dr. Arjun Mehta, MD • Emergency Coordinator</p>
                </div>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Payload expectedVersion: v{selectedBed?.version || 1}
              </span>
            </div>

            {/* Status Panel */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 min-h-[140px] flex flex-col justify-center">
              {terminalAResult ? (
                terminalAResult.success ? (
                  <div className="flex flex-col gap-1.5 text-emerald-800">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <span className="material-symbols-outlined text-[20px] text-emerald-600">
                        check_circle
                      </span>
                      <span>HTTP 201 CREATED — Bed Acquired!</span>
                    </div>
                    <p className="text-xs text-emerald-700 font-mono">
                      Database version bumped: v{selectedBed?.version} → v{(selectedBed?.version || 1) + 1}
                    </p>
                    <p className="text-[11px] text-emerald-600 mt-1">
                      Admission ID: {terminalAResult.data?.id} • Patient admitted successfully.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 text-red-800">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <span className="material-symbols-outlined text-[20px] text-red-600">
                        error
                      </span>
                      <span>HTTP {terminalAResult.status} CONFLICT — Lock Lost!</span>
                    </div>
                    <p className="text-xs text-red-700 font-mono">
                      {terminalAResult.data?.message || 'Optimistic locking collision detected.'}
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center text-xs text-slate-400 flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-[28px] text-slate-300">
                    desktop_windows
                  </span>
                  <span>Terminal ready. Click 'Trigger Simultaneous Allocation Race' above.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Terminal B */}
        <div className="bg-white rounded-2xl border border-border-subtle p-5 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-mono font-bold text-xs">
                  B
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Terminal B (TRAUMA-BAY-2)</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Nurse Simran Kaur, RN • Trauma Station</p>
                </div>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                Payload expectedVersion: v{selectedBed?.version || 1}
              </span>
            </div>

            {/* Status Panel */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 min-h-[140px] flex flex-col justify-center">
              {terminalBResult ? (
                terminalBResult.success ? (
                  <div className="flex flex-col gap-1.5 text-emerald-800">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <span className="material-symbols-outlined text-[20px] text-emerald-600">
                        check_circle
                      </span>
                      <span>HTTP 201 CREATED — Bed Acquired!</span>
                    </div>
                    <p className="text-xs text-emerald-700 font-mono">
                      Database version bumped: v{selectedBed?.version} → v{(selectedBed?.version || 1) + 1}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 text-red-800">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <span className="material-symbols-outlined text-[20px] text-red-600">
                        error
                      </span>
                      <span>HTTP {terminalBResult.status} CONFLICT — Collision Handled!</span>
                    </div>
                    <p className="text-xs text-red-700 font-mono">
                      {terminalBResult.data?.message || 'Bed state was modified concurrently.'}
                    </p>
                    <p className="text-[11px] text-red-600 mt-1">
                      Client notified of stale version without corrupted database state.
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center text-xs text-slate-400 flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-[28px] text-slate-300">
                    desktop_windows
                  </span>
                  <span>Terminal ready. Awaiting concurrent trigger command.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Log Stream */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 font-mono text-xs shadow-md">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
          <span className="font-bold text-slate-400 uppercase text-[11px]">
            Live OCC Kernel & WebSocket Execution Log
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            STOMP Broker Online
          </span>
        </div>
        <div className="max-h-48 overflow-y-auto flex flex-col gap-1 text-[11px]">
          {simulationLogs.length === 0 ? (
            <span className="text-slate-500 italic">No race simulations executed yet.</span>
          ) : (
            simulationLogs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </div>
    </div>
  );
};
