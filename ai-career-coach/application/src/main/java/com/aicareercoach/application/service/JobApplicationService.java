package com.aicareercoach.application.service;

import com.aicareercoach.application.dto.JobApplicationRequest;
import com.aicareercoach.application.dto.JobApplicationResponse;
import com.aicareercoach.application.entity.ApplicationStatus;

import java.util.List;

public interface JobApplicationService {

    JobApplicationResponse create(Long userId, JobApplicationRequest request);

    JobApplicationResponse update(Long userId, Long applicationId, JobApplicationRequest request);

    JobApplicationResponse getById(Long userId, Long applicationId);

    List<JobApplicationResponse> listByUser(Long userId);

    List<JobApplicationResponse> listByStatus(Long userId, ApplicationStatus status);

    void delete(Long userId, Long applicationId);
}
