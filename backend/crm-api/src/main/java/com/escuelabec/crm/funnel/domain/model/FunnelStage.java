package com.escuelabec.crm.funnel.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "funnel_stages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FunnelStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer stageId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Integer position;

    @Column(nullable = false)
    @Builder.Default
    private String color = "#3498DB";

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
}
