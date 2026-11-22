package com.mediflow.dto;

import com.mediflow.domain.Bed;
import com.mediflow.domain.enums.BedStatus;
import com.mediflow.domain.enums.WardType;

import java.time.OffsetDateTime;

public record BedDTO(
        Long id,
        String bedCode,
        WardType wardType,
        Integer floorNumber,
        BedStatus status,
        Boolean hasVentilator,
        Long version,
        OffsetDateTime updatedAt,
        PatientSummaryDTO currentPatient
) {
    public static BedDTO from(Bed bed) {
        return new BedDTO(
                bed.getId(),
                bed.getBedCode(),
                bed.getWardType(),
                bed.getFloorNumber(),
                bed.getStatus(),
                bed.getHasVentilator(),
                bed.getVersion(),
                bed.getUpdatedAt(),
                null
        );
    }

    public static BedDTO from(Bed bed, PatientSummaryDTO patient) {
        return new BedDTO(
                bed.getId(),
                bed.getBedCode(),
                bed.getWardType(),
                bed.getFloorNumber(),
                bed.getStatus(),
                bed.getHasVentilator(),
                bed.getVersion(),
                bed.getUpdatedAt(),
                patient
        );
    }
}
