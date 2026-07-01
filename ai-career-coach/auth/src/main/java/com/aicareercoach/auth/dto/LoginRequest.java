package com.aicareercoach.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
@Schema(description = "User login credentials")
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Schema(example = "john.doe@example.com")
    String email;

    @NotBlank(message = "Password is required")
    @Schema(example = "SecurePass1")
    String password;
}
