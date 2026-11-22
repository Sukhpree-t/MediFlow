package com.mediflow.security;

import com.mediflow.domain.StaffUser;
import com.mediflow.repository.StaffUserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MediFlowUserDetailsService implements UserDetailsService {

    private final StaffUserRepository staffUserRepository;

    public MediFlowUserDetailsService(StaffUserRepository staffUserRepository) {
        this.staffUserRepository = staffUserRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        StaffUser staff = staffUserRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("No staff found with email: " + email));

        return User.builder()
                .username(staff.getEmail())
                .password(staff.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority(staff.getRole().name())))
                .build();
    }
}
