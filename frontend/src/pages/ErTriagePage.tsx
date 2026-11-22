import React, { useState, useEffect } from 'react';
import { Patient, WardType, Gender } from '../types';
import api from '../api/client';
import { UserPlus, Clock, AlertCircle, HeartPulse, Sparkles } from 'lucide-react';

export const ErTriagePage: React.FC = () => {
  const [queue, setQueue] = useState<Patient[]>([]);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>(45);
  const [gender, setGender] = useState<Gender>('M');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [vitalsSummary, setVitalsSummary] = useState('BP: 130/85, HR: 88, SpO2: 97%');
  const [acuityLevel, setAcuityLevel] = useState<number>(2);
  const [recommendedWard, setRecommendedWard] = useState<WardType>('GENERAL');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/triage');
      setQueue(res.data);
    } catch (err) {
      console.error('Failed to load queue:', err);
    }
  };

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !age || !chiefComplaint) return;
    setLoading(true);
    setSuccessMsg(null);

    try {
      await api.post('/triage', {
        fullName,
        age: Number(age),
        gender,
        chiefComplaint,
        vitalsSummary,
        acuityLevel,
        recommendedWard,
      });

      setSuccessMsg(`Patient ${fullName} admitted to ER Triage Queue!`);
      setFullName('');
      setChiefComplaint('');
      fetchQueue();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit intake.');
    } finally {
      setLoading(false);
    }
  };

  const getAcuityBadge = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 2:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 3:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Emergency Intake Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg text-slate-900">Emergency Intake</h2>
              <p className="text-xs text-slate-500 font-mono">Real-time triage scoring engine</p>
            </div>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleIntakeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Patient Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Vikram Singhania"
                className="w-full text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2.5 border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Age
                </label>
                <input
                  type="number"
                  min="1"
                  max="149"
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2.5 border"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2.5 bg-white border"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Acuity Level (ESI 1-4)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setAcuityLevel(level);
                      if (level === 1) setRecommendedWard('ICU');
                      else if (level === 2) setRecommendedWard('GENERAL');
                    }}
                    className={`py-2 text-xs font-bold font-mono rounded-lg border transition-all ${
                      acuityLevel === level
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Level {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Chief Complaint
              </label>
              <textarea
                required
                rows={2}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Presenting symptoms, onset duration..."
                className="w-full text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2.5 border"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Vitals Telemetry
              </label>
              <input
                type="text"
                value={vitalsSummary}
                onChange={(e) => setVitalsSummary(e.target.value)}
                placeholder="BP, HR, SpO2, Temp"
                className="w-full text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2.5 border"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Recommended Ward Wing
              </label>
              <select
                value={recommendedWard}
                onChange={(e) => setRecommendedWard(e.target.value as WardType)}
                className="w-full text-xs rounded-lg border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-2.5 bg-white border"
              >
                <option value="ICU">ICU (Intensive Care)</option>
                <option value="GENERAL">General Ward</option>
                <option value="ISOLATION">Isolation Wing</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <HeartPulse className="w-4 h-4" />
              {loading ? 'Submitting Intake...' : 'Admit to Triage Queue'}
            </button>
          </form>
        </div>

        {/* Right: Prioritized Queue Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <h2 className="font-headline font-bold text-lg text-slate-900">
                Prioritized Waiting Queue
              </h2>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200 font-semibold">
              {queue.length} Waiting
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Patient Code</th>
                  <th className="py-2.5 px-3">Name & Age</th>
                  <th className="py-2.5 px-3">Acuity</th>
                  <th className="py-2.5 px-3">Chief Complaint</th>
                  <th className="py-2.5 px-3">Target Wing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-blue-600">
                      {p.patientCode}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{p.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {p.age} yrs • {p.gender}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-mono font-bold text-[10px] border ${getAcuityBadge(
                          p.acuityLevel
                        )}`}
                      >
                        Level {p.acuityLevel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {p.chiefComplaint}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] font-semibold text-slate-700">
                        {p.recommendedWard || 'ICU'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
