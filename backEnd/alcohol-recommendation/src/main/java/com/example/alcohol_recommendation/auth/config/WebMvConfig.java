package com.example.alcohol_recommendation.auth.config;

import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


public class WebMvConfig implements WebMvcConfigurer  {
	
	@Override
	public void addCorsMappings(CorsRegistry registry) { 
		registry.addMapping("/**")
			.allowedOrigins("http://localhost:3000")
			.allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
			.allowedHeaders("*")
			.allowCredentials(true);
	}
}
