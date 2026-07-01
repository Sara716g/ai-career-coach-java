package com.aicareercoach.application.repository;

import com.aicareercoach.application.entity.ApplicationStatus;
import com.aicareercoach.application.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<JobApplication> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, ApplicationStatus status);

    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);
}
