/**
 * NeoBank — Notification Auto-Configuration
 * Spring Boot auto-configuration for the Notification Services module.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.notification.starter;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.ComponentScan;

@AutoConfiguration
@ConditionalOnProperty(prefix = "neobank.notification", name = "enabled", havingValue = "true", matchIfMissing = true)
@ComponentScan(basePackages = "com.qsoftwares.neobank.notification")
public class NotificationAutoConfiguration {

}
