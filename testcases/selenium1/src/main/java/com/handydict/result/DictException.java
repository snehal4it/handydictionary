package com.handydict.result;

public class DictException extends RuntimeException {
	private static final long serialVersionUID = 1L;
	
	private Result result;
	
	public DictException(Result result) {
		this.result = result;
	}

	public Result getResult() {
		return result;
	}

	public void setResult(Result result) {
		this.result = result;
	}
}
