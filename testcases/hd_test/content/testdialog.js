var hd_alias=null;

function init() {
	hd_alias = window.arguments[0];
	
}

function onExit() {
	hd_alias.executeTest();
	return true;
}