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
hd_alias.prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

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

//-- start -- Sites Config -------
hd_alias.sc = new function() {
	var self=this;
	this.blockpref="extensions.handy_dictionary_ext.blocklist";
	this.allowpref="extensions.handy_dictionary_ext.allowlist";
	this.autopref="extensions.handy_dictionary_ext.autorun";
	
	this._add=function(prefVar, site) {
		if (site == null || site.trim().length == 0) {
			return;
		}
		site = site.trim().toLowerCase();
		//try {
			var resultStr=hd_alias.prefManager.getComplexValue(prefVar, Ci.nsISupportsString).data;
			var resultAr=JSON.parse(resultStr);
			if (resultAr == null) {
				resultAr = new Array();
			}
			var index = resultAr.indexOf(site);
			if (index == -1) {
				resultAr[resultAr.length] = site;
				self._updatePref(prefVar, resultAr);
			}
		//} catch (e) {}
	};
	
	this._updatePref=function(prefVar, resultAr) {
		var updatedVal = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
		updatedVal.data = JSON.stringify(resultAr);
		hd_alias.prefManager.setComplexValue(prefVar, Ci.nsISupportsString, updatedVal);
	};
	
	this._remove=function(prefVar, site) {
		if (site == null || site.trim().length == 0) {
			return;
		}
		site = site.trim().toLowerCase();
		//try {
			var resultStr=hd_alias.prefManager.getComplexValue(prefVar, Ci.nsISupportsString).data;
			var resultAr=JSON.parse(resultStr);
			if (resultAr == null || resultAr.length == 0) {
				return;
			}
			var index = resultAr.indexOf(site);
			if (index != -1) {
				resultAr.splice(index,1);
				self._updatePref(prefVar, resultAr);
			}
		//} catch (e) {}
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
	
	this.process=function(site) {
		
	};
};
//-- end -- Sites Config -------
})();