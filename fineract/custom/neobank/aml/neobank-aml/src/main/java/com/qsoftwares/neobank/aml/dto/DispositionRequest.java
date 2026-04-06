package com.qsoftwares.neobank.aml.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DispositionRequest {
    private String action; // DISMISS, ESCALATE, REPORT
    private String notes;
    private String disposedBy;
}
