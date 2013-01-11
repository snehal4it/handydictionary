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
		var dict_id = 0;
		try {
			dict_id=hd_alias.prefManager.getIntPref("extensions.handy_dictionary_ext.dict");
		} catch(e) {}
		if (dict_id==null || dict_id < 0 || dict_id >= hd_alias.dicts.length) {
			dict_id=0;
		}
		return hd_alias.dicts[dict_id];
	};
	
	// retrieves pop-up based on display mode
	this.getPopup=function(){
		var mode = 0;
		try {
			mode=hd_alias.prefManager.getIntPref("extensions.handy_dictionary_ext.mode");
		} catch(e) {}
		
		var popup = null;
		if (mode==1) {
			popup = new hd_alias.compactPopup();
		} else {
			popup = new hd_alias.popupHandler();
		}
		
		return popup;
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
};

// dictionaries
hd_alias.dicts=[
	new function(){
		// 0 dictionary.cambridge.org
		var self=this;
		this.url=hd_alias.defaultDictURL;
		this.resultId="entryContent";
		this.titleStyle='display:block;font-size:28px;margin-bottom:9px;';
		this.titleStyle+='font-family:"Hoefler Text","Linux Libertine","Georgia","Century Schoolbook L",serif;';
		
		this.getURL=function(text) {
			return self.url+text;
		};
		this.applyFix=function(elem) {
			if (elem.nodeName.toUpperCase() == 'DIV') {
				//fix:iframe can t be displayed, so display hidden content
				if (elem.style && elem.style.display && elem.style.display.toLowerCase() == "none") {
					elem.style.display="block";
				} else if (elem.querySelector) {
					self._fixHeadAndLists(elem);
				}
			} else if (elem.nodeName.toUpperCase() == 'P') {
				if (elem.getAttribute("id")) {
					elem.setAttribute("style", "margin:0px;");
				}
			}
		};
		// remove margins from head word and fix the content for result entries
		this._fixHeadAndLists=function(elem) {
			var refElem=elem.querySelector("div.posblock_b > div.gwblock");
			if(refElem && refElem.querySelector) {
				var headTitleElem=refElem.querySelector("div.gwblock_h > h1.header");
				if(headTitleElem && headTitleElem.querySelector) {
					headTitleElem.setAttribute("style", "margin:0px;font-size:15px;display:inline;font-weight:normal;");
					var spanTitleElem=headTitleElem.querySelector("span.hw > span.BASE");
					if(spanTitleElem) {
						spanTitleElem.setAttribute("style", self.titleStyle);
					}
				}
				
				var additionalHead=refElem.querySelector("div.gwblock_h > div.additional_header");
				if(additionalHead){
					additionalHead.setAttribute("style", "display:inline;");
				}
				
				var headTitleElem2=refElem.querySelector("div#cdo-definition-head > h2#definition-title");
				if(headTitleElem2) {
					headTitleElem2.setAttribute("style", "margin:0px;");
				}
				
				if (!refElem.querySelectorAll) {return;}
				var entries=refElem.querySelectorAll("div.gwblock_b > div.sense > div.sense-bullet");
				if (entries == null || entries.length == 0) { return;}
				for (var i=0;i<entries.length;i++){
					entries[i].setAttribute("style", "float:left;");
				}
			}
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
			titleAr[0] = dictResultElem.querySelector("div.posblock > div.posblock_b > div.gwblock > div.gwblock_h > h1.header > span.hw");
			titleAr[1] = dictResultElem.querySelector("div.posblock > div.posblock_b > div.gwblock > div.gwblock_h > h1.header > span.pos");
			titleAr[2] = dictResultElem.querySelector("div.posblock > div.posblock_b > div.gwblock > div.gwblock_h > div.additional_header > span.prons");
			if (titleAr[2] != null) {
				titleAr[2].setAttribute("style", "margin-left:2px;margin-right:2px;");
			}
			titleAr[3] = dictResultElem.querySelector("div.posblock > div.posblock_b > div.gwblock > div.gwblock_h > div.additional_header > span.grams");
			
			var defAr = new Array();
			defAr[0] = dictResultElem.querySelector("div.posblock > div.posblock_b > div.gwblock > div.gwblock_b > div.sense > span");
			if (defAr[0] == null) {
				defAr[0] = dictResultElem.querySelector("div.posblock > div.posblock_b > div.gwblock > div.gwblock_b div.sense > span");
			}
			
			result[0] = titleAr;
			result[1] = defAr;
			
			return result;
		};
	},
	new function(){
		// 1 Oxford
		var self=this;
		this.url="http://oxforddictionaries.com/search/english/?direct=1&multi=1&q=";
		this.resultId="mainContent";
		this.bgImgRef='background:url("http://oxforddictionaries.com/external/images/bullet_gray.png?version=2012-11-29-1457")';
		this.bgImgRef+=' no-repeat scroll 0px 5px transparent;';
		
		this.getURL=function(text) {
			return self.url+text;
		};
		this.applyFix=function(elem) {
			if (elem.nodeName.toUpperCase() == 'HEADER' && elem.querySelector) {
				var headTitleElem=elem.querySelector("h1.pageTitle");
				if (headTitleElem) {
					headTitleElem.setAttribute("style", "margin:0px;");
				}
			} else if (elem.nodeName.toUpperCase() == 'DIV'	&& elem.querySelector) {
				var headTitleElem=elem.querySelector("div > section.senseGroup > h3.partOfSpeech");
				if (headTitleElem) {
					headTitleElem.setAttribute("style", "margin:0px;");
				}
				self._fixList(elem);
			}
		};
		// fix result entries spacing and bullet
		this._fixList=function(elem) {
			if(!elem.querySelectorAll) { return;}
			var ulElems=elem.querySelectorAll("div > section.senseGroup > ul.sense-entry");
			if(ulElems == null || ulElems.length == 0) { return;}
			for (var j=0; j < ulElems.length; j++) {
			var ulElem=ulElems[j];
			if (ulElem && ulElem.querySelectorAll) {
				ulElem.setAttribute("style", "padding:0px;");
				var lists=ulElem.querySelectorAll("li");
				if(lists && lists.length > 0) {
					for(var i = 0; i < lists.length; i++) {
						lists[i].setAttribute("style", "padding-left:10px;list-style:none outside none;" + self.bgImgRef);
						if(lists[i].querySelector){
							var exElem=lists[i].querySelector("div span.exampleGroup");
							if(exElem) {
								exElem.setAttribute("style", "display:block;");
							}
						}
					}
				}
			}
			}
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
		this.url="http://dictionary.reference.com/dic?q=";
		this.resultId="contentResults";
		this.getURL=function(text) {
			return self.url+text;
		};
		this.applyFix=function(elem) {
			if (elem.nodeName.toUpperCase() == 'DIV') {
				var divId=elem.getAttribute("id");
				if (divId) {
					divId=divId.toLowerCase();
					if(divId=="headserp"){
						//hide heading containing searched text
						elem.setAttribute("style", "display:none;");
					}else if (elem.querySelector){
						// remove adds
						var topElem=elem.querySelector("#top");
						if(topElem){
							topElem.setAttribute("style", "display:none;");
						}
					}
				}
			}
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
		this.url="http://www.merriam-webster.com/dictionary/";
		this.resultId="wordclick";
		
		this.getURL=function(text) {
			return self.url+text;
		};
		
		this.applyFix=function(elem) {
			if (elem.nodeName.toUpperCase() == 'DIV' && elem.querySelector) {
				var headTitleElem=elem.querySelector("div#mwEntryData > div#headword > h2");
				if (headTitleElem) {
					headTitleElem.setAttribute("style", "margin:0px;");
				}
				
				var defHeaderElem=elem.querySelector("div#mwEntryData > div.d > h2.def-header");
				if (defHeaderElem) {
					defHeaderElem.setAttribute("style", "margin:0px;");
				}
			}
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
		this.url="http://www.thefreedictionary.com/";
		this.resultId="MainTxt";
		
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