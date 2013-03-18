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
	
	private static final String[] css = new String[] {"http://dictionary.reference.com/dcss/dictionary/v5/newSerpStylesTopHeavy.r90443.css"};
	
	private static final String[] titleAr = new String[] {
		"div#Headserp > span > span > h1#query_h1",
		"div#midRail > div#rpane > div > div.sep_top > div.KonaBody > div > div > div.header > span.pronset > span.show_spellpr > span.pron",
		"div#midRail > div#rpane > div > div.sep_top > div.KonaBody > div > div > div.body > div > span.pg"
	};
	
	private static final String[] defAr = new String[] {"div#midRail > div#rpane > div > div.sep_top > div.KonaBody > div > div > div.body > div > div.luna-Ent > div.dndata"};
	
	public DictionaryDotCom(WebDriver driver) {
		super(driver, resultId, url+searchTxt, css);
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
