/* For licence details please refer license.txt */

// Namespace for HandyDictionary
if ("undefined" == typeof(handy_dictionary_ext_ns_id123)) {
	var handy_dictionary_ext_ns_id123 = {};
};

//single anonymous block to contain all objects
(function() {
var hd_alias = handy_dictionary_ext_ns_id123;
hd_alias.ANALYZER=function(popupVar){
	var self=this;
	this.popup=popupVar;
	
	//auto-search vars
	this.auto=false;
	this.searchList=null;
	this.currDict=null;
	this.autoSearchInc=null;
	
	this.analyze=function(docFragment, dict){
		var dictResultElem = docFragment.querySelector("#"+dict.resultId);
		if (dictResultElem != null) {
			return {type:1,resultObject:dictResultElem};
		} else {
			var spellCheckElem = docFragment.querySelector(dict.errId);
			if (spellCheckElem == null) {
				return {type:2};
			}
			var links = spellCheckElem.querySelectorAll("a");
			if (links == null || links.length <= 0) {
				return {type:2};
			}
			return {type:3,resultObject:links};
		}
	};
	
	this.autoSearch=function(autoSearchInc) {
		self.auto = true;
		self.autoSearchInc=autoSearchInc;
		self.searchList=new Array();
		var dictAr = hd_alias.dicts;
		var dict = self.popup.dict;
		var index = 0;
		for(var i = 0; i < dictAr.length; i++) {
			if (dict == dictAr[i]) {
				continue;
			}
			self.searchList[index++]=dictAr[i];
		}
		self.searchNext();
	};
	
	this.autoSearchError=function(flag) {
		self.autoSearchInc.nodeValue=hd_alias.str("ui_cl_auto_search_no_res");
		self.clearAutoSearch();
		self.popup.autoSearchResult({type:2, endFlag:flag});
	};
	
	this.clearAutoSearch=function() {
		self.auto=false;
		self.searchList=null;
		self.currDict=null;
		self.autoSearchInc=null;
	};
	
	this.searchNext=function() {
		if (self.searchList == null || self.searchList.length == 0) {
			self.autoSearchError(true);
			return;
		}
		self.currDict = self.searchList.splice(0,1)[0];
		self.autoSearchInc.nodeValue=self.searchList.length;
		var dictURL = self.currDict.getURL(self.popup.selectedText);
		hd_alias.ajaxHandler(dictURL, self);
	};
	
	//------ start ---- popup methods for ajax call back--------
	this.updateresult=function(docFragment, dynaCSSAr) {
		var result = self.analyze(docFragment, self.currDict);
		if (result.type == 1) {
			var currDict = self.currDict;
			self.clearAutoSearch();
			self.popup.autoSearchResult(
				{type:1, docFrag:docFragment, dCSSAr:dynaCSSAr, dict:currDict});
		} else {
			self.searchNext();
		}
	};
	
	this.display=function(msg) {
		self.autoSearchError();
	};
	
	this.bypassErrStatus = function(statusCode) {
		// for Merriam-Webster dict 404 is returned when word is not found
		return (statusCode == 404 && self.currDict == hd_alias.dicts[3]);
	};
	//------ end ---- popup methods for ajax call back--------
};

hd_alias.TIMER=function(uiElemVar, popupVar){
	var self=this;
	this.uiElem=uiElemVar;
	this.popup=popupVar;
	this.timerVar=null;
	
	this.start=function() {
		if (self.uiElem == null) { return; }
		self.clear();
		self.popup.doc.addEventListener("mousemove", self.curmoved, false);
		self.popup.doc.addEventListener("mouseout", self.curout, false);
		self.uiElem.nodeValue=20;
		self.timerVar=setInterval(self.update, 1000);
	};
	
	this.update=function() {
		if (self.uiElem == null) {
			self.clear();
			return;
		}
		var currValue = parseInt(self.uiElem.nodeValue);
		if (currValue == null || currValue <= 1) {
			self.clear();
			if (self.popup != null) {
				self.popup.close();
			}
			return;
		}
		self.uiElem.nodeValue=currValue-1;
	};
	
	this.clear=function() {
		if (self.timerVar != null) {
			clearInterval(self.timerVar);
			self.timerVar = null;
		}
		if (self.uiElem != null) {
			self.uiElem.nodeValue=0;
			return;
		}
		
		if (self.popup != null && self.popup.doc != null) {
			self.popup.doc.removeEventListener("mousemove", self.curmoved, false);
			self.popup.doc.removeEventListener("mouseout", self.curout, false);
		}
	};
	
	this.curmoved=function() {
		self.clear();
	};
	
	this.curout=function() {
		self.start();
	};
};
})();