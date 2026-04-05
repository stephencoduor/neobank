/**
 * NeoBank — Device Bind Request DTO
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceBindRequest {

    /** Fineract client id the device will be bound to. */
    private String clientId;

    /** Device-generated unique identifier (UUID, hardware id, or app-generated). */
    private String deviceId;

    /** Human-friendly device name, e.g. "Amina's Pixel 8". */
    private String deviceName;

    /** Platform: ANDROID | IOS | WEB. */
    private String platform;

    /** Base64 encoded EC or RSA public key for request signing. */
    private String publicKey;
}
