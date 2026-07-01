package com.aicareercoach.analysis.repository;

import com.aicareercoach.analysis.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {

    List<ResumeAnalysis> findByUserIdOrderByAnalyzedAtDesc(Long userId);

    List<ResumeAnalysis> findByResumeIdOrderByAnalyzedAtDesc(Long resumeId);

    Optional<ResumeAnalysis> findByIdAndUserId(Long id, Long userId);
}
