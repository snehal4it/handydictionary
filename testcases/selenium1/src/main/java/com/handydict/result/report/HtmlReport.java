package com.handydict.result.report;

import java.io.File;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import com.handydict.dict.Dictionary;
import com.handydict.result.Result;

import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;

public class HtmlReport {
	private static final Logger LOGGER = LogManager.getLogger(HtmlReport.class);
	
	private static final String SUMMARY_REPORT = "summary.html";
	
	private static final SimpleDateFormat format1 = new SimpleDateFormat("yyyyMMdd");
	private static final String OUTPUT_DIR = "output/reports";
	private static final String SUMMARY_REPORT_TEMPLATE = "/SummaryReport.xml";
	private static final String DETAILED_REPORT_TEMPLATE = "/DetailedReport.xml";
	
	private Map<Dictionary, Result> dictionaryResult = new LinkedHashMap<Dictionary, Result>();
	
	public HtmlReport(Map<Dictionary, Result> dictionaryResult) {
		this.dictionaryResult = dictionaryResult;
	}
	
	public List<String> generate() {
		List<String> paths = new ArrayList<String>();
		String path = createOutputLocation();
		String resultPath = generateSummaryReport(path);
		paths.add(resultPath);
		
		for (Entry<Dictionary,Result> entry : dictionaryResult.entrySet()) {
			resultPath = generateDetailedReport(path, entry.getKey(), entry.getValue());
			paths.add(resultPath);
		}
		return paths;
	}
	
	public String generateDetailedReport(String path, Dictionary dictionary, Result result) {
		InputStream in = this.getClass().getResourceAsStream(DETAILED_REPORT_TEMPLATE);
		LOGGER.debug("Details:InputStream ={}", in);
		String title = dictionary.getClass().getSimpleName();
		String outputFile = path + title + ".html";
		try {
			JasperReport jasperReport = JasperCompileManager.compileReport(in);
			LOGGER.debug("Details:report:{}", jasperReport);
			
			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("title", title);
			
			JasperPrint jasperPrint = JasperFillManager.fillReport(
					jasperReport, parameters, new JRBeanCollectionDataSource(result.getRecords()));
			LOGGER.debug("jasperPrint={}", jasperPrint);
			
			JasperExportManager.exportReportToHtmlFile(jasperPrint, outputFile);
		} catch (Exception e) {
			LOGGER.error("Error in generateDetailedReport", e);
		}
		return outputFile;
	}
	
	private String createOutputLocation() {
		File file = new File(OUTPUT_DIR);
		if (!file.exists()) {
			boolean result = file.mkdirs();
			if (!result) {
				LOGGER.warn("Unable to create output directories");
			}
		}
		
		Date currentDate = Calendar.getInstance().getTime();
		String outputDirStr = format1.format(currentDate);
		String path = OUTPUT_DIR + File.separator + outputDirStr + File.separator;
		
		File outputDir = new File(path);
		LOGGER.info("Creating output dir: path={}", path);
		
		boolean result = outputDir.mkdir();
		if (!result) {
			LOGGER.error("Unable to create output directory: {}", path);
		}
		
		return path;
	}
	
		
	public String generateSummaryReport(String path) {
		InputStream in = this.getClass().getResourceAsStream(SUMMARY_REPORT_TEMPLATE);
		LOGGER.debug("InputStream: ={}", in);
		String outputFile = path + SUMMARY_REPORT;
		
		try {
			JasperReport jasperReport = JasperCompileManager.compileReport(in);
			LOGGER.debug("report: ={}", jasperReport);
			
			Map<String, Object> parameters = new HashMap<String, Object>();
			
			JasperPrint jasperPrint = JasperFillManager.fillReport(
					jasperReport, parameters, new SummaryDataSource(dictionaryResult));
			LOGGER.debug("jasperPrint: ={}", jasperPrint);
			
			JasperExportManager.exportReportToHtmlFile(jasperPrint, outputFile);
		} catch (Exception e) {
			LOGGER.error("error in generateSummaryReport", e);
		}
		return outputFile;
	}	
}
