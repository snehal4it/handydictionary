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

function startup(data, reason) {
	
	myDump("start:"+data.installPath + "::" + data.resourceURI);
	
	// load scripts into all window
	var enumerator = Services.wm.getEnumerator("navigator:browser");
    while (enumerator.hasMoreElements()) {
		doStartup(enumerator.getNext());
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
}

function install(data, reason) {

}

function uninstall(data, reason) {

}

//---------

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

function doShutdown(windowObj) {
	try {
		if (!windowObj.handy_dictionary_ext_ns_id123) {	return;	}
	} catch (e) { return; }
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
                //myDump(win);
				doStartup(win);
			}
        }, false);
    }
};

function myDump(aMessage) {
  var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage("HandyDict: " + aMessage);
}