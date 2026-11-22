package com.mediflow.dto;

import com.mediflow.domain.enums.Gender;
import com.mediflow.domain.enums.WardType;
import jakarta.validation.constraints.*;

public record TriageRequestDTO(
        @NotBlank String fullName,
        @NotNull @Min(1) @Max(149) Integer age,
        @NotNull Gender gender,
        @NotBlank String chiefComplaint,
        String vitalsSummary,
        @NotNull @Min(1) @Max(4) Integer acuityLevel,
        WardType recommendedWard
) {}
