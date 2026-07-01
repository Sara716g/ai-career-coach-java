package com.aicareercoach.auth.mapper;

import com.aicareercoach.auth.dto.AuthResponse;
import com.aicareercoach.auth.dto.UserProfileResponse;
import com.aicareercoach.auth.entity.RoleType;
import com.aicareercoach.auth.entity.User;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AuthMapper {

    public UserProfileResponse toProfileResponse(User user) {
        Set<RoleType> roles = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet());

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(roles)
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public AuthResponse toAuthResponse(String accessToken, long expiresInMs, User user) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresInMs(expiresInMs)
                .user(toProfileResponse(user))
                .build();
    }
}
