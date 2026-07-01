package com.aicareercoach.application.dto;

import com.aicareercoach.application.entity.ApplicationStatus;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.time.LocalDate;

@Value
@Builder
public class JobApplicationResponse {

    Long id;
    Long userId;
    Long resumeId;
    String companyName;
    String jobTitle;
    ApplicationStatus status;
    LocalDate appliedDate;
    String jobUrl;
    String notes;
    Instant createdAt;
    Instant updatedAt;
}
