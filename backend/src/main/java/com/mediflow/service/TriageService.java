package com.mediflow.service;

import com.mediflow.domain.Patient;
import com.mediflow.domain.enums.PatientStatus;
import com.mediflow.dto.PatientDTO;
import com.mediflow.dto.TriageRequestDTO;
import com.mediflow.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TriageService {

    private final PatientRepository patientRepository;

    public TriageService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Transactional(readOnly = true)
    public List<PatientDTO> getWaitingQueue() {
        return patientRepository.findByStatusOrderByAcuityLevelAscArrivalTimeAsc(PatientStatus.WAITING)
                .stream()
                .map(PatientDTO::from)
                .toList();
    }

    @Transactional
    public PatientDTO createTriageIntake(TriageRequestDTO request) {
        Patient patient = new Patient();
        String code = "PAT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        patient.setPatientCode(code);
        patient.setFullName(request.fullName());
        patient.setAge(request.age());
        patient.setGender(request.gender());
        patient.setChiefComplaint(request.chiefComplaint());
        patient.setVitalsSummary(request.vitalsSummary());
        patient.setAcuityLevel(request.acuityLevel());
        patient.setRecommendedWard(request.recommendedWard());
        patient.setStatus(PatientStatus.WAITING);
        patient.setArrivalTime(OffsetDateTime.now());

        Patient saved = patientRepository.save(patient);
        return PatientDTO.from(saved);
    }
}
