package com.mediflow.exception;

/**
 * Thrown when a concurrent bed modification is detected via JPA optimistic locking.
 * Carries the bed ID so the exception handler can re-fetch the latest state.
 */
public class BedConcurrentModificationException extends RuntimeException {

    private final Long bedId;
    private final String bedCode;
    private final Long detectedVersion;

    public BedConcurrentModificationException(Long bedId, String bedCode, Long detectedVersion) {
        super("Concurrent modification detected for bed %s (id=%d, detectedVersion=%d)"
                .formatted(bedCode, bedId, detectedVersion));
        this.bedId = bedId;
        this.bedCode = bedCode;
        this.detectedVersion = detectedVersion;
    }

    public Long getBedId() { return bedId; }
    public String getBedCode() { return bedCode; }
    public Long getDetectedVersion() { return detectedVersion; }
}
