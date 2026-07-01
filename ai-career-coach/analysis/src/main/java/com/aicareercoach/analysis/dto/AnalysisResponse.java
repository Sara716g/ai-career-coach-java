package com.aicareercoach.analysis.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.Instant;

@Value
@Builder
public class AnalysisResponse {

    Long id;
    Long resumeId;
    Long userId;
    BigDecimal score;
    String feedback;
    String strengths;
    String weaknesses;
    String targetRole;
    String aiModel;
    Instant analyzedAt;
    Instant createdAt;
}
