package com.mediflow;

import com.mediflow.domain.Bed;
import com.mediflow.domain.Patient;
import com.mediflow.domain.enums.BedStatus;
import com.mediflow.domain.enums.Gender;
import com.mediflow.domain.enums.PatientStatus;
import com.mediflow.domain.enums.WardType;
import com.mediflow.dto.AdmissionRequestDTO;
import com.mediflow.dto.LoginRequestDTO;
import com.mediflow.dto.LoginResponseDTO;
import com.mediflow.repository.BedRepository;
import com.mediflow.repository.PatientRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class ConcurrentBedAllocationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Test
    @DisplayName("25 concurrent threads attempting to allocate ICU-02: exactly 1 success, 24 conflicts (HTTP 409), and 1 version increment")
    void testTwentyFiveConcurrentBedAllocations() throws Exception {
        // 1. Obtain JWT token as ER Coordinator
        LoginRequestDTO loginReq = new LoginRequestDTO(
                "arjun.mehta@mediflow.org",
                "MediFlow@2026",
                "ER-DESK-1"
        );
        ResponseEntity<LoginResponseDTO> loginResp = restTemplate.postForEntity(
                "/api/auth/login", loginReq, LoginResponseDTO.class
        );
        assertThat(loginResp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(loginResp.getBody()).isNotNull();
        String jwtToken = loginResp.getBody().token();

        // 2. Prepare Bed ICU-02: ensure AVAILABLE status and record initial version
        Bed bed = bedRepository.findByBedCode("ICU-02")
                .orElseThrow(() -> new IllegalStateException("ICU-02 not found in seed data"));
        bed.setStatus(BedStatus.AVAILABLE);
        bed = bedRepository.saveAndFlush(bed);
        final Long bedId = bed.getId();
        final Long expectedVersion = bed.getVersion();

        // 3. Create 25 distinct waiting patients for each competing thread
        final int THREAD_COUNT = 25;
        List<Long> patientIds = new ArrayList<>();
        for (int i = 1; i <= THREAD_COUNT; i++) {
            Patient p = new Patient();
            p.setPatientCode("CONCUR-PAT-" + i + "-" + System.currentTimeMillis());
            p.setFullName("Concurrent Test Patient " + i);
            p.setAge(30 + i);
            p.setGender(Gender.M);
            p.setChiefComplaint("Simulated emergency " + i);
            p.setAcuityLevel(1);
            p.setRecommendedWard(WardType.ICU);
            p.setStatus(PatientStatus.WAITING);
            p.setArrivalTime(OffsetDateTime.now());
            Patient saved = patientRepository.saveAndFlush(p);
            patientIds.add(saved.getId());
        }

        // 4. Set up concurrency primitives
        ExecutorService executor = Executors.newFixedThreadPool(THREAD_COUNT);
        CountDownLatch readyLatch = new CountDownLatch(THREAD_COUNT);
        CountDownLatch startLatch = new CountDownLatch(1);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        AtomicInteger otherErrors = new AtomicInteger(0);

        List<Future<?>> futures = new ArrayList<>();

        for (int i = 0; i < THREAD_COUNT; i++) {
            final Long patientId = patientIds.get(i);
            final String terminal = "ER-TERM-" + (i + 1);

            futures.add(executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await(); // Wait for simultaneous firing

                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_JSON);
                    headers.setBearerAuth(jwtToken);

                    AdmissionRequestDTO request = new AdmissionRequestDTO(
                            bedId,
                            patientId,
                            expectedVersion, // All 25 threads pass the EXACT SAME expectedVersion
                            "Dr. Test Concurrency",
                            "Concurrent allocation benchmark thread",
                            terminal
                    );

                    HttpEntity<AdmissionRequestDTO> entity = new HttpEntity<>(request, headers);
                    ResponseEntity<String> response = restTemplate.postForEntity(
                            "/api/admissions", entity, String.class
                    );

                    if (response.getStatusCode() == HttpStatus.CREATED) {
                        successCount.incrementAndGet();
                    } else if (response.getStatusCode() == HttpStatus.CONFLICT) {
                        conflictCount.incrementAndGet();
                    } else {
                        System.out.println("THREAD ERROR: status=" + response.getStatusCode() + " body=" + response.getBody());
                        otherErrors.incrementAndGet();
                    }
                } catch (Exception e) {
                    System.out.println("THREAD EXCEPTION: " + e.getMessage());
                    e.printStackTrace();
                    otherErrors.incrementAndGet();
                }
            }));
        }

        readyLatch.await(10, TimeUnit.SECONDS);
        startLatch.countDown(); // FIRE ALL 25 SIMULTANEOUSLY

        for (Future<?> f : futures) {
            f.get(15, TimeUnit.SECONDS);
        }

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        // 5. Assert concurrency invariants
        assertThat(successCount.get())
                .as("Exactly ONE thread must succeed in allocating the bed")
                .isEqualTo(1);

        assertThat(conflictCount.get())
                .as("The remaining 24 threads must receive HTTP 409 Conflict")
                .isEqualTo(24);

        assertThat(otherErrors.get())
                .as("There should be zero unexpected errors")
                .isEqualTo(0);

        // 6. Assert database state: single version increment and OCCUPIED status
        Bed finalBedState = bedRepository.findById(bedId).orElseThrow();
        assertThat(finalBedState.getStatus()).isEqualTo(BedStatus.OCCUPIED);
        assertThat(finalBedState.getVersion())
                .as("Bed version must be incremented by exactly 1")
                .isEqualTo(expectedVersion + 1);
    }
}
