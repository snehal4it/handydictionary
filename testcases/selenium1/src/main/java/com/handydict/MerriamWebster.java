package com.handydict;

import java.util.HashMap;
import java.util.Map;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class MerriamWebster extends Dictionary {
	private static final String resultId = "merriamWebsterDefHdTemp1111Id";
	private static final String url = "http://www.merriam-webster.com/dictionary/";
	private static final String searchTxt = "flay";
	
	private static final String txtLocation = "main > article > div.full-def-box > div.inner-box-wrapper > div.word-header > div > h1";
	
	// messages
	private static final String txt2 = "Looking for element that contains word used for lookup:" + txtLocation;
	
	private static final String[] css = new String[] {"http://www.merriam-webster.com/styles/default/mw-ref.css"};
	
	private static final String[] titleAr = new String[] {
		"main > article > div.full-def-box > div.inner-box-wrapper > div.word-header > div > h1",
		"main > article > div.full-def-box > div.inner-box-wrapper > div.word-attributes > span.main-attr > em",
		"main > article > div.full-def-box > div.inner-box-wrapper > div.word-attributes > span.pr"
	};
	
	private static final String[] defAr = new String[] {"main > article > div.card-box > div.inner-box-wrapper > div.card-primary-content > ol > li > p.definition-inner-item"};
	
	private static final Map<String, Object> dictMap = new HashMap<String, Object>();
	static {
		// fix for testcase where href return full url
		// removed trailing backslash
		dictMap.put("baseURL", "http://www.merriam-webster.com");
		dictMap.put("url", url);
		dictMap.put("css", css);
		dictMap.put("excludeCSS", new String[]{"/styles\\/default\\/interface\\.css/i"});
	}
	
	public MerriamWebster(WebDriver driver) {
		super(driver, resultId, url+searchTxt, dictMap);
	}
	
	@Override
	protected void applyFix(WebDriver driver) {
		WebElement webElement = findElement(driver, By.cssSelector("div.left-content"));
		if (webElement != null) {
			((JavascriptExecutor) driver).executeScript(
					"arguments[0].setAttribute(arguments[1], arguments[2]);", 
					webElement, "id", resultId);
		}
	}
	
	protected void testother(WebElement resultElem) {
		// check word in the result
		assertText(resultElem, txtLocation, txt2, searchTxt);
		
		testCompactMode(resultElem, titleAr, defAr);
	}
}
