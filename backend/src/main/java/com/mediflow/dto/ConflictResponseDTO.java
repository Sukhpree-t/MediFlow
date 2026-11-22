package com.mediflow.dto;

public record ConflictResponseDTO(
        String message,
        BedDTO latestBed
) {}
