package com.aicareercoach.resume.service;

import com.aicareercoach.common.exception.ResourceNotFoundException;
import com.aicareercoach.resume.dto.ResumeRequest;
import com.aicareercoach.resume.dto.ResumeResponse;
import com.aicareercoach.resume.entity.Resume;
import com.aicareercoach.resume.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;

    @Override
    @Transactional
    public ResumeResponse create(Long userId, ResumeRequest request) {
        boolean isPrimary = Boolean.TRUE.equals(request.getPrimary())
                || resumeRepository.countByUserId(userId) == 0;

        if (isPrimary) {
            clearPrimaryFlag(userId);
        }

        Resume resume = Resume.builder()
                .userId(userId)
                .title(request.getTitle())
                .summary(request.getSummary())
                .fileUrl(request.getFileUrl())
                .skills(request.getSkills())
                .primary(isPrimary)
                .build();

        return toResponse(resumeRepository.save(resume));
    }

    @Override
    @Transactional
    public ResumeResponse update(Long userId, Long resumeId, ResumeRequest request) {
        Resume resume = findOwnedResume(userId, resumeId);

        resume.setTitle(request.getTitle());
        resume.setSummary(request.getSummary());
        resume.setFileUrl(request.getFileUrl());
        resume.setSkills(request.getSkills());

        if (Boolean.TRUE.equals(request.getPrimary()) && !resume.isPrimary()) {
            clearPrimaryFlag(userId);
            resume.setPrimary(true);
        }

        return toResponse(resumeRepository.save(resume));
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeResponse getById(Long userId, Long resumeId) {
        return toResponse(findOwnedResume(userId, resumeId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResumeResponse> listByUser(Long userId) {
        return resumeRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void delete(Long userId, Long resumeId) {
        Resume resume = findOwnedResume(userId, resumeId);
        resumeRepository.delete(resume);
    }

    private Resume findOwnedResume(Long userId, Long resumeId) {
        return resumeRepository.findByIdAndUserId(resumeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", resumeId));
    }

    private void clearPrimaryFlag(Long userId) {
        resumeRepository.findByUserIdOrderByCreatedAtDesc(userId).forEach(resume -> {
            if (resume.isPrimary()) {
                resume.setPrimary(false);
                resumeRepository.save(resume);
            }
        });
    }

    private ResumeResponse toResponse(Resume resume) {
        return ResumeResponse.builder()
                .id(resume.getId())
                .userId(resume.getUserId())
                .title(resume.getTitle())
                .summary(resume.getSummary())
                .fileUrl(resume.getFileUrl())
                .skills(resume.getSkills())
                .primary(resume.isPrimary())
                .createdAt(resume.getCreatedAt())
                .updatedAt(resume.getUpdatedAt())
                .build();
    }
}
