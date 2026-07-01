package com.aicareercoach.resume.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ResumeRequest {

    @NotBlank
    @Size(max = 200)
    String title;

    @Size(max = 5000)
    String summary;

    @Size(max = 500)
    String fileUrl;

    @Size(max = 2000)
    String skills;

    Boolean primary;
}
