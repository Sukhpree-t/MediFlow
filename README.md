# MediFlow — Real-Time Hospital Bed Allocation & Smart Triage Hub

MediFlow is an enterprise-grade clinical bed management and emergency triage orchestration system designed for trauma centers and intensive care networks. It eliminates bed race conditions via **JPA `@Version` optimistic concurrency control**, synchronizes live telemetry across clinical terminals via **sub-100ms STOMP WebSockets**, and enforces role-based access control via stateless **JWT security**.

---

## Architecture & System Overview

- **Backend**: Spring Boot 3.4.x running on **Java 21 / 25** (with **Virtual Threads** enabled via Project Loom).
- **Database**: Supabase PostgreSQL with Flyway-managed isolated `app` schema.
- **Frontend**: Vite + React 18 + TypeScript + Tailwind CSS implementing the **Cobalt Clinical** design system.
- **Real-Time Engine**: STOMP over WebSockets (`/ws`) broadcasting to `/topic/beds` and `/topic/audit` inside `TransactionSynchronization.afterCommit()` callbacks.
- **Zero-Collision Concurrency Guard**: JPA Optimistic Locking (`@Version BIGINT`) on `app.beds` with REST exception advice returning HTTP 409 Conflict alongside the latest bed state.

---

## Quick Start (Single-Command Startup)

### 1. Prerequisites
- **Java**: JDK 21 or JDK 25 installed.
- **Node.js**: v18+ and `npm`.
- **Database**: Supabase PostgreSQL project (or H2 test database).

---

### 2. Linux Startup

#### Option A: Running with Supabase PostgreSQL
```bash
# 1. Set environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and populate your SUPABASE_DB_URL, SUPABASE_DB_PASSWORD, and JWT_SECRET

# 2. Launch Backend
cd backend && JAVA_HOME=/usr/lib/jvm/java-25-openjdk-amd64 ./mvnw spring-boot:run &

# 3. Launch Frontend
cd ../frontend && npm install && npm run dev
```

#### Option B: Running with In-Memory H2 (Offline / Dev Mode)
```bash
# Start backend in test profile (in-memory H2 with schema + seed data applied)
cd backend && JAVA_HOME=/usr/lib/jvm/java-25-openjdk-amd64 ./mvnw test-compile && \
  JAVA_HOME=/usr/lib/jvm/java-25-openjdk-amd64 ./mvnw spring-boot:run -Dspring-boot.run.profiles=test &

# Start frontend
cd ../frontend && npm install && npm run dev
```

---

### 3. Windows Startup

```cmd
:: 1. Copy environment template
copy backend\.env.example backend\.env
:: Edit backend\.env with your Supabase credentials

:: 2. Launch Backend
cd backend
set JAVA_HOME=C:\Program Files\Java\jdk-21
mvnw.cmd spring-boot:run

:: 3. Launch Frontend (in a new terminal window)
cd frontend
npm install
npm run dev
```

---

## Demo Credentials & Clinical Terminals

| Role | Email | Password | Assigned Terminal | Key Capabilities |
|------|-------|----------|-------------------|------------------|
| **ER Coordinator** | `arjun.mehta@mediflow.org` | `MediFlow@2026` | `ER-DESK-1` | Triage intake, bed allocation, patient admissions |
| **Ward Nurse** | `simran.kaur@mediflow.org` | `MediFlow@2026` | `ICU-STATION-A` | Patient discharge, bed sanitization status updates |
| **Ward Nurse** | `rohan.verma@mediflow.org` | `MediFlow@2026` | `GEN-WARD-B` | General ward tracking and patient discharge |
| **Hospital Admin** | `kavita.nair@mediflow.org` | `MediFlow@2026` | *All Terminals* | System oversight, full audit logs, metrics telemetry |

> **Pro Tip**: Use the **1-Click Demo Presets** on the login screen (`http://localhost:5173/login`) to instantly log in as any role.

---

## Concurrency Testing (25 Parallel Terminals)

To verify the zero-collision concurrency guarantee under heavy hospital load:

```bash
cd backend
JAVA_HOME=/usr/lib/jvm/java-25-openjdk-amd64 ./mvnw test -Dtest=ConcurrentBedAllocationTest
```

**Test Invariant Verification**:
- Spawns **25 concurrent threads** via `ExecutorService` and `CountDownLatch`.
- All 25 threads fire simultaneously trying to admit patients into the same available bed (`ICU-02`) with identical `expectedVersion`.
- **Assertions verified**:
  - `successCount == 1` (HTTP 201 Created)
  - `conflictCount == 24` (HTTP 409 Conflict)
  - `bed.version` increments by exactly `+1` (e.g. `v1 → v2`)
  - Real-time audit entry logged with `LOCK_RETRY_RESOLVED` and sub-100ms latency.

---

## API Reference Summary

- `POST /api/auth/login` — Authenticate and receive stateless JWT.
- `GET /api/beds?wardType=&status=` — Live bed inventory with current occupant summary.
- `PATCH /api/beds/{id}/status` — Transition bed states (`AVAILABLE`, `CLEANING`, `RESERVED`).
- `GET /api/triage` — Emergency intake queue sorted by acuity level (1 to 4).
- `POST /api/triage` — Register incoming ER patient.
- `POST /api/admissions` — Admit patient to bed with `expectedVersion` concurrency guard.
- `POST /api/admissions/{bedId}/discharge` — Discharge patient and set bed to `CLEANING`.
- `GET /api/audit-logs` — Live ledger of all state and version transitions.
- `GET /api/metrics` — Aggregate hospital capacity and queue KPIs.
- `WS /ws` — STOMP endpoint (`/topic/beds`, `/topic/audit`).
