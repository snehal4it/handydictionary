package test.handy_dict;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class FreeDictionary extends Dictionary {
	private static final String resultId = "MainTxt";
	private static final String url = "http://www.thefreedictionary.com/";
	private static final String searchTxt = "flay";
	
	private static final String txtLocation = "table > tbody > tr > td > span.hw";
	
	// messages
	private static final String txt2 = "Looking for element that contains word used for lookup:" + txtLocation;
	
	public FreeDictionary(WebDriver driver) {
		super(driver, resultId, url+searchTxt);
	}
	
	protected void testother(WebElement resultElem) {
		// check word in the result
		assertText(resultElem, txtLocation, txt2, searchTxt);
	}
}
