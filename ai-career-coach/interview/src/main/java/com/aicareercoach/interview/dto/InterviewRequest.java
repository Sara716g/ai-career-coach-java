package com.aicareercoach.interview.dto;

import com.aicareercoach.interview.entity.InterviewStatus;
import com.aicareercoach.interview.entity.InterviewType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;

@Value
@Builder
public class InterviewRequest {

    Long jobApplicationId;

    @NotBlank
    @Size(max = 200)
    String title;

    @NotNull
    InterviewType type;

    @NotNull
    InterviewStatus status;

    Instant scheduledAt;

    Integer durationMinutes;

    @Size(max = 5000)
    String questions;

    @Size(max = 5000)
    String feedback;

    BigDecimal performanceScore;
}
