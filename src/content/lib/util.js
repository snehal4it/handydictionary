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
	}
	
	// unused can be removed
	this.getDictionaryServiceURL=function(selectedText){
		return hd_alias.defaultDictURL + selectedText;
	}
	
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
	}
	
	this.getAbsoluteLocations=function(eventObj){
		var currentX = eventObj.clientX + content.pageXOffset + 5;
		var currentY = eventObj.clientY + content.pageYOffset + 20;
		return new Array(currentX, currentY);
	}
	
	// For frame clientX,Y is relative to frame not parent window
	this.getFrameAbsLocations=function(eventObj){
		var currentX = eventObj.mozMovementX + content.pageXOffset + 5;
		var currentY = eventObj.mozMovementY + content.pageYOffset + 20;
		return new Array(currentX, currentY);
	}
	
	// store location incase of context menu event
	this.updateContextMenuPos=function(eventObj){
		hd_alias.contextMenuPos=self.getAbsoluteLocations(eventObj);
	}
	
	this.getSelectedText=function(){
		//var text = content.getSelection().toString();
		//text = text.replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ");
		//text = text.replace(/\s+/g, " ");
		//return text;
		return document.commandDispatcher.focusedWindow.
				getSelection().toString().replace(/(\n|\r|\t)+/g, " ").trim();
	}
	
	// mark document, whether for current tab tool is enabled
	this.markDocument=function(doc, flag){
		if(doc && doc.setUserData){
			if(flag){
				doc.setUserData(hd_alias.userDataKey, true, null);
			}else{
				doc.setUserData(hd_alias.userDataKey, null, null);
			}
		}
	}
	
	// check document and return true if marked
	this.isExtEnabled=function(doc){
		if(doc && doc.getUserData){
			var flag=doc.getUserData(hd_alias.userDataKey);
			if(flag==true){return true;}
		}
		return false;
	}
	
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
	}
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
		}
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
		}
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
		}
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
		}
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
		}
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
		}
	},
	new function(){
		// 2 dictionary.reference.com
		var self=this;
		this.url="http://dictionary.reference.com/dic?q=";
		this.resultId="contentResults";
		this.getURL=function(text) {
			return self.url+text;
		}
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
		}
	},
	new function(){
		// 3 Merriam-Webster
		var self=this;
		this.url="http://www.merriam-webster.com/dictionary/";
		this.resultId="wordclick";
		
		this.getURL=function(text) {
			return self.url+text;
		}
		
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
		}
	},
	new function(){
		// 4 The Free Dictionary
		var self=this;
		this.url="http://www.thefreedictionary.com/";
		this.resultId="MainTxt";
		
		this.getURL=function(text) {
			return self.url+text;
		}
		this.applyFix=function(elem) {}
	}
];

})();