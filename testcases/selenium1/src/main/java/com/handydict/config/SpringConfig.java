package com.handydict.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

/**
 * Basic Dictionary Configuration
 * @author snehal patel
 */
@Configuration
@PropertySource("dictionary.properties")
@ComponentScan(basePackages = "com.handydict")
public class SpringConfig {
	
}