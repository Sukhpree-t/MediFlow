package com.mediflow.dto;

import com.mediflow.domain.Patient;
import com.mediflow.domain.enums.Gender;
import com.mediflow.domain.enums.PatientStatus;
import com.mediflow.domain.enums.WardType;

import java.time.OffsetDateTime;

public record PatientDTO(
        Long id,
        String patientCode,
        String fullName,
        Integer age,
        Gender gender,
        String chiefComplaint,
        String vitalsSummary,
        Integer acuityLevel,
        WardType recommendedWard,
        PatientStatus status,
        OffsetDateTime arrivalTime
) {
    public static PatientDTO from(Patient p) {
        return new PatientDTO(
                p.getId(), p.getPatientCode(), p.getFullName(), p.getAge(),
                p.getGender(), p.getChiefComplaint(), p.getVitalsSummary(),
                p.getAcuityLevel(), p.getRecommendedWard(), p.getStatus(), p.getArrivalTime()
        );
    }
}
