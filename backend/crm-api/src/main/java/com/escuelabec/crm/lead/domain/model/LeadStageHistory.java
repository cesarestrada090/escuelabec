package com.escuelabec.crm.lead.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lead_stage_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadStageHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long leadId;

    private Integer fromStageId;

    @Column(nullable = false)
    private Integer toStageId;

    private Long changedBy;

    @Column(nullable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }
}
