package com.mediflow.exception;

import com.mediflow.domain.enums.BedStatus;

public class BedNotAvailableException extends RuntimeException {
    public BedNotAvailableException(String bedCode, BedStatus currentStatus) {
        super("Bed %s is not available (current status: %s)".formatted(bedCode, currentStatus));
    }
}
