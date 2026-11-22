export type WardType = 'ICU' | 'GENERAL' | 'ISOLATION';
export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'RESERVED';
export type StaffRole = 'ROLE_ER_COORDINATOR' | 'ROLE_WARD_NURSE' | 'ROLE_ADMIN';
export type PatientStatus = 'WAITING' | 'ADMITTED' | 'DISCHARGED';
export type Gender = 'M' | 'F' | 'OTHER';

export interface PatientSummary {
  id: number;
  patientCode: string;
  fullName: string;
  age: number;
  chiefComplaint: string;
  acuityLevel: number;
}

export interface Bed {
  id: number;
  bedCode: string;
  wardType: WardType;
  floorNumber: number;
  status: BedStatus;
  hasVentilator: boolean;
  version: number;
  updatedAt: string;
  currentPatient?: PatientSummary | null;
}

export interface Patient {
  id: number;
  patientCode: string;
  fullName: string;
  age: number;
  gender: Gender;
  chiefComplaint: string;
  vitalsSummary?: string;
  acuityLevel: number;
  recommendedWard?: WardType;
  status: PatientStatus;
  arrivalTime: string;
}

export interface AuditLog {
  id: number;
  terminalId: string;
  actionType: string;
  bedCode: string;
  versionTransition: string;
  staffRole: string;
  latencyMs: number;
  createdAt: string;
}

export interface Metrics {
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  cleaningBeds: number;
  reservedBeds: number;
  waitingPatients: number;
  admittedPatients: number;
}

export interface UserSession {
  token: string;
  role: StaffRole;
  fullName: string;
  employeeId: string;
  terminalId: string;
  expiresInMs: number;
}

export interface ConflictResponse {
  message: string;
  latestBed?: Bed;
}
