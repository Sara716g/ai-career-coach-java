package com.aicareercoach.application.service;

import com.aicareercoach.application.dto.JobApplicationRequest;
import com.aicareercoach.application.dto.JobApplicationResponse;
import com.aicareercoach.application.entity.ApplicationStatus;
import com.aicareercoach.application.entity.JobApplication;
import com.aicareercoach.application.repository.JobApplicationRepository;
import com.aicareercoach.common.exception.ResourceNotFoundException;
import com.aicareercoach.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final ResumeRepository resumeRepository;

    @Override
    @Transactional
    public JobApplicationResponse create(Long userId, JobApplicationRequest request) {
        validateResumeOwnership(userId, request.getResumeId());

        JobApplication application = JobApplication.builder()
                .userId(userId)
                .resumeId(request.getResumeId())
                .companyName(request.getCompanyName())
                .jobTitle(request.getJobTitle())
                .status(request.getStatus())
                .appliedDate(request.getAppliedDate())
                .jobUrl(request.getJobUrl())
                .notes(request.getNotes())
                .build();

        return toResponse(jobApplicationRepository.save(application));
    }

    @Override
    @Transactional
    public JobApplicationResponse update(Long userId, Long applicationId, JobApplicationRequest request) {
        JobApplication application = findOwnedApplication(userId, applicationId);
        validateResumeOwnership(userId, request.getResumeId());

        application.setResumeId(request.getResumeId());
        application.setCompanyName(request.getCompanyName());
        application.setJobTitle(request.getJobTitle());
        application.setStatus(request.getStatus());
        application.setAppliedDate(request.getAppliedDate());
        application.setJobUrl(request.getJobUrl());
        application.setNotes(request.getNotes());

        return toResponse(jobApplicationRepository.save(application));
    }

    @Override
    @Transactional(readOnly = true)
    public JobApplicationResponse getById(Long userId, Long applicationId) {
        return toResponse(findOwnedApplication(userId, applicationId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> listByUser(Long userId) {
        return jobApplicationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<JobApplicationResponse> listByStatus(Long userId, ApplicationStatus status) {
        return jobApplicationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void delete(Long userId, Long applicationId) {
        JobApplication application = findOwnedApplication(userId, applicationId);
        jobApplicationRepository.delete(application);
    }

    private JobApplication findOwnedApplication(Long userId, Long applicationId) {
        return jobApplicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("JobApplication", applicationId));
    }

    private void validateResumeOwnership(Long userId, Long resumeId) {
        if (resumeId == null) {
            return;
        }
        resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", resumeId));
    }

    private JobApplicationResponse toResponse(JobApplication application) {
        return JobApplicationResponse.builder()
                .id(application.getId())
                .userId(application.getUserId())
                .resumeId(application.getResumeId())
                .companyName(application.getCompanyName())
                .jobTitle(application.getJobTitle())
                .status(application.getStatus())
                .appliedDate(application.getAppliedDate())
                .jobUrl(application.getJobUrl())
                .notes(application.getNotes())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .build();
    }
}
