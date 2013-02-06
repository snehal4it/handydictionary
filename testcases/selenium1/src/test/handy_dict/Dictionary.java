package test.handy_dict;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import test.handy_dict.result.DictException;
import test.handy_dict.result.Result;

public class Dictionary {
	protected static final String SPACE = " ";
	protected WebDriver driver = null; 
	
	private String resultId;
	
	private String url;
	
	protected Result result = new Result();
	
	public Dictionary(WebDriver driver, String resultId, String url) {
		this.driver=driver;
		this.resultId=resultId;
		this.url=url;
	}
	
	public Result test() {
		result.info("Loading page:" + url);
		
		driver.get(url);
		
		result.info("Finding result element:" + resultId);
		WebElement resultElem = findElement(driver, By.id(resultId));
		if (resultElem == null) {
			result.error("Result Element not found");
			return result;
		}
		result.info("Result Element Found");
		
		testother(resultElem);
		
		return result;
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
