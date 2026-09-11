package com.queueless.queueless;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int notificationId;

    private int tokenNumber;

    private String notificationType;

    private String notificationStatus;

    private String message;

    // Default constructor required by JPA
    public Notification() {
    }

    // Constructor
    public Notification(
            int tokenNumber,
            String notificationType,
            String notificationStatus,
            String message) {

        this.tokenNumber = tokenNumber;
        this.notificationType = notificationType;
        this.notificationStatus = notificationStatus;
        this.message = message;
    }

    public int getNotificationId() {
        return notificationId;
    }

    public int getTokenNumber() {
        return tokenNumber;
    }

    public String getNotificationType() {
        return notificationType;
    }

    public String getNotificationStatus() {
        return notificationStatus;
    }

    public String getMessage() {
        return message;
    }

    public void setTokenNumber(int tokenNumber) {
        this.tokenNumber = tokenNumber;
    }

    public void setNotificationType(String notificationType) {
        this.notificationType = notificationType;
    }

    public void setNotificationStatus(String notificationStatus) {
        this.notificationStatus = notificationStatus;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}