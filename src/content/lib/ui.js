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
	
	// returns true if ui created
	this.init = function(posArr, selectedText) {
		return self.commonInit(posArr, selectedText, self.buildUI);
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
		selectedText=selectedText.replace(/\s/g, "");
		self.inputCtrl.value="";
		self.toggleSearchDisplay(null);
		
		//todo: move to common method
		self.selectedText=selectedText;
		self.dictURL=self.dict.getURL(selectedText);
		self.moreoptlink.setAttribute("href", self.dictURL);
		
		self.loadContent();
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
				dictResultElem = self.doc.getElementById(result_id);
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
		self=null;
	};
	
	this._getTitleContainer = function(dictURL) {
		var titleContainer = self.doc.createElement("div");
		var titleContainerStyle="font-size:12px;height:24px;width:100%;"+self.fontFamily;
		titleContainer.setAttribute("style", titleContainerStyle);
		
		var titlediv = self.doc.createElement("div");
		var titledivtxtcont = self.doc.createElement("span");
		titledivtxtcont.setAttribute("style", "margin-right:60px;");
		var titledivtxt = self.doc.createTextNode(hd_alias.str("title"));
		titledivtxtcont.appendChild(titledivtxt);
		titlediv.appendChild(titledivtxtcont);
		var titledivstyle = "float:right;text-align:right;color:#555555;width:330px;";
		titledivstyle += ("font-weight:bold;cursor:move;line-height:17px;" + self.fontFamily);
		titlediv.setAttribute("style", titledivstyle);
		
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
		styleVal += "overflow:scroll;margin:auto;font-size:12.8px;color:black;";
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