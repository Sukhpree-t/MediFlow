package com.mediflow.dto;

public record AdmissionResponseDTO(
        Long admissionId,
        Long bedId,
        Long patientId,
        Long newBedVersion,
        String message
) {}
