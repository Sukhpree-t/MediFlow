package com.mediflow.dto;

public record StaffUserDTO(
        Long id,
        String employeeId,
        String fullName,
        String email,
        String role,
        String assignedTerminal
) {}
