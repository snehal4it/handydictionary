package test;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;

public class Test {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		 // Create a new instance of the html unit driver
        // Notice that the remainder of the code relies on the interface, 
        // not the implementation.
        WebDriver driver = new HtmlUnitDriver();

        // And now use this to visit Google
        driver.get("http://eprotrackplus.sony.com.sg/digite/Request?Key=login");
        //String src =driver.getPageSource();
        //System.out.println("src:" + src);

        // Find the text input element by its name
        WebElement element = driver.findElement(By.name("loginId"));

        // Enter something to search for
        element.sendKeys("Cheese!");

        // Now submit the form. WebDriver will find the form for us from the element
        element.submit();

        // Check the title of the page
        System.out.println("Page title is: " + driver.getTitle());


	}

}
