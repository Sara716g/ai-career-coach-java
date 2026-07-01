package com.aicareercoach.resume.dto;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class ResumeResponse {

    Long id;
    Long userId;
    String title;
    String summary;
    String fileUrl;
    String skills;
    boolean primary;
    Instant createdAt;
    Instant updatedAt;
}
