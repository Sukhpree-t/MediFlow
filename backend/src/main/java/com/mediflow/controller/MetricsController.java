package com.mediflow.controller;

import com.mediflow.domain.enums.BedStatus;
import com.mediflow.domain.enums.PatientStatus;
import com.mediflow.dto.MetricsDTO;
import com.mediflow.repository.BedRepository;
import com.mediflow.repository.PatientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/metrics")
public class MetricsController {

    private final BedRepository bedRepository;
    private final PatientRepository patientRepository;

    public MetricsController(BedRepository bedRepository, PatientRepository patientRepository) {
        this.bedRepository = bedRepository;
        this.patientRepository = patientRepository;
    }

    @GetMapping
    public ResponseEntity<MetricsDTO> getMetrics() {
        long totalBeds = bedRepository.count();
        long availableBeds = bedRepository.countByStatus(BedStatus.AVAILABLE);
        long occupiedBeds = bedRepository.countByStatus(BedStatus.OCCUPIED);
        long cleaningBeds = bedRepository.countByStatus(BedStatus.CLEANING);
        long reservedBeds = bedRepository.countByStatus(BedStatus.RESERVED);

        long waitingPatients = patientRepository.countByStatus(PatientStatus.WAITING);
        long admittedPatients = patientRepository.countByStatus(PatientStatus.ADMITTED);

        return ResponseEntity.ok(new MetricsDTO(
                totalBeds,
                availableBeds,
                occupiedBeds,
                cleaningBeds,
                reservedBeds,
                waitingPatients,
                admittedPatients
        ));
    }
}
