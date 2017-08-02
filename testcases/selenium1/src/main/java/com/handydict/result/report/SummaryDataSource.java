package com.handydict.result.report;

import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;

import com.handydict.Dictionary;
import com.handydict.result.Result;

import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JRField;
import net.sf.jasperreports.engine.JRRewindableDataSource;

public class SummaryDataSource implements JRRewindableDataSource {
	
	private Map<Dictionary, Result> entries;
	
	private Iterator<Entry<Dictionary, Result>> iterator = null;
	
	private Entry<Dictionary, Result> currentRecord = null; 
	
	public SummaryDataSource(Map<Dictionary, Result> entries) {
		this.entries = entries;
		iterator = entries.entrySet().iterator();
	}

	@Override
	public boolean next() throws JRException {
		if (iterator.hasNext()) {
			currentRecord = iterator.next();
			return true;
		}
		
		return false;
	}

	@Override
	public Object getFieldValue(JRField jrField) throws JRException {
		if (jrField.getName().equals("key")) {
			return currentRecord.getKey().getClass().getSimpleName();
		} else if (jrField.getName().equals("errorCount")) {
			return currentRecord.getValue().getErrorCount();
		} else if (jrField.getName().equals("warningCount")) {
			return currentRecord.getValue().getWarningCount();
		}
		return null;
	}

	@Override
	public void moveFirst() throws JRException {
		iterator = entries.entrySet().iterator();
	}
	
}
