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
	private static final String headTitleElemSel = "div.gwblock_h > h1.header";
	private static final String spanTitleElemSel =  "span.hw > span.BASE";
	private static final String additionalHeaderSel = "div.gwblock_h > div.additional_header";
	private static final String headTitleElem2Sel = "div#cdo-definition-head > h2#definition-title";
	private static final String entries = "div.gwblock_b > div.sense > div.sense-bullet";
	
	// messages
	private static final String txt1 = "Looking for Ref Element:" + refElement;
	private static final String txt2 = "Looking for element that contains word used for lookup:" + txtLocation;
	
	private static final String infoTxt1 = "Looking for internal element that contains word for CSS:" + refElement + SPACE + headTitleElemSel;
	private static final String infoTxt2 = "Looking for span element for CSS:" + refElement + SPACE +  headTitleElemSel + SPACE + spanTitleElemSel;
	private static final String infoTxt3 = "Looking additionalHead for CSS:" + refElement + SPACE + additionalHeaderSel;
	private static final String infoTxt4 = "Looking headTitleElem2 for CSS:" + refElement + SPACE + headTitleElem2Sel;
	private static final String infoTxt5 = "Looking entries for CSS:" + refElement + SPACE + entries;
	
	
	public Cambridge(WebDriver driver) {
		super(driver, resultId, url+searchTxt);
	}
	
	public Cambridge(WebDriver driver, String str) {
		super(driver, resultId, url+str);
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
		
		WebElement headTitleElem = verify(refElem, headTitleElemSel, infoTxt1);
		if (headTitleElem != null) {
			verify(headTitleElem, spanTitleElemSel, infoTxt2);
		}
		
		verify(refElem, additionalHeaderSel, infoTxt3);
		verify(refElem, headTitleElem2Sel, infoTxt4);		
		verifyAll(refElem, entries, infoTxt5);
		
	}
	
}
