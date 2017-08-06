package com.handydict.report;

import java.util.List;
import java.util.Map;

import com.handydict.dict.Dictionary;
import com.handydict.result.Result;

/**
 * Dictionary test report generator
 * @author snehal patel
 */
public interface DictionaryTestReportGenerator {
	
	/**
	 * Generate report using input result
	 * @param dictionaryResult dictionary test result
	 */
	List<String> generateReport(Map<Dictionary, Result> dictionaryResult);
}
