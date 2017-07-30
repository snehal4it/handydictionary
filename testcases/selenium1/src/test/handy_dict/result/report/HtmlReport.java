package test.handy_dict.result.report;

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

import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import test.handy_dict.Cambridge;
import test.handy_dict.Dictionary;
import test.handy_dict.Oxford;
import test.handy_dict.result.Result;

public class HtmlReport {
	private static final String SUMMARY_REPORT = "summary.html";
	
	private static final SimpleDateFormat format1 = new SimpleDateFormat("yyyyMMdd");
	private static final String OUTPUT_DIR = "output/reports";
	private static final String SUMMARY_REPORT_TEMPLATE = "/SummaryReport.xml";
	private static final String DETAILED_REPORT_TEMPLATE = "/DetailedReport.xml";
	
	private Map<Dictionary, Result> entries = new LinkedHashMap<Dictionary, Result>();
	
	public void add(Dictionary dict, Result result) {
		entries.put(dict, result);
	}
	
	public List<String> generate() {
		List<String> paths = new ArrayList<String>();
		String path = createOutputLocation();
		String resultPath = generateSummaryReport(path);
		paths.add(resultPath);
		
		for (Entry<Dictionary,Result> entry : entries.entrySet()) {
			resultPath = generateDetailedReport(path, entry.getKey(), entry.getValue());
			paths.add(resultPath);
		}
		return paths;
	}
	
	public String generateDetailedReport(String path, Dictionary dictionary, Result result) {
		System.out.println("--------" + this.getClass().getResource(DETAILED_REPORT_TEMPLATE).getPath());
		InputStream in = this.getClass().getResourceAsStream(DETAILED_REPORT_TEMPLATE);
		System.out.println("Details:InputStream:" + in);
		String title = dictionary.getClass().getSimpleName();
		String outputFile = path + title + ".html";
		try {
			JasperReport jasperReport = JasperCompileManager.compileReport(in);
			System.out.println("Details:report:" + jasperReport);
			
			Map<String, Object> parameters = new HashMap<String, Object>();
			parameters.put("title", title);
			
			JasperPrint jasperPrint = JasperFillManager.fillReport(
					jasperReport, parameters, new JRBeanCollectionDataSource(result.getRecords()));
			System.out.println(jasperPrint);
			
			JasperExportManager.exportReportToHtmlFile(jasperPrint, outputFile);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return outputFile;
	}
	
	private String createOutputLocation() {
		File file = new File(OUTPUT_DIR);
		if (!file.exists()) {
			boolean result = file.mkdirs();
			if (!result) {
				System.out.println("Unable to create output directories:");
			}
		}
		
		Date currentDate = Calendar.getInstance().getTime();
		String outputDirStr = format1.format(currentDate);
		String path = OUTPUT_DIR + File.separator + outputDirStr + File.separator;
		
		File outputDir = new File(path);
		System.out.println("Creating output dir:" + path);
		boolean result = outputDir.mkdir();
		if (!result) {
			System.out.println("Unable to create output directory:"+path);
		}
		
		return path;
	}
	
		
	public String generateSummaryReport(String path) {
		InputStream in = this.getClass().getResourceAsStream(SUMMARY_REPORT_TEMPLATE);
		System.out.println("InputStream:" + in);
		String outputFile = path + SUMMARY_REPORT;
		
		try {
			JasperReport jasperReport = JasperCompileManager.compileReport(in);
			System.out.println("report:" + jasperReport);
			
			Map<String, Object> parameters = new HashMap<String, Object>();
			
			JasperPrint jasperPrint = JasperFillManager.fillReport(
					jasperReport, parameters, new SummaryDataSource(entries));
			System.out.println(jasperPrint);
			
			JasperExportManager.exportReportToHtmlFile(jasperPrint, outputFile);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return outputFile;
	}
	
	public static void main(String[] args) {
		Dictionary dict1 = new Cambridge(null);
		Dictionary dict2 = new Oxford(null);
		
		HtmlReport report = new HtmlReport();
		Result result1 = new Result();
		result1.info("Dictionary1");
		result1.error("Dictionary 1 error1");
		report.add(dict1, result1);
		
		
		Result result2 = new Result();
		result2.info("Dictionary2");
		result2.info("Entry1");
		result2.warn("Dictionary2 warning");
		for (int i = 0; i < 100; i++) {
			result2.info("Dictionary2::" + i + "-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------==================================================================================================================================================================================END");
		}

		report.add(dict2, result2);
		
		report.generate();
	}
	
}
