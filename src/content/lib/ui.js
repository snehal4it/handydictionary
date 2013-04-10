/* For licence details please refer license.txt */

// Namespace for HandyDictionary
if ("undefined" == typeof(handy_dictionary_ext_ns_id123)) {
	var handy_dictionary_ext_ns_id123 = {};
};

(function() {
var hd_alias=handy_dictionary_ext_ns_id123;
var util=hd_alias.UTIL;

//-- start ----------- popupbase------------
var popupbase = function() {
	this.width=350;
	this.height=121;
	this.currentX = 200;
	this.currentY = 250;
	this.frm=null;
	this.doc=null;
	this.titlebar=null;
	this.moreoptlink=null;
	this.closebtndiv = null;
	this.contentdiv=null;
	this.dict=null;
	this.dictURL=null;
	this.dragdropref=null;
	this.fontFamily="font-family:Georgia,verdana,arial,helvetica,sans-serif;";
	this.backgroundColor="#e6e6e6";
	this.outerBorderColor="#aaaaaa";
	
	this.titleContainerLeft=0;
	this.selectedText="";
};
popupbase.prototype.checkAndStorePos=function(updateX, updateY){
	if (updateX != null && updateX > 0) {
		this.currentX = updateX;
	}
	
	if (updateY != null && updateY > 0) {
		this.currentY = updateY;
	}
	
	var updatedPos = util.adjustAbsoluteLocations(
		this.currentX, this.currentY, this.width, this.height);
	this.currentX=updatedPos[0];
	this.currentY=updatedPos[1];
};

popupbase.prototype.commonInit = function(posArr, selectedText, buildFunc) {
	this.selectedText=selectedText;
	this.dict=util.getDictionary();
	this.dictURL=this.dict.getURL(selectedText);
	this.checkAndStorePos(posArr[0], posArr[1]);
	
	// generates inline popup content using iframe
	this.frm = content.document.createElement("iframe");
	this.frm.setAttribute("type", "content");
	this.frm.setAttribute("collapsed", "true");
	
	var styleVal1 = "display:block;position:absolute;overflow:hidden;";
	styleVal1 += "left:" + this.currentX + "px;top:" + this.currentY + "px;" ;
	styleVal1 += "border:solid 1px "+this.outerBorderColor+";";
	styleVal1 += "background-color:"+this.backgroundColor+";";
	styleVal1 += "text-align:justify;font-size:12px;width:"+this.width;
	styleVal1 += "px;height:"+this.height+"px;z-index:100;";
	styleVal1 += "border-radius:6px;";
	this.frm.setAttribute("style", styleVal1);
    
	var body = util.getRootElement();
	if (!body) { return false; }
	body.appendChild(this.frm);
	
	this.frm.addEventListener("load", buildFunc, false);
	this.frm.contentDocument.location.href = "about:blank";
	return true;
};

//clear content/messages from content window
popupbase.prototype.clearContentNode = function() {
	var childNodes = this.contentdiv.childNodes;
	if (childNodes && childNodes.length > 0) {			
		var tempArray = new Array();
		for (var i = 0; i < childNodes.length; i++) {
			tempArray[i] = childNodes.item(i);
		}
		
		for (var i = 0; i < tempArray.length; i++) {
			this.contentdiv.removeChild(tempArray[i]);
		}
	}
};

//display temporary messages
popupbase.prototype.display = function(displayStr) {
	this.clearContentNode();
	
	var msgElem = this.doc.createElement("h1");
	var msgtxt = this.doc.createTextNode(displayStr);
	msgElem.appendChild(msgtxt);
	this.contentdiv.appendChild(msgElem);
};

// remove listeners and references on close
popupbase.prototype.close = function(closeFunct) {
	this.frm.contentDocument.removeEventListener("keypress",closeFunct,false);
	content.document.removeEventListener("keypress",closeFunct,false);
	
	this.dragdropref.close();
	this.dragdropref=null;
	
	var body = util.getRootElement();
	if(!body) {return;}
	body.removeChild(this.frm);
	
	this.selectedText=null;
	this.dict=null;
	this.dictURL=null;
	this.closebtndiv=null;
	this.moreoptlink=null;
	this.titlebar=null;
	this.doc=null;
	this.contentdiv=null;
	this.frm=null;
	
	// fix where focus is lost and events no longer fired
	// which prevents other pop-ups from closing
	content.focus();
};

popupbase.prototype.commonBuild = function(body, closeFunct) {
	// fix for iframe where parent document loses focus
	// and stop receiving keyboard events
	if(content.document.activeElement && content.document.activeElement.blur) {
		content.document.activeElement.blur();
	}
	
	content.document.addEventListener("keypress", closeFunct, false);
	this.frm.contentDocument.addEventListener("keypress", closeFunct, false);
	
	// enable drag/move for inline popup
	this.dragdropref = new hd_alias.dragDropHandler();
	this.dragdropref.init(this.doc, body, this.frm);
	
	// do not load content for manual search
	if (this.selectedText != null && this.selectedText != "") {
		this.loadContent();
	} else {
		this.toggleSearchDisplay(null);
	}
};

popupbase.prototype.loadContent = function() {
	this.display(hd_alias.str("ajax_loading"));
	hd_alias.ajaxHandler(this.dictURL, this);
};

// updates all links to be opened in new window
popupbase.prototype.commonUpdateResult = function(element) {
	if (element == null || !element.querySelectorAll) { return; }
	var links = element.querySelectorAll("a");
	if (links != null && links.length > 0) {
		for (var i = 0; i < links.length; i++) {
			links[i].setAttribute("target", "_blank");
		}
	}
};

// check whether given err status can be ignored
popupbase.prototype.bypassErrStatus = function(statusCode) {
	// for Merriam-Webster dict 404 is returned when word is not found
	return (statusCode == 404 && this.dict == hd_alias.dicts[3]);
};
//-- end ----------- popupbase------------

//--start---classic mode------------------
hd_alias.popupHandler = function() {
	var self=this;
	this.width=490;
	this.height=291;
	this.searchdiv=null;
	this.searchcontroldiv=null;
	this.searchcontroldisplayed=false;
	this.inputCtrl=null;
	this.btnCtrl=null;
	this.fontFamily="font-family:arial,verdana,helvetica,sans-serif;";
	this.dictTitleLbl=null;
	this.autoSearchFlag=false;
	
	// returns true if ui created
	this.init = function(posArr, selectedText) {
		return self.commonInit(posArr, selectedText, self.buildUI);
	};
	
	// alternate init for compact mode error case
	this.initSwitch = function(posArr, selectedText, docFragment, dynaCSSAr) {
		// invoke init with manual search
		return self.commonInit(posArr, "", function(eventObj) {
			self.buildUI(eventObj);
			// toggle manual search mode
			self.toggleSearchDisplay(null);
			self.updateSelectedText(selectedText);
			self.updateresult(docFragment,dynaCSSAr);
		});
	};
	
	this.buildUI=function(eventObj) {
		self.doc=self.frm.contentDocument;
        var body=self.frm.contentDocument.body;
        body.setAttribute("style", "margin:0px;padding:3px 0px;");
        
        self.titlebar = self._getTitleContainer(self.dictURL);
        var popupbody = self._getPopupBody();
        
        body.appendChild(self.titlebar);
        body.appendChild(popupbody);
        
        self.commonBuild(body, self.checkCloseEvent);
	};
	
	this.checkCloseEvent=function(eventObj) {
		if (eventObj.keyCode == 27) {
			eventObj.stopImmediatePropagation();
			self.close();
		}
		return false;
	};
	
	this.handleCR=function(eventObj) {
		if (eventObj.keyCode == 13) {
			self.handleSearch(eventObj);
		}
	};
	
	this.handleSearch=function(eventObj) {
		var selectedText=self.inputCtrl.value;
		if (selectedText == null || selectedText.length == 0) {
			var msg=hd_alias.str("ui_search_empty");
			alert(msg);
			return;
		}
		// fix the case where user entered phrase
		//selectedText=selectedText.replace(/\s/g, "");
		selectedText=selectedText.trim();
		self.inputCtrl.value="";
		self.toggleSearchDisplay(null);
		self.reload(selectedText);
	};
	
	this.updateSelectedText=function(selText) {
		self.selectedText=selText;
		self.dictURL=self.dict.getURL(self.selectedText);
		self.moreoptlink.setAttribute("href", self.dictURL);
	};
	
	this.reload=function(selText) {
		self.updateSelectedText(selText);
		self.loadContent();
	};
	
	this.spellCheckReload=function(eventObj) {
		if (eventObj.target != null) {
			var selText = eventObj.target.textContent;
			if (selText != null) {
				selText = selText.trim();
				if (selText.length > 0) {
					self.reload(selText);
					return;
				}
			}
		}
		alert(hd_alias.str("ui_cl_error_spell"));
	};
	
	// toggle display of search manual option
	this.toggleSearchDisplay = function(eventObj) {
		if (self.searchcontroldiv == null) {
			self._initSearchControls();
		}
		
		if (self.searchcontroldisplayed) {
			self.searchcontroldiv.style.display="none";
			self.contentdiv.style.height="230px";
		} else {
			self.contentdiv.style.height="200px";
			self.searchcontroldiv.style.display="block";
			try {
			self.searchcontroldiv.getElementsByTagName("input")[0].focus();
			} catch(e) {}
		}
		self.searchcontroldisplayed=!self.searchcontroldisplayed;
	};
	
	// display result in content block
	this.updateresult = function(docFragment, dynaCSSAr) {
		self.clearContentNode();

		var result_id=self.dict.resultId;
		var dictResultElem=null;
		if (docFragment.querySelector) {
			dictResultElem=docFragment.querySelector("#"+result_id);
		}

		if (dictResultElem == null) {
			self.contentdiv.appendChild(docFragment);
			if (self.contentdiv.querySelector) {
				dictResultElem = self.contentdiv.querySelector("#"+result_id);
			} else {
				dictResultElem = self.doc.getElementById(result_id);
			}
		}
		
		// if result block is present, then display only that content
		if (dictResultElem != null) {
			// update links
			self.commonUpdateResult(dictResultElem);
			
			var childNodes = dictResultElem.childNodes;
			self.clearContentNode();
			
			//var cssAr = self.dict.css;
			var cssAr = util.getRefinedCSSList(dynaCSSAr, self.dict);
			var linkVar = null;
			for (var i = 0; i < cssAr.length; i++) {
				linkVar = self.doc.createElement("link");
				linkVar.setAttribute("type", "text/css");
				linkVar.setAttribute("rel", "stylesheet");
				linkVar.setAttribute("href", cssAr[i]);
				self.contentdiv.appendChild(linkVar);
			}
			
			var styleContainer = self.doc.createElement("style");
			self.contentdiv.appendChild(styleContainer);
			var styleRef = self.doc.styleSheets[self.doc.styleSheets.length-1];
			
			var cssRulesAr = self.dict.cssRules;
			for (var i = 0; i < cssRulesAr.length; i++) {
				styleRef.insertRule(cssRulesAr[i], styleRef.cssRules.length);
			}
			
			self.contentdiv.appendChild(dictResultElem);
		} else {
			// check for suggestions if word is not found
			var flag = self.handleResultNotFound();
			if (flag != true) {
				self.handleNoDataFound();
			}

			var failsafe_flag = hd_alias.prefManager.getBoolPref("extensions.handy_dictionary_ext.cl_failsafe");
			if (self.autoSearchFlag == false && failsafe_flag == true) {
				var autoSearchDiv = self.doc.createElement("div");
				var autoSearchStyle = "position:absolute;left:100px;top:80px;height:30px;width:280px;";
				autoSearchStyle += "border-radius:6px;color:blue;background-color:#cccccc;";
				autoSearchStyle += "text-align:center;font-weight:bold;padding-top:12px;";
				autoSearchDiv.setAttribute("style", autoSearchStyle);
				var autoSearchTxt = self.doc.createTextNode(hd_alias.str("ui_cl_auto_search_msg"));
				var autoSearchInc = self.doc.createTextNode("");
				autoSearchDiv.appendChild(autoSearchTxt);
				autoSearchDiv.appendChild(autoSearchInc);
				self.contentdiv.appendChild(autoSearchDiv);
				
				self.autoSearchFlag=true;
				new hd_alias.ANALYZER(self).autoSearch(autoSearchInc);
			}
		}
	};
	
	// called when auto search operation ends
	this.autoSearchResult=function(result) {
		if (result.type == 1) {
			// result found
			self.dict = result.dict;
			self.dictTitleLbl.nodeValue=self.dict.lbl;
			self.updateSelectedText(self.selectedText);
			self.updateresult(result.docFrag, result.dCSSAr);
		} else {
			setTimeout(function(){
				if (self != null && self.contentdiv != null
						&& self.contentdiv.lastChild != null) {
					self.contentdiv.removeChild(self.contentdiv.lastChild);
				}
			}, 1500);
		}
		self.autoSearchFlag=false;
	};

	// case when definition not found
	this.handleResultNotFound=function() {
		// check for suggestions if word is not found
		var spellCheckElem = self.contentdiv.querySelector(self.dict.errId);
		if (spellCheckElem == null) {
			return false;
		}
		
		var links = spellCheckElem.querySelectorAll("a");
		if (links == null || links.length <= 0) {
			return false;
		}
		self.clearContentNode();
		
		var errElem = self.doc.createElement("div");
		errElem.setAttribute("style", "color:red;");
		var errtxt = self.doc.createTextNode(self.selectedText+" "+hd_alias.str("ui_cl_error_title"));
		errElem.appendChild(errtxt);
		
		var opt1Elem = self.doc.createElement("div");
		opt1Elem.setAttribute("style", "border-right:dashed 1px #555555;width:47%;float:left;padding-right:5px;");
		var altElem = self.doc.createElement("div");
		altElem.setAttribute("style", "color:#555555;");
		var altTxt = self.doc.createTextNode(" "+hd_alias.str("ui_cl_error_alt"));
		altElem.appendChild(altTxt);
		
		opt1Elem.appendChild(altElem);
		var ulElem = self.doc.createElement("ul");
		opt1Elem.appendChild(ulElem);
		
		for (var i = 0; i < links.length; i++) {
			//links[i].setAttribute("href", "#");
			links[i].removeAttribute("href");
			links[i].setAttribute("style", "color:#0000EE;cursor:pointer;");
			links[i].addEventListener("click", self.spellCheckReload, false);
			
			var liElem = self.doc.createElement("li");
			liElem.appendChild(links[i]);
			ulElem.appendChild(liElem);
		}
		
		var opt2Elem = self.doc.createElement("div");
		opt2Elem.setAttribute("style", "margin-left:5px;width:45%;float:left;");
		var containerElem = self._getOtherDictSearchContainer(true);
		opt2Elem.appendChild(containerElem);
		
		self.contentdiv.appendChild(errElem);
		self.contentdiv.appendChild(opt1Elem);
		self.contentdiv.appendChild(opt2Elem);
		return true;
	};
	
	// case where no definition, no suggestions found
	this.handleNoDataFound=function() {
		self.clearContentNode();
		var containerElem = self._getOtherDictSearchContainer(false);
		self.contentdiv.appendChild(containerElem);
	};
	
	// search word using other dictionary
	this.switchDict=function(eventObj) {
		if (eventObj.target != null) {
			var selDictLbl = eventObj.target.textContent;
			if (selDictLbl != null) {
				selDictLbl = selDictLbl.trim();
				if (selDictLbl.length > 0) {
					var dictAr = hd_alias.dicts;
					var dict = null;
					for(var i = 0; i < dictAr.length; i++) {
						if (selDictLbl == dictAr[i].lbl) {
							dict = dictAr[i];
							break;
						}
					}
					if (dict != null) {
						// change current dictionary
						self.dict = dict;
						self.dictTitleLbl.nodeValue=dictAr[i].lbl;
						self.reload(self.selectedText);
						return;
					}
				}
			}
		}
		alert(hd_alias.str("ui_cl_error_spell"));
	};
	
	// remove listeners and references on close
	this.close = function() {
		popupbase.prototype.close.call(self, self.checkCloseEvent);
		
		if (self.inputCtrl != null) {
			self.inputCtrl.removeEventListener("keypress",self.handleCR,false);
		}
		
		if (self.btnCtrl != null) {
			self.btnCtrl.removeEventListener("click",self.handleSearch,false);
		}
		
		self.searchdiv=null;
		self.searchcontroldiv=null;
		self.searchcontroldisplayed=false;
		self.inputCtrl=null;
		self.btnCtrl=null;
		self.dictTitleLbl=null;
		self=null;
	};
	
	// creates and returns container for searching the word using other dictionary
	this._getOtherDictSearchContainer = function(excludeHeader) {
		var containerElem = self.doc.createElement("div");
		
		if (excludeHeader != true) {
			var errElem = self.doc.createElement("div");
			errElem.setAttribute("style", "color:red;");
			var errtxt = self.doc.createTextNode(self.selectedText+" "+hd_alias.str("ui_cl_error_title"));
			errElem.appendChild(errtxt);
			containerElem.appendChild(errElem);
		}
		
		var msgElem = self.doc.createElement("div");
		msgElem.setAttribute("style", "color:#555555;");
		var msgtxt = self.doc.createTextNode(hd_alias.str("ui_cl_try_other_dict"));
		msgElem.appendChild(msgtxt);
		containerElem.appendChild(msgElem);
		
		var ulElem = self.doc.createElement("ul");
		containerElem.appendChild(ulElem);
		var dictAr = hd_alias.dicts;
		for(var i = 0; i < dictAr.length; i++) {
			if (self.dict == dictAr[i]) {
				continue;
			}
			var dictElem = self.doc.createElement("a");
			//dictElem.setAttribute("href", "#");
			dictElem.setAttribute("style", "color:#0000EE;cursor:pointer;");
			var dictElemTxt = self.doc.createTextNode(dictAr[i].lbl);
			dictElem.appendChild(dictElemTxt);
			dictElem.addEventListener("click", self.switchDict, false);

			var liElem = self.doc.createElement("li");
			liElem.setAttribute("style", "margin:5px 0px 5px 0px;");
			liElem.appendChild(dictElem);
			ulElem.appendChild(liElem);
		}
		return containerElem;
	};
	
	this._getTitleContainer = function(dictURL) {
		var titleContainer = self.doc.createElement("div");
		var titleContainerStyle="font-size:12px;height:24px;width:100%;"+self.fontFamily;
		titleContainer.setAttribute("style", titleContainerStyle);
		
		var titlediv = self.doc.createElement("div");
		var titledivtxtcont = self.doc.createElement("span");
		titledivtxtcont.setAttribute("style", "font-size:9px;");
		var titledivtxt = self.doc.createTextNode(hd_alias.str("title"));
		titledivtxtcont.appendChild(titledivtxt);
		titlediv.appendChild(titledivtxtcont);
		var titledivstyle = "float:right;color:#555555;width:80px;";
		titledivstyle += ("cursor:move;line-height:17px;" + self.fontFamily);
		titlediv.setAttribute("style", titledivstyle);
		
		// container for dictionary title
		var dictTitleDiv = self.doc.createElement("div");
		var dictTitleDivStyle = "float:right;color:#555555;width:250px;text-align:center;";
		dictTitleDivStyle += "cursor:move;line-height:17px;" + self.fontFamily;
		dictTitleDiv.setAttribute("style", dictTitleDivStyle);
		var dictTitlePrefixCont = self.doc.createElement("span");
		dictTitlePrefixCont.setAttribute("style", "font-size:9px;vertical-align:1;");
		var dictTitleTxt = self.doc.createTextNode("Definition from ");
		dictTitlePrefixCont.appendChild(dictTitleTxt);
		var dictTitleSpan = self.doc.createElement("span");
		dictTitleSpan.setAttribute("style", "font-weight:bold;font-size:12px;");
		self.dictTitleLbl=self.doc.createTextNode(self.dict.lbl);
		dictTitleSpan.appendChild(self.dictTitleLbl);
		dictTitleDiv.appendChild(dictTitlePrefixCont);
		dictTitleDiv.appendChild(dictTitleSpan);

		var moreoptdiv = self.doc.createElement("div");
		var moreoptdivStyle = "width:110px;float:right;text-align:center;";
		moreoptdivStyle += "margin-right:5px;line-height:17px;";
		moreoptdiv.setAttribute("style", moreoptdivStyle);
		self.moreoptlink = self.doc.createElement("a");
		self.moreoptlink.setAttribute("href", dictURL);
		var moreoptlinkStyle = "text-decoration:underline;color:#555555;";
		moreoptlinkStyle += "cursor:pointer;" + self.fontFamily;
		self.moreoptlink.setAttribute("style", moreoptlinkStyle);
		self.moreoptlink.setAttribute("target", "_blank");
		var moreoptlinktxt = self.doc.createTextNode(hd_alias.str("ui_open_new_tab"));
		self.moreoptlink.appendChild(moreoptlinktxt);
		moreoptdiv.appendChild(self.moreoptlink);
		
		self.closebtndiv = self.doc.createElement("div");
		var styleVar2 = "border:solid 1px #555555;width:30px;float:right;color:#555555;";
		styleVar2 += "text-align:center;font-size:14px;background-color:#cccccc;";
		styleVar2 += "cursor:pointer;margin-right:5px;border-radius:4px;";
		self.closebtndiv.setAttribute("style", styleVar2);
		self.closebtndiv.addEventListener("click", self.close, false);
		var closebtntxt = self.doc.createTextNode("X");
		self.closebtndiv.appendChild(closebtntxt);
		
		titleContainer.appendChild(self.closebtndiv);
		titleContainer.appendChild(moreoptdiv);
		titleContainer.appendChild(dictTitleDiv);
		titleContainer.appendChild(titlediv);
		
		return titleContainer;
	};
	
	this._getPopupBody = function() {
		var popupbody = self.doc.createElement("div");
		
		self.searchdiv = self.doc.createElement("div");
		var searchdivStyle = "width:480px;border:solid 1px #aaaaaa;margin-bottom:2px;font-size:12px;";
		searchdivStyle += "margin-left:auto;margin-right:auto;background-color:#ffffff;";
		self.searchdiv.setAttribute("style", searchdivStyle);
		var searchtxtCont = self.doc.createElement("div");
		var searchtxtContStyle = "cursor:pointer;width:115px;margin-left:5px;";
		searchtxtContStyle += ("color:#555555;text-decoration:underline;"+self.fontFamily);
		searchtxtCont.setAttribute("style", searchtxtContStyle);
		var searchdivtxt = self.doc.createTextNode(hd_alias.str("ui_search"));
		searchtxtCont.appendChild(searchdivtxt);
		self.searchdiv.appendChild(searchtxtCont);
		
		searchtxtCont.addEventListener("click", self.toggleSearchDisplay, false);
		
		self.contentdiv = self.doc.createElement("div");
		var styleVal = "border:solid 1px #aaaaaa;padding:5px;background-color:#ffffff;";
		styleVal += "text-align:justify;font-size:12px;width:470px;height:230px;";
		styleVal += "overflow:auto;margin:auto;font-size:12.8px;color:black;";
		styleVal += "font-family:'Arial','Helvetica','Nimbus Sans L','FreeSans',";
		styleVal += "'Liberation Sans','Microsoft Sans Serif','Arial Unicode MS',sans-serif;";
		self.contentdiv.setAttribute("style", styleVal);

		popupbody.appendChild(self.searchdiv);
		popupbody.appendChild(self.contentdiv);
		return popupbody;
	};
	
	this._initSearchControls = function() {
		var searchCtrl=self.doc.createElement("div");
		searchCtrl.setAttribute("style", "height:30px;display:none;");
		
		self.inputCtrl=self.doc.createElement("input");
		self.inputCtrl.setAttribute("type", "text");
		self.inputCtrl.setAttribute("style", "margin:4px 5px 4px 5px;font-size:15px;width:140px;");
		
		self.btnCtrl=self.doc.createElement("span");
		var btnCtrlStyle="border:solid 1px #aaaaaa;color:#555555;";
		btnCtrlStyle+="text-align:center;font-size:14px;background-color:#cccccc;";
		btnCtrlStyle+="padding:2px 5px 2px 5px;cursor:pointer;border-radius:4px;";
		self.btnCtrl.setAttribute("style", btnCtrlStyle);
		var btnCtrltxt = self.doc.createTextNode(hd_alias.str("ui_search_btn"));
		self.btnCtrl.appendChild(btnCtrltxt);
		
		self.inputCtrl.addEventListener("keypress", self.handleCR,false);
		self.btnCtrl.addEventListener("click", self.handleSearch,false);

		searchCtrl.appendChild(self.inputCtrl);
		searchCtrl.appendChild(self.btnCtrl);
		
		self.searchdiv.appendChild(searchCtrl);
		self.searchcontroldiv = searchCtrl;
	};
	
};
//hd_alias.classicPopup.prototype = Object.create(new popupbase);
hd_alias.popupHandler.prototype = Object.create(new popupbase);
//-- end ---classic mode------------------


//---start--drag-drop---------------------
//enables drag/move functionality
hd_alias.dragDropHandler=function() {
	var self=this;
	this.sourceElem=null;
	this.popupwinElem=null;
	this.startflag=false;
	this.startx=0;
	this.starty=0;
	this.startleft=0;
	this.starttop=0;
	this.doc=null;
	
	this.init = function(doc, elem, elemWin) {
		if (doc == null || elem == null || elemWin == null) {return;}
		self.sourceElem = elem;
		self.popupwinElem = elemWin;
		self.doc=doc;
		
		self.sourceElem.addEventListener("mousedown",self.startdrag,false);
		self.doc.addEventListener("mouseup",self.stopdrag,false);
		self.doc.addEventListener("mousemove",self.ondrag,false);
	};
	
	this.startdrag = function(mouseE) {
		self.startleft=parseInt(self.popupwinElem.style.left);
		self.starttop=parseInt(self.popupwinElem.style.top);
		
		self.popupwinElem.contentDocument.body.style.cursor="move";
		self.startx=mouseE.screenX;
		self.starty=mouseE.screenY;
		
		self.startflag=true;
	};
	
	this.stopdrag = function(mouseE) {
		self.startflag=false;
		self.popupwinElem.contentDocument.body.style.cursor="auto";
	};
	
	this.ondrag = function(mouseE) {
		if (self.startflag != true) { return;}
		var deltax = mouseE.screenX - self.startx;
		var deltay = mouseE.screenY - self.starty;
		var currentx = self.startleft + deltax;
		var currenty = self.starttop + deltay;
		
		if (currentx < 0) {currentx=0;}
		if (currenty < 0) {currenty=0;}

		self.popupwinElem.style.left=currentx + "px";
		self.popupwinElem.style.top=currenty + "px";
	};
	
	// clear listeners/references
	this.close = function() {
		self.sourceElem.removeEventListener("mousedown",self.startdrag,false);

		self.doc.removeEventListener("mouseup",self.stopdrag,false);
		self.doc.removeEventListener("mousemove",self.ondrag,false);

		self.sourceElem=null;
		self.popupwinElem=null;
		self=null;
	};
};
//--- end --drag-drop---------------------

//--start---compact mode------------------
//Display result in compact mode
hd_alias.compactPopup=function() {
	var self=this;
	//this.backgroundColor="#ffffe8";
	this.backgroundColor="#f9f9e9";
	this.outerBorderColor="#bcaab4";
	
	this.init = function(posArr, selectedText) {
		return self.commonInit(posArr, selectedText, self.buildUI);
	};
	
	this.buildUI=function(eventObj) {
		self.doc=self.frm.contentDocument;
        var body=self.frm.contentDocument.body;
        body.setAttribute("style", "margin:0px;");
        
        self.titlebar = self._getTitleContainer(self.dictURL);
        var popupbody = self._getPopupBody();
        
        body.appendChild(self.titlebar);
        body.appendChild(popupbody);
        
        self.commonBuild(body, self.checkCloseEvent);
	};
	
	// display result in content block
	this.updateresult = function(docFragment, dynaCSSAr) {
		self.clearContentNode();
		
		var dataIssue = false;
		var result = self.dict.getCompactResult(docFragment);
		if (result.length == 1) {
			// switch to classic mode if result not found
			//self.display(result[0]);
			dataIssue = true;
		} else {
			var titleDiv = self.doc.createElement("div");
			titleDiv.setAttribute("style", "width:"+self.titleContainerLeft+"px;font-size:12px;overflow:hidden;");
			var titleAr = result[0];
			for (var i = 0; i < titleAr.length; i++) {
				if (titleAr[i] == null) { continue; }
				if (i == 0) {
					titleAr[i].setAttribute("style", "font-size:20px;font-weight:bold;");
				}
				titleAr[i].style.display="inline";
				titleDiv.appendChild(titleAr[i]);
			}
			
			var defDiv = self.doc.createElement("div");
			defDiv.setAttribute("style", "margin-left:10px;font-size:14px;");
			var defAr = result[1];
			for (var i = 0; i < defAr.length; i++) {
				if (defAr[i] == null) { continue; }
				defDiv.appendChild(defAr[i]);
			}
			
			self.contentdiv.appendChild(titleDiv);
			self.contentdiv.appendChild(defDiv);
			
			// check if data is found for compact mode
			dataIssue = (titleDiv.textContent == null
					|| titleDiv.textContent.replace(/\s/g, "").length == 0
					|| defDiv.textContent == null
					|| defDiv.textContent.replace(/\s/g, "").length == 0);
		}
		
		if (dataIssue) {
			var switchFlag = self.handleDataIssue(docFragment,dynaCSSAr);
			if (switchFlag == true) {
				return;
			}
		}
		
		// display scroll if content is more
		if (self.contentdiv.getBoundingClientRect().height > self.height) {
			self.contentdiv.style.height=self.height+"px";
			self.contentdiv.style.overflow="auto";
			self.titlebar.style.left=(self.titleContainerLeft-13)+"px";
		}
	};
	
	// display result in classic mode
	this.switchMode=function(docFragment, dynaCSSAr) {
		var selText = self.selectedText;
		var posAr = new Array(self.currentX,self.currentY);
		self.close();
		
		var popup = new hd_alias.popupHandler();
		var flag=popup.initSwitch(posAr, selText, docFragment, dynaCSSAr);
		if (!flag) {
			alert(hd_alias.str("display.error1")+'\n'+hd_alias.str("display.error2"));
			return;
		}
	};
	
	// display settings
	this.changeSettings=function(eventObj) {
		self.close();
		hd_alias.kbh.handlePreferrences(eventObj);
	};
	
	// incase data cannot be located for compact mode
	// display pop-up to select option to display result in classic mode
	// or open settings window
	// returns true if auto switch is enabled else false
	this.handleDataIssue=function(docFragment, dynaCSSAr) {
		var failsafe_flag = hd_alias.prefManager.getBoolPref("extensions.handy_dictionary_ext.failsafe");
		if (failsafe_flag == true) {
			self.switchMode(docFragment,dynaCSSAr);
			// call to switchMode already invalidated this popup
			return true;
		}
		
		self.clearContentNode();
		
		var containerElem = self.doc.createElement("div");
		var errElem = self.doc.createElement("div");
		var errSpanElem = self.doc.createElement("span");
		errSpanElem.setAttribute("style", "color:red;");
		var errSpantxt = self.doc.createTextNode(hd_alias.str("ui_cm_error_title")+" ");
		var errtxt = self.doc.createTextNode(self.selectedText);
		errSpanElem.appendChild(errSpantxt);
		errElem.appendChild(errSpanElem);
		errElem.appendChild(errtxt);
		
		var msgElem = self.doc.createElement("div");
		var msgtxt = self.doc.createTextNode(hd_alias.str("ui_cm_error_text"));
		msgElem.appendChild(msgtxt);
		
		var opt1Elem = self.doc.createElement("a");
		opt1Elem.setAttribute("href", "#");
		opt1Elem.setAttribute("style", "display:block;color:#0000EE;cursor:pointer;");
		var opt1txt = self.doc.createTextNode(hd_alias.str("ui_cm_opt1"));
		opt1Elem.appendChild(opt1txt);
		opt1Elem.addEventListener("click", function(eventObj){
			self.switchMode(docFragment,dynaCSSAr);
		}, false);
		
		var opt2Elem = self.doc.createElement("a");
		opt2Elem.setAttribute("href", "#");
		opt2Elem.setAttribute("style", "display:block;color:#0000EE;cursor:pointer;");
		var opt2txt = self.doc.createTextNode(hd_alias.str("ui_cm_opt2"));
		opt2Elem.appendChild(opt2txt);
		opt2Elem.addEventListener("click", self.changeSettings, false);
		
		var msgElem1 = self.doc.createElement("div");
		msgElem1.setAttribute("style", "font-size:10px;");
		var msgtxt1 = self.doc.createTextNode(hd_alias.str("ui_cm_opt2_desc"));
		msgElem1.appendChild(msgtxt1);
		
		containerElem.appendChild(errElem);
		containerElem.appendChild(msgElem);
		containerElem.appendChild(opt1Elem);
		containerElem.appendChild(msgElem1);
		containerElem.appendChild(opt2Elem);
		
		self.contentdiv.appendChild(containerElem);
		return false;
	};
	
	this.checkCloseEvent=function(eventObj) {
		if (eventObj.keyCode == 27) {
			eventObj.stopImmediatePropagation();
			self.close();
		}
		return false;
	};
	
	// remove listeners and references on close
	this.close = function() {
		popupbase.prototype.close.call(self, self.checkCloseEvent);
	};
	
	this._getTitleContainer = function(dictURL) {
		var titleContainerWidth = 90;
		self.titleContainerLeft = self.width - titleContainerWidth;
		var titleContainer = self.doc.createElement("div");
		var titleContainerStyle="position:absolute;font-size:12px;height:24px;cursor:move;"+self.fontFamily;
		titleContainerStyle += "left:"+self.titleContainerLeft+"px;top:2px;width:"+titleContainerWidth+"px";
		titleContainer.setAttribute("style", titleContainerStyle);
		
		var moreoptdiv = self.doc.createElement("div");
		var moreoptdivStyle = "width:40px;float:right;text-align:center;";
		moreoptdivStyle += "margin-right:5px;line-height:17px;";
		moreoptdiv.setAttribute("style", moreoptdivStyle);
		self.moreoptlink = self.doc.createElement("a");
		self.moreoptlink.setAttribute("href", dictURL);
		var moreoptlinkStyle = "text-decoration:underline;color:#555555;";
		moreoptlinkStyle += "cursor:pointer;" + self.fontFamily;
		self.moreoptlink.setAttribute("style", moreoptlinkStyle);
		self.moreoptlink.setAttribute("target", "_blank");
		var moreoptlinktxt = self.doc.createTextNode(hd_alias.str("ui_more"));
		self.moreoptlink.appendChild(moreoptlinktxt);
		moreoptdiv.appendChild(self.moreoptlink);
		
		self.closebtndiv = self.doc.createElement("div");
		var styleVar2 = "border:solid 1px #555555;width:30px;float:right;color:#555555;";
		styleVar2 += "text-align:center;font-size:14px;background-color:#cccccc;";
		styleVar2 += "cursor:pointer;margin-right:5px;border-radius:4px;";
		self.closebtndiv.setAttribute("style", styleVar2);
		self.closebtndiv.addEventListener("click", self.close, false);
		var closebtntxt = self.doc.createTextNode("X");
		self.closebtndiv.appendChild(closebtntxt);
		
		titleContainer.appendChild(self.closebtndiv);
		titleContainer.appendChild(moreoptdiv);
				
		return titleContainer;
	};
	
	this._getPopupBody = function() {
		var popupdiv = self.doc.createElement("div");
		popupdiv.setAttribute("style", "height:"+self.height+"px;display:table-cell;vertical-align:middle;");
		
		self.contentdiv = self.doc.createElement("div");
		var leftMargin=10;
		var width = self.width - leftMargin;
		self.contentdiv.setAttribute("style", "width:"+width+"px;margin-left:"+leftMargin+"px;"+self.fontFamily);
		
		popupdiv.appendChild(self.contentdiv);
		return popupdiv;
	};
};
hd_alias.compactPopup.prototype = Object.create(new popupbase);
//-- end ---compact mode------------------
})();