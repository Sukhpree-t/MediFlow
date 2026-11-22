package com.mediflow.controller;

import com.mediflow.dto.AdmissionRequestDTO;
import com.mediflow.dto.AdmissionResponseDTO;
import com.mediflow.dto.BedDTO;
import com.mediflow.dto.DischargeRequestDTO;
import com.mediflow.service.AdmissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admissions")
public class AdmissionController {

    private final AdmissionService admissionService;

    public AdmissionController(AdmissionService admissionService) {
        this.admissionService = admissionService;
    }

    @PostMapping
    public ResponseEntity<AdmissionResponseDTO> admitPatient(
            @Valid @RequestBody AdmissionRequestDTO request,
            Authentication authentication) {
        String staffEmail = authentication != null ? authentication.getName() : "arjun.mehta@mediflow.org";
        AdmissionResponseDTO response = admissionService.admitPatient(request, staffEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{bedId}/discharge")
    public ResponseEntity<BedDTO> dischargePatient(
            @PathVariable Long bedId,
            @RequestBody(required = false) DischargeRequestDTO request,
            Authentication authentication) {
        String staffEmail = authentication != null ? authentication.getName() : "simran.kaur@mediflow.org";
        BedDTO bedDTO = admissionService.dischargePatient(bedId, request, staffEmail);
        return ResponseEntity.ok(bedDTO);
    }
}
