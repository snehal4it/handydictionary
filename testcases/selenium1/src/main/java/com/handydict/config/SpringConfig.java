package com.handydict.config;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.springframework.context.annotation.Bean;
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
	
	/** web driver implementation */
	@Bean
	public WebDriver webDriver() {
		return new FirefoxDriver();
	}
	
}