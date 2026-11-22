package com.mediflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * MediFlow — Real-Time Hospital Bed Allocation & Smart Triage Hub
 *
 * <p>Entry point for the Spring Boot 3.4.x application.
 * Virtual Threads (Project Loom) are enabled via:
 * {@code spring.threads.virtual.enabled=true} in application.properties.
 */
@SpringBootApplication
public class MediFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(MediFlowApplication.class, args);
    }
}
