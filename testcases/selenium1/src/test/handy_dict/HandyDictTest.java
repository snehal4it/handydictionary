package test.handy_dict;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

import test.handy_dict.result.DictException;
import test.handy_dict.result.Result;
import test.handy_dict.result.report.HtmlReport;

public class HandyDictTest {
	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
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
				//System.out.println("result:" + result);
			} catch (DictException e) {
				report.add(dict, e.getResult());
				e.printStackTrace();
			}
		}
		
		List<String> paths = report.generate();
		try {
			String summaryFileStr = paths.get(0);
			File summaryFile = new File(summaryFileStr);
			driver.get("file:///" + summaryFile.getAbsolutePath());
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		
		//driver.close();
	}

}
