package com.handydict;

import java.io.File;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.WebDriver;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import com.handydict.config.SpringConfig;
import com.handydict.dict.Dictionary;
import com.handydict.report.DictionaryTestReportGenerator;
import com.handydict.result.Result;
import com.handydict.test.DictionaryTestExecutor;

/**
 * Main application class, to test all supported dictionary
 * @author snehal patel
 */
public class Application {
	private static final Logger LOGGER = LogManager.getLogger(Application.class);
	
	public static void main(String... args) {
		LOGGER.info("Dictionary Test Started");
		// path to gecko driver
		System.setProperty("webdriver.gecko.driver", "C:\\workspace\\geckodriver18\\geckodriver.exe");
		
		ApplicationContext context = new AnnotationConfigApplicationContext(SpringConfig.class);
		DictionaryTestExecutor dictionaryTestExecutor = context.getBean(DictionaryTestExecutor.class);
		Map<Dictionary, Result> dictionaryResult = dictionaryTestExecutor.executeTest();
		LOGGER.debug("result for dictionaryResult={}", dictionaryResult);
		
		DictionaryTestReportGenerator dictionaryTestReportGenerator = context.getBean(DictionaryTestReportGenerator.class);
		List<String> paths = dictionaryTestReportGenerator.generateReport(dictionaryResult);
		
		WebDriver driver = context.getBean(WebDriver.class);
		try {
			String summaryFileStr = paths.get(0);
			File summaryFile = new File(summaryFileStr);
			driver.get("file:///" + summaryFile.getAbsolutePath());
		} catch (Exception e) {
			LOGGER.error("Error while preparing report", e);
		}
		
		LOGGER.info("Dictionary Test Completed");
	}
}
