package test.handy_dict;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class Oxford extends Dictionary {
	private static final String resultId = "mainContent";
	private static final String url = "http://oxforddictionaries.com/search/english/?direct=1&multi=1&q=";
	private static final String searchTxt = "flay";
	
	private static final String txtLocation = "header > h1";
	private static final String headTitleElemSel = "h1.pageTitle";
	private static final String partOfSpeechSel = "div > section.senseGroup > h3.partOfSpeech";
	private static final String ulElemsSel = "div > section.senseGroup > ul.sense-entry";
	private static final String liElemsSel = "li";
	private static final String exampleGroupSel = "div span.exampleGroup";
	
	// messages
	private static final String txt2 = "Looking for element that contains word used for lookup:" + txtLocation;
	
	private static final String infoTxt1 = "Looking for header element for CSS: HEADER >" +  headTitleElemSel;
	private static final String infoTxt2 = "Looking for partOfSpeechSel for CSS: DIV >" +  partOfSpeechSel;
	private static final String ulElemsSelInfo = "Looking for ulElemsSel for fixing ul list: DIV >" +  ulElemsSel;
	private static final String liElemsSelInfo = "Looking for all li child: DIV >" +  ulElemsSel +  SPACE + liElemsSel;
	private static final String exampleGroupSelInfo = "Looking for exampleGroup in li: DIV >" +  ulElemsSel + SPACE + liElemsSel + SPACE + exampleGroupSel;
	
	public Oxford(WebDriver driver) {
		super(driver, resultId, url+searchTxt);
	}
	
	protected void testother(WebElement resultElem) {
		// check word in the result
		assertText(resultElem, txtLocation, txt2, searchTxt);
		
		List<WebElement> elems = resultElem.findElements(By.xpath("./*"));
		if (elems == null || elems.size() == 0) {
			result.warn("Result Element content is empty");
			return;
		}
		
		boolean headerFlag = false;
		boolean divFlag = false;
		for (WebElement elem : elems) {
			String tagName = elem.getTagName().toUpperCase();
			if ("HEADER".equals(tagName)) {
				headerFlag = true;
				verify(elem, headTitleElemSel, infoTxt1);
			} else if ("DIV".equals(tagName)) {
				divFlag = true;
				verify(elem, partOfSpeechSel, infoTxt2);
				_fixList(elem);
			}
		}
		
		if (!headerFlag) {
			result.warn("HEADER element not found in resultElement");
		}
		
		if (!divFlag) {
			result.warn("DIV element not found in resultElement");
		}
	}
	
	protected void _fixList(WebElement divElem) {
		List<WebElement> ulElems = verifyAll(divElem, ulElemsSel, ulElemsSelInfo);
		for (WebElement ulElem : ulElems) {
			List<WebElement> lists = verifyAll(ulElem, liElemsSel, liElemsSelInfo);
			for (WebElement elem : lists) {
				verify(elem, exampleGroupSel, exampleGroupSelInfo);
			}
		}
	}
}
