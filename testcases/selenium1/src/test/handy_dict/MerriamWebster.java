package test.handy_dict;

import java.util.HashMap;
import java.util.Map;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class MerriamWebster extends Dictionary {
	private static final String resultId = "wordclick";
	private static final String url = "http://www.merriam-webster.com/dictionary/";
	private static final String searchTxt = "flay";
	
	private static final String txtLocation = "#mwEntryData > div#headword > h2";
	
	// messages
	private static final String txt2 = "Looking for element that contains word used for lookup:" + txtLocation;
	
	private static final String[] css = new String[] {"http://www.merriam-webster.com/styles/default/mw-ref.css"};
	
	private static final String[] titleAr = new String[] {
		"#mwEntryData > div#headword > h2",
		"#mwEntryData > div#headword > span.main-fl",
		"#mwEntryData > div#headword > span.pr"
	};
	
	private static final String[] defAr = new String[] {"#mwEntryData > div.d > div.sblk > div.scnt"};
	
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
	
	protected void testother(WebElement resultElem) {
		// check word in the result
		assertText(resultElem, txtLocation, txt2, searchTxt);
		
		testCompactMode(resultElem, titleAr, defAr);
	}
}
