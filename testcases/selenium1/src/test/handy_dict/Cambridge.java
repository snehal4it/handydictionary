package test.handy_dict;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import test.handy_dict.result.DictException;

public class Cambridge extends Dictionary {
	private static final String resultId = "entryContent";
	private static final String url = "http://dictionary.cambridge.org/search/british/direct/?q=";
	private static final String searchTxt = "flay";
	
	private static final String refElement = "div div.posblock_b > div.gwblock";
	private static final String txtLocation = "div.gwblock_h";
	
	// messages
	private static final String txt1 = "Looking for Ref Element:" + refElement;
	private static final String txt2 = "Looking for element that contains word used for lookup:" + txtLocation;
	
	private static final String[] css = new String[] {"http://dictionary.cambridge.org/styles/interface.css?version=2013-01-08-1449",
	          "http://dictionary.cambridge.org/styles/ddr_entry.css?version=2013-01-08-1449",
	          "http://dictionary.cambridge.org/styles/cald3_entry.css?version=2013-01-08-1449"};
	
	private static final String[] titleAr = new String[] {
		"div.posblock > div.posblock_b > div.gwblock > div.gwblock_h > h1.header > span.hw",
		"div.posblock > div.posblock_b > div.gwblock > div.gwblock_h > h1.header > span.pos",
		"div.posblock > div.posblock_b > div.gwblock > div.gwblock_h > div.additional_header > span.prons",
		"div.posblock > div.posblock_b > div.gwblock > div.gwblock_h > div.additional_header > span.grams"
	};
	
	private static final String[] defAr = new String[] {"div.posblock > div.posblock_b > div.gwblock > div.gwblock_b > div.sense > span"};
	
	public Cambridge(WebDriver driver) {
		super(driver, resultId, url+searchTxt, css);
	}
	
	public Cambridge(WebDriver driver, String str) {
		super(driver, resultId, url+str, css);
	}
	
	protected void testother(WebElement resultElem) {
		result.info("Tag name verification: expected DIV");
		if (!"DIV".equals(resultElem.getTagName().toUpperCase())) {
			result.error("Tag name verification failed");
			throw new DictException(result); 
		}
		result.info("Tag name verified successfully");
		
		// check ref element
		WebElement refElem  = assertElem(resultElem, refElement, txt1);
		
		// check word in the result
		assertText(refElem, txtLocation, txt2, searchTxt);
		
		testCompactMode(resultElem, titleAr, defAr);
	}
	
}
