package com.aicareercoach.auth.service;

import com.aicareercoach.auth.dto.AuthResponse;
import com.aicareercoach.auth.dto.LoginRequest;
import com.aicareercoach.auth.dto.RegisterRequest;
import com.aicareercoach.auth.dto.UserProfileResponse;
import com.aicareercoach.auth.entity.Role;
import com.aicareercoach.auth.entity.RoleType;
import com.aicareercoach.auth.entity.User;
import com.aicareercoach.auth.mapper.AuthMapper;
import com.aicareercoach.auth.repository.RoleRepository;
import com.aicareercoach.auth.repository.UserRepository;
import com.aicareercoach.auth.security.JwtTokenProvider;
import com.aicareercoach.common.exception.BusinessException;
import com.aicareercoach.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final AuthMapper authMapper;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = UserDetailsServiceImpl.normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new BusinessException("Email is already registered", HttpStatus.CONFLICT, "EMAIL_EXISTS");
        }

        Role userRole = roleRepository.findByName(RoleType.USER)
                .orElseThrow(() -> new ResourceNotFoundException("Role", RoleType.USER));

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .roles(Set.of(userRole))
                .enabled(true)
                .build();

        User saved = userRepository.save(user);
        return issueToken(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = UserDetailsServiceImpl.normalizeEmail(request.getEmail());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));

        return issueToken(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(UserDetailsServiceImpl.normalizeEmail(email))
                .orElseThrow(() -> new ResourceNotFoundException("User", email));
        return authMapper.toProfileResponse(user);
    }

    private AuthResponse issueToken(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtTokenProvider.generateToken(userDetails);
        return authMapper.toAuthResponse(token, jwtTokenProvider.getExpirationMs(), user);
    }
}
