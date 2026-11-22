package com.mediflow.dto;

import com.mediflow.domain.AuditLog;

import java.time.OffsetDateTime;

public record AuditLogDTO(
        Long id,
        String terminalId,
        String actionType,
        String bedCode,
        String versionTransition,
        String staffRole,
        Long latencyMs,
        OffsetDateTime createdAt
) {
    public static AuditLogDTO from(AuditLog log) {
        return new AuditLogDTO(
                log.getId(), log.getTerminalId(), log.getActionType(),
                log.getBedCode(), log.getVersionTransition(), log.getStaffRole(),
                log.getLatencyMs(), log.getCreatedAt()
        );
    }
}
