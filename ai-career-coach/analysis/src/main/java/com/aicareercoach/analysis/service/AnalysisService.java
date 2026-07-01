package com.aicareercoach.analysis.service;

import com.aicareercoach.analysis.dto.AnalysisRequest;
import com.aicareercoach.analysis.dto.AnalysisResponse;

import java.util.List;

public interface AnalysisService {

    AnalysisResponse analyzeResume(Long userId, AnalysisRequest request);

    AnalysisResponse getById(Long userId, Long analysisId);

    List<AnalysisResponse> listByUser(Long userId);

    List<AnalysisResponse> listByResume(Long userId, Long resumeId);
}
