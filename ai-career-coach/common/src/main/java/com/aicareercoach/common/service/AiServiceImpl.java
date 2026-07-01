package com.aicareercoach.common.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class AiServiceImpl implements AiService {

    @Value("${app.ai.provider:gemini}")
    private String provider;

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.model:}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean isEnabled() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    @Override
    public String generate(String systemPrompt, String userPrompt) {
        if (!isEnabled()) {
            log.warn("AI API key is not configured. AI service is disabled.");
            return "";
        }

        try {
            if ("openai".equalsIgnoreCase(provider)) {
                return callOpenAi(systemPrompt, userPrompt);
            } else {
                return callGemini(systemPrompt, userPrompt);
            }
        } catch (Exception e) {
            log.error("Error communicating with AI service (provider: {}): {}", provider, e.getMessage(), e);
            throw new RuntimeException("Failed to generate content from AI: " + e.getMessage(), e);
        }
    }

    private String callGemini(String systemPrompt, String userPrompt) throws Exception {
        String selectedModel = (model == null || model.trim().isEmpty()) ? "gemini-1.5-flash" : model;
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + selectedModel + ":generateContent?key=" + apiKey;

        // Construct Gemini Request Body
        ObjectNode requestBody = objectMapper.createObjectNode();
        ArrayNode contents = requestBody.putArray("contents");
        ObjectNode content = contents.addObject();
        ArrayNode parts = content.putArray("parts");
        ObjectNode part = parts.addObject();

        String combinedText = "System Instructions:\n" + systemPrompt + "\n\nUser Input:\n" + userPrompt;
        part.put("text", combinedText);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
        
        log.debug("Sending request to Gemini API, model: {}", selectedModel);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode partsNode = candidates.get(0).path("content").path("parts");
                if (partsNode.isArray() && !partsNode.isEmpty()) {
                    return partsNode.get(0).path("text").asText();
                }
            }
            throw new RuntimeException("Unexpected response structure from Gemini API: " + response.getBody());
        } else {
            throw new RuntimeException("Gemini API call failed with status: " + response.getStatusCode());
        }
    }

    private String callOpenAi(String systemPrompt, String userPrompt) throws Exception {
        String selectedModel = (model == null || model.trim().isEmpty()) ? "gpt-4o-mini" : model;
        String url = "https://api.openai.com/v1/chat/completions";

        // Construct OpenAI Request Body
        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", selectedModel);
        ArrayNode messages = requestBody.putArray("messages");

        // System message
        ObjectNode systemMessage = messages.addObject();
        systemMessage.put("role", "system");
        systemMessage.put("content", systemPrompt);

        // User message
        ObjectNode userMessage = messages.addObject();
        userMessage.put("role", "user");
        userMessage.put("content", userPrompt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
        
        log.debug("Sending request to OpenAI API, model: {}", selectedModel);
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                return choices.get(0).path("message").path("content").asText();
            }
            throw new RuntimeException("Unexpected response structure from OpenAI API: " + response.getBody());
        } else {
            throw new RuntimeException("OpenAI API call failed with status: " + response.getStatusCode());
        }
    }
}
