package com.mediflow.controller;

import com.mediflow.domain.StaffUser;
import com.mediflow.dto.LoginRequestDTO;
import com.mediflow.dto.LoginResponseDTO;
import com.mediflow.repository.StaffUserRepository;
import com.mediflow.security.JwtTokenProvider;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final StaffUserRepository staffUserRepository;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtTokenProvider jwtTokenProvider,
                          StaffUserRepository staffUserRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.staffUserRepository = staffUserRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);

        StaffUser staff = staffUserRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException("Staff user not found: " + request.email()));

        String terminal = request.terminalId() != null && !request.terminalId().isBlank()
                ? request.terminalId()
                : (staff.getAssignedTerminal() != null ? staff.getAssignedTerminal() : "DESK-DEFAULT");

        return ResponseEntity.ok(new LoginResponseDTO(
                jwt,
                staff.getRole().name(),
                staff.getFullName(),
                staff.getEmployeeId(),
                terminal,
                jwtTokenProvider.getExpirationMs()
        ));
    }

    @PostMapping("/demo-login")
    public ResponseEntity<LoginResponseDTO> demoLogin(@RequestBody(required = false) Map<String, String> body) {
        String role = body != null && body.containsKey("role") ? body.get("role") : "COORDINATOR";
        String email = switch (role.toUpperCase()) {
            case "NURSE", "ROLE_WARD_NURSE" -> "simran.kaur@mediflow.org";
            case "ADMIN", "ROLE_ADMIN" -> "kavita.nair@mediflow.org";
            default -> "arjun.mehta@mediflow.org";
        };
        String terminal = body != null && body.containsKey("terminalId") ? body.get("terminalId") : "ER-DESK-1";

        return login(new LoginRequestDTO(email, "MediFlow@2026", terminal));
    }

    @GetMapping("/staff")
    public ResponseEntity<java.util.List<com.mediflow.dto.StaffUserDTO>> getStaffDirectory() {
        java.util.List<com.mediflow.dto.StaffUserDTO> staff = staffUserRepository.findAll().stream()
                .map(s -> new com.mediflow.dto.StaffUserDTO(
                        s.getId(),
                        s.getEmployeeId(),
                        s.getFullName(),
                        s.getEmail(),
                        s.getRole().name(),
                        s.getAssignedTerminal()
                ))
                .toList();
        return ResponseEntity.ok(staff);
    }
}
