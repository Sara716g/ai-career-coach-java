package com.aicareercoach.auth.service;

import com.aicareercoach.auth.entity.RoleType;
import com.aicareercoach.auth.entity.User;
import com.aicareercoach.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(normalizeEmail(username))
                .orElseThrow(() -> new UsernameNotFoundException("Invalid email or password"));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .disabled(!user.isEnabled())
                .authorities(user.getRoles().stream()
                        .map(role -> toAuthority(role.getName()))
                        .collect(Collectors.toSet()))
                .build();
    }

    static SimpleGrantedAuthority toAuthority(RoleType roleType) {
        return new SimpleGrantedAuthority("ROLE_" + roleType.name());
    }

    static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
