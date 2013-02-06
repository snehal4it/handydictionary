package test.handy_dict;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import test.handy_dict.result.DictException;
import test.handy_dict.result.Result;
import test.handy_dict.result.report.HtmlReport;

public class HandyDictTest {
	private static String PROXY = "43.88.65.10:8080";
	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		org.openqa.selenium.Proxy proxy = new org.openqa.selenium.Proxy();
		proxy.setHttpProxy(PROXY).setFtpProxy(PROXY).setSslProxy(PROXY);
		DesiredCapabilities cap = new DesiredCapabilities();
		cap.setCapability(CapabilityType.PROXY, proxy);
		WebDriver driver = new FirefoxDriver(cap);
		
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
