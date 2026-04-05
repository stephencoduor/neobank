/**
 * NeoBank — Card Issuing Auto-Configuration
 * Spring Boot auto-configuration for the Card Issuing module.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.card.starter;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.ComponentScan;

@AutoConfiguration
@ConditionalOnProperty(prefix = "neobank.card", name = "enabled", havingValue = "true", matchIfMissing = true)
@ComponentScan(basePackages = "com.qsoftwares.neobank.card")
public class CardAutoConfiguration {

}
