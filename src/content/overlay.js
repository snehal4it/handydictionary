/* For licence details please refer license.txt */

// Namespace for HandyDictionary
if ("undefined" == typeof(handy_dictionary_ext_ns_id123)) {
	var handy_dictionary_ext_ns_id123 = {};
};

(function() {
var hd_alias=handy_dictionary_ext_ns_id123;

hd_alias.OverlayBuilder=new function() {
	this.init=function() {
		hd_alias.CustomLocale.init();
		
		hd_alias.ContextMenuBuilder.init();
		hd_alias.ToolbarMenuBuilder.init();
		hd_alias.StatusbarMenuBuilder.init();
	}
	
	this.clean=function() {
		hd_alias.ContextMenuBuilder.clean();
		hd_alias.ToolbarMenuBuilder.clean();
		hd_alias.StatusbarMenuBuilder.clean();
		
		hd_alias.CustomLocale.clean();
	}
};

//----- Start UI-----
hd_alias.ContextMenuBuilder = new function() {
	var self=this;
	this.init=function() {
		var contextMenu = document.getElementById("contentAreaContextMenu");
		//var test=document.getElementById("stringbundleset");
		//alert(test);
		if (!contextMenu) { return; }
		
		var options = document.createElement("menu");
		options.setAttribute("id", "handy_dictionary_ext_context_menu_opt");
		options.setAttribute("hidden", "true");
		var optionsLbl=hd_alias.str("ext_short_label") + " " + hd_alias.str("opt_label");
		options.setAttribute("label",  optionsLbl);
		
		var optionsPopup = document.createElement("menupopup");
		
		// Manual lookup
		var lookup = document.createElement("menuitem");
		lookup.setAttribute("label", hd_alias.str("lookup_manual_label"));
		lookup.addEventListener("click",hd_alias.lookupManually,false);
		
		// Preferrences
		var pref = document.createElement("menuitem");
		pref.setAttribute("label", hd_alias.str("pref_label"));
		pref.addEventListener("click",function() {
			window.openDialog('chrome://handy_dictionary_ext/content/preference.xul',
				'handy_dictionary_ext_dialog_pref','chrome,centerscreen');
		},false);
		
		// about
		var howto = document.createElement("menuitem");
		howto.setAttribute("label", hd_alias.str("howto_label"));
		howto.addEventListener("click",function() {
			window.openDialog('chrome://handy_dictionary_ext/content/about.xul',
				'handy_dictionary_ext_dialog_howto','chrome,centerscreen');
		},false);
		
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
	}
	
	this.clean=function() {
		var contextMenu = document.getElementById("contentAreaContextMenu");
		if (!contextMenu) { return; }
		
		var options = contextMenu.querySelector("#handy_dictionary_ext_context_menu_opt");
		contextMenu.removeChild(options);
		
		var linkOptions = contextMenu.querySelector("#handy_dictionary_ext_context_menu_link");
		contextMenu.removeChild(linkOptions);
		
		var wordLookup = contextMenu.querySelector("#handy_dictionary_ext_context_menu_link1");
		contextMenu.removeChild(wordLookup);
	}
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
		
		var mainMenuPopup = document.createElement("menupopup");
		
		// Enable Menu
		var enable = document.createElement("menuitem");
		enable.setAttribute("id", "handy_dictionary_ext_enable_submenu");
		enable.setAttribute("hidden", "false");
		enable.setAttribute("label", hd_alias.str("turnon_label"));
		enable.addEventListener("click",function() {
			hd_alias.changeStateManually(true);
		},false);
		
		// Disable Menu
		var disable = document.createElement("menuitem");
		disable.setAttribute("id", "handy_dictionary_ext_disable_submenu");
		disable.setAttribute("hidden", "true");
		disable.setAttribute("label", hd_alias.str("turnoff_label"));
		disable.addEventListener("click",function() {
			hd_alias.changeStateManually(false);
		},false);
		
		// Preferrences
		var pref = document.createElement("menuitem");
		pref.setAttribute("label", hd_alias.str("pref_label"));
		pref.addEventListener("click",function() {
			window.openDialog('chrome://handy_dictionary_ext/content/preference.xul',
				'handy_dictionary_ext_dialog_pref','chrome,centerscreen');
		},false);
		
		// about
		var howto = document.createElement("menuitem");
		howto.setAttribute("label", hd_alias.str("howto_label"));
		howto.addEventListener("click",function() {
			window.openDialog('chrome://handy_dictionary_ext/content/about.xul',
				'handy_dictionary_ext_dialog_howto','chrome,centerscreen');
		},false);		
		
		mainMenuPopup.appendChild(enable);
		mainMenuPopup.appendChild(disable);
		mainMenuPopup.appendChild(pref);
		mainMenuPopup.appendChild(howto);
		
		mainMenu.appendChild(mainMenuPopup);
		
		// all appended child to be removed in cleanup
		toolbar.appendChild(mainMenu);
	}
	
	this.clean=function() {
		var toolbar = document.getElementById("menu_ToolsPopup");
		if (!toolbar) { return; }
		
		var mainMenu = toolbar.querySelector("#handy_dictionary_ext_main_menu");
		toolbar.removeChild(mainMenu);
	}
};

hd_alias.StatusbarMenuBuilder = new function() {
	var self=this;
	this.init=function() {
		var statusbar = document.getElementById("status-bar");
		if (!statusbar) { return; }
		
		var onBtn = document.createElement("statusbarpanel");
		onBtn.setAttribute("id", "handy_dictionary_ext_status_bar_on");
		var lbl = hd_alias.str("ext_short_label")+hd_alias.str("turnon_label");
		onBtn.setAttribute("label", lbl);
		onBtn.addEventListener("click",function() {
			hd_alias.changeStateManually(true);
		},false);
		onBtn.setAttribute("tooltiptext", hd_alias.str("turnon_tooltip"));
		
		var offBtn = document.createElement("statusbarpanel");
		offBtn.setAttribute("id", "handy_dictionary_ext_status_bar_off");
		var lbl1 = hd_alias.str("ext_short_label")+hd_alias.str("turnoff_label");
		offBtn.setAttribute("label", lbl1);
		offBtn.addEventListener("click",function() {
			hd_alias.changeStateManually(false);
		},false);
		offBtn.setAttribute("tooltiptext", hd_alias.str("turnoff_tooltip"));
		offBtn.setAttribute("hidden", "true");
		
		// all appended child to be removed in cleanup
		statusbar.appendChild(onBtn);
		statusbar.appendChild(offBtn);
	}
	
	this.clean=function() {
		var statusbar = document.getElementById("status-bar");
		if (!statusbar) { return; }
	
		var onBtn = statusbar.querySelector("#handy_dictionary_ext_status_bar_on");
		statusbar.removeChild(onBtn);
		
		var offBtn = statusbar.querySelector("#handy_dictionary_ext_status_bar_off");
		statusbar.removeChild(offBtn);
	}
};
//----- End UI-----
})();