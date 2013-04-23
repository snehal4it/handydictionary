/* For licence details please refer license.txt */

// Namespace for HandyDictionary
if ("undefined" == typeof(handy_dictionary_ext_ns_id123)) {
	var handy_dictionary_ext_ns_id123 = {};
};

(function() {
var hd_alias=handy_dictionary_ext_ns_id123;
var kb_lookup_id = "handy_dictionary_ext_kb_lookup";
var kb_pref_id = "handy_dictionary_ext_kb_pref";
var kb_about_id = "handy_dictionary_ext_kb_about";
var kb_toggle_state_id = "handy_dictionary_ext_kb_toggle_state";

var tb_enable_id = "handy_dictionary_ext_enable_submenu";

var cmd_toggleState = hd_alias.varname+".kbh.handleToggleState(event);";
var cmd_pref = hd_alias.varname+".kbh.handlePreferrences(event);";
var cmd_about = hd_alias.varname+".kbh.handleAboutDialog(event);";
var cmd_manualLookup = hd_alias.varname+".kbh.lookupManually(event);";
var cmd_manualLookup_cntx = hd_alias.varname+".lookupManually(event);";
var cmd_block = hd_alias.varname+".MENU.handleDisableForWebsite(event, this);";
var cmd_allow = hd_alias.varname+".MENU.handleEnableForWebsite(event, this);";

// reference to id used for menus
hd_alias.OId = {
	toolbar_id:"menu_ToolsPopup",
	block_id:"handy_dictionary_ext_block_submenu",
	allow_id:"handy_dictionary_ext_allow_submenu",
	st_block_id:"handy_dictionary_ext_st_block_submenu",
	st_allow_id:"handy_dictionary_ext_st_allow_submenu",
	st_opt_id:"handy_dictionary_ext_status_bar_opt"
};

// single object to handle init and cleanup
// for all overlay elements
hd_alias.OverlayBuilder=new function() {
	this.init=function() {
		hd_alias.CustomLocale.init();
		
		hd_alias.kbh.init();
		hd_alias.ContextMenuBuilder.init();
		hd_alias.ToolbarMenuBuilder.init();
		hd_alias.StatusbarMenuBuilder.init();
	};
	
	this.clean=function() {
		hd_alias.ContextMenuBuilder.clean();
		hd_alias.ToolbarMenuBuilder.clean();
		hd_alias.StatusbarMenuBuilder.clean();
		hd_alias.kbh.clean();
		
		hd_alias.CustomLocale.clean();
	};
};

//----- Start UI-----
hd_alias.ContextMenuBuilder = new function() {
	var self=this;
	this.init=function() {
		var contextMenu = document.getElementById("contentAreaContextMenu");
		if (contextMenu == null) { return; }
		
		var options = document.createElement("menu");
		options.setAttribute("id", "handy_dictionary_ext_context_menu_opt");
		options.setAttribute("hidden", "true");
		var optionsLbl=hd_alias.str("ext_short_label") + " " + hd_alias.str("opt_label");
		options.setAttribute("label",  optionsLbl);
		options.setAttribute("accesskey", "O");
		
		var optionsPopup = document.createElement("menupopup");
		
		// Manual lookup
		var lookup = document.createElement("menuitem");
		lookup.setAttribute("label", hd_alias.str("lookup_manual_label"));
		lookup.setAttribute("key", kb_lookup_id);
		lookup.setAttribute("oncommand", cmd_manualLookup_cntx);
		lookup.setAttribute("accesskey", "m");
		
		// Preferences
		var pref = document.createElement("menuitem");
		pref.setAttribute("label", hd_alias.str("pref_label"));
		pref.setAttribute("key", kb_pref_id);
		pref.setAttribute("oncommand", cmd_pref);
		pref.setAttribute("accesskey", "p");
		
		// about
		var howto = document.createElement("menuitem");
		howto.setAttribute("label", hd_alias.str("howto_label"));
		howto.setAttribute("key", kb_about_id);
		howto.setAttribute("oncommand", cmd_about);
		howto.setAttribute("accesskey", "h");
		
		// word lookup from link
		var linkOptions = document.createElement("menu");
		linkOptions.setAttribute("id", "handy_dictionary_ext_context_menu_link");
		linkOptions.setAttribute("hidden", "true");
		var linkOptLbl=hd_alias.str("ext_short_label") + " " + hd_alias.str("lookup_label");
		linkOptions.setAttribute("label",  linkOptLbl);
		
		// lookup single word
		var wordLookup = document.createElement("menuitem");
		wordLookup.setAttribute("id", "handy_dictionary_ext_context_menu_link1");
		wordLookup.setAttribute("hidden", "true");
		wordLookup.setAttribute("label", linkOptLbl);
		
		optionsPopup.appendChild(lookup);
		optionsPopup.appendChild(pref);
		optionsPopup.appendChild(howto);
		options.appendChild(optionsPopup);
		
		// all appended child to be removed in cleanup
		contextMenu.appendChild(options);
		contextMenu.appendChild(linkOptions);
		contextMenu.appendChild(wordLookup);
	};
	
	this.clean=function() {
		var contextMenu = document.getElementById("contentAreaContextMenu");
		if (!contextMenu) { return; }
		
		var options = contextMenu.querySelector("#handy_dictionary_ext_context_menu_opt");
		contextMenu.removeChild(options);
		
		var linkOptions = contextMenu.querySelector("#handy_dictionary_ext_context_menu_link");
		contextMenu.removeChild(linkOptions);
		
		var wordLookup = contextMenu.querySelector("#handy_dictionary_ext_context_menu_link1");
		contextMenu.removeChild(wordLookup);
	};
};

hd_alias.ToolbarMenuBuilder = new function() {
	var self=this;
	this.init=function() {
		var toolbar = document.getElementById("menu_ToolsPopup");
		if (!toolbar) { return; }
		
		var mainMenu = document.createElement("menu");
		mainMenu.setAttribute("id", "handy_dictionary_ext_main_menu");
		mainMenu.setAttribute("label", hd_alias.str("handy_dictionary_ext_label"));
		mainMenu.setAttribute("insertbefore", "sanitizeSeparator");
		mainMenu.setAttribute("accesskey", "t");
		
		var mainMenuPopup = document.createElement("menupopup");
		
		// Enable Menu
		var enable = document.createElement("menuitem");
		enable.setAttribute("id", tb_enable_id);
		enable.setAttribute("hidden", "false");
		enable.setAttribute("key", kb_toggle_state_id);
		enable.setAttribute("label", hd_alias.str("turnon_label"));
		enable.setAttribute("oncommand", cmd_toggleState);
		enable.setAttribute("accesskey", "o");
		enable.setAttribute("tooltiptext", hd_alias.str("toolbar_enable_tooltip"));
		
		// Disable Menu
		var disable = document.createElement("menuitem");
		disable.setAttribute("id", "handy_dictionary_ext_disable_submenu");
		disable.setAttribute("hidden", "true");
		disable.setAttribute("key", kb_toggle_state_id);
		disable.setAttribute("label", hd_alias.str("turnoff_label"));
		disable.setAttribute("oncommand", cmd_toggleState);
		disable.setAttribute("accesskey", "f");
		disable.setAttribute("tooltiptext", hd_alias.str("toolbar_disable_tooltip"));
		
		// disable for website
		var blockMenu = document.createElement("menuitem");
		blockMenu.setAttribute("id", hd_alias.OId.block_id);
		blockMenu.setAttribute("type", "checkbox");
		blockMenu.setAttribute("hidden", "true");
		//blockMenu.setAttribute("key", kb_toggle_state_id);
		blockMenu.setAttribute("label", hd_alias.str("block_website_prefix"));
		blockMenu.setAttribute("oncommand", cmd_block);
		blockMenu.setAttribute("tooltiptext", hd_alias.str("block_website_tooltip"));
		
		// enable for website
		var allowMenu = document.createElement("menuitem");
		allowMenu.setAttribute("id", hd_alias.OId.allow_id);
		allowMenu.setAttribute("type", "checkbox");
		allowMenu.setAttribute("hidden", "true");
		//allowMenu.setAttribute("key", kb_toggle_state_id);
		allowMenu.setAttribute("label", hd_alias.str("enable_website_prefix"));
		allowMenu.setAttribute("oncommand", cmd_allow);
		allowMenu.setAttribute("tooltiptext", hd_alias.str("enable_website_tooltip"));
		
		// Preferrences
		var pref = document.createElement("menuitem");
		pref.setAttribute("label", hd_alias.str("pref_label"));
		pref.setAttribute("key", kb_pref_id);
		pref.setAttribute("oncommand", cmd_pref);
		pref.setAttribute("accesskey", "p");
		
		// about
		var howto = document.createElement("menuitem");
		howto.setAttribute("label", hd_alias.str("howto_label"));
		howto.setAttribute("key", kb_about_id);
		howto.setAttribute("oncommand", cmd_about);
		howto.setAttribute("accesskey", "h");
		
		mainMenuPopup.appendChild(enable);
		mainMenuPopup.appendChild(disable);
		mainMenuPopup.appendChild(blockMenu);
		mainMenuPopup.appendChild(allowMenu);
		mainMenuPopup.appendChild(pref);
		mainMenuPopup.appendChild(howto);
		
		mainMenu.appendChild(mainMenuPopup);
		
		// all appended child to be removed in cleanup
		toolbar.appendChild(mainMenu);
	};
	
	this.clean=function() {
		var toolbar = document.getElementById("menu_ToolsPopup");
		if (!toolbar) { return; }
		
		var mainMenu = toolbar.querySelector("#handy_dictionary_ext_main_menu");
		toolbar.removeChild(mainMenu);
	};
};

hd_alias.StatusbarMenuBuilder = new function() {
	var self=this;
	this.init=function() {
		var statusbar = document.getElementById("status-bar");
		if (!statusbar) { return; }
		
		var onBtn = document.createElement("statusbarpanel");
		onBtn.setAttribute("id", "handy_dictionary_ext_status_bar_on");
		var lbl = "HDi";
		onBtn.setAttribute("label", lbl);
		onBtn.setAttribute("style", "background-color:red;color:white;font-weight:bold;border:solid 1px white;");
		onBtn.addEventListener("click",function() {
			hd_alias.changeStateManually(true);
		},false);
		onBtn.setAttribute("tooltiptext", hd_alias.str("turnon_tooltip"));
		
		var offBtn = document.createElement("statusbarpanel");
		offBtn.setAttribute("id", "handy_dictionary_ext_status_bar_off");
		offBtn.setAttribute("label", lbl);
		offBtn.setAttribute("style", "background-color:green;color:white;font-weight:bold;border:solid 1px white;");
		offBtn.addEventListener("click",function() {
			hd_alias.changeStateManually(false);
		},false);
		offBtn.setAttribute("tooltiptext", hd_alias.str("turnoff_tooltip"));
		offBtn.setAttribute("hidden", "true");
		
		var optPopup = document.createElement("menupopup");
		optPopup.setAttribute("position", "before_end");
		
		var optBtn = document.createElement("statusbarpanel");
		optBtn.setAttribute("id", hd_alias.OId.st_opt_id);
		var optBtnStyle = "border-top:solid 7px white;border-bottom:solid 7px white;";
		optBtnStyle += "border-left:solid 2px white;border-right:solid 2px white;";
		optBtnStyle += "background-color:black;width:10px;padding:0px;";
		optBtn.setAttribute("style", optBtnStyle);
		optBtn.setAttribute("class", "statusbarpanel-menu-iconic");
		optBtn.addEventListener("mouseover",function(eventObj) {
			//anchor,position,x,y,isContextMenu,attributesOverride,triggerEvent
			optPopup.openPopup(optBtn,"",0,0,false,false,eventObj);
		},false);
		optBtn.setAttribute("hidden", "true");
		
		// disable for website
		var blockMenu = document.createElement("menuitem");
		blockMenu.setAttribute("id", hd_alias.OId.st_block_id);
		blockMenu.setAttribute("type", "checkbox");
		blockMenu.setAttribute("hidden", "true");
		//blockMenu.setAttribute("key", kb_toggle_state_id);
		blockMenu.setAttribute("label", hd_alias.str("block_website_prefix"));
		blockMenu.setAttribute("oncommand", cmd_block);
		blockMenu.setAttribute("tooltiptext", hd_alias.str("block_website_tooltip"));
		
		// enable for website
		var allowMenu = document.createElement("menuitem");
		allowMenu.setAttribute("id", hd_alias.OId.st_allow_id);
		allowMenu.setAttribute("type", "checkbox");
		allowMenu.setAttribute("hidden", "true");
		//allowMenu.setAttribute("key", kb_toggle_state_id);
		allowMenu.setAttribute("label", hd_alias.str("enable_website_prefix"));
		allowMenu.setAttribute("oncommand", cmd_allow);
		allowMenu.setAttribute("tooltiptext", hd_alias.str("enable_website_tooltip"));
		
		optPopup.appendChild(blockMenu);
		optPopup.appendChild(allowMenu);
		optBtn.appendChild(optPopup);
		
		// all appended child to be removed in cleanup
		statusbar.appendChild(onBtn);
		statusbar.appendChild(offBtn);
		statusbar.appendChild(optBtn);
	};
	
	this.clean=function() {
		var statusbar = document.getElementById("status-bar");
		if (!statusbar) { return; }
	
		var onBtn = statusbar.querySelector("#handy_dictionary_ext_status_bar_on");
		statusbar.removeChild(onBtn);
		
		var offBtn = statusbar.querySelector("#handy_dictionary_ext_status_bar_off");
		statusbar.removeChild(offBtn);
		
		var optBtn = statusbar.querySelector("#"+hd_alias.OId.st_opt_id);
		statusbar.removeChild(optBtn);
	};
};

// keyboard shortcuts
hd_alias.kbh = new function() {
	var self=this;
	this.init=function() {
		var keyset = document.getElementById("mainKeyset");
		if (keyset == null) { return; }
		
		var lookupKey = document.createElement("key");
		lookupKey.setAttribute("id", kb_lookup_id);
		lookupKey.setAttribute("modifiers", "accel");
		lookupKey.setAttribute("key", "m");
		lookupKey.setAttribute("oncommand", cmd_manualLookup);
		keyset.appendChild(lookupKey);
		
		var prefKey = document.createElement("key");
		prefKey.setAttribute("id", kb_pref_id);
		prefKey.setAttribute("modifiers", "alt");
		prefKey.setAttribute("key", "q");
		prefKey.setAttribute("oncommand", cmd_pref);
		keyset.appendChild(prefKey);
		
		var aboutKey = document.createElement("key");
		aboutKey.setAttribute("id", kb_about_id);
		aboutKey.setAttribute("modifiers", "alt,accel");
		aboutKey.setAttribute("keycode", "h");
		aboutKey.setAttribute("oncommand", cmd_about);
		keyset.appendChild(aboutKey);
		
		var toggleStateKey = document.createElement("key");
		toggleStateKey.setAttribute("id", kb_toggle_state_id);
		toggleStateKey.setAttribute("modifiers", "alt");
		toggleStateKey.setAttribute("key", "o");
		toggleStateKey.setAttribute("oncommand", cmd_toggleState);
		keyset.appendChild(toggleStateKey);
		
		// fix to apply changes without restart
		keyset.parentNode.insertBefore(keyset, keyset.nextSibling);
	};
	
	this.clean=function() {
		var keyset = document.getElementById("mainKeyset");
		if (keyset == null) { return; }
		
		var lookupKey = keyset.querySelector("#"+kb_lookup_id);
		keyset.removeChild(lookupKey);
		
		var prefKey = keyset.querySelector("#"+kb_pref_id);
		keyset.removeChild(prefKey);
		
		var aboutKey = keyset.querySelector("#"+kb_about_id);
		keyset.removeChild(aboutKey);
		
		var toggleStateKey = keyset.querySelector("#"+kb_toggle_state_id);
		keyset.removeChild(toggleStateKey);
	};
	
	this.lookupManually=function(eventObj) {
		var x = content.innerWidth/3 + content.pageXOffset;
		var y = content.innerHeight/3 + content.pageYOffset;
		hd_alias.contextMenuPos=new Array(x, y);
		hd_alias.lookupManually(eventObj);
	};
	
	this.handlePreferrences=function(eventObj) {
		window.openDialog('chrome://handy_dictionary_ext/content/preference.xul',
				'handy_dictionary_ext_dialog_pref','chrome,centerscreen');
	};
	
	this.handleAboutDialog=function(eventObj) {
		window.openDialog('chrome://handy_dictionary_ext/content/about.xul',
				'handy_dictionary_ext_dialog_howto','chrome,centerscreen');
	};
	
	this.handleToggleState=function(eventObj) {
		var toolbar = document.getElementById("menu_ToolsPopup");
		if (!toolbar) { return; }
		
		var enableMenu = toolbar.querySelector("#"+tb_enable_id);
		if (enableMenu != null && enableMenu.hidden != null) {
			hd_alias.changeStateManually(!enableMenu.hidden);
		}
	};
};
//----- End UI-----
})();