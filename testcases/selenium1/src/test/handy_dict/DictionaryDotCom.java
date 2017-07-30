package test.handy_dict;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class DictionaryDotCom extends Dictionary {
	private static final String resultId = "source-luna";
	private static final String url = "http://dictionary.reference.com/dic?q=";
	private static final String searchTxt = "flay";
	
	private static final String txtLocation = "section.luna-box > header h1.head-entry > span";
	//private static final String topElemSel = "#top";
	
	
	// messages
	private static final String txt2 = "Looking for element that contains word used for lookup:" + txtLocation;
	
	//private static final String topElemSelInfo = "Looking for top element, remove adds:" +  topElemSel;
	private static final String[] css = new String[] {"http://dictionary.reference.com/dcss/dictionary/v5/newSerpStylesTopHeavy.r90658.css"};
	
	private static final String[] titleAr = new String[] {
		"section.luna-box > header > div.waypoint-wrapper > h1.head-entry > span",
		"section.luna-box > header > div.pronounce > div > span.spellpron",
		"section.luna-box > header > div.pronounce > div > span.ipapron"
	};
	
	private static final String[] defAr = new String[] {"section.luna-box > div.source-data > div.def-list > section.def-pbk > div.def-set > div"};
	
	private static final Map<String, Object> dictMap = new HashMap<String, Object>();
	static {
		dictMap.put("baseURL", "http://dictionary.reference.com/");
		dictMap.put("url", url);
		dictMap.put("css", css);
		dictMap.put("excludeCSS", new String[]{"/http(.|\\s)*?static\\.sfdict\\.com(.|\\s)*?responsive\\.css/i"});
	}
	
	public DictionaryDotCom(WebDriver driver) {
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
