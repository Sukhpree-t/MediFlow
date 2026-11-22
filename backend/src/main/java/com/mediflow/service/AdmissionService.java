package com.mediflow.service;

import com.mediflow.domain.Admission;
import com.mediflow.domain.Bed;
import com.mediflow.domain.Patient;
import com.mediflow.domain.StaffUser;
import com.mediflow.domain.enums.BedStatus;
import com.mediflow.domain.enums.PatientStatus;
import com.mediflow.dto.AdmissionRequestDTO;
import com.mediflow.dto.AdmissionResponseDTO;
import com.mediflow.dto.BedDTO;
import com.mediflow.dto.DischargeRequestDTO;
import com.mediflow.dto.PatientSummaryDTO;
import com.mediflow.exception.BedNotAvailableException;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.exception.VersionMismatchException;
import com.mediflow.repository.AdmissionRepository;
import com.mediflow.repository.BedRepository;
import com.mediflow.repository.PatientRepository;
import com.mediflow.repository.StaffUserRepository;
import com.mediflow.websocket.BedUpdateBroadcaster;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.OffsetDateTime;

@Service
public class AdmissionService {

    private final BedRepository bedRepository;
    private final PatientRepository patientRepository;
    private final AdmissionRepository admissionRepository;
    private final StaffUserRepository staffUserRepository;
    private final AuditService auditService;
    private final BedUpdateBroadcaster broadcaster;

    public AdmissionService(BedRepository bedRepository,
                            PatientRepository patientRepository,
                            AdmissionRepository admissionRepository,
                            StaffUserRepository staffUserRepository,
                            AuditService auditService,
                            BedUpdateBroadcaster broadcaster) {
        this.bedRepository = bedRepository;
        this.patientRepository = patientRepository;
        this.admissionRepository = admissionRepository;
        this.staffUserRepository = staffUserRepository;
        this.auditService = auditService;
        this.broadcaster = broadcaster;
    }

    @Transactional
    public AdmissionResponseDTO admitPatient(AdmissionRequestDTO request, String staffEmail) {
        long startTime = System.currentTimeMillis();

        Bed bed = bedRepository.findById(request.bedId())
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + request.bedId()));

        // Pre-check version matching before modifying
        if (!request.expectedVersion().equals(bed.getVersion())) {
            throw new VersionMismatchException(bed.getId(), request.expectedVersion(), bed.getVersion());
        }

        if (bed.getStatus() != BedStatus.AVAILABLE) {
            throw new BedNotAvailableException(bed.getBedCode(), bed.getStatus());
        }

        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + request.patientId()));

        StaffUser staffUser = staffUserRepository.findByEmail(staffEmail)
                .orElseGet(() -> staffUserRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No staff user found")));

        Long oldVersion = bed.getVersion();
        bed.setStatus(BedStatus.OCCUPIED);
        Bed savedBed = bedRepository.saveAndFlush(bed);
        Long newVersion = savedBed.getVersion();

        patient.setStatus(PatientStatus.ADMITTED);
        patientRepository.save(patient);

        Admission admission = new Admission();
        admission.setBed(savedBed);
        admission.setPatient(patient);
        admission.setAdmittedByStaff(staffUser);
        admission.setAttendingDoctor(request.attendingDoctor() != null ? request.attendingDoctor() : "Dr. On Duty");
        admission.setAdmittedAt(OffsetDateTime.now());
        admission.setNotes(request.notes());
        Admission savedAdmission = admissionRepository.save(admission);

        long latency = System.currentTimeMillis() - startTime;
        String versionTransition = "v" + oldVersion + "→v" + newVersion;

        auditService.recordAuditLog(
                request.terminalId(),
                "BED_ALLOCATED",
                savedBed.getBedCode(),
                versionTransition,
                staffUser.getRole().name(),
                latency
        );

        BedDTO bedDTO = BedDTO.from(savedBed, PatientSummaryDTO.from(patient));
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    broadcaster.broadcastBedUpdate(bedDTO);
                }
            });
        } else {
            broadcaster.broadcastBedUpdate(bedDTO);
        }

        return new AdmissionResponseDTO(
                savedAdmission.getId(),
                savedBed.getId(),
                patient.getId(),
                newVersion,
                "Patient successfully admitted to " + savedBed.getBedCode()
        );
    }

    @Transactional
    public BedDTO dischargePatient(Long bedId, DischargeRequestDTO request, String staffEmail) {
        long startTime = System.currentTimeMillis();

        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + bedId));

        Admission activeAdmission = admissionRepository.findActiveByBedId(bedId)
                .orElseThrow(() -> new ResourceNotFoundException("No active admission for bed: " + bed.getBedCode()));

        StaffUser staffUser = staffUserRepository.findByEmail(staffEmail)
                .orElseGet(() -> staffUserRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No staff user found")));

        activeAdmission.setDischargedAt(OffsetDateTime.now());
        if (request != null && request.notes() != null) {
            String existingNotes = activeAdmission.getNotes() != null ? activeAdmission.getNotes() + "\n" : "";
            activeAdmission.setNotes(existingNotes + "Discharge Notes: " + request.notes());
        }
        admissionRepository.save(activeAdmission);

        Patient patient = activeAdmission.getPatient();
        patient.setStatus(PatientStatus.DISCHARGED);
        patientRepository.save(patient);

        Long oldVersion = bed.getVersion();
        bed.setStatus(BedStatus.CLEANING);
        Bed savedBed = bedRepository.saveAndFlush(bed);
        Long newVersion = savedBed.getVersion();

        long latency = System.currentTimeMillis() - startTime;
        String versionTransition = "v" + oldVersion + "→v" + newVersion;

        auditService.recordAuditLog(
                request != null ? request.terminalId() : "NURSE-STATION",
                "BED_RELEASED",
                savedBed.getBedCode(),
                versionTransition,
                staffUser.getRole().name(),
                latency
        );

        BedDTO bedDTO = BedDTO.from(savedBed, null);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    broadcaster.broadcastBedUpdate(bedDTO);
                }
            });
        } else {
            broadcaster.broadcastBedUpdate(bedDTO);
        }

        return bedDTO;
    }
}
