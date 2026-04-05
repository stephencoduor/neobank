/**
 * NeoBank — Mobile Money Auto-Configuration
 * Spring Boot auto-configuration for the Mobile Money module.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.mobilemoney.starter;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.ComponentScan;

@AutoConfiguration
@ConditionalOnProperty(prefix = "neobank.mobilemoney", name = "enabled", havingValue = "true", matchIfMissing = true)
@ComponentScan(basePackages = "com.qsoftwares.neobank.mobilemoney")
public class MobileMoneyAutoConfiguration {

}
