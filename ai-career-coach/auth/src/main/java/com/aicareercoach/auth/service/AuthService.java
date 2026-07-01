package com.aicareercoach.auth.service;

import com.aicareercoach.auth.dto.AuthResponse;
import com.aicareercoach.auth.dto.LoginRequest;
import com.aicareercoach.auth.dto.RegisterRequest;
import com.aicareercoach.auth.dto.UserProfileResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserProfileResponse getCurrentUser(String email);
}
