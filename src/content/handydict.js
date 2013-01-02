/* For licence details please refer license.txt */

// Namespace for HandyDictionary
if ("undefined" == typeof(handy_dictionary_ext_ns_id123)) {
	var handy_dictionary_ext_ns_id123 = {};
};

// single anonymous block to contain all objects
(function() {
var hd_alias=handy_dictionary_ext_ns_id123;
var cntx=hd_alias.CNTX;
var util=hd_alias.UTIL;
var menu=hd_alias.MENU;

hd_alias.gInit=function() {
	cntx.init();
	menu.init();
	gBrowser.addEventListener("DOMContentLoaded", hd_alias.domListener, false);
	gBrowser.tabContainer.addEventListener("TabSelect", hd_alias.tabSelectListener, false);
};

hd_alias.gClean=function() {
	cntx.clean();
	menu.clean();
	gBrowser.removeEventListener("DOMContentLoaded", hd_alias.domListener, false);
	gBrowser.tabContainer.removeEventListener("TabSelect", hd_alias.tabSelectListener, false);
};

// updates status of already opened tab based on user preferences
// flag: enable or cleanup
hd_alias.updateOpenedTab=function(flag){
	var autoRun = hd_alias.prefManager.getBoolPref("extensions.handy_dictionary_ext.autorun");
	// incase of cleanup, no need to check autorun
	if (flag && !autoRun) {
		return;
	}
	//var numTabs = gBrowser.browsers.length;
	var numTabs = gBrowser.tabContainer.childNodes.length;
	for (var i = 0; i < numTabs; i++) {
		var currentTab = gBrowser.tabContainer.childNodes[i];
		if (gBrowser.selectedTab == currentTab) {
			hd_alias.changeStateManually(flag);
		} else {
			var currentBrowser = gBrowser.getBrowserForTab(currentTab);
			var doc=currentBrowser.contentDocument;
			if (flag) {
				hd_alias.enableListener({originalTarget:doc});
			} else {
				hd_alias.disableListener({originalTarget:doc});
			}
			
			// apply on frames if any
			hd_alias.enableForFrames(doc, flag);
		}	
	}
};

hd_alias.domListener=function(eventObj) {
	var autoRun = hd_alias.prefManager.getBoolPref("extensions.handy_dictionary_ext.autorun");
	if (autoRun) {
		hd_alias.enableListener(eventObj);
	} else {
		hd_alias.disableListener(eventObj);
	}
	menu.updateStatus(autoRun);
};

hd_alias.tabSelectListener=function(eventObj) {
	// for each tab restore the status of extension
	var on = util.isExtEnabled(content.document);
	menu.updateStatus(on);
	if (on) {
		cntx.enable();
	} else {
		cntx.disable();
	}
};

// eventObj may be null incase, enabled manually
hd_alias.enableListener=function(eventObj) {
	var doc=content.document;
	// when tab is not having focus, actual dom doc is different
	if (eventObj && eventObj.originalTarget) {
		doc=eventObj.originalTarget;
	}
	doc.addEventListener("dblclick", hd_alias.handleDoubleClick, false);
	util.markDocument(doc,true);
	cntx.enable();
};

hd_alias.disableListener = function(eventObj) {
	var doc=content.document;
	// when tab is not having focus, actual dom doc is different
	if (eventObj && eventObj.originalTarget) {
		doc=eventObj.originalTarget;
	}
	doc.removeEventListener("dblclick", hd_alias.handleDoubleClick, false);
	util.markDocument(doc,false);
	cntx.disable();
};

// enable/disable manually
hd_alias.changeStateManually=function(flag) {
	menu.updateStatus(flag);
	if(flag) {
		hd_alias.enableListener(null);
	}else{
		hd_alias.disableListener(null);
	}
	
	// apply on frames if any
	hd_alias.enableForFrames(content.document, flag);
};

hd_alias.enableForFrames=function(doc, flag) {
	var frames = doc.getElementsByTagName("frame");
	hd_alias.handleFrames(frames, flag);
	var iframes = doc.getElementsByTagName("iframe");
	hd_alias.handleFrames(iframes, flag);
};

hd_alias.handleFrames=function(frm, flag) {
	if(frm != null && frm.length > 0) {
		for(var i = 0; i < frm.length; i++) {
			if(flag){
				frm[i].contentDocument.addEventListener("dblclick",hd_alias.handleDoubleClick,false);
			}else{
				frm[i].contentDocument.removeEventListener("dblclick",hd_alias.handleDoubleClick,false);
			}
		}
	}
};

hd_alias.handleDoubleClick=function(eventObj) {
	var posArr=null;
	var activeElem = content.document.activeElement;
	if (activeElem) {
		var nodeName=activeElem.nodeName.toUpperCase();
		//fix: for frame use alternate positions
		if(nodeName == "IFRAME"	|| nodeName == "FRAME"){
			posArr=util.getFrameAbsLocations(eventObj);
		}
	}
	if (posArr==null) {
		posArr = util.getAbsoluteLocations(eventObj);
	}

	var selectedText = util.getSelectedText();
	hd_alias.displayHandyDict(posArr, selectedText);
};

// delegate to context object
hd_alias.lookupManually=function(eventObj) {
	cntx.lookupManually(eventObj);
};

hd_alias.displayHandyDict=function(posArr, selectedText) {
	if (selectedText != null && selectedText.replace(/\s/g, "").length > 0) {
		//var dictURL = util.getDictionaryServiceURL(selectedText);
		var dict=util.getDictionary();
		var dictURL=dict.getURL(selectedText);
		var popup = new hd_alias.popupHandler();
		var flag = popup.init(posArr, dictURL, dict);
		if (!flag) {
			alert(hd_alias.str("display.error1")+'\n'+hd_alias.str("display.error2"));
			return;
		}
		popup.display(hd_alias.str("ajax_loading"));
		
		hd_alias.ajaxHandler(dictURL, popup);
	}
};

//todo: move to util
hd_alias.ajaxHandler=function(dictURL, popup) {
	var xhr = null;
	if (window.XMLHttpRequest)  {
		xhr=new XMLHttpRequest();
	} else {
		xhr=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhr.onreadystatechange= function() {
		if (xhr.readyState==4) {
			if (xhr.status==200) {
				var dictionaryDomFragment = util.parseHTML(
					content.document, xhr.responseText, true, 
					xhr.channel.URI, false);
				popup.updateresult(dictionaryDomFragment);
			} else {
				popup.display(hd_alias.str("ajax.error"));
			}
		}
	};
	xhr.open("GET",dictURL,true);
	xhr.send();
};
})();