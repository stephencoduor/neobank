/**
 * NeoBank — Merchant Services Auto-Configuration
 * Spring Boot auto-configuration for the Merchant Services module.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.merchant.starter;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.ComponentScan;

@AutoConfiguration
@ConditionalOnProperty(prefix = "neobank.merchant", name = "enabled", havingValue = "true", matchIfMissing = true)
@ComponentScan(basePackages = "com.qsoftwares.neobank.merchant")
public class MerchantAutoConfiguration {

}
