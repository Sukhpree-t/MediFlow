package com.mediflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdmissionRequestDTO(
        @NotNull Long bedId,
        @NotNull Long patientId,
        @NotNull Long expectedVersion,
        String attendingDoctor,
        String notes,
        String terminalId
) {}
