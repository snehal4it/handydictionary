package com.handydict.test;

import java.util.Map;

import com.handydict.dict.Dictionary;
import com.handydict.result.Result;

/**
 * Executor for executing dictionary test cases
 * @author snehal patel
 *
 */
public interface DictionaryTestExecutor {
	
	/**
	 * Execute dictionary tests
	 * @return result for each dictionary
	 */
	Map<Dictionary, Result> executeTest();
}
