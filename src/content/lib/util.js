/* For licence details please refer license.txt */

// Namespace for HandyDictionary
if ("undefined" == typeof(handy_dictionary_ext_ns_id123)) {
	var handy_dictionary_ext_ns_id123 = {};
};

(function() {
var hd_alias=handy_dictionary_ext_ns_id123;
hd_alias.UTIL=new function(){
	var self=this;
	
	// split the text into words and remove special chars
	// maximum words are limited to 20
	this.filterLookupText = function(lookupText) {
		var result = new Array();
		var resultIndex = 0;
		if (lookupText == null || lookupText.length == 0) { return result; }
		var words = lookupText.split(hd_alias.filterTextExpr);
		var filterAr = hd_alias.filterTextArr;
		for(var i = 0; i < words.length; i++) {
			if (words[i].length <= 1) {	continue;}
			var flag = false;
			for (var j=0; j < filterAr.length; j++) {
				if (words[i].toLowerCase() == filterAr[j]) {
					flag = true;
					break;
				}
			}
			
			if (!flag) {
				result[resultIndex++]=words[i];
				if (resultIndex >= hd_alias.cntxItemsLimit) { break; }
			}
		}
		return result;
	};
	
	// unused can be removed
	this.getDictionaryServiceURL=function(selectedText){
		return hd_alias.defaultDictURL + selectedText;
	};
	
	// retrieves current dictionary
	this.getDictionary=function(){
		var dict_id = hd_alias.ph.getDictionaryId();
		if (dict_id==null || dict_id < 0 || dict_id >= hd_alias.dicts.length) {
			dict_id=0;
		}
		return hd_alias.dicts[dict_id];
	};
	
	// retrieves pop-up based on display mode
	this.getPopup=function(){
		var mode = hd_alias.ph.getDisplayMode();
		var popup = null;
		if (mode==1) {
			popup = new hd_alias.compactPopup();
		} else {
			popup = new hd_alias.popupHandler();
		}
		
		return popup;
	};
	
	// retrieves auto close value based on popup type
	this.getAutoClose=function(popup){
		var autoCloseVal = 10;
		if (popup instanceof hd_alias.popupHandler) {
			autoCloseVal = hd_alias.ph.getCLAutoClose();
		} else if (popup instanceof hd_alias.compactPopup) {
			autoCloseVal = hd_alias.ph.getAutoClose();
		}
		return autoCloseVal;
	};
	
	this.getKeyConfig=function(){
		// replace string val with array object
		var kbObj = hd_alias.ph.getKBObj();
		for(key in kbObj) {
			var kbAr=null;
			//try {
				kbAr=JSON.parse(kbObj[key]);
			//} catch (e) { }
			if (kbAr == null) {
				// disable key in case error
				kbAr=[[], ""];
			}
			kbObj[key]=kbAr;
		}
		return kbObj;
	};
	
	this.getAbsoluteLocations=function(eventObj){
		var currentX = eventObj.clientX + content.pageXOffset + 5;
		var currentY = eventObj.clientY + content.pageYOffset + 20;
		return new Array(currentX, currentY);
	};
	
	/**
	 * x,y - absolute location for pop-up
	 * width, height - dimension for pop-up
	 * @return updated x,y position array 
	 */
	this.adjustAbsoluteLocations=function(x, y, width, height){
		// only update if content area more than pop-up
		if (content.innerHeight < height
				|| content.innerWidth < width) {
			return;
		}
		
		var right = x + width;
		var bottom = y + height;
		// update dimension based on scrolling
		var offsetWidth = content.innerWidth + content.pageXOffset;
		var offsetHeight = content.innerHeight + content.pageYOffset;
		
		var updatedX = x;
		if (right > offsetWidth) {
			updatedX = (x - (right - offsetWidth))-25;
			if (updatedX < 0) {
				updatedX = x;
			}
		}
		
		var updatedY = y;
		if (bottom > offsetHeight) {
			updatedY = (y - (bottom - offsetHeight))-15;
			if (updatedY < 0) {
				updatedY = y;
			}
		}
		return new Array(updatedX, updatedY);
	};
	
	// For frame clientX,Y is relative to frame not parent window
	this.getFrameAbsLocations=function(eventObj){
		var currentX = eventObj.mozMovementX + content.pageXOffset + 5;
		var currentY = eventObj.mozMovementY + content.pageYOffset + 20;
		return new Array(currentX, currentY);
	};
	
	// store location incase of context menu event
	this.updateContextMenuPos=function(eventObj){
		hd_alias.contextMenuPos=self.getAbsoluteLocations(eventObj);
	};
	
	// eventObj can be null, if present then text from
	// input/text-area if selected will be returned
	this.getSelectedText=function(eventObj){
		//var text = content.getSelection().toString();
		//text = text.replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ");
		//text = text.replace(/\s+/g, " ");
		//return text;
		if (eventObj && eventObj.explicitOriginalTarget) {
			var elem = eventObj.explicitOriginalTarget;
			var nodeName = elem.nodeName.toUpperCase();
			if ((nodeName == "INPUT" || nodeName == "TEXTAREA")
					&& elem.value && elem.value != ""
						&& elem.selectionStart != null && elem.selectionEnd != null) {
				var selText = elem.value.substring(elem.selectionStart, elem.selectionEnd);
				if (selText != null && selText.replace(/\s/g, "").length > 0) {
					return selText;
				}
			}
		}
		return document.commandDispatcher.focusedWindow.
				getSelection().toString().replace(/(\n|\r|\t)+/g, " ").trim();
	};
	
	// mark document, whether for current tab tool is enabled
	this.markDocument=function(doc, flag){
		if(doc && doc.setUserData){
			if(flag){
				doc.setUserData(hd_alias.userDataKey, true, null);
			}else{
				doc.setUserData(hd_alias.userDataKey, null, null);
			}
		}
	};
	
	// check document and return true if marked
	this.isExtEnabled=function(doc){
		if(doc && doc.getUserData){
			var flag=doc.getUserData(hd_alias.userDataKey);
			if(flag==true){return true;}
		}
		return false;
	};
	
	// top level element to contain popup
	this.getRootElement = function() {
		if (content.document.body && content.document.body.nodeName
			&& content.document.body.nodeName.toUpperCase()=="BODY") {
			// for frameset it returns frameset instead of body tag
			return content.document.body;
		}
		var body = content.document.getElementsByTagName("body")[0];
		if (!body) {
			// fix for frameset
			body=content.document.getElementsByTagName("html")[0];
		}
		return body;
	};
	
	/**
	 * copied from
	 * https://developer.mozilla.org/en-US/docs/XUL_School/DOM_Building_and_HTML_Insertion
	 */
	this.parseHTML=function(doc, html, allowStyle, baseURI, isXML) {
		var PARSER_UTILS = "@mozilla.org/parserutils;1";
	 
		// User the newer nsIParserUtils on versions that support it.
		if (PARSER_UTILS in Components.classes) {
			var parser = Components.classes[PARSER_UTILS].getService(Components.interfaces.nsIParserUtils);
			if ("parseFragment" in parser)
				return parser.parseFragment(html, allowStyle ? parser.SanitizerAllowStyle : 0,
											!!isXML, baseURI, doc.documentElement);
		}
	 
		return Components.classes["@mozilla.org/feed-unescapehtml;1"]
						 .getService(Components.interfaces.nsIScriptableUnescapeHTML)
						 .parseFragment(html, !!isXML, baseURI, doc.documentElement);
	};
	
	/** retrieves css href from head tag */
	this.extractCSS=function(html) {
		var links = new Array();
		if (html == null || html == "") {
			return links;
		}
		
		try {
			var start = html.search(/<head>/i);
			if (start == -1) {
				start = 0;
			}
			var end = html.search(/<\/head>/i);
			if (end == -1) {
				end = html.search(/<body/i);
			}
			
			if (end == -1) {
				end = html.length;
			}
			
			var head = html.substring(start, end);
			var result = head.match(/(<link)(.|\s)*?>/ig);
			if (result != null) {
				var linkIndex=0;
				for (var i = 0; i < result.length; i++) {
					if (result[i].search(/rel=["'\s]?stylesheet["'\s]/i) != -1) {
						var hrefAr = result[i].match(/href=["'\s]?(?:.|\s)*?["'\s]/i);
						if (hrefAr != null && hrefAr.length > 0 && hrefAr[0].length > 5) {
							links[linkIndex++]=hrefAr[0].substr(5).replace(/("|')+/g, "");
						}
					}
				}
			}
		} catch (e) {}
		return links;
	};
	
	/**
	 * from the input css list and static list maintained
	 * returns appropriate css
	 */
	this.getRefinedCSSList=function(cssAr, dict) {
		if (cssAr == null || cssAr.length == 0) {
			return dict.css;
		}
		
		var excludeCss = dict.excludeCSS;
		var resultCssAr = new Array();
		var resultIndex = 0;
		for (var i = 0; i < cssAr.length; i++) {
			var cssLink = cssAr[i];
			if (cssLink == null) {
				continue;
			}
			
			var exclude = false;
			if (excludeCss != null) {
				for (var j = 0; j < excludeCss.length; j++) {
					if (cssLink.search(excludeCss[j]) != -1) {
						exclude = true;
						break;
					}
				}
			}
			
			if (exclude) { continue; }
			
			var pos = cssLink.search(/http/i);
			if (pos != 0) {
				if (cssLink.indexOf("/") == 0) {
					cssLink = dict.baseURL + cssLink;
				} else {
					var tempURL = dict.url;
					try {
						var qIndex = tempURL.indexOf("?");
						if (qIndex != -1) {
							tempURL = tempURL.substring(0, qIndex);
						}
						var q1Index = tempURL.indexOf("/")+1;
						qIndex = tempURL.lastIndexOf("/");
						if (qIndex != -1 && qIndex != tempURL.length -1 && qIndex > q1Index) {
							tempURL = tempURL.substring(0, qIndex+1);
						}
					} catch(e) {}
					cssLink = tempURL + cssLink;
				}
			}
			resultCssAr[resultIndex]=cssLink;
			resultIndex++;
		}
		
		if (resultCssAr.length == 0) {
			return dict.css;
		}
		
		return resultCssAr;
	};
};

// dictionaries
hd_alias.dicts=[
	new function(){
		// 0 dictionary.cambridge.org
		var self=this;
		this.lbl="Cambridge Dictionary";
		this.baseURL="http://dictionary.cambridge.org/";
		this.url=hd_alias.defaultDictURL;
		this.resultId="entryContent";
		// if word is not found, then suggestions container css selector
		this.errId="div#cdo-spellcheck-container ul#cdo-spellcheck";
		this.css=["http://dictionary.cambridge.org/common.css?version=2013-03-20-1149"];
		this.excludeCSS=[];
		this.cssRules=["#" + self.resultId + " > div {display:block;}",
		               "#" + self.resultId + " > p {margin:0px;}" ];
		
		this.getURL=function(text) {
			return self.url+text;
		};
		
		// returns array, 0 - Title Elements Array, 1 - Definition Elements Array
		// returns array with length 1 in-case of error
		this.getCompactResult=function(docFragment) {
			var dictResultElem=docFragment.querySelector("#"+self.resultId);
			if (dictResultElem == null) {
				return new Array("Result not found");
			}
			
			var result = new Array();
			var titleAr = new Array();
			titleAr[0] = dictResultElem.querySelector("div.di > div.di-head > h1 > span");
			titleAr[1] = dictResultElem.querySelector("div.di > div.di-head > span.di-info span.posgram > span.pos");
			titleAr[2] = dictResultElem.querySelector("div.di > div.di-head > span.di-info span.pron");
			if (titleAr[2] == null) {
				titleAr[2] = dictResultElem.querySelector("div.di > div.di-body div.sense-block > span.sense-body span.def-block > span.def-head span.pron");
			}
			if (titleAr[2] != null) {
				titleAr[2].setAttribute("style", "margin-left:2px;margin-right:2px;");
			}
			
			var defAr = new Array();
			defAr[0] = dictResultElem.querySelector("div.di > div.di-body div.sense-block > span.sense-body span.def-block > span.def-head > span.def");
			if (defAr[0] == null) {
				defAr[0] = dictResultElem.querySelector("div.di > div.di-body > div.idiom-block > span.idiom-body > span.def-block > span.def-head > span.def");
			}
			
			result[0] = titleAr;
			result[1] = defAr;
			
			return result;
		};
	},
	new function(){
		// 1 Oxford
		var self=this;
		this.lbl="Oxford Dictionary";
		this.baseURL="http://oxforddictionaries.com/";
		this.url=self.baseURL+"search/english/?direct=1&multi=1&q=";
		this.resultId="mainContent";
		this.errId="div#noSearchResults div#noresults";
		this.css=["http://oxforddictionaries.com/common.css?version=2013-03-28-1205"];
		this.excludeCSS=[];
		// header, headTitleElem, translateElem, defElem
		this.cssRules=["#" + self.resultId + " > header h1.pageTitle {margin:0px;line-height:1em;}",
		    "#" + self.resultId + " > div div > section.senseGroup > h3.partOfSpeech {margin:0px;}",
		    "#" + self.resultId + " > div div > span.TranslationCrossLinks {display:none;}",
		    "#" + self.resultId + " > div div > div.entryType {display:none;}"];
		
		this.getURL=function(text) {
			return self.url+text;
		};
		
		// returns array, 0 - Title Elements Array, 1 - Definition Elements Array
		// returns array with length 1 in-case of error
		this.getCompactResult=function(docFragment) {
			var dictResultElem=docFragment.querySelector("#"+self.resultId);
			if (dictResultElem == null) {
				return new Array("Result not found");
			}
			
			var result = new Array();
			var titleAr = new Array();
			titleAr[0] = dictResultElem.querySelector("header > h1.pageTitle");
			titleAr[1] = dictResultElem.querySelector("header > div.entryPronunciation > a");
			if (titleAr[1] == null) {
				titleAr[1] = dictResultElem.querySelector("div#entryPageContent > div > section.senseGroup > div.entryPronunciation > a");
			}
			if (titleAr[1] != null) {
				titleAr[1].setAttribute("style", "margin-right:3px;");
			}
			titleAr[2] = dictResultElem.querySelector("div#entryPageContent > div > section.senseGroup > h3.partOfSpeech > span.partOfSpeech");
			titleAr[3] = dictResultElem.querySelector("div#entryPageContent > div > section.senseGroup > em");
			
			var defAr = new Array();
			defAr[0] = dictResultElem.querySelector("div#entryPageContent > div > section.senseGroup > ul.sense-entry > li.sense > div.senseInnerWrapper > span.definition");
			
			result[0] = titleAr;
			result[1] = defAr;
			
			return result;
		};
	},
	new function(){
		// 2 dictionary.reference.com
		var self=this;
		this.lbl="Dictionary.com";
		this.baseURL="http://dictionary.reference.com/";
		this.url=self.baseURL+"dic?q=";
		this.resultId="contentResults";
		this.errId="div#nBL";
		this.css=["http://dictionary.reference.com/dcss/dictionary/v5/newSerpStylesTopHeavy.r90586.css"];
		// remove css from dynamically generated css array
		this.excludeCSS=[/http(.|\s)*?static\.sfdict\.com(.|\s)*?responsive\.css/i];
		// title space, searched text, remove adds
		this.cssRules=["#" + self.resultId + " > div#Dash_1 {display:none;}",
		               "#" + self.resultId + " > div#headserp {display:none;}",
		               "#" + self.resultId + " #top {display:none;}"];
		
		this.getURL=function(text) {
			return self.url+text;
		};
		
		// returns array, 0 - Title Elements Array, 1 - Definition Elements Array
		// returns array with length 1 in-case of error
		this.getCompactResult=function(docFragment) {
			var dictResultElem=docFragment.querySelector("#"+self.resultId);
			if (dictResultElem == null) {
				return new Array("Result not found");
			}
			
			var result = new Array();
			var titleAr = new Array();
			titleAr[0] = dictResultElem.querySelector("div#Headserp > span > span > h1#query_h1");
			titleAr[1] = dictResultElem.querySelector("div#midRail > div#rpane > div > div.sep_top > div.KonaBody > div > div > div.header > span.pronset > span.show_spellpr > span.pron");
			if (titleAr[1] != null) {
				titleAr[1].setAttribute("style", "margin-left:2px;margin-right:2px;");
			}
			titleAr[2] = dictResultElem.querySelector("div#midRail > div#rpane > div > div.sep_top > div.KonaBody > div > div > div.body > div > span.pg");
									
			var defAr = new Array();
			defAr[0] = dictResultElem.querySelector("div#midRail > div#rpane > div > div.sep_top > div.KonaBody > div > div > div.body > div > div.luna-Ent > div.dndata");
			if (defAr[0] == null) {
				defAr[0] = dictResultElem.querySelector("div#midRail > div#rpane > div > div.sep_top > div.KonaBody > div > div > div.body > div > div.luna-Ent");
			}

			result[0] = titleAr;
			result[1] = defAr;
			
			return result;
		};
	},
	new function(){
		// 3 Merriam-Webster
		var self=this;
		this.lbl="Merriam-Webster Dictionary";
		this.baseURL="http://www.merriam-webster.com/";
		this.url=self.baseURL+"dictionary/";
		this.resultId="wordclick";
		this.errId="div#content > div.spelling-help > ol";
		this.css=["http://www.merriam-webster.com/styles/default/mw-ref.css"];
		// remove css from dynamically generated css array
		this.excludeCSS=[/styles\/default\/interface\.css/i];
		// headTitleElem, defHeaderElem
		this.cssRules=["#" + self.resultId + " > div div#mwEntryData > div#headword > h2 {margin:0px;}",
		               "#" + self.resultId + " > div div#mwEntryData > div.d > h2.def-header {margin:0px;}"];
		
		this.getURL=function(text) {
			return self.url+text;
		};
		
		// returns array, 0 - Title Elements Array, 1 - Definition Elements Array
		// returns array with length 1 in-case of error
		this.getCompactResult=function(docFragment) {
			var dictResultElem=docFragment.querySelector("#"+self.resultId);
			if (dictResultElem == null) {
				return new Array("Result not found");
			}
			
			var result = new Array();
			var titleAr = new Array();
			titleAr[0] = dictResultElem.querySelector("#mwEntryData > div#headword > h2");
			titleAr[1] = dictResultElem.querySelector("#mwEntryData > div#headword > span.main-fl");
			if (titleAr[1] != null) {
				titleAr[1].setAttribute("style", "margin-left:2px;margin-right:2px;");
			}
			titleAr[2] = dictResultElem.querySelector("#mwEntryData > div#headword > span.pr");
									
			var defAr = new Array();
			defAr[0] = dictResultElem.querySelector("#mwEntryData > div.d > div.sblk > div.scnt");
			if (defAr[0] == null) {
				defAr[0] = dictResultElem.querySelector("#mwEntryData > div.d > div.sense-block-one > div.scnt");
			}

			result[0] = titleAr;
			result[1] = defAr;
			
			return result;
		};
	},
	new function(){
		// 4 The Free Dictionary
		var self=this;
		this.lbl="The Free Dictionary";
		this.baseURL="http://www.thefreedictionary.com/";
		this.url=self.baseURL;
		this.resultId="MainTxt";
		this.errId="table#ContentTable td:nth-child(2) div table";
		this.css=["http://img.tfd.com/t.css?g"];
		this.cssRules=["TD{font-size:10pt;}"];
		this.excludeCSS=[];
		this.getURL=function(text) {
			return self.url+text;
		};
		this.applyFix=function(elem) {};
		
		// returns array, 0 - Title Elements Array, 1 - Definition Elements Array
		// returns array with length 1 in-case of error
		this.getCompactResult=function(docFragment) {
			var dictResultElem=docFragment.querySelector("#"+self.resultId);
			if (dictResultElem == null) {
				return new Array("Result not found");
			}
			
			var result = new Array();
			var titleAr = new Array();
			titleAr[0] = dictResultElem.querySelector("table td > span.hw");
			titleAr[1] = dictResultElem.querySelector("table td > span.pron");
			if (titleAr[1] != null) {
				titleAr[1].setAttribute("style", "margin-left:2px;margin-right:2px;");
			}
									
			var defAr = new Array();
			defAr[0] = dictResultElem.querySelector("table td > div.pseg > div.ds-list");
			if (defAr[0] == null) {
				defAr[0] = dictResultElem.querySelector("table td > div.pseg > div.ds-single");
			}

			result[0] = titleAr;
			result[1] = defAr;
			
			return result;
		};
	}
];

})();