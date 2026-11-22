package com.mediflow.exception;

public class VersionMismatchException extends RuntimeException {
    private final Long bedId;

    public VersionMismatchException(Long bedId, Long expected, Long actual) {
        super("Version mismatch for bed %d: expected=%d actual=%d".formatted(bedId, expected, actual));
        this.bedId = bedId;
    }

    public Long getBedId() { return bedId; }
}
