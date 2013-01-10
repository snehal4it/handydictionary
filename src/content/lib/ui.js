/* For licence details please refer license.txt */

// Namespace for HandyDictionary
if ("undefined" == typeof(handy_dictionary_ext_ns_id123)) {
	var handy_dictionary_ext_ns_id123 = {};
};

(function() {
var hd_alias=handy_dictionary_ext_ns_id123;
// maintain life cycle of inline poup
hd_alias.popupHandler = function() {
	var self=this;
	this.width=490;
	this.height=286;
	this.contentdiv = null;
	this.outerdiv = null;
	this.closebtndiv = null;
	this.currentX = 200;
	this.currentY = 250;
	this.dragdropref=null;
	this.searchdiv=null;
	this.searchcontroldiv=null;
	this.searchcontroldisplayed=false;
	this.inputCtrl=null;
	this.btnCtrl=null;
	this.moreoptlink=null;
	this.fontFamily="font-family:arial,verdana,helvetica,sans-serif;";
	
	this.dict=null;
	var util=hd_alias.UTIL;
	
	this._getTitleContainer = function(dictURL) {
		var titleContainer = content.document.createElement("div");
		var titleContainerStyle="font-size:12px;height:24px;width:100%;"+self.fontFamily;
		titleContainer.setAttribute("style", titleContainerStyle);
		
		var titlediv = content.document.createElement("div");
		var titledivtxtcont = content.document.createElement("span");
		titledivtxtcont.setAttribute("style", "margin-right:60px;");
		var titledivtxt = content.document.createTextNode(hd_alias.str("title"));
		titledivtxtcont.appendChild(titledivtxt);
		titlediv.appendChild(titledivtxtcont);
		var titledivstyle = "float:right;text-align:right;color:#555555;width:330px;";
		titledivstyle += ("font-weight:bold;cursor:move;line-height:17px;" + self.fontFamily);
		titlediv.setAttribute("style", titledivstyle);
		
		var moreoptdiv = content.document.createElement("div");
		var moreoptdivStyle = "width:110px;float:right;text-align:center;";
		moreoptdivStyle += "margin-right:5px;line-height:17px;";
		moreoptdiv.setAttribute("style", moreoptdivStyle);
		self.moreoptlink = content.document.createElement("a");
		self.moreoptlink.setAttribute("href", dictURL);
		var moreoptlinkStyle = "text-decoration:underline;color:#555555;";
		moreoptlinkStyle += "cursor:pointer;" + self.fontFamily;
		self.moreoptlink.setAttribute("style", moreoptlinkStyle);
		self.moreoptlink.setAttribute("target", "_blank");
		var moreoptlinktxt = content.document.createTextNode(hd_alias.str("ui_open_new_tab"));
		self.moreoptlink.appendChild(moreoptlinktxt);
		moreoptdiv.appendChild(self.moreoptlink);
		
		self.closebtndiv = content.document.createElement("div");
		var styleVar2 = "border:solid 1px #555555;width:30px;float:right;color:#555555;";
		styleVar2 += "text-align:center;font-size:14px;background-color:#cccccc;";
		styleVar2 += "cursor:pointer;margin-right:5px;border-radius:4px;";
		self.closebtndiv.setAttribute("style", styleVar2);
		self.closebtndiv.addEventListener("click", self.close, false);
		var closebtntxt = content.document.createTextNode("X");
		self.closebtndiv.appendChild(closebtntxt);
		
		titleContainer.appendChild(self.closebtndiv);
		titleContainer.appendChild(moreoptdiv);
		titleContainer.appendChild(titlediv);
		
		return titleContainer;
	};
	
	this._getPopupBody = function() {
		var popupbody = content.document.createElement("div");
		
		self.searchdiv = content.document.createElement("div");
		var searchdivStyle = "width:480px;border:solid 1px #aaaaaa;margin-bottom:2px;";
		searchdivStyle += "margin-left:auto;margin-right:auto;background-color:#ffffff;";
		self.searchdiv.setAttribute("style", searchdivStyle);
		var searchtxtCont = content.document.createElement("div");
		var searchtxtContStyle = "cursor:pointer;width:115px;margin-left:5px;";
		searchtxtContStyle += ("color:#555555;text-decoration:underline;"+self.fontFamily);
		searchtxtCont.setAttribute("style", searchtxtContStyle);
		var searchdivtxt = content.document.createTextNode(hd_alias.str("ui_search"));
		searchtxtCont.appendChild(searchdivtxt);
		self.searchdiv.appendChild(searchtxtCont);
		
		searchtxtCont.addEventListener("click", self.toggleSearchDisplay, false);
		
		self.contentdiv = content.document.createElement("div");
		var styleVal = "border:solid 1px #aaaaaa;padding:5px;background-color:#ffffff;";
		styleVal += "text-align:justify;font-size:12px;width:470px;height:230px;";
		styleVal += "overflow:scroll;margin:auto;font-size:12.8px;color:black;";
		styleVal += "font-family:'Arial','Helvetica','Nimbus Sans L','FreeSans',";
		styleVal += "'Liberation Sans','Microsoft Sans Serif','Arial Unicode MS',sans-serif;";
		self.contentdiv.setAttribute("style", styleVal);
		
		popupbody.appendChild(self.searchdiv);
		popupbody.appendChild(self.contentdiv);
		return popupbody;
	};
	
	this._initSearchControls = function() {
		var searchCtrl=content.document.createElement("div");
		searchCtrl.setAttribute("style", "height:30px;display:none;");
		
		self.inputCtrl=content.document.createElement("input");
		self.inputCtrl.setAttribute("type", "text");
		self.inputCtrl.setAttribute("style", "margin:4px 5px 4px 5px;padding:2px;font-size:12px;height:16px;width:140px;");
		
		self.btnCtrl=content.document.createElement("span");
		var btnCtrlStyle="border:solid 1px #aaaaaa;color:#555555;";
		btnCtrlStyle+="text-align:center;font-size:14px;background-color:#cccccc;";
		btnCtrlStyle+="padding:2px 5px 2px 5px;cursor:pointer;border-radius:4px;";
		self.btnCtrl.setAttribute("style", btnCtrlStyle);
		var btnCtrltxt = content.document.createTextNode(hd_alias.str("ui_search_btn"));
		self.btnCtrl.appendChild(btnCtrltxt);
		
		self.inputCtrl.addEventListener("keypress", self.handleCR,false);
		self.btnCtrl.addEventListener("click", self.handleSearch,false);

		searchCtrl.appendChild(self.inputCtrl);
		searchCtrl.appendChild(self.btnCtrl);
		
		self.searchdiv.appendChild(searchCtrl);
		self.searchcontroldiv = searchCtrl;
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
		selectedText=selectedText.replace(/\s/g, "");
		self.inputCtrl.value="";
		self.toggleSearchDisplay(null);
		//var dictURL = util.getDictionaryServiceURL(selectedText);
		var dictURL=self.dict.getURL(selectedText);
		self.moreoptlink.setAttribute("href", dictURL);
		self.display(hd_alias.str("ajax_loading"));
		hd_alias.ajaxHandler(dictURL, self);
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
	
	this.checkAndStorePos = function(updateX, updateY) {
		if (updateX != null && updateX > 0) {
			self.currentX = updateX;
		}
		
		if (updateY != null && updateY > 0) {
			self.currentY = updateY;
		}
		
		var updatedPos = util.adjustAbsoluteLocations(
			self.currentX, self.currentY, self.width, self.height);
		self.currentX=updatedPos[0];
		self.currentY=updatedPos[1];
	};
	
	// returns true if ui created
	this.init = function(posArr, dictURL, dict) {
		self.dict=dict;
		self.checkAndStorePos(posArr[0], posArr[1]);
		
		// generates inline popup content using div
		self.outerdiv = content.document.createElement("div");
		var styleVal1 = "display:block;position:absolute;overflow:hidden;";
		styleVal1 += "left:" + self.currentX + "px;top:" + self.currentY + "px;" ;
		styleVal1 += "border:solid 1px #aaaaaa;background-color:#e6e6e6;";
		styleVal1 += "text-align:justify;font-size:12px;width:"+self.width;
		styleVal1 += "px;height:"+self.height+"px;z-index:100;";
		styleVal1 += "padding-top:5px;padding-bottom:5px;border-radius:6px;";
		self.outerdiv.setAttribute("style", styleVal1);
		
		var titleContainer = this._getTitleContainer(dictURL);
		var popupbody = this._getPopupBody();
		
		self.outerdiv.appendChild(titleContainer);
		self.outerdiv.appendChild(popupbody);
		
		var body = util.getRootElement();
		if (!body) { return false; }
		body.appendChild(self.outerdiv);
		
		// fix for iframe where parent document loses focus
		// and stop receiving keyboard events
		if(content.document.activeElement && content.document.activeElement.blur) {
			content.document.activeElement.blur();
		}
		
		content.document.addEventListener("keypress", self.checkCloseEvent, false);
		
		// enable drag/move for inline popup
		self.dragdropref = new hd_alias.dragDropHandler();
		self.dragdropref.init(titleContainer, self.outerdiv);
		return true;
	};
	
	// top level element to contain popup
	//this._getRootElement = function() {
	//	if (content.document.body && content.document.body.nodeName
	//		&& content.document.body.nodeName.toUpperCase()=="BODY") {
	//		// for frameset it returns frameset instead of body tag
	//		return content.document.body;
	//	}
	//	var body = content.document.getElementsByTagName("body")[0];
	//	if (!body) {
	//		// fix for frameset
	//		body=content.document.getElementsByTagName("html")[0];
	//	}
	//	return body;
	//};
	
	// display temporary messages
	this.display = function(displayStr) {
		self.clearContentNode();
		
		var msgElem = content.document.createElement("h1");
		var msgtxt = content.document.createTextNode(displayStr);
		msgElem.appendChild(msgtxt);
		self.contentdiv.appendChild(msgElem);
	};
	
	// clear content/messages from content window
	this.clearContentNode = function() {
		var childNodes = self.contentdiv.childNodes;
		if (childNodes && childNodes.length > 0) {			
			var tempArray = new Array();
			for (var i = 0; i < childNodes.length; i++) {
				tempArray[i] = childNodes.item(i);
			}
			
			for (var i = 0; i < tempArray.length; i++) {
				self.contentdiv.removeChild(tempArray[i]);
			}
		}
	};
	
	// display result in content block
	this.updateresult = function(docFragment) {
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
				dictResultElem = content.document.getElementById(result_id);
			}
		}
		
		// if result block is present, then display only that content
		if (dictResultElem != null) {
			var childNodes = dictResultElem.childNodes;
			self.clearContentNode();
			if (childNodes && childNodes.length > 0) {
				var tempArray = new Array();
				for (var i = 0; i < childNodes.length; i++) {
					tempArray[i] = childNodes.item(i);
				}
				
				for (var i = 0; i < tempArray.length; i++) {
					var elem = tempArray[i];
					self.dict.applyFix(elem);
					self.contentdiv.appendChild(elem);
				}
			}
		}
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
		content.document.removeEventListener("keypress",self.checkCloseEvent,false);
		self.closebtndiv.removeEventListener("click",self.close,false);
		
		if (self.inputCtrl != null) {
			self.inputCtrl.removeEventListener("keypress",self.handleCR,false);
		}
		
		if (self.btnCtrl != null) {
			self.btnCtrl.removeEventListener("click",self.handleSearch,false);
		}
		
		self.dragdropref.close();
		self.dragdropref=null;
		
		var body = util.getRootElement();
		if(!body) {return;}
		body.removeChild(self.outerdiv);
		
		self.outerdiv=null;
		self.contentdiv=null;
		self.closebtndiv=null;
		self.searchdiv=null;
		self.searchcontroldiv=null;
		self.moreoptlink=null;
		self.inputCtrl=null;
		self.btnCtrl=null;
		self=null;
	};
};

// enables drag/move functionality
hd_alias.dragDropHandler=function() {
	var self=this;
	this.sourceElem=null;
	this.popupwinElem=null;
	this.startflag=false;
	this.startx=0;
	this.starty=0;
	this.startleft=0;
	this.starttop=0;
	this.temp=null;
	
	this.init = function(elem, elemWin) {
		if (elem == null || elemWin == null) {return;}
		self.sourceElem = elem;
		self.popupwinElem = elemWin;
		self.sourceElem.addEventListener("mousedown",self.startdrag,false);
		if (self.temp != null) {
			self.temp.addEventListener("mouseup",self.stopdrag,false);
			self.temp.addEventListener("mousemove",self.ondrag,false);
		} else {
		content.document.addEventListener("mouseup",self.stopdrag,false);
		content.document.addEventListener("mousemove",self.ondrag,false);
		}
	};
	
	this.startdrag = function(mouseE) {
		self.startflag=true;
		self.startx=mouseE.clientX;
		self.starty=mouseE.clientY;
		self.startleft=parseInt(self.popupwinElem.style.left);
		self.starttop=parseInt(self.popupwinElem.style.top);
		if (self.temp != null) {
			self.popupwinElem.contentDocument.body.style.cursor="move";
		} else {
			self.popupwinElem.style.cursor="move";
		}
	};
	
	this.stopdrag = function(mouseE) {
		self.startflag=false;
		if (self.temp != null) {
			self.popupwinElem.contentDocument.body.style.cursor="auto";
		} else {
			self.popupwinElem.style.cursor="auto";
		}
	};
	
	this.ondrag = function(mouseE) {
		if (self.startflag != true) { return;}
		var deltax = mouseE.clientX - self.startx;
		var deltay = mouseE.clientY - self.starty;
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
		if (self.temp != null) {
			self.temp.removeEventListener("mouseup",self.stopdrag,false);
			self.temp.removeEventListener("mousemove",self.ondrag,false);
		} else {
		content.document.removeEventListener("mouseup",self.stopdrag,false);
		content.document.removeEventListener("mousemove",self.ondrag,false);
		}
		self.sourceElem=null;
		self.popupwinElem=null;
		self=null;
	};
};

// Display result in compact mode
hd_alias.compactPopup=function() {
	var self=this;
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
	this.fontFamily="font-family:Georgia,verdana,arial,helvetica,sans-serif;";
	
	this.titleContainerLeft=0;
	var util=hd_alias.UTIL;
	
	this.checkAndStorePos = function(updateX, updateY) {
		if (updateX != null && updateX > 0) {
			self.currentX = updateX;
		}
		
		if (updateY != null && updateY > 0) {
			self.currentY = updateY;
		}
		
		var updatedPos = util.adjustAbsoluteLocations(
			self.currentX, self.currentY, self.width, self.height);
		self.currentX=updatedPos[0];
		self.currentY=updatedPos[1];
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
	
	this.buildUI=function(eventObj) {
		//var doc = eventObj.originalTarget;
		self.doc=self.frm.contentDocument;
        var body=self.frm.contentDocument.body;
        body.setAttribute("style", "margin:0px;");
        
        self.titlebar = self._getTitleContainer(self.dictURL);
        var popupbody = self._getPopupBody();
        
        body.appendChild(self.titlebar);
        body.appendChild(popupbody);
        // fix for iframe where parent document loses focus
		// and stop receiving keyboard events
		if(content.document.activeElement && content.document.activeElement.blur) {
			content.document.activeElement.blur();
		}

		content.document.addEventListener("keypress", self.checkCloseEvent, false);
		self.frm.contentDocument.addEventListener("keypress", self.checkCloseEvent, false);
		
		// enable drag/move for inline popup
		self.dragdropref = new hd_alias.dragDropHandler();
		//todo: fix temp var
		self.dragdropref.temp=self.doc;
		self.dragdropref.init(self.titlebar, self.frm);
		
		//todo: fix async issue
		self.display(hd_alias.str("ajax_loading"));
		hd_alias.ajaxHandler(self.dictURL, self);
	};
	
	this.init = function(posArr, dictURL, dict) {
		self.dict=dict;
		self.dictURL=dictURL;
		self.checkAndStorePos(posArr[0], posArr[1]);
		
		// generates inline popup content using iframe
		self.frm = content.document.createElement("iframe");
		self.frm.setAttribute("type", "content");
		self.frm.setAttribute("collapsed", "true");
		var styleVal1 = "display:block;position:absolute;overflow:hidden;";
		styleVal1 += "left:" + self.currentX + "px;top:" + self.currentY + "px;" ;
		styleVal1 += "border:solid 1px #bcaab4;background-color:#ffffe8;";
		styleVal1 += "text-align:justify;font-size:12px;width:"+self.width;
		styleVal1 += "px;height:"+self.height+"px;z-index:100;";
		styleVal1 += "border-radius:6px;";
		self.frm.setAttribute("style", styleVal1);
        
		var body = util.getRootElement();
		if (!body) { return false; }
		body.appendChild(self.frm);
		
		//self.doc=self.frm.contentDocument;
		self.frm.addEventListener("load", self.buildUI, false);
		self.frm.contentDocument.location.href = "about:blank";
		
		return true;
	};
	
	// display result in content block
	this.updateresult = function(docFragment) {
		self.clearContentNode();
		
		var result = self.dict.getCompactResult(docFragment);
		if (result.length == 1) {
			self.display(result[0]);
			return;
		}
				
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
		
		// display scroll if content is more
		if (self.contentdiv.getBoundingClientRect().height > self.height) {
			self.contentdiv.style.height=self.height+"px";
			self.contentdiv.style.overflow="auto";
			self.titlebar.style.left=(self.titleContainerLeft-13)+"px";
		}
	};
	
	
	// display temporary messages
	this.display = function(displayStr) {
		self.clearContentNode();
		
		var msgElem = self.doc.createElement("h1");
		var msgtxt = self.doc.createTextNode(displayStr);
		msgElem.appendChild(msgtxt);
		self.contentdiv.appendChild(msgElem);
	};
	
	// clear content/messages from content window
	this.clearContentNode = function() {
		var childNodes = self.contentdiv.childNodes;
		if (childNodes && childNodes.length > 0) {			
			var tempArray = new Array();
			for (var i = 0; i < childNodes.length; i++) {
				tempArray[i] = childNodes.item(i);
			}
			
			for (var i = 0; i < tempArray.length; i++) {
				self.contentdiv.removeChild(tempArray[i]);
			}
		}
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
		self.frm.contentDocument.removeEventListener("keypress",self.checkCloseEvent,false);
		content.document.removeEventListener("keypress",self.checkCloseEvent,false);
		
		var body = util.getRootElement();
		if(!body) {return;}
		body.removeChild(self.frm);
		
		//self.dict=null;
		//self.dictURL=null;
		self.closebtndiv=null;
		self.moreoptlink=null;
		self.titlebar=null;
		self.doc=null;
		self.contentdiv=null;
		self.frm=null;
		
		// fix where focus is lost and events no longer fired
		// which prevents other pop-ups from closing
		content.focus();
	};
};
})();