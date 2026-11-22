package com.mediflow.dto;

import com.mediflow.domain.Patient;

public record PatientSummaryDTO(
        Long id,
        String patientCode,
        String fullName,
        Integer age,
        String chiefComplaint,
        Integer acuityLevel
) {
    public static PatientSummaryDTO from(Patient p) {
        return new PatientSummaryDTO(
                p.getId(), p.getPatientCode(), p.getFullName(),
                p.getAge(), p.getChiefComplaint(), p.getAcuityLevel()
        );
    }
}
