package com.aicareercoach.interview.dto;

import com.aicareercoach.interview.entity.InterviewStatus;
import com.aicareercoach.interview.entity.InterviewType;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;

@Value
@Builder
public class InterviewResponse {

    Long id;
    Long userId;
    Long jobApplicationId;
    String title;
    InterviewType type;
    InterviewStatus status;
    Instant scheduledAt;
    Integer durationMinutes;
    String questions;
    String feedback;
    BigDecimal performanceScore;
    Instant createdAt;
    Instant updatedAt;
}
