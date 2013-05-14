if ("undefined" == typeof(handy_dictionary_ext_test_ns_id)) {
	var handy_dictionary_ext_test_ns_id = {};
};

//single anonymous block to contain all objects
(function() {
var hd_alias=handy_dictionary_ext_test_ns_id;
hd_alias.init=function() {};
hd_alias.clean=function() {};

hd_alias.executeCompactModeTest=function() {
	var compModeTest = new hd_alias.CompactModeTest();
	compModeTest.init();
};

hd_alias.CompactModeTest=function() {
	var self=this;
	this.testURL="";
	this.doc=null;
	this.resultAr=null;
	this.count1=0;
	this.count2=0;
	this.errCase=[["deceivingly", "superior to"],
	              ["deceivingly", "Hard to Swallow"],
	              ["capable of", "according to", "familiar with", "superior to",
	               "Back to Square One", "An Arm and a Leg", "Cut To The Chase",
	               "Cry Wolf", "Hard to Swallow", "High and Dry", "On Cloud Nine",
	               "On the Ropes"],
	              ["capable of", "familiar with", "superior to", "Back to Square One",
	                "An Arm and a Leg", "Hard to Swallow", "On Cloud Nine"],
	              ["familiar with", "capable of", "superior to", "Cut To The Chase",
	               "Hard to Swallow", "High and Dry", "On Cloud Nine"]
				];
	
	this.init = function() {
		gBrowser.addEventListener("DOMContentLoaded", function domLoad(eventObj) {
			if (eventObj && eventObj.originalTarget) {
				var windowObj = eventObj.originalTarget.defaultView;
				if (!windowObj.frameElement) {
					gBrowser.removeEventListener("DOMContentLoaded", domLoad, false);
					self.doc = content.document;
					self.start();
				}
			}
		}, false);
		content.location.href=self.testURL;
	};
	
	this.start = function() {
		var pref = hd_alias.UserPreferences;
		pref.reset();
		pref.setDisplayMode(1);
		pref.setFailSafeCompactMode(false);

		self.resultAr=[];
		var elemList = self.doc.querySelectorAll("td");
		for (var dictId = 0; dictId < 5; dictId++) {
			var resultObj = new hd_alias.testResult();
			self.resultAr.push(resultObj);
			resultObj.log("Started Test for DICT ID:" + dictId);
			pref.setDictionaryId(dictId);
	
			for (var i = 0; i < elemList.length; i++) {
				self.count1++;
				hd_alias.TestUtil.selectNodeContent(elemList[i]);
				hd_alias.TestUtil.fireDoubleClickEvent(elemList[i]);
				
				self.test(elemList[i], self.doc.body.lastChild,
					self.errCase[dictId], resultObj, self.end);
			}
			resultObj.log("Completed Test for DICT ID:" + dictId);
		}
	};
	
	this.test=function(elem, popup, errCase, resultObj, endFuncRef){
		new hd_alias.CompPopupTest(elem, popup,
			errCase, resultObj, endFuncRef).start();
	};
	
	this.end=function(){
		self.count2++;
		if (self.count1 == self.count2) {
			alert("End:" + self.count2);
			self.resultAr.forEach(function(element, index, array) {
				element._log.forEach(hd_alias.log);
			});
		}
	};
};

hd_alias.CompPopupTest=function(elem, popup, errCase, resultObj, endFuncRef) {
	var self=this;
	this.elem=elem;
	this.popup=popup;
	this.errCase=errCase;
	this.resultObj=resultObj;
	this.endFuncRef=endFuncRef;
	this.fixChar = String.fromCharCode(183);
	
	this.start=function(){
		var index = self.popup.nodeName.search(/iframe/i);
		if (index != 0) {
			resultObj.err("Error unable to locate popup for:" + self.elem.textContent);
			return;
		}
		
		if (self.popup.contentDocument.readyState == "complete") {
			self.domLoaded();
		} else {
			self.popup.addEventListener("load", self.domLoaded, false);
		}
	};
	
	this.domLoaded=function(){
		self.popup.removeEventListener("load", self.domLoaded, false);
		var doc = self.popup.contentDocument;
		
		self.observer = new MutationObserver(self.domtest);
		var config = { attributes: false, childList: true, characterData: false };
		self.observer.observe(doc.body.lastChild.lastChild, config);
	};
	
	this.domtest=function(mutations){
		self.observer.disconnect();
		var contentDiv = self.popup.contentDocument.body.lastChild.lastChild;
		var txtContent = contentDiv.textContent;
		var word = self.elem.textContent;
		if (txtContent == null || txtContent.replace(/\s/g, "").length == 0) {
			resultObj.err("Compact Mode Data Issue:" + word);
		} else {
			var index = txtContent.indexOf("Error in lookup for");
			if (index != -1) {
				if (self.errCase.indexOf(word) == -1) {
					resultObj.err("Compact Mode Error:" + word);
				}
				//else { Known Error case }
			} else {
				index = txtContent.indexOf("Error...Please Try again");
				if (index != -1) {
					resultObj.err("Compact Mode Connection Error:" + word);
				} else {
					var titleDiv = contentDiv.firstChild;
					var defDiv = titleDiv.nextSibling;
					if (titleDiv.textContent == null
							|| titleDiv.textContent.replace(/\s/g, "").length == 0) {
						resultObj.err("Compact Mode:Title Data not found:" + word);
					} else {
						var titleContTxt = titleDiv.firstChild.textContent.replace(new RegExp(self.fixChar, "g"), "");
						var wordIndex = word.search(new RegExp(titleContTxt, "i"));
						if (wordIndex == -1) {
							wordIndex = titleContTxt.search(new RegExp(word, "i"));
						}
						if (wordIndex == -1) {
							resultObj.warn("Word not found in title:expected:"+ word + ":found:" + titleContTxt);
						} else if (defDiv.textContent == null
								|| defDiv.textContent.replace(/\s/g, "").length == 0) {
							resultObj.err("Compact Mode:Definition not found:" + word);
						}
					}
				}
			}
		}
		var closeBtn = self.popup.contentDocument.body.firstChild.firstChild;
		hd_alias.TestUtil.fireClickEvent(closeBtn);
		
		if (self.endFuncRef) {
			self.endFuncRef.call();
		}
	};
};

hd_alias.UserPreferences=new function() {
	var self=this;
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.handy_dictionary_ext.");
	
	this.reset=function() {
		var keys = self.prefs.getChildList("", {});
		for (var i = 0; i < keys.length; i++) {
			if (self.prefs.prefHasUserValue(keys[i])) {
				self.prefs.clearUserPref(keys[i]);
			}
		}
	};
	this.setAutoRun=function(flag) {self.prefs.setBoolPref("autorun", flag);};
	this.isAutoRun=function() {return self.prefs.getBoolPref("autorun");};
	this.getDictionaryId=function(){return self.prefs.getIntPref("dict");};
	this.setDictionaryId=function(dictId){self.prefs.setIntPref("dict", dictId);};
	this.getDisplayMode=function(){return self.prefs.getIntPref("mode");};
	this.setDisplayMode=function(mode){self.prefs.setIntPref("mode", mode);};
	this.isFailSafeCompactMode=function(){return self.prefs.getBoolPref("failsafe");};
	this.setFailSafeCompactMode=function(flag){self.prefs.setBoolPref("failsafe", flag);};
	this.isFailSafeClsMode=function(){return self.prefs.getBoolPref("cl_failsafe");};
	this.setFailSafeClsMode=function(flag){self.prefs.setBoolPref("cl_failsafe", flag);};
	this.getCompactModeAutoClose=function(){return self.prefs.getIntPref("autoclose");};
	this.setCompactModeAutoClose=function(timeout){self.prefs.setIntPref("autoclose", timeout);};
	this.getClsModeAutoClose=function(){return self.prefs.getIntPref("cl_autoclose");};
	this.setClsModeAutoClose=function(timeout){self.prefs.setIntPref("cl_autoclose", timeout);};
};

hd_alias.TestUtil=new function() {
	var self=this;
	
	this.selectNodeContent=function(node) {
		var selection = content.getSelection();
		if (selection.rangeCount > 0) {
			selection.removeAllRanges();
		}
		var range = content.document.createRange();
		range.selectNodeContents(node);
		selection.addRange(range);
	};
	
	this.fireKeyEvent=function(ctrl,alt,shift,charCode,elem) {
		if (elem == null) { elem = content.document;}
		var event = document.createEvent("KeyboardEvent");
		event.initKeyEvent("keypress", true, true, null,
				ctrl, alt, shift, false, 0, charCode);
		elem.dispatchEvent(event);
	};
	
	this.fireClickEvent=function(elem) {
		var event = document.createEvent("MouseEvent");
		event.initMouseEvent("click", true, true, content,
			    1, 0, 0, 0, 0, false, false, false, false, 0, null);
		elem.dispatchEvent(event);
	};
	
	this.fireDoubleClickEvent=function(elem) {
		var rectObj = elem.getBoundingClientRect();
		var clientX = rectObj.left + parseInt((rectObj.width/2));
		var clientY = rectObj.top + parseInt((rectObj.height/2));
		var event = document.createEvent("MouseEvent");
		event.initMouseEvent("dblclick", true, true, content,
			    2, 0, 0, clientX, clientY, false, false, false, false, 0, null);
		elem.dispatchEvent(event);
	};
};

hd_alias.testResult=function() {
	var self=this;
	this._log=[];
	
	this.log=function(msgStr) {
		self._log.push(["msg", msgStr]);
	};
	
	this.warn=function(warnStr) {
		self._log.push(["warn", warnStr]);
	};
	
	this.err=function(errStr) {
		self._log.push(["err", errStr]);
	};
};

hd_alias.log=function(aMessage) {
	var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
    	.getService(Components.interfaces.nsIConsoleService);
	consoleService.logStringMessage("HandyDict: " + aMessage);
};

hd_alias.err=function(errStr) {
	Components.utils.reportError(errStr);
};

// -------------------- unused -------------------------
hd_alias.PrefWindowTest=function() {
	this._open=function() {
		var prefKeyElem = document.getElementById("handy_dictionary_ext_key_pref");
		prefKeyElem.click();
		
	};
};

hd_alias.openDialog=function() {
	window.openDialog('chrome://hd_test/content/testdialog.xul',
			'test_handy_dictionary','chrome,centerscreen,resizable=yes', hd_alias);
};

hd_alias.executeTest=function() {
	setTimeout(hd_alias.execute, 1000);
};

hd_alias.execute=function() {
	//document.defaultView.location
	gBrowser.addEventListener("DOMContentLoaded", function domLoad(eventObj) {
		if (eventObj && eventObj.originalTarget) {
			var windowObj = eventObj.originalTarget.defaultView;
			if (!windowObj.frameElement) {
				gBrowser.removeEventListener("DOMContentLoaded", domLoad, false);
				hd_alias.executeCompactModeTest();
			}
		}
	}, false);
	content.location.href="file:///D:/snehal/ie_ext/bkup/dict_test.html";
};

hd_alias.executeCompactModeTest1=function() {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    	.getService(Components.interfaces.nsIWindowMediator);
	var browserWindow = wm.getMostRecentWindow(null);
	if (!browserWindow.gBrowser) {
		var doc = browserWindow.document;
		var checkBox = doc.querySelector("#handy_dictionary_ext_cntrl_checkbox");
		checkBox.click();

		var prefWindow = doc.querySelector("prefwindow");
		prefWindow.acceptDialog();
	}
};
})();