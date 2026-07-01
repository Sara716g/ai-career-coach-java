package com.aicareercoach.auth.dto;

import com.aicareercoach.auth.entity.RoleType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.Set;

@Value
@Builder
@Schema(description = "Authenticated user profile")
public class UserProfileResponse {

    @Schema(example = "1")
    Long id;

    @Schema(example = "john.doe@example.com")
    String email;

    @Schema(example = "John")
    String firstName;

    @Schema(example = "Doe")
    String lastName;

    @Schema(example = "[\"USER\"]")
    Set<RoleType> roles;

    @Schema(example = "true")
    boolean enabled;

    Instant createdAt;
}
