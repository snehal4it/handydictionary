package test.handy_dict;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class MerriamWebster extends Dictionary {
	private static final String resultId = "wordclick";
	private static final String url = "http://www.merriam-webster.com/dictionary/";
	private static final String searchTxt = "flay";
	
	private static final String txtLocation = "div#mwEntryData > div#headword > h2";
	private static final String headTitleElemSel = txtLocation;
	private static final String defHeaderElemSel = "div#mwEntryData > div.d > h2.def-header";
	
	// messages
	private static final String txt2 = "Looking for element that contains word used for lookup:" + txtLocation;
	
	private static final String headTitleElemSelInfo = "Looking for header element for CSS:" +  headTitleElemSel;
	private static final String defHeaderElemSelInfo = "Looking for defHeaderElem for CSS:" +  defHeaderElemSel;
	
	public MerriamWebster(WebDriver driver) {
		super(driver, resultId, url+searchTxt);
	}
	
	protected void testother(WebElement resultElem) {
		// check word in the result
		assertText(resultElem, txtLocation, txt2, searchTxt);
		
		verify(resultElem, headTitleElemSel, headTitleElemSelInfo);
		verify(resultElem, defHeaderElemSel, defHeaderElemSelInfo);
	}
}
