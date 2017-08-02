package com.handydict;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

import com.handydict.result.DictException;
import com.handydict.result.Result;
import com.handydict.result.report.HtmlReport;

/**
 * Main application class, to test all supported dictionary
 * @author snehal patel
 */
public class HandyDictTest {
	private static final Logger LOGGER = LogManager.getLogger(HandyDictTest.class);
	
	public static void main(String[] args) {
		LOGGER.info("Dictionary Test Started");
		
		// path to gecko driver
		System.setProperty("webdriver.gecko.driver", "C:\\workspace\\geckodriver18\\geckodriver.exe");
		
		WebDriver driver = new FirefoxDriver();
		
		List<Dictionary> dics = new ArrayList<Dictionary>();
		dics.add(new Cambridge(driver));
		dics.add(new Oxford(driver));
		dics.add(new DictionaryDotCom(driver));
		dics.add(new MerriamWebster(driver));
		dics.add(new FreeDictionary(driver));
		
		HtmlReport report = new HtmlReport();
		
		for (Dictionary dict : dics) {
			try {
				Result result = dict.test();
				report.add(dict, result);
				LOGGER.debug("result for dictionary={}, result={}", dict, result);
			} catch (DictException e) {
				report.add(dict, e.getResult());
				LOGGER.error("Error in testing dictionary, {}", dict, e);
			}
		}
		
		List<String> paths = report.generate();
		try {
			String summaryFileStr = paths.get(0);
			File summaryFile = new File(summaryFileStr);
			driver.get("file:///" + summaryFile.getAbsolutePath());
		} catch (Exception e) {
			LOGGER.error("Error while preparing report", e);
		}
		
		LOGGER.info("Dictionary Test Completed");
		//driver.close();
	}

}
