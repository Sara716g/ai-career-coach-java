package com.aicareercoach.interview.service;
 
import com.aicareercoach.application.repository.JobApplicationRepository;
import com.aicareercoach.common.exception.ResourceNotFoundException;
import com.aicareercoach.common.service.AiService;
import com.aicareercoach.interview.dto.InterviewRequest;
import com.aicareercoach.interview.dto.InterviewResponse;
import com.aicareercoach.interview.dto.MockInterviewRequest;
import com.aicareercoach.interview.entity.Interview;
import com.aicareercoach.interview.entity.InterviewStatus;
import com.aicareercoach.interview.repository.InterviewRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
 
@Service
@RequiredArgsConstructor
@Slf4j
public class InterviewServiceImpl implements InterviewService {
 
    private final InterviewRepository interviewRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final AiService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();
 
    @Override
    @Transactional
    public InterviewResponse create(Long userId, InterviewRequest request) {
        validateJobApplicationOwnership(userId, request.getJobApplicationId());
 
        Interview interview = mapToEntity(userId, request);
        return toResponse(interviewRepository.save(interview));
    }
 
    @Override
    @Transactional
    public InterviewResponse generateMockInterview(Long userId, MockInterviewRequest request) {
        validateJobApplicationOwnership(userId, request.getJobApplicationId());
 
        String questions = """
                1. Tell me about yourself and why you are interested in the %s role.
                2. Describe a challenging project and how you handled it.
                3. How do you stay current with industry trends?
                4. What are your strengths and areas for improvement?
                5. Do you have any questions for us?
                """.formatted(request.getTargetRole()).trim();
 
        if (aiService.isEnabled()) {
            try {
                String systemPrompt = String.format(
                        "You are an expert technical interviewer. Generate 5 realistic interview questions for a %s interview for the target role of: %s. Focus areas: %s. Return only the questions as a numbered list. No introductory or concluding text.",
                        request.getType(),
                        request.getTargetRole(),
                        request.getFocusAreas() != null ? request.getFocusAreas() : "General"
                );
                String responseText = aiService.generate(systemPrompt, "Please generate the questions now.");
                if (responseText != null && !responseText.trim().isEmpty()) {
                    questions = responseText.trim();
                }
            } catch (Exception e) {
                log.error("Failed to generate AI mock interview questions. Falling back to default list.", e);
            }
        }
 
        Interview interview = Interview.builder()
                .userId(userId)
                .jobApplicationId(request.getJobApplicationId())
                .title("Mock Interview: " + request.getTargetRole())
                .type(request.getType())
                .status(InterviewStatus.SCHEDULED)
                .scheduledAt(Instant.now())
                .durationMinutes(45)
                .questions(questions)
                .feedback("Practice session generated. Focus on STAR method and role-specific examples.")
                .build();
 
        return toResponse(interviewRepository.save(interview));
    }
 
    @Override
    @Transactional
    public InterviewResponse update(Long userId, Long interviewId, InterviewRequest request) {
        Interview interview = findOwnedInterview(userId, interviewId);
        validateJobApplicationOwnership(userId, request.getJobApplicationId());
 
        if (request.getStatus() == InterviewStatus.COMPLETED && interview.getStatus() != InterviewStatus.COMPLETED) {
            if (aiService.isEnabled() && request.getFeedback() != null && !request.getFeedback().trim().isEmpty()) {
                try {
                    String systemPrompt = """
                            You are an expert interviewer.
                            Evaluate the candidate's responses for the following interview and return a JSON structure with the overall score and detailed constructive feedback.
                            The response must be in valid JSON format with the following keys. Do not include markdown wraps or backticks like ```json ... ```:
                            {
                              "score": <a number between 0.00 and 100.00 representing overall performance>,
                              "feedback": "<detailed constructive feedback on the responses, highlighting strengths and improvements>"
                            }
                            """;
 
                    String userPrompt = String.format(
                            "Target Role: %s\nInterview Type: %s\nQuestions:\n%s\n\nCandidate Answers/Transcript:\n%s",
                            interview.getTitle(),
                            interview.getType(),
                            interview.getQuestions(),
                            request.getFeedback()
                    );
 
                    String responseText = aiService.generate(systemPrompt, userPrompt);
                    
                    if (responseText.contains("```")) {
                        responseText = responseText.replaceAll("```[a-zA-Z]*", "").trim();
                    }
 
                    JsonNode json = objectMapper.readTree(responseText);
                    BigDecimal score = new BigDecimal(json.path("score").asText(request.getPerformanceScore() != null ? request.getPerformanceScore().toString() : "75.00"));
                    String finalFeedback = json.path("feedback").asText(request.getFeedback());
 
                    interview.setPerformanceScore(score);
                    interview.setFeedback(finalFeedback);
                    interview.setJobApplicationId(request.getJobApplicationId());
                    interview.setTitle(request.getTitle());
                    interview.setType(request.getType());
                    interview.setStatus(request.getStatus());
                    interview.setScheduledAt(request.getScheduledAt());
                    interview.setDurationMinutes(request.getDurationMinutes());
                } catch (Exception e) {
                    log.error("Failed to evaluate mock interview via AI. Falling back to request feedback.", e);
                    applyRequest(interview, request);
                }
            } else {
                applyRequest(interview, request);
            }
        } else {
            applyRequest(interview, request);
        }
 
        return toResponse(interviewRepository.save(interview));
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewResponse getById(Long userId, Long interviewId) {
        return toResponse(findOwnedInterview(userId, interviewId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> listByUser(Long userId) {
        return interviewRepository.findByUserIdOrderByScheduledAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> listByStatus(Long userId, InterviewStatus status) {
        return interviewRepository.findByUserIdAndStatusOrderByScheduledAtDesc(userId, status).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void delete(Long userId, Long interviewId) {
        Interview interview = findOwnedInterview(userId, interviewId);
        interviewRepository.delete(interview);
    }

    private Interview findOwnedInterview(Long userId, Long interviewId) {
        return interviewRepository.findByIdAndUserId(interviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview", interviewId));
    }

    private void validateJobApplicationOwnership(Long userId, Long jobApplicationId) {
        if (jobApplicationId == null) {
            return;
        }
        jobApplicationRepository.findByIdAndUserId(jobApplicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication", jobApplicationId));
    }

    private Interview mapToEntity(Long userId, InterviewRequest request) {
        Interview interview = new Interview();
        interview.setUserId(userId);
        applyRequest(interview, request);
        return interview;
    }

    private void applyRequest(Interview interview, InterviewRequest request) {
        interview.setJobApplicationId(request.getJobApplicationId());
        interview.setTitle(request.getTitle());
        interview.setType(request.getType());
        interview.setStatus(request.getStatus());
        interview.setScheduledAt(request.getScheduledAt());
        interview.setDurationMinutes(request.getDurationMinutes());
        interview.setQuestions(request.getQuestions());
        interview.setFeedback(request.getFeedback());
        interview.setPerformanceScore(request.getPerformanceScore());
    }

    private InterviewResponse toResponse(Interview interview) {
        return InterviewResponse.builder()
                .id(interview.getId())
                .userId(interview.getUserId())
                .jobApplicationId(interview.getJobApplicationId())
                .title(interview.getTitle())
                .type(interview.getType())
                .status(interview.getStatus())
                .scheduledAt(interview.getScheduledAt())
                .durationMinutes(interview.getDurationMinutes())
                .questions(interview.getQuestions())
                .feedback(interview.getFeedback())
                .performanceScore(interview.getPerformanceScore())
                .createdAt(interview.getCreatedAt())
                .updatedAt(interview.getUpdatedAt())
                .build();
    }
}
