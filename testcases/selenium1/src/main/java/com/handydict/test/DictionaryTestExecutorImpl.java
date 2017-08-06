package com.handydict.test;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.handydict.dict.Dictionary;
import com.handydict.result.DictException;
import com.handydict.result.Result;

/**
 * Test Executor Implementation
 * @author snehal patel
 */
@Component
public class DictionaryTestExecutorImpl implements DictionaryTestExecutor {
	private static final Logger LOGGER = LogManager.getLogger(DictionaryTestExecutorImpl.class);
	
	@Autowired
	private List<Dictionary> dictionaryList;
	
	@Override
	public Map<Dictionary, Result> executeTest() {
		Map<Dictionary, Result> dictResultMap = new LinkedHashMap<Dictionary, Result>();
		for (Dictionary dict : dictionaryList) {
			try {
				Result result = dict.test();
				dictResultMap.put(dict, result);
				LOGGER.debug("result for dictionary={}, result={}", dict, result);
			} catch (DictException e) {
				LOGGER.error("Error in testing dictionary, {}", dict, e);
			}
		}
		return dictResultMap;
	}
}
