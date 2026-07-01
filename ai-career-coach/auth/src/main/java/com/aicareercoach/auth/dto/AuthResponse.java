package com.aicareercoach.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
@Schema(description = "JWT authentication response")
public class AuthResponse {

    @Schema(example = "eyJhbGciOiJIUzI1NiJ9...")
    String accessToken;

    @Schema(example = "Bearer")
    String tokenType;

    @Schema(example = "86400000")
    Long expiresInMs;

    UserProfileResponse user;
}
