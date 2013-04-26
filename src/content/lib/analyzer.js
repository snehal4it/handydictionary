/* For licence details please refer license.txt */

// Namespace for HandyDictionary
if ("undefined" == typeof(handy_dictionary_ext_ns_id123)) {
	var handy_dictionary_ext_ns_id123 = {};
};

//single anonymous block to contain all objects
(function() {
var hd_alias = handy_dictionary_ext_ns_id123;
var util=hd_alias.UTIL;
hd_alias.ANALYZER=function(popupVar){
	var self=this;
	this.popup=popupVar;
	this.closeFlag=false;
	
	//auto-search vars
	this.auto=false;
	this.searchList=null;
	this.currDict=null;
	this.autoSearchInc=null;
	
	this.analyze=function(docFragment, dict){
		if (dict == null) {
			return {type:2};
		}
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
		if (self.closeFlag == true) { return; }
		var flag = self.updateStatus(hd_alias.str("ui_cl_auto_search_no_res"));
		if (flag == true) {
			// dead object
			self.close();
			return;
		}
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
		if (self.closeFlag == true) { return; }
		if (self.searchList == null || self.searchList.length == 0) {
			self.autoSearchError(true);
			return;
		}
		self.currDict = self.searchList.splice(0,1)[0];
		var flag = self.updateStatus(self.searchList.length);
		if (flag == true) {
			// dead object
			self.close();
			return;
		}
		var dictURL = self.currDict.getURL(self.popup.selectedText);
		hd_alias.ajaxHandler(dictURL, self);
	};
	
	this.updateStatus=function(msg) {
		if (self.autoSearchInc == null) { return false; }
		try {
			self.autoSearchInc.nodeValue=msg;
		} catch (e) {
			// dead object
			return true;
		}
		return false;
	};
	 
	this.close=function() {
		self.closeFlag = true;
		self.clearAutoSearch();
	};
	//------ start ---- popup methods for ajax call back--------
	this.updateresult=function(docFragment, dynaCSSAr) {
		if (self.closeFlag == true) { return; }
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
	this.closeFlag=false;
	this.initFlag=false;
	
	this.start=function() {
		if (self.uiElem == null || self.closeFlag == true) { return; }
		self.clear();
		
		var autoCloseVal = util.getAutoClose(self.popup);
		if (autoCloseVal <= 0) {
			return;
		}
		try {
			if (self.initFlag == false) {
				self.initFlag = true;
				self.popup.doc.body.addEventListener("mousemove", self.curmoved, false);
				self.popup.doc.body.addEventListener("mouseout", self.curout, false);
			}
			self.uiElem.nodeValue=autoCloseVal;
		} catch (e) {
			// dead object
			self.close();
			return;
		}
		self.timerVar=setInterval(self.update, 1000);
	};
	
	this.update=function() {
		if (self.closeFlag == true) { return; }
		if (self.uiElem == null) {
			self.clear();
			return;
		}
		try {
			var currValue = parseInt(self.uiElem.nodeValue);
			if (currValue == null || currValue <= 1) {
				self.clear();
				if (self.popup != null) {
					self.popup.close();
				}
				return;
			}
			self.uiElem.nodeValue=currValue-1;
		} catch(e) {
			// dead object error, clear timer and close
			self.close();
		}
	};
	
	this.clear=function() {
		if (self.timerVar != null) {
			clearInterval(self.timerVar);
			self.timerVar = null;
		}
		
		if (self.closeFlag == true) { return; }
		
		try {
			if (self.uiElem != null) {
				self.uiElem.nodeValue=0;
			}
		} catch (e) {
			//dead object
		}
	};
	
	this.close=function() {
		self.closeFlag = true;
		self.clear();
		self.uiElem = null;
		try {
			if (self.popup != null && self.popup.doc != null) {
				self.popup.doc.body.removeEventListener("mousemove", self.curmoved, false);
				self.popup.doc.body.removeEventListener("mouseout", self.curout, false);
			}
		} catch (e) {}
		self.popup = null;
	};
	
	this.curmoved=function() {
		// only invoke if timer is set
		if (self.timerVar == null) {return;}
		self.clear();
	};
	
	this.curout=function(eventObj) {
		try {
			// gets fired on div,span etc, invoked only if out of pop-up 
			if (eventObj.relatedTarget == null || self.popup.doc.body == eventObj.target) {		
				self.start();
			}
		} catch (e) {}
	};
};
})();