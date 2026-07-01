package com.aicareercoach.resume.entity;

import com.aicareercoach.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private boolean primary = false;
}
