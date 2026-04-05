/**
 * NeoBank — Notification Service Interface
 * Abstraction for sending notifications across multiple channels.
 * Copyright (c) 2026 Qsoftwares Ltd. All rights reserved.
 */
package com.qsoftwares.neobank.notification.service;

import java.util.Map;

/**
 * Interface for sending notifications to NeoBank users.
 * Implementations handle specific channels: Push (FCM), SMS (Africa's Talking),
 * Email (SendGrid/SES), and in-app notifications.
 *
 * TODO: Implement SMS channel via Africa's Talking API
 * TODO: Implement Email channel via SendGrid or AWS SES
 * TODO: Implement in-app notification storage in Fineract
 * TODO: Add notification template engine (Thymeleaf/FreeMarker)
 * TODO: Support notification preferences per user (opt-in/out per channel)
 * TODO: Add delivery tracking and retry logic for failed deliveries
 */
public interface NotificationService {

    /**
     * Send a notification to a specific user.
     *
     * @param clientId Fineract client ID
     * @param channel  notification channel (PUSH, SMS, EMAIL, IN_APP)
     * @param title    notification title
     * @param body     notification body/message
     * @param data     additional data payload (key-value pairs)
     * @return delivery result with notification ID and status
     */
    Map<String, Object> sendNotification(String clientId, String channel,
                                          String title, String body,
                                          Map<String, Object> data);

    /**
     * Send a notification to multiple users (broadcast).
     *
     * @param clientIds list of Fineract client IDs
     * @param channel   notification channel
     * @param title     notification title
     * @param body      notification body/message
     * @param data      additional data payload
     * @return batch delivery result
     */
    Map<String, Object> sendBulkNotification(java.util.List<String> clientIds, String channel,
                                              String title, String body,
                                              Map<String, Object> data);

    /**
     * Get notification history for a client.
     *
     * @param clientId Fineract client ID
     * @param page     page number (0-indexed)
     * @param size     page size
     * @return paginated list of notifications
     */
    Map<String, Object> getNotificationHistory(String clientId, int page, int size);

    /**
     * Mark a notification as read.
     *
     * @param notificationId the notification ID
     * @return updated notification status
     */
    Map<String, Object> markAsRead(String notificationId);
}
