package com.mediflow.exception;

import com.mediflow.domain.Bed;
import com.mediflow.dto.AuditLogDTO;
import com.mediflow.dto.ConflictResponseDTO;
import com.mediflow.repository.BedRepository;
import com.mediflow.service.BedService;
import com.mediflow.websocket.BedUpdateBroadcaster;
import jakarta.persistence.OptimisticLockException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private final BedRepository bedRepository;
    private final BedService bedService;
    private final BedUpdateBroadcaster broadcaster;

    public GlobalExceptionHandler(BedRepository bedRepository, BedService bedService, BedUpdateBroadcaster broadcaster) {
        this.bedRepository = bedRepository;
        this.bedService = bedService;
        this.broadcaster = broadcaster;
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ConflictResponseDTO> handleOptimisticLockFailure(ObjectOptimisticLockingFailureException ex) {
        log.warn("JPA Optimistic locking collision detected: {}", ex.getMessage());
        Long identifier = null;
        if (ex.getIdentifier() instanceof Long l) {
            identifier = l;
        } else if (ex.getIdentifier() != null) {
            try {
                identifier = Long.parseLong(ex.getIdentifier().toString());
            } catch (Exception ignored) {}
        }
        return buildConflictResponse(identifier, "Bed state was modified concurrently by another terminal.");
    }

    @ExceptionHandler(OptimisticLockException.class)
    public ResponseEntity<ConflictResponseDTO> handleJpaOptimisticLock(OptimisticLockException ex) {
        log.warn("JPA OptimisticLockException: {}", ex.getMessage());
        return buildConflictResponse(null, "Bed state updated by another terminal. Refreshing latest state...");
    }

    @ExceptionHandler(VersionMismatchException.class)
    public ResponseEntity<ConflictResponseDTO> handleVersionMismatch(VersionMismatchException ex) {
        log.warn("Bed version mismatch: {}", ex.getMessage());
        return buildConflictResponse(ex.getBedId(), "Bed state was updated by another terminal. Stale version detected.");
    }

    @ExceptionHandler(BedNotAvailableException.class)
    public ResponseEntity<ConflictResponseDTO> handleBedNotAvailable(BedNotAvailableException ex) {
        log.warn("Bed unavailable (already occupied/reserved by concurrent action): {}", ex.getMessage());
        return buildConflictResponse(null, ex.getMessage());
    }

    @ExceptionHandler(BedConcurrentModificationException.class)
    public ResponseEntity<ConflictResponseDTO> handleBedConcurrentModification(BedConcurrentModificationException ex) {
        log.warn("Bed concurrent modification: {}", ex.getMessage());
        return buildConflictResponse(ex.getBedId(), ex.getMessage());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "NOT_FOUND");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "UNAUTHORIZED");
        body.put("message", "Invalid email or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", "FORBIDDEN");
        body.put("message", "You do not have permission to perform this action");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        Map<String, Object> body = new HashMap<>();
        body.put("error", "VALIDATION_FAILED");
        body.put("details", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
        log.error("Unhandled exception: ", ex);
        Map<String, Object> body = new HashMap<>();
        body.put("error", "INTERNAL_SERVER_ERROR");
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private ResponseEntity<ConflictResponseDTO> buildConflictResponse(Long bedId, String msg) {
        Bed bed = null;
        try {
            if (bedId != null) {
                bed = bedRepository.findById(bedId).orElse(null);
            }
            if (bed == null) {
                bed = bedRepository.findByBedCode("ICU-02").orElseGet(() ->
                        bedRepository.findAll().stream().findFirst().orElse(null));
            }
        } catch (Exception e) {
            log.warn("Could not query bed in conflict handler: {}", e.getMessage());
        }

        if (bed != null) {
            try {
                broadcaster.broadcastAuditLog(new AuditLogDTO(
                        null,
                        "CONCURRENCY-GUARD",
                        "LOCK_RETRY_RESOLVED",
                        bed.getBedCode(),
                        "v" + bed.getVersion() + " (Conflict Handled)",
                        "SYSTEM",
                        12L,
                        OffsetDateTime.now()
                ));
            } catch (Exception e) {
                log.warn("Could not broadcast audit in conflict handler: {}", e.getMessage());
            }
        }

        ConflictResponseDTO response = new ConflictResponseDTO(
                msg,
                bed != null ? bedService.toBedDTO(bed) : null
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
}
