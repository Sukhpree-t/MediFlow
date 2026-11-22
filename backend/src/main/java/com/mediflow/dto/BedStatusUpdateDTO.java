package com.mediflow.dto;

import com.mediflow.domain.enums.BedStatus;
import jakarta.validation.constraints.NotNull;

public record BedStatusUpdateDTO(
        @NotNull BedStatus status,
        String terminalId
) {}
