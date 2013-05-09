package test.handy_dict;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class Oxford extends Dictionary {
	private static final String resultId = "mainContent";
	private static final String url = "http://oxforddictionaries.com/search/english/?direct=1&multi=1&q=";
	private static final String searchTxt = "flay";
	
	private static final String txtLocation = "header > h1.pageTitle";
	
	// messages
	private static final String txt2 = "Looking for element that contains word used for lookup:" + txtLocation;
	
	private static final String[] css = new String[] {"http://oxforddictionaries.com/common.css?version=2013-05-02-0954"};
	
	private static final String[] titleAr = new String[] {
		"header > h1.pageTitle",
		"header > div.entryPronunciation > a",
		"div#entryPageContent > div > section.senseGroup > h3.partOfSpeech > span.partOfSpeech",
		"div#entryPageContent > div > section.senseGroup > em"
	};
	
	private static final String[] defAr = new String[] {"div#entryPageContent > div > section.senseGroup > ul.sense-entry > li.sense > div.senseInnerWrapper > span.definition"};
	
	private static final Map<String, Object> dictMap = new HashMap<String, Object>();
	static {
		dictMap.put("baseURL", "http://oxforddictionaries.com/");
		dictMap.put("url", url);
		dictMap.put("css", css);
		dictMap.put("excludeCSS", new String[]{});
	}
	
	public Oxford(WebDriver driver) {
		super(driver, resultId, url+searchTxt, dictMap);
	}
	
	protected void testother(WebElement resultElem) {
		// check word in the result
		assertText(resultElem, txtLocation, txt2, searchTxt);
		
		List<WebElement> elems = resultElem.findElements(By.xpath("./*"));
		if (elems == null || elems.size() == 0) {
			result.warn("Result Element content is empty");
			return;
		}
	
		testCompactMode(resultElem, titleAr, defAr);
	}
}
