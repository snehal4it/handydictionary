package com.handydict.result;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

public class Result {
	private List<Record> records = new ArrayList<Record>();
	
	public List<Record> getRecords() {
		return records;
	}

	public void info(String txt) {
		Record record = new Record(txt, RecordType.INFO);
		records.add(record);
	}
	
	public void warn(String txt) {
		Record record = new Record(txt, RecordType.WARN);
		records.add(record);
	}
	
	public void error(String txt) {
		Record record = new Record(txt, RecordType.ERROR);
		records.add(record);
	}
	
	public int getErrorCount() {
		int count = 0;
		for (Record record: records) {
			if (record.getType() == RecordType.ERROR) {
				count++;
			}
		}
		return count;
	}
	
	public int getWarningCount() {
		int count = 0;
		for (Record record: records) {
			if (record.getType() == RecordType.WARN) {
				count++;
			}
		}
		return count;
	}
	
	public boolean isError() {
		int count = getErrorCount();
		return count > 0;
	}
	
	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this,
				ToStringStyle.MULTI_LINE_STYLE);
	}
}
