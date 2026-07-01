package com.aicareercoach.analysis.service;
 
import com.aicareercoach.analysis.dto.AnalysisRequest;
import com.aicareercoach.analysis.dto.AnalysisResponse;
import com.aicareercoach.analysis.entity.ResumeAnalysis;
import com.aicareercoach.analysis.repository.AnalysisRepository;
import com.aicareercoach.common.exception.ResourceNotFoundException;
import com.aicareercoach.common.service.AiService;
import com.aicareercoach.resume.entity.Resume;
import com.aicareercoach.resume.repository.ResumeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
 
@Service
@RequiredArgsConstructor
@Slf4j
public class AnalysisServiceImpl implements AnalysisService {
 
    private static final String DEFAULT_AI_MODEL = "career-coach-v1";
 
    private final AnalysisRepository analysisRepository;
    private final ResumeRepository resumeRepository;
    private final AiService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();
 
    @Override
    @Transactional
    public AnalysisResponse analyzeResume(Long userId, AnalysisRequest request) {
        Resume resume = resumeRepository.findByIdAndUserId(request.getResumeId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", request.getResumeId()));
 
        BigDecimal score = generateScore();
        String feedback = "Resume demonstrates solid fundamentals. Consider quantifying achievements and tailoring keywords for the target role.";
        String strengths = "Clear structure, relevant skills section, consistent formatting";
        String weaknesses = "Limited metrics, generic summary, missing role-specific keywords";
        String aiModelUsed = DEFAULT_AI_MODEL;
 
        if (aiService.isEnabled()) {
            try {
                String systemPrompt = """
                        You are an expert career coach and resume reviewer.
                        Analyze the candidate's resume for the target role and return a JSON structure with evaluation results.
                        The response must be in valid JSON format with the following keys. Do not include any formatting, markdown wrappers, or backticks like ```json ... ```:
                        {
                          "score": <a number between 0.00 and 100.00 representing match level>,
                          "feedback": "<general feedback on how well the resume matches the target role, with recommendations>",
                          "strengths": "<bulleted list of strengths relative to the target role>",
                          "weaknesses": "<bulleted list of weaknesses or areas for improvement relative to the target role>"
                        }
                        """;
 
                String userPrompt = String.format(
                        "Target Role: %s\nResume Title: %s\nResume Summary: %s\nResume Skills: %s",
                        request.getTargetRole(),
                        resume.getTitle(),
                        resume.getSummary() != null ? resume.getSummary() : "",
                        resume.getSkills() != null ? resume.getSkills() : ""
                );
 
                String responseText = aiService.generate(systemPrompt, userPrompt);
                
                // Strip markdown wrap if present
                if (responseText.contains("```")) {
                    responseText = responseText.replaceAll("```[a-zA-Z]*", "").trim();
                }
 
                JsonNode json = objectMapper.readTree(responseText);
                if (json.has("score")) {
                    score = new BigDecimal(json.get("score").asText()).setScale(2, RoundingMode.HALF_UP);
                }
                if (json.has("feedback")) {
                    feedback = json.get("feedback").asText();
                }
                if (json.has("strengths")) {
                    strengths = json.get("strengths").asText();
                }
                if (json.has("weaknesses")) {
                    weaknesses = json.get("weaknesses").asText();
                }
                aiModelUsed = "ai-service";
            } catch (Exception e) {
                log.error("Failed to perform AI analysis. Falling back to default mock data.", e);
            }
        }
 
        ResumeAnalysis analysis = ResumeAnalysis.builder()
                .resumeId(request.getResumeId())
                .userId(userId)
                .score(score)
                .feedback(feedback)
                .strengths(strengths)
                .weaknesses(weaknesses)
                .targetRole(request.getTargetRole())
                .aiModel(aiModelUsed)
                .analyzedAt(Instant.now())
                .build();
 
        return toResponse(analysisRepository.save(analysis));
    }

    @Override
    @Transactional(readOnly = true)
    public AnalysisResponse getById(Long userId, Long analysisId) {
        return toResponse(findOwnedAnalysis(userId, analysisId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnalysisResponse> listByUser(Long userId) {
        return analysisRepository.findByUserIdOrderByAnalyzedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnalysisResponse> listByResume(Long userId, Long resumeId) {
        resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", resumeId));

        return analysisRepository.findByResumeIdOrderByAnalyzedAtDesc(resumeId).stream()
                .map(this::toResponse)
                .toList();
    }

    private ResumeAnalysis findOwnedAnalysis(Long userId, Long analysisId) {
        return analysisRepository.findByIdAndUserId(analysisId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis", analysisId));
    }

    private BigDecimal generateScore() {
        double raw = 72 + (Math.random() * 23);
        return BigDecimal.valueOf(raw).setScale(2, RoundingMode.HALF_UP);
    }

    private AnalysisResponse toResponse(ResumeAnalysis analysis) {
        return AnalysisResponse.builder()
                .id(analysis.getId())
                .resumeId(analysis.getResumeId())
                .userId(analysis.getUserId())
                .score(analysis.getScore())
                .feedback(analysis.getFeedback())
                .strengths(analysis.getStrengths())
                .weaknesses(analysis.getWeaknesses())
                .targetRole(analysis.getTargetRole())
                .aiModel(analysis.getAiModel())
                .analyzedAt(analysis.getAnalyzedAt())
                .createdAt(analysis.getCreatedAt())
                .build();
    }
}
