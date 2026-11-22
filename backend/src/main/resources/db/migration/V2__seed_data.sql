-- ============================================================
-- MediFlow V2 — Seed Data
-- BCrypt password for all staff: MediFlow@2026 (10 rounds)
-- Fully ANSI SQL / PostgreSQL / H2 compatible
-- ============================================================

-- ============================================================
-- Staff Users (4 accounts)
-- ============================================================
INSERT INTO app.staff_users (employee_id, full_name, email, password_hash, role, assigned_terminal)
SELECT 'EMP-001', 'Arjun Mehta', 'arjun.mehta@mediflow.org', '$2b$10$U2inSEw.ZsVZdkychMBgS.TB3vDGpXR0wOH5oq2Flq29NxzmlJ2QS', 'ROLE_ER_COORDINATOR', 'ER-DESK-1'
WHERE NOT EXISTS (SELECT 1 FROM app.staff_users WHERE email = 'arjun.mehta@mediflow.org');

INSERT INTO app.staff_users (employee_id, full_name, email, password_hash, role, assigned_terminal)
SELECT 'EMP-002', 'Simran Kaur', 'simran.kaur@mediflow.org', '$2b$10$U2inSEw.ZsVZdkychMBgS.TB3vDGpXR0wOH5oq2Flq29NxzmlJ2QS', 'ROLE_WARD_NURSE', 'ICU-STATION-A'
WHERE NOT EXISTS (SELECT 1 FROM app.staff_users WHERE email = 'simran.kaur@mediflow.org');

INSERT INTO app.staff_users (employee_id, full_name, email, password_hash, role, assigned_terminal)
SELECT 'EMP-003', 'Rohan Verma', 'rohan.verma@mediflow.org', '$2b$10$U2inSEw.ZsVZdkychMBgS.TB3vDGpXR0wOH5oq2Flq29NxzmlJ2QS', 'ROLE_WARD_NURSE', 'GEN-WARD-B'
WHERE NOT EXISTS (SELECT 1 FROM app.staff_users WHERE email = 'rohan.verma@mediflow.org');

INSERT INTO app.staff_users (employee_id, full_name, email, password_hash, role, assigned_terminal)
SELECT 'EMP-004', 'Kavita Nair', 'kavita.nair@mediflow.org', '$2b$10$U2inSEw.ZsVZdkychMBgS.TB3vDGpXR0wOH5oq2Flq29NxzmlJ2QS', 'ROLE_ADMIN', NULL
WHERE NOT EXISTS (SELECT 1 FROM app.staff_users WHERE email = 'kavita.nair@mediflow.org');

-- ============================================================
-- Beds — 18 total: ICU (6), GENERAL (8), ISOLATION (4)
-- ============================================================
INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'ICU-01', 'ICU', 2, 'OCCUPIED', TRUE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'ICU-01');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'ICU-02', 'ICU', 2, 'AVAILABLE', TRUE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'ICU-02');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'ICU-03', 'ICU', 2, 'OCCUPIED', TRUE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'ICU-03');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'ICU-04', 'ICU', 2, 'AVAILABLE', FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'ICU-04');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'ICU-05', 'ICU', 2, 'CLEANING', FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'ICU-05');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'ICU-06', 'ICU', 2, 'RESERVED', TRUE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'ICU-06');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'GEN-101', 'GENERAL', 3, 'OCCUPIED', FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'GEN-101');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'GEN-102', 'GENERAL', 3, 'OCCUPIED', FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'GEN-102');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'GEN-103', 'GENERAL', 3, 'AVAILABLE', FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'GEN-103');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'GEN-104', 'GENERAL', 3, 'OCCUPIED', FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'GEN-104');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'GEN-105', 'GENERAL', 3, 'AVAILABLE', FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'GEN-105');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'GEN-106', 'GENERAL', 3, 'CLEANING', FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'GEN-106');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'GEN-107', 'GENERAL', 3, 'AVAILABLE', FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'GEN-107');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'GEN-108', 'GENERAL', 3, 'AVAILABLE', FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'GEN-108');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'ISO-01', 'ISOLATION', 1, 'OCCUPIED', FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'ISO-01');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'ISO-02', 'ISOLATION', 1, 'OCCUPIED', FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'ISO-02');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'ISO-03', 'ISOLATION', 1, 'AVAILABLE', FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'ISO-03');

INSERT INTO app.beds (bed_code, ward_type, floor_number, status, has_ventilator, version)
SELECT 'ISO-04', 'ISOLATION', 1, 'CLEANING', FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM app.beds WHERE bed_code = 'ISO-04');

-- ============================================================
-- Patients — 11 total: 6 ADMITTED + 5 WAITING (triage queue)
-- ============================================================
INSERT INTO app.patients (patient_code, full_name, age, gender, chief_complaint, vitals_summary, acuity_level, recommended_ward, status)
SELECT 'PAT-001', 'Ravi Kumar', 45, 'M', 'Chest pain, shortness of breath', 'BP:160/95 HR:102 SpO2:94% Temp:37.1°C', 1, 'ICU', 'ADMITTED'
WHERE NOT EXISTS (SELECT 1 FROM app.patients WHERE patient_code = 'PAT-001');

INSERT INTO app.patients (patient_code, full_name, age, gender, chief_complaint, vitals_summary, acuity_level, recommended_ward, status)
SELECT 'PAT-002', 'Meena Sharma', 67, 'F', 'Altered consciousness, high fever', 'BP:90/60 HR:118 SpO2:91% Temp:39.8°C', 1, 'ICU', 'ADMITTED'
WHERE NOT EXISTS (SELECT 1 FROM app.patients WHERE patient_code = 'PAT-002');

INSERT INTO app.patients (patient_code, full_name, age, gender, chief_complaint, vitals_summary, acuity_level, recommended_ward, status)
SELECT 'PAT-003', 'Suresh Pillai', 52, 'M', 'Post-op monitoring — cardiac bypass', 'BP:120/80 HR:76 SpO2:98% Temp:36.8°C', 2, 'ICU', 'ADMITTED'
WHERE NOT EXISTS (SELECT 1 FROM app.patients WHERE patient_code = 'PAT-003');

INSERT INTO app.patients (patient_code, full_name, age, gender, chief_complaint, vitals_summary, acuity_level, recommended_ward, status)
SELECT 'PAT-004', 'Ananya Joshi', 34, 'F', 'Moderate asthma exacerbation', 'BP:130/85 HR:94 SpO2:95% Temp:37.3°C', 2, 'GENERAL', 'ADMITTED'
WHERE NOT EXISTS (SELECT 1 FROM app.patients WHERE patient_code = 'PAT-004');

INSERT INTO app.patients (patient_code, full_name, age, gender, chief_complaint, vitals_summary, acuity_level, recommended_ward, status)
SELECT 'PAT-005', 'Deepak Rao', 58, 'M', 'Cellulitis, wound care required', 'BP:140/88 HR:88 SpO2:97% Temp:38.1°C', 3, 'GENERAL', 'ADMITTED'
WHERE NOT EXISTS (SELECT 1 FROM app.patients WHERE patient_code = 'PAT-005');

INSERT INTO app.patients (patient_code, full_name, age, gender, chief_complaint, vitals_summary, acuity_level, recommended_ward, status)
SELECT 'PAT-006', 'Priya Nambiar', 29, 'F', 'Confirmed TB, respiratory isolation', 'BP:118/76 HR:82 SpO2:96% Temp:37.9°C', 2, 'ISOLATION', 'ADMITTED'
WHERE NOT EXISTS (SELECT 1 FROM app.patients WHERE patient_code = 'PAT-006');

INSERT INTO app.patients (patient_code, full_name, age, gender, chief_complaint, vitals_summary, acuity_level, recommended_ward, status)
SELECT 'PAT-007', 'Karan Malhotra', 41, 'M', 'Sudden severe headache, vomiting', 'BP:175/105 HR:96 SpO2:97% Temp:36.9°C', 1, 'ICU', 'WAITING'
WHERE NOT EXISTS (SELECT 1 FROM app.patients WHERE patient_code = 'PAT-007');

INSERT INTO app.patients (patient_code, full_name, age, gender, chief_complaint, vitals_summary, acuity_level, recommended_ward, status)
SELECT 'PAT-008', 'Lakshmi Iyer', 73, 'F', 'Hip fracture post-fall', 'BP:145/90 HR:88 SpO2:96% Temp:36.5°C', 2, 'GENERAL', 'WAITING'
WHERE NOT EXISTS (SELECT 1 FROM app.patients WHERE patient_code = 'PAT-008');

INSERT INTO app.patients (patient_code, full_name, age, gender, chief_complaint, vitals_summary, acuity_level, recommended_ward, status)
SELECT 'PAT-009', 'Amit Patel', 22, 'M', 'Suspected drug overdose', 'BP:100/65 HR:110 SpO2:92% Temp:36.2°C', 1, 'ICU', 'WAITING'
WHERE NOT EXISTS (SELECT 1 FROM app.patients WHERE patient_code = 'PAT-009');

INSERT INTO app.patients (patient_code, full_name, age, gender, chief_complaint, vitals_summary, acuity_level, recommended_ward, status)
SELECT 'PAT-010', 'Fatima Shaikh', 55, 'F', 'Uncontrolled diabetes, DKA', 'BP:135/82 HR:104 SpO2:98% Temp:37.4°C', 2, 'GENERAL', 'WAITING'
WHERE NOT EXISTS (SELECT 1 FROM app.patients WHERE patient_code = 'PAT-010');

INSERT INTO app.patients (patient_code, full_name, age, gender, chief_complaint, vitals_summary, acuity_level, recommended_ward, status)
SELECT 'PAT-011', 'Rajesh Nair', 38, 'M', 'Suspected active pulmonary TB', 'BP:122/78 HR:86 SpO2:95% Temp:38.3°C', 2, 'ISOLATION', 'WAITING'
WHERE NOT EXISTS (SELECT 1 FROM app.patients WHERE patient_code = 'PAT-011');

-- ============================================================
-- Admissions — link 6 admitted patients to occupied beds
-- ============================================================
INSERT INTO app.admissions (bed_id, patient_id, admitted_by_staff_id, attending_doctor, notes)
SELECT b.id, p.id, s.id, 'Dr. Priya Sharma', 'Patient stabilized on admission. Monitoring vitals hourly.'
FROM app.beds b, app.patients p, app.staff_users s
WHERE b.bed_code = 'ICU-01'
  AND p.patient_code = 'PAT-001'
  AND s.employee_id = 'EMP-001'
  AND NOT EXISTS (SELECT 1 FROM app.admissions a WHERE a.bed_id = b.id AND a.discharged_at IS NULL);

INSERT INTO app.admissions (bed_id, patient_id, admitted_by_staff_id, attending_doctor, notes)
SELECT b.id, p.id, s.id, 'Dr. Rahul Gupta', 'Sepsis protocol initiated. IV antibiotics administered.'
FROM app.beds b, app.patients p, app.staff_users s
WHERE b.bed_code = 'ICU-03'
  AND p.patient_code = 'PAT-002'
  AND s.employee_id = 'EMP-001'
  AND NOT EXISTS (SELECT 1 FROM app.admissions a WHERE a.bed_id = b.id AND a.discharged_at IS NULL);

INSERT INTO app.admissions (bed_id, patient_id, admitted_by_staff_id, attending_doctor, notes)
SELECT b.id, p.id, s.id, 'Dr. Priya Sharma', 'Post-bypass day 2. Hemodynamically stable. Weaning off ventilator.'
FROM app.beds b, app.patients p, app.staff_users s
WHERE b.bed_code = 'ICU-06'
  AND p.patient_code = 'PAT-003'
  AND s.employee_id = 'EMP-002'
  AND NOT EXISTS (SELECT 1 FROM app.admissions a WHERE a.bed_id = b.id AND a.discharged_at IS NULL);

INSERT INTO app.admissions (bed_id, patient_id, admitted_by_staff_id, attending_doctor, notes)
SELECT b.id, p.id, s.id, 'Dr. Sunita Kapoor', 'Nebulization q4h. SpO2 improving. Discharge expected in 48h.'
FROM app.beds b, app.patients p, app.staff_users s
WHERE b.bed_code = 'GEN-101'
  AND p.patient_code = 'PAT-004'
  AND s.employee_id = 'EMP-003'
  AND NOT EXISTS (SELECT 1 FROM app.admissions a WHERE a.bed_id = b.id AND a.discharged_at IS NULL);

INSERT INTO app.admissions (bed_id, patient_id, admitted_by_staff_id, attending_doctor, notes)
SELECT b.id, p.id, s.id, 'Dr. Sunita Kapoor', 'Wound debridement done. IV Cephalexin. Dressing change daily.'
FROM app.beds b, app.patients p, app.staff_users s
WHERE b.bed_code = 'GEN-102'
  AND p.patient_code = 'PAT-005'
  AND s.employee_id = 'EMP-003'
  AND NOT EXISTS (SELECT 1 FROM app.admissions a WHERE a.bed_id = b.id AND a.discharged_at IS NULL);

INSERT INTO app.admissions (bed_id, patient_id, admitted_by_staff_id, attending_doctor, notes)
SELECT b.id, p.id, s.id, 'Dr. Arvind Krishnan', 'DOTS protocol started. Contact tracing initiated. Strict isolation.'
FROM app.beds b, app.patients p, app.staff_users s
WHERE b.bed_code = 'ISO-01'
  AND p.patient_code = 'PAT-006'
  AND s.employee_id = 'EMP-002'
  AND NOT EXISTS (SELECT 1 FROM app.admissions a WHERE a.bed_id = b.id AND a.discharged_at IS NULL);

-- ============================================================
-- Audit Logs — 4 initial entries (only if table is empty)
-- ============================================================
INSERT INTO app.audit_logs (terminal_id, action_type, bed_code, version_transition, staff_role, latency_ms)
SELECT 'ER-DESK-1', 'BED_ALLOCATED', 'ICU-01', 'v1→v2', 'ROLE_ER_COORDINATOR', 42
WHERE NOT EXISTS (SELECT 1 FROM app.audit_logs);

INSERT INTO app.audit_logs (terminal_id, action_type, bed_code, version_transition, staff_role, latency_ms)
SELECT 'ICU-STATION-A', 'BED_ALLOCATED', 'ICU-03', 'v1→v2', 'ROLE_ER_COORDINATOR', 38
WHERE (SELECT COUNT(*) FROM app.audit_logs) = 1;

INSERT INTO app.audit_logs (terminal_id, action_type, bed_code, version_transition, staff_role, latency_ms)
SELECT 'ER-DESK-1', 'BED_ALLOCATED', 'GEN-101', 'v1→v2', 'ROLE_ER_COORDINATOR', 51
WHERE (SELECT COUNT(*) FROM app.audit_logs) = 2;

INSERT INTO app.audit_logs (terminal_id, action_type, bed_code, version_transition, staff_role, latency_ms)
SELECT 'ER-DESK-1', 'STATUS_UPDATED', 'ICU-05', 'v2→v3', 'ROLE_WARD_NURSE', 29
WHERE (SELECT COUNT(*) FROM app.audit_logs) = 3;
