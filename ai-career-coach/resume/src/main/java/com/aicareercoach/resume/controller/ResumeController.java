package com.aicareercoach.resume.controller;

import com.aicareercoach.auth.repository.UserRepository;
import com.aicareercoach.common.dto.ApiResponse;
import com.aicareercoach.common.exception.ResourceNotFoundException;
import com.aicareercoach.resume.dto.ResumeRequest;
import com.aicareercoach.resume.dto.ResumeResponse;
import com.aicareercoach.resume.service.ResumeService;
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
@RequestMapping("/api/v1/resumes")
@RequiredArgsConstructor
@Tag(name = "Resumes", description = "Resume management")
public class ResumeController {

    private final ResumeService resumeService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Create a new resume")
    public ResponseEntity<ApiResponse<ResumeResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ResumeRequest request
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        ResumeResponse response = resumeService.create(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resume created", response));
    }

    @GetMapping
    @Operation(summary = "List all resumes for current user")
    public ResponseEntity<ApiResponse<List<ResumeResponse>>> list(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(resumeService.listByUser(userId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resume by ID")
    public ResponseEntity<ApiResponse<ResumeResponse>> getById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(resumeService.getById(userId, id)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update resume")
    public ResponseEntity<ApiResponse<ResumeResponse>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ResumeRequest request
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(resumeService.update(userId, id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete resume")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        resumeService.delete(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Resume deleted", null));
    }

    private Long resolveUserId(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email))
                .getId();
    }
}
