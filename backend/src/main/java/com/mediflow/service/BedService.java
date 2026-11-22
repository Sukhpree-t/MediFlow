package com.mediflow.service;

import com.mediflow.domain.Admission;
import com.mediflow.domain.Bed;
import com.mediflow.domain.enums.BedStatus;
import com.mediflow.domain.enums.WardType;
import com.mediflow.dto.BedDTO;
import com.mediflow.dto.BedStatusUpdateDTO;
import com.mediflow.dto.PatientSummaryDTO;
import com.mediflow.exception.ResourceNotFoundException;
import com.mediflow.repository.AdmissionRepository;
import com.mediflow.repository.BedRepository;
import com.mediflow.websocket.BedUpdateBroadcaster;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.Optional;

@Service
public class BedService {

    private final BedRepository bedRepository;
    private final AdmissionRepository admissionRepository;
    private final AuditService auditService;
    private final BedUpdateBroadcaster broadcaster;

    public BedService(BedRepository bedRepository,
                      AdmissionRepository admissionRepository,
                      AuditService auditService,
                      BedUpdateBroadcaster broadcaster) {
        this.bedRepository = bedRepository;
        this.admissionRepository = admissionRepository;
        this.auditService = auditService;
        this.broadcaster = broadcaster;
    }

    @Transactional(readOnly = true)
    public List<BedDTO> getAllBeds(WardType wardType, BedStatus status) {
        List<Bed> beds;
        if (wardType != null && status != null) {
            beds = bedRepository.findByWardTypeAndStatus(wardType, status);
        } else if (wardType != null) {
            beds = bedRepository.findByWardType(wardType);
        } else if (status != null) {
            beds = bedRepository.findByStatus(status);
        } else {
            beds = bedRepository.findAll();
        }

        return beds.stream().map(this::toBedDTO).toList();
    }

    @Transactional(readOnly = true)
    public BedDTO getBedById(Long id) {
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + id));
        return toBedDTO(bed);
    }

    @Transactional
    public BedDTO updateBedStatus(Long id, BedStatusUpdateDTO updateDTO, String staffRole) {
        long startTime = System.currentTimeMillis();
        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bed not found with id: " + id));

        Long oldVersion = bed.getVersion();
        bed.setStatus(updateDTO.status());
        Bed saved = bedRepository.saveAndFlush(bed);
        Long newVersion = saved.getVersion();

        long latency = System.currentTimeMillis() - startTime;
        String versionTransition = "v" + oldVersion + "→v" + newVersion;

        auditService.recordAuditLog(
                updateDTO.terminalId(),
                "STATUS_UPDATED",
                saved.getBedCode(),
                versionTransition,
                staffRole,
                latency
        );

        BedDTO bedDTO = toBedDTO(saved);
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

    public BedDTO toBedDTO(Bed bed) {
        Optional<Admission> activeAdmission = admissionRepository.findActiveByBedId(bed.getId());
        PatientSummaryDTO patientSummary = activeAdmission
                .map(a -> PatientSummaryDTO.from(a.getPatient()))
                .orElse(null);
        return BedDTO.from(bed, patientSummary);
    }
}
