package com.mediflow.service;

import com.mediflow.domain.AuditLog;
import com.mediflow.dto.AuditLogDTO;
import com.mediflow.repository.AuditLogRepository;
import com.mediflow.websocket.BedUpdateBroadcaster;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final BedUpdateBroadcaster broadcaster;

    public AuditService(AuditLogRepository auditLogRepository, BedUpdateBroadcaster broadcaster) {
        this.auditLogRepository = auditLogRepository;
        this.broadcaster = broadcaster;
    }

    @Transactional
    public AuditLogDTO recordAuditLog(String terminalId, String actionType, String bedCode,
                                     String versionTransition, String staffRole, Long latencyMs) {
        AuditLog auditLog = new AuditLog();
        auditLog.setTerminalId(terminalId != null ? terminalId : "SYSTEM");
        auditLog.setActionType(actionType);
        auditLog.setBedCode(bedCode);
        auditLog.setVersionTransition(versionTransition);
        auditLog.setStaffRole(staffRole);
        auditLog.setLatencyMs(latencyMs);
        auditLog.setCreatedAt(OffsetDateTime.now());

        AuditLog saved = auditLogRepository.saveAndFlush(auditLog);
        AuditLogDTO dto = AuditLogDTO.from(saved);
        broadcaster.broadcastAuditLog(dto);
        return dto;
    }

    @Transactional(readOnly = true)
    public List<AuditLogDTO> getRecentLogs(int limit) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit))
                .stream()
                .map(AuditLogDTO::from)
                .toList();
    }
}
