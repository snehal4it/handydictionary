package com.handydict.dict;

import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.handydict.result.DictException;
import com.handydict.result.Result;

/**
 * Base class that contains common test operations for all dictionary
 * @author snehal patel
 */
public class Dictionary {
	private static final Logger LOGGER = LogManager.getLogger(Dictionary.class);
	
	protected static final String SPACE = " ";
	protected WebDriver driver = null; 
	
	private String resultId;
	
	private String url;
	
	private Map<String, Object> dictMap;
	
	protected Result result = new Result();
	
	private static final String infoTxtCommon = "Looking for:";
	
	private static final String extractCSSJS = "var html = arguments[0];"
		+ "var links = new Array();"
		+ "if (html == null || html == \"\") {" + "return links;" + "}"
		+ "try {"
		+ "var start = html.search(/<head>/i);"
		+ "if (start == -1) {"	+ "start = 0;"	+ "}"
		+ "var end = html.search(/<\\/head>/i);"
		+ "if (end == -1) {" + "end = html.search(/<body/i);" + "}"
		+ "if (end == -1) {" + "end = html.length;" + "}"
		+ "var head = html.substring(start, end);"
		+ "var result = head.match(/(<link)(.|\\s)*?>/ig);"
		+ "if (result != null) {"
		+ "var linkIndex=0;"
		+ "for (var i = 0; i < result.length; i++) {"
		+ "if (result[i].search(/rel=[\"'\\s]?stylesheet[\"'\\s]/i) != -1) {"
		+ "var hrefAr = result[i].match(/href=[\"'\\s]?(?:.|\\s)*?[\"'\\s]/i);"
		+ "if (hrefAr != null && hrefAr.length > 0 && hrefAr[0].length > 5) {"
		+ "links[linkIndex++]=hrefAr[0].substr(5).replace(/(\"|')+/g, \"\");"
		+ "} } } } } catch (e) {}"
		+ "return links;";
	
	private static final String refinedCSSJS = "var cssAr = arguments[0];var dict = arguments[1];"
		+ "if (cssAr == null || cssAr.length == 0) {" + "return dict.css;" + "}"
		+ "var excludeCss = dict.excludeCSS;"
		+ "var resultCssAr = new Array();"
		+ "var resultIndex = 0;"
		+ "for (var i = 0; i < cssAr.length; i++) {"
		+ "var cssLink = cssAr[i];" + "if (cssLink == null) {continue;}"
		+ "var exclude = false;"
		+ "if (excludeCss != null) {"
		+ "for (var j = 0; j < excludeCss.length; j++) {"
		// fix for regular expression in string format
		+ "excludeCss[j]=eval(excludeCss[j]);"
		+ "if (cssLink.search(excludeCss[j]) != -1) {"
		+ "exclude = true;"
		+ "break;"
		+ "} } } if (exclude) { continue; }"
		+ "var pos = cssLink.search(/http/i);"
		+ "if (pos != 0) {"
		+ "if (cssLink.indexOf(\"/\") == 0) {"
		+ "cssLink = dict.baseURL + cssLink;"
		+ "} else {"
		+ "var tempURL = dict.url;"
		+ "try {"
		+ "var qIndex = tempURL.indexOf(\"?\");"
		+ "if (qIndex != -1) { tempURL = tempURL.substring(0, qIndex); }"
		+ "var q1Index = tempURL.indexOf(\"/\")+1;"
		+ "qIndex = tempURL.lastIndexOf(\"/\");"
		+ "if (qIndex != -1 && qIndex != tempURL.length -1 && qIndex > q1Index) {"
		+ "tempURL = tempURL.substring(0, qIndex+1);"
		+ "} } catch(e) {}"
		+ "cssLink = tempURL + cssLink;"
		+ "} }"
		+ "resultCssAr[resultIndex]=cssLink;"
		+ "resultIndex++;"
		+ "}"
		+ "if (resultCssAr.length == 0) {return dict.css;}"
		+ "return resultCssAr;";
	
	public Dictionary(WebDriver driver, String resultId, String url, Map<String, Object> dictMap) {
		this.driver=driver;
		this.resultId=resultId;
		this.url=url;
		this.dictMap=dictMap;
	}
	
	public Result test() {
		result.info("Loading page:" + url);
		
		try {
			driver.get(url);
			Thread.sleep(2000);
		} catch (Exception e) {
			LOGGER.error("Error in loading page:", e);
		}
		
		applyFix(driver);
		
		result.info("Finding result element:" + resultId);
		WebElement resultElem = findElement(driver, By.id(resultId));
		if (resultElem == null) {
			result.error("Result Element not found");
			return result;
		}
		result.info("Result Element Found");
		
		testother(resultElem);
		
		testDynamicCSS();
		//testCSS();
		
		return result;
	}
	
	// apply any fix before actual test starts
	protected void applyFix(WebDriver driver) {
		
	}
	
	protected void testDynamicCSS() {
		String html = driver.getPageSource();
		if (driver instanceof JavascriptExecutor) {
			JavascriptExecutor jsDriver = ((JavascriptExecutor)driver);
			@SuppressWarnings("unchecked")
			List<String> cssList = (List<String>) jsDriver.executeScript(extractCSSJS, html);
			if (cssList == null || cssList.size() == 0) {
				result.warn("Javascript:extractCSS return null or empty list");
			}
			
			@SuppressWarnings("unchecked")
			List<String> refinedCssList = (List<String>) jsDriver.executeScript(refinedCSSJS, cssList, dictMap);
			if (cssList == null || cssList.size() == 0) {
				result.warn("Javascript:getRefinedCSSList return null or empty list");
			} else {
				testCSS(refinedCssList);
			}
		} else {
			result.warn("Could not test dynamic CSS as driver is not instance of JavascriptExecutor");
		}
	}
	
	protected void testCSS(List<String> cssList) {
		result.info("------------------CSS File test------------------");
		if (cssList == null || cssList.size() == 0) {
			result.warn("No file to test------------------------------");
			return;
		}
		
		List<WebElement> elems = driver.findElements(By.tagName("link"));
		for (String css : cssList) {
			result.info("Checking file:" + css);
			boolean flag = false;
			for (WebElement elem: elems) {
				String href = elem.getAttribute("href");
				if (css.equalsIgnoreCase(href)) {
					flag = true;
					break;
				}
			}
			
			if (flag) {
				result.info("File found in source");
			} else {
				result.warn("File not found");
			}
		}
		result.info("------------------CSS File test------------------");
	}
	
	protected void testCompactMode(WebElement resultElem, String[] titleAr, String[] defAr) {
		result.info("------------------COMPACT MODE: CHECK------------------");
		result.info("---Title Ar----");
		for (String titleElem: titleAr) {
			verify(resultElem, titleElem, infoTxtCommon + titleElem);
		}
		
		result.info("---Def Ar----");
		for (String defElem: defAr) {
			verify(resultElem, defElem, infoTxtCommon + defElem);
		}
	}
	
	protected void testother(WebElement resultElem) {}
	
	// use findElements and return first element if present else null
	public WebElement findElement(WebElement elem, By by) {
		List<WebElement> elems = elem.findElements(by);
		if (elems != null && elems.size() > 0) {
			return elems.get(0);
		}
		return null;
	}
	
	public WebElement findElement(WebDriver elem, By by) {
		List<WebElement> elems = elem.findElements(by);
		if (elems != null && elems.size() > 0) {
			return elems.get(0);
		}
		return null;
	}
	
	public WebElement assertElem(WebElement elem, String cssSelStr, String info) {
		result.info(info);
		WebElement resultElem = findElement(elem, By.cssSelector(cssSelStr));
		if (resultElem == null) {
			result.error("Element not found");
			throw new DictException(result);
		}
		
		result.info("Element found");
		return resultElem;
	}
	
	public WebElement assertText(WebElement elem, String cssSelStr, String info, String searchTxt) {
		WebElement txtElem = assertElem(elem, cssSelStr, info);
		
		result.info("Looking word '" + searchTxt + "' inside above element");
		String txtElemStr = txtElem.getText();
		if (txtElemStr == null) {
			result.error("Above word not found, content is null in above element");
			throw new DictException(result);
		}
		
		int txtResult = txtElemStr.toLowerCase().indexOf(searchTxt.toLowerCase());
		if (txtResult == -1) {
			result.error("Above word not found, actual content:\n" + txtElemStr);
			throw new DictException(result);
		}
		result.info("Looking word completed successfully");
		
		return txtElem;
	}
	
	// verify element present or not and record in result
	public WebElement verify(WebElement elem, String cssSelStr, String info) {
		result.info(info);
		WebElement resultElem = findElement(elem, By.cssSelector(cssSelStr));
		if (resultElem == null) {
			result.warn("Element not found");
		} else {
			result.info("Element found");
		}
		return resultElem;
	}
	
	
	public List<WebElement> verifyAll(WebElement elem, String cssSelStr, String info) {
		result.info(info);
		
		List<WebElement> elems = elem.findElements(By.cssSelector(cssSelStr));
		if (elems == null || elems.size() == 0) {
			result.warn("Elements can not be located");
		} else {
			result.info("Elements located: total:" + elems.size());
		}
		return elems;
	}
}
