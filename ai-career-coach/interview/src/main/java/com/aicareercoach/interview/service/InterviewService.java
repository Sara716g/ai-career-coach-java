package com.aicareercoach.interview.service;

import com.aicareercoach.interview.dto.InterviewRequest;
import com.aicareercoach.interview.dto.InterviewResponse;
import com.aicareercoach.interview.dto.MockInterviewRequest;
import com.aicareercoach.interview.entity.InterviewStatus;

import java.util.List;

public interface InterviewService {

    InterviewResponse create(Long userId, InterviewRequest request);

    InterviewResponse generateMockInterview(Long userId, MockInterviewRequest request);

    InterviewResponse update(Long userId, Long interviewId, InterviewRequest request);

    InterviewResponse getById(Long userId, Long interviewId);

    List<InterviewResponse> listByUser(Long userId);

    List<InterviewResponse> listByStatus(Long userId, InterviewStatus status);

    void delete(Long userId, Long interviewId);
}
