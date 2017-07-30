package test.handy_dict;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class Oxford extends Dictionary {
	private static final String resultId = "content";
	private static final String url = "https://en.oxforddictionaries.com/definition/";
	private static final String searchTxt = "flay";
	
	private static final String txtLocation = "div.entryWrapper header > h2 > span";
	
	// messages
	private static final String txt2 = "Looking for element that contains word used for lookup:" + txtLocation;
	
	private static final String[] css = new String[] {"https://en.oxforddictionaries.com/common.css?version=2013-05-02-0954"};
	
	private static final String[] titleAr = new String[] {
		"div.entryWrapper header > h2 > span",
		"div.entryWrapper > section > h3 > span"
	};
	
	private static final String[] defAr = new String[] {"div.entryWrapper > section > ul.semb > li > div > p"};
	
	private static final Map<String, Object> dictMap = new HashMap<String, Object>();
	static {
		dictMap.put("baseURL", "https://en.oxforddictionaries.com");
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
