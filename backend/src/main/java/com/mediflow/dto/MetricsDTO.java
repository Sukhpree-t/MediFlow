package com.mediflow.dto;

public record MetricsDTO(
        long totalBeds,
        long availableBeds,
        long occupiedBeds,
        long cleaningBeds,
        long reservedBeds,
        long waitingPatients,
        long admittedPatients
) {}
