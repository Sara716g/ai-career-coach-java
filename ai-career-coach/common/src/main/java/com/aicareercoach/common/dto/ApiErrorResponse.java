package com.aicareercoach.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.List;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {

    Instant timestamp;
    int status;
    String error;
    String message;
    String path;
    String errorCode;
    List<FieldErrorDetail> fieldErrors;

    @Value
    @Builder
    public static class FieldErrorDetail {
        String field;
        String message;
        Object rejectedValue;
    }
}
