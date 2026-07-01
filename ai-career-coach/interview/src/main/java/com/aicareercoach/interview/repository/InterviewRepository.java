package com.aicareercoach.interview.repository;

import com.aicareercoach.interview.entity.Interview;
import com.aicareercoach.interview.entity.InterviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByUserIdOrderByScheduledAtDesc(Long userId);

    List<Interview> findByUserIdAndStatusOrderByScheduledAtDesc(Long userId, InterviewStatus status);

    Optional<Interview> findByIdAndUserId(Long id, Long userId);
}
