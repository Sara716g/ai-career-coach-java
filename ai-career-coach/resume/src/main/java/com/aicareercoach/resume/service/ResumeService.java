package com.aicareercoach.resume.service;

import com.aicareercoach.resume.dto.ResumeRequest;
import com.aicareercoach.resume.dto.ResumeResponse;

import java.util.List;

public interface ResumeService {

    ResumeResponse create(Long userId, ResumeRequest request);

    ResumeResponse update(Long userId, Long resumeId, ResumeRequest request);

    ResumeResponse getById(Long userId, Long resumeId);

    List<ResumeResponse> listByUser(Long userId);

    void delete(Long userId, Long resumeId);
}
