package com.aicareercoach.common.service;

public interface AiService {
    String generate(String systemPrompt, String userPrompt);
    boolean isEnabled();
}
