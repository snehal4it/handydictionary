/* For licence details please refer license.txt */

// Namespace for HandyDictionary
if ("undefined" == typeof(handy_dictionary_ext_ns_id123)) {
	var handy_dictionary_ext_ns_id123 = {};
};

// single anonymous block to contain all objects
(function() {
// Constants, shared variables
var hd_alias = handy_dictionary_ext_ns_id123;
hd_alias.varname="handy_dictionary_ext_ns_id123";

// common words to be filtered
hd_alias.filterTextArr = ['a','an','the','as','at','be','on','in','to','from','of','for','by',
	'when','where','what','why','how','am','is','are','and','his','her','thier','will','this','that','not','there',
	'he','she','they','we','do','did','your','you','was','were','has','had','have'];
hd_alias.filterTextExpr=/[\s;:,?'"!#()]/;

// location of context menu
hd_alias.contextMenuPos=[0,0];
// maximum words to be displayed in context menu
hd_alias.cntxItemsLimit=20;

hd_alias.defaultDictURL='http://dictionary.cambridge.org/search/british/direct/?q=';

hd_alias.userDataKey="handy_dict_ext_doc_key987";

//-- start-- Locale handler
hd_alias.CustomLocale = new function() {
	var self=this;
	this.xul="chrome://handy_dictionary_ext/locale/bsui.properties";
	this.hd="chrome://handy_dictionary_ext/locale/handy_dict.properties";
	this.sb=null;
	this.categoryManager=null;
	
	this.init=function() {
		self.categoryManager=Cc["@mozilla.org/categorymanager;1"].getService(Ci.nsICategoryManager);
		self.categoryManager.addCategoryEntry("handy_dictionary_ext_bundle", self.xul, "", false, true);
		self.categoryManager.addCategoryEntry("handy_dictionary_ext_bundle", self.hd, "", false, true);
		self.sb=Services.strings.createExtensibleBundle("handy_dictionary_ext_bundle");
	};
	
	// delete category and flush bundles
	this.clean=function() {
		self.categoryManager.deleteCategoryEntry("handy_dictionary_ext_bundle", self.xul, false);
		self.categoryManager.deleteCategoryEntry("handy_dictionary_ext_bundle", self.hd, false);
		
		Services.strings.flushBundles();
		self.sb=null;
		self.categoryManager=null;
	};
	
	this.str=function(key) {
		var result = "!" + key + "!";
		try {
			result = self.sb.GetStringFromName(key);
		} catch (e) {}
		return result;
	};
};
//-- end-- Locale handler

// handles internationalization
hd_alias.str=hd_alias.CustomLocale.str;

//-- start -- Preference Handler -----
hd_alias.ph=new function(){
	var self=this;
	this.prefs=null;
	this.blockpref="blocklist";
	this.allowpref="allowlist";
	
	this.init=function(){
		self.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.handy_dictionary_ext.");
		// This is only necessary prior to Gecko 13
		if (!("addObserver" in self.prefs)) {
			self.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
		}
		self.prefs.addObserver("", self, false);
	};
	
	this.clean=function(){
		self.prefs.removeObserver("", self);
	};
	
	this.observe=function(aSubject, aTopic, aData){
		switch (aData) {
			case self.blockpref:
			case self.allowpref:
				// updates enable/disable for website menus
				hd_alias.MENU.updatesc();
				break;
		}
	};
	
	//----- preferences used ---------
	this.getDictionaryId=function(){
		var dict_id = 0;
		try {
			dict_id=self.prefs.getIntPref("dict");
		} catch(e) {}
		return dict_id;
	};
	
	this.getDisplayMode=function(){
		var mode = 0;
		try {
			mode=self.prefs.getIntPref("mode");
		} catch(e) {}
		return mode;
	};
	// compact mode fail safe flag
	this.isFailSafe=function(){
		var failsafe_flag = true;
		try {
			failsafe_flag = self.prefs.getBoolPref("failsafe");
		} catch(e) {}
		return failsafe_flag;
	};
	
	// classic mode fail safe flag
	this.isCLFailSafe=function(){
		var failsafe_flag = true;
		try {
			failsafe_flag = self.prefs.getBoolPref("cl_failsafe");
		} catch(e) {}
		return failsafe_flag;
	};
	
	this.isAutoRun=function(){
		var autoRun = true;
		try {
			autoRun = self.prefs.getBoolPref("autorun");
		} catch(e) {}
		return autoRun;
	};
	
	this.getAutoClose=function(){
		var autoClose = 8;
		try {
			autoClose=self.prefs.getIntPref("autoclose");
		} catch(e) {}
		if (autoClose < 0 || autoClose > 60) {
			autoClose = 8;
		}
		return autoClose;
	};
	
	this.getCLAutoClose=function(){
		var autoClose = 12;
		try {
			autoClose=self.prefs.getIntPref("cl_autoclose");
		} catch(e) {}
		if (autoClose < 0 || autoClose > 60) {
			autoClose = 12;
		}
		return autoClose;
	};
	
	// retrieves complex value for sites configuration
	this.getSCComplexValue=function(prefVar){
		return self.prefs.getComplexValue(prefVar, Ci.nsISupportsString).data;
	};
	
	this.setSCComplexValue=function(prefVar, valueStr){
		var updatedVal = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
		updatedVal.data = valueStr;
		self.prefs.setComplexValue(prefVar, Ci.nsISupportsString, updatedVal);
	};
	//----- preferences used ---------
};
//-- end -- Preference Handler -------

//-- start -- Sites Config -------
hd_alias.sc = new function() {
	var self=this;
	this.blockpref=hd_alias.ph.blockpref;
	this.allowpref=hd_alias.ph.allowpref;
	
	this._add=function(prefVar, site) {
		if (site == null || site.trim().length == 0) {
			return;
		}
		site = site.trim().toLowerCase();
		try {
			var resultStr=hd_alias.ph.getSCComplexValue(prefVar);
			var resultAr=JSON.parse(resultStr);
			if (resultAr == null) {
				resultAr = new Array();
			}
			var index = resultAr.indexOf(site);
			if (index == -1) {
				resultAr[resultAr.length] = site;
				self._updatePref(prefVar, resultAr);
			}
		} catch (e) {}
	};
	
	this._updatePref=function(prefVar, resultAr) {
		var valueStr = JSON.stringify(resultAr);
		hd_alias.ph.setSCComplexValue(prefVar, valueStr);
	};
	
	this._remove=function(prefVar, site) {
		if (site == null || site.trim().length == 0) {
			return;
		}
		site = site.trim().toLowerCase();
		try {
			var resultStr=hd_alias.ph.getSCComplexValue(prefVar);
			var resultAr=JSON.parse(resultStr);
			if (resultAr == null || resultAr.length == 0) {
				return;
			}
			var index = resultAr.indexOf(site);
			if (index != -1) {
				resultAr.splice(index,1);
				self._updatePref(prefVar, resultAr);
			}
		} catch (e) {}
	};
	
	this._exist=function(prefVar, site) {
		if (site == null || site.trim().length == 0) {
			return false;
		}
		site = site.trim().toLowerCase();
		
		try {
			var resultStr=hd_alias.ph.getSCComplexValue(prefVar);
			var resultAr=JSON.parse(resultStr);
			if (resultAr == null || resultAr.length == 0) {
				return false;
			}
			var index = resultAr.indexOf(site);
			if (index != -1) {
				return true;
			}
		} catch (e) {}
		return false;
	};
	
	this.block=function(site) {
		self._remove(self.allowpref, site);
		self._add(self.blockpref, site);
	};
	
	this.allow=function(site) {
		self._remove(self.blockpref, site);
		self._add(self.allowpref, site);
	};
	
	this.unblock=function(site) {
		self._remove(self.blockpref, site);
	};
	
	this.clear=function(site) {
		self._remove(self.allowpref, site);
	};
	
	this.isBlocked=function(site) {
		return self._exist(self.blockpref, site);
	};
	
	this.isAllowed=function(site) {
		return self._exist(self.allowpref, site);
	};
	
	// checks whether tool can be enabled for website
	this.isEnabled=function(site) {
		var autoRun = hd_alias.ph.isAutoRun();
		if (autoRun) {
			return !self.isBlocked(site);
		} else {
			return self.isAllowed(site);
		}
	};
};
//-- end -- Sites Config -------
})();