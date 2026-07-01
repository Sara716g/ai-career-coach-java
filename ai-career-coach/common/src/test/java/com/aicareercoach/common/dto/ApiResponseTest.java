package com.aicareercoach.common.dto;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ApiResponseTest {

    @Test
    void successWithDataShouldCreateSuccessfulResponse() {
        ApiResponse<String> response = ApiResponse.success("payload");

        assertTrue(response.isSuccess());
        assertEquals("Operation successful", response.getMessage());
        assertEquals("payload", response.getData());
    }

    @Test
    void successWithCustomMessageAndDataShouldCreateSuccessfulResponse() {
        ApiResponse<Integer> response = ApiResponse.success("custom", 42);

        assertTrue(response.isSuccess());
        assertEquals("custom", response.getMessage());
        assertEquals(42, response.getData());
    }
}
