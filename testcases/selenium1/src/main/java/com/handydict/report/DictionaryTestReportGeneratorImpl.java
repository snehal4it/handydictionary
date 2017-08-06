package com.handydict.report;

import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Component;

import com.handydict.dict.Dictionary;
import com.handydict.result.Result;
import com.handydict.result.report.HtmlReport;

/**
 * Report generator implementation
 * @author snehal patel
 */
@Component
public class DictionaryTestReportGeneratorImpl implements DictionaryTestReportGenerator {
	
	private static final Logger LOGGER = LogManager.getLogger(DictionaryTestReportGeneratorImpl.class);

	@Override
	public List<String> generateReport(Map<Dictionary, Result> dictionaryResult) {
		HtmlReport report = new HtmlReport(dictionaryResult);
		List<String> paths = report.generate();
		LOGGER.debug("paths={}", paths);
		return paths;
	}

}
