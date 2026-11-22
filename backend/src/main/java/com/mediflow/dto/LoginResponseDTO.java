package com.mediflow.dto;

public record LoginResponseDTO(
        String token,
        String role,
        String fullName,
        String employeeId,
        String terminalId,
        Long expiresInMs
) {}
