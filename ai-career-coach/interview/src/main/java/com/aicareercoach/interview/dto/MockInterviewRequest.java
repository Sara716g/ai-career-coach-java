package com.aicareercoach.interview.dto;

import com.aicareercoach.interview.entity.InterviewType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class MockInterviewRequest {

    Long jobApplicationId;

    @NotBlank
    @Size(max = 200)
    String targetRole;

    @NotNull
    InterviewType type;

    @Size(max = 2000)
    String focusAreas;
}
