/* For licence details please refer license.txt */

// Namespace for HandyDictionary
if ("undefined" == typeof(handy_dictionary_ext_ns_id123)) {
	var handy_dictionary_ext_ns_id123 = {};
};

(function() {
var hd_alias=handy_dictionary_ext_ns_id123;
hd_alias.CNTX = new function() {
	var self=this;
	var util=hd_alias.UTIL;
	
	this.optmenu=null;
	this.cntxmenuitem=null;
	this.cntxmenu=null;
	this.contextMenu=null;
	this.menuItemDataKey="txtargument";
	
	// cache references
	this.init=function() {
		self.contextMenu = document.getElementById("contentAreaContextMenu");
		if (self.contextMenu) {
			self.optmenu=document.getElementById("handy_dictionary_ext_context_menu_opt");
			self.cntxmenuitem=document.getElementById("handy_dictionary_ext_context_menu_link1");
			self.cntxmenu=document.getElementById("handy_dictionary_ext_context_menu_link");
			
			self.maintainContextMenuReg(true);
			
			// by default all are hidden
			self.optmenu.hidden=true;
			self.hideContextItems();
		}
	};
	
	// cleanup listeners and references
	this.clean=function() {
		self.maintainContextMenuReg(false);
		
		self.cntxmenu=null;
		self.cntxmenuitem=null;
		self.optmenu=null;
		self.contextMenu=null;
	};
	
	this.enable=function() {
		self.optmenu.hidden=false;
	};
	
	this.disable=function() {
		self.optmenu.hidden=true;
		self.hideContextItems();
	};

	// register/deregister listeners
	this.maintainContextMenuReg=function(flag) {
		if (self.optmenu == null) { return;}
		if (flag) {
			self.contextMenu.addEventListener("popupshowing", self.initContextMenuItems, false);
			self.contextMenu.addEventListener("popuphiding", self.clearContextMenuItems, false);
			self.optmenu.hidden=false;
		} else {
			self.contextMenu.removeEventListener("popupshowing", self.initContextMenuItems, false);
			self.contextMenu.removeEventListener("popuphiding", self.clearContextMenuItems, false);
			self.optmenu.hidden=true;
			self.hideContextItems();
		}
	};
	
	this.hideContextItems=function() {
		self.cntxmenuitem.hidden=true;
		self.cntxmenu.hidden=true;
		
		// cleanup listeners
		self._removeListeners(self.cntxmenuitem);
	};
	
	// if extension is enabled display context menus
	this.initContextMenuItems=function(eventObj) {
		// enable context menu based on document markup
		if (!util.isExtEnabled(content.document)) {	return;	}
		if (eventObj.eventPhase != 2) { return; }
		util.updateContextMenuPos(eventObj);
		self.hideContextItems();
		var words = self.getLookupText();
		if (words.length == 0) {
			return;
		} else if (words.length == 1) {
			self.cntxmenuitem.hidden = false;
			var label = hd_alias.str("cntx_lookup") + ' "' + words[0] + '"';
			self.cntxmenuitem.setAttribute("label", label);
			self._addListeners(self.cntxmenuitem,words[0]);
			return;
		}
		self.cntxmenu.hidden = false;
		var menupopup = self.cntxmenu.menupopup;
		if (!menupopup) {
			menupopup = document.createElement("menupopup");
			self.cntxmenu.appendChild(menupopup);
		}
		for (var i = 0; i < words.length; i++) {
			var menuItem = document.createElement("menuitem");
			self._addListeners(menuItem,words[i]);
			menuItem.setAttribute("label", words[i]);
			menupopup.appendChild(menuItem);
		}
	};
	
	// remove context menus
	this.clearContextMenuItems = function(eventObj) {
		if (eventObj.eventPhase != 2) { return; }
		var menupopup = self.cntxmenu.menupopup;
		if (menupopup) {
			self.cntxmenu.removeChild(menupopup);
		}
		self.hideContextItems();
	};
	
	// add listeners for menuitem in context menu
	this._addListeners=function(menuitem,text) {
		menuitem.addEventListener("click",self.onContextMenuCommands,false);
		menuitem.setUserData(self.menuItemDataKey, text, null);
	};
	
	// remove listeners for menuitem in context menu
	this._removeListeners=function(menuitem) {
		menuitem.removeEventListener("click",self.onContextMenuCommands,false);
		menuitem.setUserData(self.menuItemDataKey, null, null);
	};
	
	this.onContextMenuCommands = function(eventObj) {
		var menuItem=eventObj.currentTarget;
		if(menuItem && menuItem.getUserData) {
			var text=menuItem.getUserData(self.menuItemDataKey);
			if(text){
				var x = hd_alias.contextMenuPos[0];
				var y = hd_alias.contextMenuPos[1];
				hd_alias.displayHandyDict(new Array(x, y), text);
			}
		}
	};
	
	// based on context retrieve words
	this.getLookupText = function() {
		var result = new Array();
		if (gContextMenu == null) { return result;}
		var elem = gContextMenu.target;
		if (gContextMenu.onLink && elem && elem.textContent) {
			var linkTag = elem;
			while (linkTag && linkTag.nodeName) {
				if (linkTag.nodeName.toUpperCase() == 'A') {
					if (linkTag.textContent) {
						elem = linkTag;
					}
					break;
				}
				linkTag = linkTag.parentNode;
			}
			
			return util.filterLookupText(elem.textContent);
		} else if (gContextMenu.isContentSelected) {
			var selection = util.getSelectedText(null);
			if (selection != "") {
				result[0] = selection;
			}
		} else if (gContextMenu.onTextInput && elem && elem.value) {
			// input, textarea
			return util.filterLookupText(elem.value);
		}
		
		return result;
	};
	
	this.lookupManually=function(eventObj) {
		var x = hd_alias.contextMenuPos[0];
		var y = hd_alias.contextMenuPos[1];
		var popup = new hd_alias.popupHandler();
		var flag=popup.init(new Array(x,y), "", true);
		if (!flag) {
			alert(hd_alias.str("display.error1")+'\n'+hd_alias.str("display.error2"));
			return;
		}
		popup.toggleSearchDisplay(null);
	};
};

hd_alias.MENU = new function() {
	var self=this;
	this.on=null;
	this.off=null;
	this.stOn=null;
	this.stOff=null;
	
	// cache references
	this.init=function(){
		self.on=document.getElementById("handy_dictionary_ext_enable_submenu");
		self.off=document.getElementById("handy_dictionary_ext_disable_submenu");
		
		self.on.hidden=false;
		self.off.hidden=true;
		
		self.stOn=document.getElementById("handy_dictionary_ext_status_bar_on");
		self.stOff=document.getElementById("handy_dictionary_ext_status_bar_off");
		
		self.stOn.hidden=false;
		self.stOff.hidden=true;
	};
	
	// remove all references
	this.clean=function(){
		self.on=null;
		self.off=null;
		self.stOn=null;
		self.stOff=null;
	};
	
	// for each tab, status is maintained and accordingly
	// display on/off menu
	this.updateStatus=function(flag){
		self.on.hidden=flag;
		self.off.hidden=!flag;
		
		self.stOn.hidden=flag;
		self.stOff.hidden=!flag;
	};
};
})();