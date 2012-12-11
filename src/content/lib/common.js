/* For licence details please refer license.txt */

// Namespace for HandyDictionary
if ("undefined" == typeof(handy_dictionary_ext_ns_id123)) {
	var handy_dictionary_ext_ns_id123 = {};
};

// single anonymous block to contain all objects
(function() {
// Constants, shared variables
var hd_alias = handy_dictionary_ext_ns_id123;
hd_alias.originalVarName="handy_dictionary_ext_ns_id123";

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

// internationalization
hd_alias.hdBundle=null;

hd_alias.userDataKey="handy_dict_ext_doc_key987";
})();