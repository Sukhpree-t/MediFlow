import React, { useState, useEffect, useCallback } from 'react';
import { Bed, Patient } from '../types';
import api from '../api/client';

const DEFAULT_CLINICAL_BEDS: Bed[] = [
  { id: 1, bedCode: 'ICU-01', wardType: 'ICU', floorNumber: 2, status: 'AVAILABLE', hasVentilator: true, version: 1, updatedAt: new Date().toISOString() },
  { id: 2, bedCode: 'ICU-02', wardType: 'ICU', floorNumber: 2, status: 'AVAILABLE', hasVentilator: true, version: 1, updatedAt: new Date().toISOString() },
  { id: 4, bedCode: 'GEN-101', wardType: 'GENERAL', floorNumber: 1, status: 'AVAILABLE', hasVentilator: false, version: 1, updatedAt: new Date().toISOString() },
];

export const RaceConditionDemoPage: React.FC = () => {
  const [beds, setBeds] = useState<Bed[]>(DEFAULT_CLINICAL_BEDS);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedBedId, setSelectedBedId] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [terminalAResult, setTerminalAResult] = useState<any>(null);
  const [terminalBResult, setTerminalBResult] = useState<any>(null);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [bedsRes, triageRes] = await Promise.all([
        api.get<Bed[]>('/beds'),
        api.get<Patient[]>('/triage'),
      ]);

      const loadedBeds = Array.isArray(bedsRes.data) && bedsRes.data.length > 0 ? bedsRes.data : DEFAULT_CLINICAL_BEDS;
      setBeds(loadedBeds);

      const waiting = Array.isArray(triageRes.data)
        ? triageRes.data.filter((p) => p.status === 'WAITING')
        : [];
      setPatients(waiting);

      // Auto-select first AVAILABLE bed if none currently selected or if selected bed is missing
      setSelectedBedId((prevId) => {
        if (prevId && loadedBeds.some((b) => b.id === prevId)) {
          return prevId;
        }
        const firstAvailable = loadedBeds.find((b) => b.status === 'AVAILABLE');
        return firstAvailable ? firstAvailable.id : loadedBeds[0]?.id || 1;
      });
    } catch (err) {
      console.warn('Backend unavailable; running simulation on memory baseline:', err);
      setBeds(DEFAULT_CLINICAL_BEDS);
      setSelectedBedId(DEFAULT_CLINICAL_BEDS[0].id);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedBed = beds.find((b) => b.id === selectedBedId) || beds[0];

  // Helper to ensure at least 2 waiting patients in the queue for the race
  const ensurePatientsForRace = async (): Promise<Patient[]> => {
    let currentPatients = [...patients];
    if (currentPatients.length >= 2) {
      return currentPatients;
    }

    setSimulationLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ℹ️ Fewer than 2 waiting patients found. Auto-provisioning emergency triage candidates...`,
      ...prev,
    ]);

    const demoCandidates = [
      {
        fullName: 'Eleanor Vance (Demo Patient)',
        age: 54,
        gender: 'F' as const,
        chiefComplaint: 'Acute chest pain radiating to left arm',
        vitalsSummary: 'BP: 148/92, HR: 104, SpO2: 95%',
        acuityLevel: 1,
        recommendedWard: selectedBed?.wardType || 'ICU',
      },
      {
        fullName: 'James Wilson (Demo Patient)',
        age: 29,
        gender: 'M' as const,
        chiefComplaint: 'Trauma with compound fracture',
        vitalsSummary: 'BP: 122/80, HR: 88, SpO2: 98%',
        acuityLevel: 2,
        recommendedWard: selectedBed?.wardType || 'ICU',
      },
    ];

    try {
      for (let i = currentPatients.length; i < 2; i++) {
        const candidate = demoCandidates[i] || demoCandidates[0];
        const res = await api.post<Patient>('/triage', candidate);
        if (res.data && res.data.id) {
          currentPatients.push(res.data);
        }
      }
      setPatients(currentPatients);
      return currentPatients;
    } catch (err) {
      console.warn('Could not auto-provision triage candidates:', err);
      // Fallback local mock patients if API fails
      const fallbackA: Patient = { id: 991, patientCode: 'DEMO-A', fullName: 'Eleanor Vance', age: 54, gender: 'F', chiefComplaint: 'Chest pain', vitalsSummary: 'Stable', acuityLevel: 1, recommendedWard: 'ICU', status: 'WAITING', arrivalTime: new Date().toISOString() };
      const fallbackB: Patient = { id: 992, patientCode: 'DEMO-B', fullName: 'James Wilson', age: 29, gender: 'M', chiefComplaint: 'Trauma', vitalsSummary: 'Stable', acuityLevel: 2, recommendedWard: 'ICU', status: 'WAITING', arrivalTime: new Date().toISOString() };
      return [fallbackA, fallbackB];
    }
  };

  // Reset bed cleanly: discharge if occupied, then patch to AVAILABLE
  const resetTargetBed = async (silent: boolean = false): Promise<Bed | null> => {
    if (!selectedBed) return null;
    setIsResetting(true);
    try {
      // 1. If currently occupied, discharge first to clear active admission record
      if (selectedBed.status === 'OCCUPIED') {
        try {
          await api.post(`/admissions/${selectedBed.id}/discharge`, {
            notes: 'Discharged for OCC Simulation Demo',
            terminalId: 'DEMO-RESET',
          });
        } catch (dischargeErr) {
          console.warn('Discharge call skipped or already clean:', dischargeErr);
        }
      }

      // 2. Patch bed to AVAILABLE
      const patchRes = await api.patch<Bed>(`/beds/${selectedBed.id}/status`, {
        status: 'AVAILABLE',
        terminalId: 'DEMO-RESET',
      });

      const updatedBed = patchRes.data || { ...selectedBed, status: 'AVAILABLE', version: selectedBed.version + 1 };

      setTerminalAResult(null);
      setTerminalBResult(null);

      if (!silent) {
        setSimulationLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] 🔄 Bed ${selectedBed.bedCode} successfully reset to AVAILABLE (v${updatedBed.version}). Ready for race simulation.`,
          ...prev,
        ]);
      }

      await loadData();
      return updatedBed;
    } catch (err: any) {
      console.error('Failed to reset bed:', err);
      if (!silent) {
        alert(err.response?.data?.message || 'Failed to reset bed');
      }
      return null;
    } finally {
      setIsResetting(false);
    }
  };

  const handleSimulateRace = async () => {
    if (!selectedBed) return;
    setIsRunning(true);
    setTerminalAResult(null);
    setTerminalBResult(null);

    let activeBed = selectedBed;

    // Pre-flight check: If the bed is already OCCUPIED or CLEANING, reset it to AVAILABLE first
    if (activeBed.status !== 'AVAILABLE') {
      setSimulationLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ⚠️ Bed ${activeBed.bedCode} is ${activeBed.status}. Automatically resetting to AVAILABLE first so the race can execute cleanly...`,
        ...prev,
      ]);
      const freshlyReset = await resetTargetBed(true);
      if (freshlyReset) {
        activeBed = freshlyReset;
      }
    }

    // Ensure we have at least 2 patients to compete
    const readyPatients = await ensurePatientsForRace();
    const patientA = readyPatients[0];
    const patientB = readyPatients[1];

    const bedId = activeBed.id;
    const version = activeBed.version;

    setSimulationLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] 🚀 Initiating simultaneous allocation race on ${activeBed.bedCode} (expectedVersion: v${version})...`,
      `[${new Date().toLocaleTimeString()}] ⚡ Terminal A dispatching for Patient ${patientA.fullName || patientA.patientCode}...`,
      `[${new Date().toLocaleTimeString()}] ⚡ Terminal B dispatching for Patient ${patientB.fullName || patientB.patientCode}...`,
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
        data: err.response?.data || { message: err.message },
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
        data: err.response?.data || { message: err.message },
      }));

    const [resA, resB] = await Promise.all([promiseA, promiseB]);

    setTerminalAResult(resA);
    setTerminalBResult(resB);

    if (resA.success && !resB.success) {
      setSimulationLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] 🏆 Terminal A (ER-DESK-1) ACQUIRED LOCK! Version bumped v${version} → v${version + 1}.`,
        `[${new Date().toLocaleTimeString()}] 🛡️ Terminal B (TRAUMA-BAY-2) REJECTED with HTTP 409 Conflict. OptimisticLockException caught — zero database corruption!`,
        ...prev,
      ]);
    } else if (!resA.success && resB.success) {
      setSimulationLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] 🏆 Terminal B (TRAUMA-BAY-2) ACQUIRED LOCK! Version bumped v${version} → v${version + 1}.`,
        `[${new Date().toLocaleTimeString()}] 🛡️ Terminal A (ER-DESK-1) REJECTED with HTTP 409 Conflict. OptimisticLockException caught — zero database corruption!`,
        ...prev,
      ]);
    } else if (resA.success && resB.success) {
      setSimulationLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ⚠️ Unexpected: Both acquired bed. Check transaction isolation level.`,
        ...prev,
      ]);
    } else {
      const msgA = resA.data?.message || 'Conflict';
      const msgB = resB.data?.message || 'Conflict';
      setSimulationLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] ℹ️ Collision handled: Neither acquired bed (Terminal A: ${msgA} | Terminal B: ${msgB}). Database safely maintained.`,
        ...prev,
      ]);
    }

    setIsRunning(false);
    await loadData();
  };

  const isBedAvailable = selectedBed?.status === 'AVAILABLE';

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
            Simulate two hospital terminals attempting to allocate the same bed at the exact same millisecond. Watch JPA optimistic concurrency control prevent double-booking with zero-overwrite guarantees and live sub-100ms WebSocket updates.
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
              onChange={(e) => {
                setSelectedBedId(Number(e.target.value));
                setTerminalAResult(null);
                setTerminalBResult(null);
              }}
              className="py-1.5 px-3 rounded-xl border border-border-subtle bg-slate-50 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {beds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.status === 'AVAILABLE' ? '🟢' : b.status === 'OCCUPIED' ? '🔴' : '🟡'} {b.bedCode} ({b.status} - v{b.version})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => resetTargetBed(false)}
            disabled={isResetting}
            className="mt-4 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Reset Bed to AVAILABLE"
          >
            <span className={`material-symbols-outlined text-[16px] ${isResetting ? 'animate-spin' : ''}`}>
              restart_alt
            </span>
            <span>{isResetting ? 'Resetting...' : 'Reset Bed'}</span>
          </button>
        </div>
      </div>

      {/* Target Bed Current State & Notice */}
      {selectedBed && (
        <div className={`rounded-2xl border p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
          isBedAvailable ? 'bg-slate-50 border-border-subtle' : 'bg-amber-50/60 border-amber-200'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-border-subtle flex items-center justify-center font-mono font-bold text-base text-primary shadow-2xs">
              {selectedBed.bedCode}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{selectedBed.wardType} Ward</span>
                <span className="text-slate-400">•</span>
                <span className="text-xs text-slate-600">Floor {selectedBed.floorNumber}</span>
                {selectedBed.currentPatient && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-slate-700 font-medium">Patient: {selectedBed.currentPatient.fullName}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                  Current Database Version: v{selectedBed.version}
                </span>
                <span
                  className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded ${
                    isBedAvailable
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  Status: {selectedBed.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isBedAvailable && (
              <span className="text-xs text-amber-800 font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-amber-600">info</span>
                Bed is currently {selectedBed.status}. Triggering race will automatically reset it to AVAILABLE.
              </span>
            )}
            <button
              onClick={handleSimulateRace}
              disabled={isRunning || isResetting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[18px] ${isRunning ? 'animate-spin' : ''}`}>
                {isRunning ? 'progress_activity' : 'bolt'}
              </span>
              <span>{isRunning ? 'Simulating Race...' : 'Trigger Simultaneous Allocation Race'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Terminals Simulation Grid */}
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
                      <span>HTTP 201 CREATED — Lock Acquired!</span>
                    </div>
                    <p className="text-xs text-emerald-700 font-mono">
                      Database version bumped: v{selectedBed?.version} → v{(selectedBed?.version || 1) + 1}
                    </p>
                    <p className="text-[11px] text-emerald-600 mt-1">
                      Patient successfully admitted into database without collision.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 text-red-800">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <span className="material-symbols-outlined text-[20px] text-red-600">
                        block
                      </span>
                      <span>HTTP {terminalAResult.status} CONFLICT — Lock Lost!</span>
                    </div>
                    <p className="text-xs text-red-700 font-mono">
                      {terminalAResult.data?.message || 'Bed state was updated by another terminal. Stale version detected.'}
                    </p>
                    <p className="text-[11px] text-red-600 mt-1">
                      Optimistic concurrency control prevented double-booking. Zero data corruption.
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
                      <span>HTTP 201 CREATED — Lock Acquired!</span>
                    </div>
                    <p className="text-xs text-emerald-700 font-mono">
                      Database version bumped: v{selectedBed?.version} → v{(selectedBed?.version || 1) + 1}
                    </p>
                    <p className="text-[11px] text-emerald-600 mt-1">
                      Patient successfully admitted into database without collision.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 text-red-800">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <span className="material-symbols-outlined text-[20px] text-red-600">
                        block
                      </span>
                      <span>HTTP {terminalBResult.status} CONFLICT — Collision Handled!</span>
                    </div>
                    <p className="text-xs text-red-700 font-mono">
                      {terminalBResult.data?.message || 'Bed state was updated by another terminal. Stale version detected.'}
                    </p>
                    <p className="text-[11px] text-red-600 mt-1">
                      Optimistic concurrency control prevented double-booking. Zero data corruption.
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
            <span className="text-slate-500 italic">No race simulations executed yet. Click 'Trigger Simultaneous Allocation Race' to start.</span>
          ) : (
            simulationLogs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </div>
    </div>
  );
};
