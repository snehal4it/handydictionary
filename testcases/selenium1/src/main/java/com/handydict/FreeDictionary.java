package com.handydict;

import java.util.HashMap;
import java.util.Map;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class FreeDictionary extends Dictionary {
	private static final String resultId = "MainTxt";
	private static final String url = "http://www.thefreedictionary.com/";
	private static final String searchTxt = "flay";
	
	private static final String txtLocation = "div#Definition > section > h2";
	
	// messages
	private static final String txt2 = "Looking for element that contains word used for lookup:" + txtLocation;
	
	private static final String[] css = new String[] {"http://img.tfd.com/t.css?e"};
	
	private static final String[] titleAr = new String[] {
		"div#Definition > section > h2",
		"div#Definition > section > span.pron"
	};
	
	private static final String[] defAr = new String[] {"div#Definition > section > div.pseg > div.ds-list"};
	
	private static final Map<String, Object> dictMap = new HashMap<String, Object>();
	static {
		dictMap.put("baseURL", "http://www.thefreedictionary.com/");
		dictMap.put("url", url);
		dictMap.put("css", css);
		dictMap.put("excludeCSS", new String[]{});
	}
	
	public FreeDictionary(WebDriver driver) {
		super(driver, resultId, url+searchTxt, dictMap);
	}
	
	protected void testother(WebElement resultElem) {
		// check word in the result
		assertText(resultElem, txtLocation, txt2, searchTxt);
		
		testCompactMode(resultElem, titleAr, defAr);
	}
}
