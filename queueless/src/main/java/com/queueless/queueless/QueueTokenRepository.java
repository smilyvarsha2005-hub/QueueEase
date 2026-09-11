package com.queueless.queueless;

import org.springframework.data.jpa.repository.JpaRepository;

public interface QueueTokenRepository extends JpaRepository<QueueToken, Integer> {
}