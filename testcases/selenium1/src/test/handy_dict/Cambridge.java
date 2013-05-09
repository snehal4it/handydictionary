package test.handy_dict;

import java.util.HashMap;
import java.util.Map;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import test.handy_dict.result.DictException;

public class Cambridge extends Dictionary {
	private static final String resultId = "entryContent";
	private static final String url = "http://dictionary.cambridge.org/search/british/direct/?q=";
	private static final String searchTxt = "flay";
	
	private static final String txtLocation = "div.di > div.di-head > h1 > span";
	
	// messages
	//private static final String txt1 = "Looking for Ref Element:" + refElement;
	private static final String txt2 = "Looking for element that contains word used for lookup:" + txtLocation;
	
	private static final String[] css = new String[] {"http://dictionary.cambridge.org/common.css?version=2013-04-16-1133"};
	
	private static final String[] titleAr = new String[] {
		"div.di > div.di-head > h1 > span",
		"div.di > div.di-head > span.di-info span.posgram > span.pos",
		"div.di > div.di-head > span.di-info span.pron"
	};
	
	private static final String[] defAr = new String[] {"div.di > div.di-body div.sense-block > span.sense-body span.def-block > span.def-head > span.def"};
	
	private static final Map<String, Object> dictMap = new HashMap<String, Object>();
	static {
		dictMap.put("baseURL", "http://dictionary.cambridge.org/");
		dictMap.put("url", url);
		dictMap.put("css", css);
		dictMap.put("excludeCSS", new String[]{});
	}
	
	public Cambridge(WebDriver driver) {
		super(driver, resultId, url+searchTxt, dictMap);
	}
	
	public Cambridge(WebDriver driver, String str) {
		super(driver, resultId, url+str, dictMap);
	}
	
	protected void testother(WebElement resultElem) {
		result.info("Tag name verification: expected DIV");
		if (!"DIV".equals(resultElem.getTagName().toUpperCase())) {
			result.error("Tag name verification failed");
			throw new DictException(result); 
		}
		result.info("Tag name verified successfully");
		
		// check ref element
		//WebElement refElem  = assertElem(resultElem, refElement, txt1);
		
		// check word in the result
		assertText(resultElem, txtLocation, txt2, searchTxt);
		
		testCompactMode(resultElem, titleAr, defAr);
	}
	
}
