package com.aicareercoach.application.dto;

import com.aicareercoach.application.entity.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;

@Value
@Builder
public class JobApplicationRequest {

    Long resumeId;

    @NotBlank
    @Size(max = 200)
    String companyName;

    @NotBlank
    @Size(max = 200)
    String jobTitle;

    @NotNull
    ApplicationStatus status;

    LocalDate appliedDate;

    @Size(max = 500)
    String jobUrl;

    @Size(max = 3000)
    String notes;
}
