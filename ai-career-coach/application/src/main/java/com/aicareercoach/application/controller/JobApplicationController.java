package com.aicareercoach.application.controller;

import com.aicareercoach.application.dto.JobApplicationRequest;
import com.aicareercoach.application.dto.JobApplicationResponse;
import com.aicareercoach.application.entity.ApplicationStatus;
import com.aicareercoach.application.service.JobApplicationService;
import com.aicareercoach.auth.repository.UserRepository;
import com.aicareercoach.common.dto.ApiResponse;
import com.aicareercoach.common.exception.ResourceNotFoundException;
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
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "Job application tracking")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Create a job application")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody JobApplicationRequest request
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        JobApplicationResponse response = jobApplicationService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Application created", response));
    }

    @GetMapping
    @Operation(summary = "List job applications")
    public ResponseEntity<ApiResponse<List<JobApplicationResponse>>> list(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) ApplicationStatus status
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        List<JobApplicationResponse> responses = status == null
                ? jobApplicationService.listByUser(userId)
                : jobApplicationService.listByStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get job application by ID")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> getById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(jobApplicationService.getById(userId, id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update job application")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody JobApplicationRequest request
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(jobApplicationService.update(userId, id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete job application")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        jobApplicationService.delete(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Application deleted", null));
    }

    private Long resolveUserId(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email))
                .getId();
    }
}
