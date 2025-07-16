package com.example.alcohol_recommendation.auth.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import static org.springframework.security.config.Customizer.withDefaults;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // JWT 토큰을 검증할 필터 빈 등록
    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter();
    }

    // Security 필터 체인 설정
    @Bean
    public SecurityFilterChain filterChain(org.springframework.security.config.annotation.web.builders.HttpSecurity http) throws Exception {
        http
        	// CORS 활성화
        	.cors(Customizer.withDefaults())
            // CSRF 비활성화
            .csrf(AbstractHttpConfigurer::disable)
            // 세션을 사용하지 않도록 stateless 설정
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            // URL별 권한 설정
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                		"/",
                		"/api/animals/**",
                        "/api/auth/signup", 
                        "/api/auth/login",
                        "/api/auth/find-userId",
                        "/api/auth/reset-password-request",
                        "/api/auth/reset-password",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/request",
                    	"/request/*",
                    	"/request/img/**",
                        "/board/**",
                        "/images/**",
                        "/comment/**",
                        "/customer/faq/**",
                        "/customer/qna/**",
                        "/admin/**",
                        "/customer/adoption/**",
                        "/uploads/**",
                        "/api/users/**",
                        "/api/**"
                ).permitAll()
                .anyRequest().authenticated()
            )
            // JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 등록
            .addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter.class)
            // 기본 HTTP Basic 로그인 폼 비활성화(필요 시 제거)
            .httpBasic(withDefaults());

        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://192.168.3.24:3000", "http://localhost:3000"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS", "PATCH"));
        config.setAllowCredentials(true);
        config.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
