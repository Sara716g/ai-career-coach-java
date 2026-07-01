package com.aicareercoach.common.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AiServiceImplTest {

    private AiServiceImpl aiService;

    @BeforeEach
    void setUp() {
        aiService = new AiServiceImpl();
    }

    @Test
    void isEnabledShouldReturnFalseWhenApiKeyIsMissing() {
        ReflectionTestUtils.setField(aiService, "apiKey", "");

        assertFalse(aiService.isEnabled());
    }

    @Test
    void isEnabledShouldReturnTrueWhenApiKeyIsPresent() {
        ReflectionTestUtils.setField(aiService, "apiKey", "test-key");

        assertTrue(aiService.isEnabled());
    }

    @Test
    void generateShouldReturnEmptyStringWhenAiIsDisabled() {
        ReflectionTestUtils.setField(aiService, "apiKey", "");

        String result = aiService.generate("system", "user");

        assertEquals("", result);
    }
}
