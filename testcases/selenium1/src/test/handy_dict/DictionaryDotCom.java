package test.handy_dict;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class DictionaryDotCom extends Dictionary {
	private static final String resultId = "contentResults";
	private static final String url = "http://dictionary.reference.com/dic?q=";
	private static final String searchTxt = "flay";
	
	private static final String txtLocation = "div#Headserp h1";
	//private static final String topElemSel = "#top";
	
	
	// messages
	private static final String txt2 = "Looking for element that contains word used for lookup:" + txtLocation;
	
	//private static final String topElemSelInfo = "Looking for top element, remove adds:" +  topElemSel;
	
	public DictionaryDotCom(WebDriver driver) {
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
		for (WebElement elem : elems) {
			String tagName = elem.getTagName().toUpperCase();
			if ("DIV".equals(tagName)) {
				String divId = elem.getAttribute("id");
				if (divId != null && divId.equals("Headserp")) {
					headerFlag = true;
					result.info("Header found and will be hidden");
				}
				//else {
				//	verify(elem, topElemSel, topElemSelInfo);
				//}
			}
		}
		
		if (!headerFlag) {
			result.warn("Header element not found in resultElement");
		}
	}
}
