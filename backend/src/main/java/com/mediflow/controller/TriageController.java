package com.mediflow.controller;

import com.mediflow.dto.PatientDTO;
import com.mediflow.dto.TriageRequestDTO;
import com.mediflow.service.TriageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/triage")
public class TriageController {

    private final TriageService triageService;

    public TriageController(TriageService triageService) {
        this.triageService = triageService;
    }

    @GetMapping
    public ResponseEntity<List<PatientDTO>> getWaitingQueue() {
        return ResponseEntity.ok(triageService.getWaitingQueue());
    }

    @PostMapping
    public ResponseEntity<PatientDTO> createTriagePatient(@Valid @RequestBody TriageRequestDTO request) {
        PatientDTO patient = triageService.createTriageIntake(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(patient);
    }
}
