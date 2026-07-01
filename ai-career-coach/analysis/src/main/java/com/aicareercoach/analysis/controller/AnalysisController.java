package com.aicareercoach.analysis.controller;

import com.aicareercoach.analysis.dto.AnalysisRequest;
import com.aicareercoach.analysis.dto.AnalysisResponse;
import com.aicareercoach.analysis.service.AnalysisService;
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
@RequestMapping("/api/v1/analyses")
@RequiredArgsConstructor
@Tag(name = "Analysis", description = "AI-powered resume analysis")
public class AnalysisController {

    private final AnalysisService analysisService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Run AI analysis on a resume")
    public ResponseEntity<ApiResponse<AnalysisResponse>> analyze(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AnalysisRequest request
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        AnalysisResponse response = analysisService.analyzeResume(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Analysis completed", response));
    }

    @GetMapping
    @Operation(summary = "List all analyses for current user")
    public ResponseEntity<ApiResponse<List<AnalysisResponse>>> list(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(analysisService.listByUser(userId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get analysis by ID")
    public ResponseEntity<ApiResponse<AnalysisResponse>> getById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(analysisService.getById(userId, id)));
    }

    @GetMapping("/resume/{resumeId}")
    @Operation(summary = "List analyses for a specific resume")
    public ResponseEntity<ApiResponse<List<AnalysisResponse>>> listByResume(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long resumeId
    ) {
        Long userId = resolveUserId(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(analysisService.listByResume(userId, resumeId)));
    }

    private Long resolveUserId(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email))
                .getId();
    }
}
