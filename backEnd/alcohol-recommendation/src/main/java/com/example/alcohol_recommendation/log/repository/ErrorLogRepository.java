package com.example.alcohol_recommendation.log.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.alcohol_recommendation.log.model.ErrorLog;

public interface ErrorLogRepository extends JpaRepository<ErrorLog, Long> {


}
