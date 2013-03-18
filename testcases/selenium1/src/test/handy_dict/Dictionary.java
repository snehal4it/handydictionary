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
	
	private String[] css;
	
	protected Result result = new Result();
	
	private static final String infoTxtCommon = "Looking for:";
	
	public Dictionary(WebDriver driver, String resultId, String url, String[] css) {
		this.driver=driver;
		this.resultId=resultId;
		this.url=url;
		this.css=css;
	}
	
	public Result test() {
		result.info("Loading page:" + url);
		
		driver.get(url);
		
		try {
			Thread.sleep(1000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		
		result.info("Finding result element:" + resultId);
		WebElement resultElem = findElement(driver, By.id(resultId));
		if (resultElem == null) {
			result.error("Result Element not found");
			return result;
		}
		result.info("Result Element Found");
		
		testother(resultElem);
		
		testCSS();
		
		return result;
	}
	
	protected void testCSS() {
		result.info("------------------CSS File test------------------");
		if (css == null || css.length == 0) {
			result.info("No file to test------------------------------");
			return;
		}
		
		List<WebElement> elems = driver.findElements(By.tagName("link"));
		for (int i =  0; i < css.length; i++) {
			result.info("Checking file:" + css[i]);
			boolean flag = false;
			for (WebElement elem: elems) {
				String href = elem.getAttribute("href");
				if (css[i].equalsIgnoreCase(href)) {
					flag = true;
					break;
				}
			}
			
			if (flag) {
				result.info("File found");
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
