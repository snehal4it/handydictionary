/* For licence details please refer license.txt */

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

// subscripts
var scriptAr = [
		"lib/common.js",
		"lib/util.js",
		"lib/contextmenu.js",
		"lib/ui.js",
		"handydict.js",
		"overlay.js"
	];
var hdURL = "chrome://handy_dictionary_ext/content/";

// --- Start life cycle methods ---
function startup(data, reason) {
	doLog("start:"+data.installPath + "::" + data.resourceURI);
	
	//preferences
	CustomPref.init(data.installPath);
	
	// load scripts into all window
	var enumerator = Services.wm.getEnumerator("navigator:browser");
    while (enumerator.hasMoreElements()) {
		doLog("Existing Window:");
		var win=enumerator.getNext();
		doStartup(win);
		doLog("count:" + win.gBrowser.browsers.length);
		
		// enable dom listeners for already opened tabs
		updateOpenedTab(win, true);
	}
	
	Services.obs.addObserver(windowListener, "chrome-document-global-created", false);
}

function shutdown(data, reason) {
	//if application is shutting down, everything will be handled automatically
    if (reason == APP_SHUTDOWN) { return; }

    // Remove listener.
    Services.obs.removeObserver(windowListener, "chrome-document-global-created");
	
	// cleanup from each window
	var enumerator = Services.wm.getEnumerator("navigator:browser");
    while (enumerator.hasMoreElements()) {
		doShutdown(enumerator.getNext());
	}
	
	// preferences
	CustomPref.clean();
	
	doLog("Cleanup Completed");
}

function install(data, reason) { }

function uninstall(data, reason) { }
// --- End life cycle methods ---

function doStartup(windowObj) {
	// create/clear existing global object
	windowObj.handy_dictionary_ext_ns_id123 = {};
	for (var i = 0; i < scriptAr.length; i++) {
		Services.scriptloader.loadSubScript(hdURL+scriptAr[i], windowObj);
	}
	
	var hd = windowObj.handy_dictionary_ext_ns_id123;
	hd.OverlayBuilder.init();
	hd.gInit();
}

function updateOpenedTab(windowObj, flag) {
	try {
		windowObj.handy_dictionary_ext_ns_id123.updateOpenedTab(flag);
	} catch (e) {}
}

function doShutdown(windowObj) {
	try {
		if (!windowObj.handy_dictionary_ext_ns_id123) {	return;	}
	} catch (e) { return; }
	
	// first stop all dom listeners
	updateOpenedTab(windowObj, false);
	
	var hd = windowObj.handy_dictionary_ext_ns_id123;
	hd.OverlayBuilder.clean();
	hd.gClean();
	
	delete windowObj.handy_dictionary_ext_ns_id123;
}

var windowListener =
{
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver]),
    observe: function windowListener(win, topic, data)
    {
        win.addEventListener("load", function onLoad(evt)
        {
            var win = evt.currentTarget;
            win.removeEventListener("load", onLoad, false);
            if (win.document.documentElement.getAttribute("windowtype") == "navigator:browser") {
				doStartup(win);
			}
        }, false);
    }
};

//-- start - pref
var CustomPref=new function() {
	var self=this;
	this.prefix="extensions.handy_dictionary_ext.";
	this.branch=null;
	
	this.init=function(path) {
		self.branch=Services.prefs.getDefaultBranch("");
		
		var uri;
		var baseURI = Services.io.newFileURI(path);
		var fileName = "pref.js";

        if (path.isDirectory()) {
            uri = Services.io.newURI("defaults/preferences/" + fileName, null, baseURI).spec;
		} else {
            uri = "jar:" + baseURI.spec + "!/defaults/preferences/" + fileName;
		}
		
		Services.scriptloader.loadSubScript(uri, CustomPref);
		//Services.prefs.savePrefFile(null);
		doLog("Pref:Init");
	}
	
	this.clean=function() {
		var pb = Services.prefs.getDefaultBranch(self.prefix);
		var names = pb.getChildList("");
		for each (var name in names) {
			if (!pb.prefHasUserValue(name))
			pb.deleteBranch(name);
		}
		self.branch=null;
		doLog("Pref:Cleanup");
	}
	
	this.pref=function(name, value) {
		try {
		switch (typeof value)
		{
			case "boolean":
				self.branch.setBoolPref(name, value);
				break;

			case "number":
				self.branch.setIntPref(name, value);
				break;

			case "string":
				var str = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
				str.data = value;
				self.branch.setComplexValue(name, Ci.nsISupportsString, str);
				break;
		}
		} catch(e) {}
	}
};
//-- end - pref

function doLog(aMessage) {
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage("HandyDict: " + aMessage);
}