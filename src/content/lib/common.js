/* For licence details please refer license.txt */

// Namespace for HandyDictionary
if ("undefined" == typeof(handy_dictionary_ext_ns_id123)) {
	var handy_dictionary_ext_ns_id123 = {};
};

// single anonymous block to contain all objects
(function() {
// Constants, shared variables
var hd_alias = handy_dictionary_ext_ns_id123;

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
})();