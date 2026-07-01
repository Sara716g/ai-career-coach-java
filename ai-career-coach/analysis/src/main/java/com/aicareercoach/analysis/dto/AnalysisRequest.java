package com.aicareercoach.analysis.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AnalysisRequest {

    @NotNull
    Long resumeId;

    @Size(max = 200)
    String targetRole;
}
