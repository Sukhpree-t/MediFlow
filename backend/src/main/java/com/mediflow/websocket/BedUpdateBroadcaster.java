package com.mediflow.websocket;

import com.mediflow.dto.AuditLogDTO;
import com.mediflow.dto.BedDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class BedUpdateBroadcaster {

    private static final Logger log = LoggerFactory.getLogger(BedUpdateBroadcaster.class);

    private final SimpMessagingTemplate messagingTemplate;

    public BedUpdateBroadcaster(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void broadcastBedUpdate(BedDTO bedDTO) {
        log.info("Broadcasting bed update to /topic/beds: bedCode={}, status={}, version={}",
                bedDTO.bedCode(), bedDTO.status(), bedDTO.version());
        messagingTemplate.convertAndSend("/topic/beds", bedDTO);
    }

    public void broadcastAuditLog(AuditLogDTO auditLogDTO) {
        log.info("Broadcasting audit log to /topic/audit: action={}, bedCode={}, versionTransition={}",
                auditLogDTO.actionType(), auditLogDTO.bedCode(), auditLogDTO.versionTransition());
        messagingTemplate.convertAndSend("/topic/audit", auditLogDTO);
    }
}
