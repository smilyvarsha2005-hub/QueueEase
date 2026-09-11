package com.queueless.queueless;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "queue_token")
public class QueueToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int tokenNumber;

    private String customerName;

    private String contact;

    private String notificationMethod;

    private int queuePosition;

    private int estimatedWaitingTime;

    private String status;

    private int organizationId;

    private int serviceId;

    private int customerId;

    // Default constructor required by JPA
    public QueueToken() {
    }

    // Existing constructor
    public QueueToken(
            String customerName,
            String contact,
            String notificationMethod,
            int queuePosition,
            int estimatedWaitingTime,
            String status) {

        this.customerName = customerName;
        this.contact = contact;
        this.notificationMethod = notificationMethod;
        this.queuePosition = queuePosition;
        this.estimatedWaitingTime = estimatedWaitingTime;
        this.status = status;
    }

    public int getTokenNumber() {
        return tokenNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getContact() {
        return contact;
    }

    public String getNotificationMethod() {
        return notificationMethod;
    }

    public int getQueuePosition() {
        return queuePosition;
    }

    public int getEstimatedWaitingTime() {
        return estimatedWaitingTime;
    }

    public String getStatus() {
        return status;
    }

    public int getOrganizationId() {
        return organizationId;
    }

    public int getServiceId() {
        return serviceId;
    }

    public int getCustomerId() {
        return customerId;
    }

    public void setQueuePosition(int queuePosition) {
        this.queuePosition = queuePosition;
    }

    public void setEstimatedWaitingTime(int estimatedWaitingTime) {
        this.estimatedWaitingTime = estimatedWaitingTime;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setOrganizationId(int organizationId) {
        this.organizationId = organizationId;
    }

    public void setServiceId(int serviceId) {
        this.serviceId = serviceId;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }
}