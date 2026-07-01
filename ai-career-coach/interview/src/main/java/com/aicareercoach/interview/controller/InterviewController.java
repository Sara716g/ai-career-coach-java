package com.aicareercoach.interview.controller;

import com.aicareercoach.auth.repository.UserRepository;
import com.aicareercoach.common.dto.ApiResponse;
import com.aicareercoach.common.exception.ResourceNotFoundException;
import com.aicareercoach.interview.dto.InterviewRequest;
import com.aicareercoach.interview.dto.InterviewResponse;
import com.aicareercoach.interview.dto.MockInterviewRequest;
import com.aicareercoach.interview.entity.InterviewStatus;
import com.aicareercoach.interview.service.InterviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/interviews")
@RequiredArgsConstructor
@Tag(name = "Interviews", description = "Interview preparation and mock sessions")
public class InterviewController {

    private final InterviewService interviewService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Schedule or record an interview")
    public ResponseEntity<ApiResponse<InterviewResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody InterviewRequest request
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        InterviewResponse response = interviewService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Interview created", response));
    }

    @PostMapping("/mock")
    @Operation(summary = "Generate AI mock interview questions")
    public ResponseEntity<ApiResponse<InterviewResponse>> generateMock(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody MockInterviewRequest request
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        InterviewResponse response = interviewService.generateMockInterview(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Mock interview generated", response));
    }

    @GetMapping
    @Operation(summary = "List interviews")
    public ResponseEntity<ApiResponse<List<InterviewResponse>>> list(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) InterviewStatus status
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        List<InterviewResponse> responses = status == null
                ? interviewService.listByUser(userId)
                : interviewService.listByStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get interview by ID")
    public ResponseEntity<ApiResponse<InterviewResponse>> getById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(interviewService.getById(userId, id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update interview")
    public ResponseEntity<ApiResponse<InterviewResponse>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody InterviewRequest request
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(interviewService.update(userId, id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete interview")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        interviewService.delete(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Interview deleted", null));
    }

    private Long resolveUserId(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email))
                .getId();
    }
}
