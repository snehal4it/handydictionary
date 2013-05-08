/* For licence details please refer license.txt */

var modifiersObj = {"--Select--":"", "Alt":"alt", "Control":"accel", "Shift":"shift"};
// for mac users alt is mapped to option key and control is mapped to Command key
var modifiersMacObj = {"--Select--":"", "Option":"alt", "Command":"accel", "Shift":"shift"};

var keyFilterAr = ["VK_SHIFT", "VK_CONTROL", "VK_ALT", "VK_WIN"];
var ctrlSuffix = "_ctrl";

// keycode - keyname mapping
var keyMap=[];

var locale = null;
var util = null;

// default key sequences
var defaultKeyObj=null;
// current key sequences
var keyConfig = null;
var nonWindowOS=false;

function init() {
	updateMacNotice();
	initKeyMap();
	
	util = window.arguments[0];
	locale = window.arguments[1];
	keyConfig = util.getKeyConfig();
	defaultKeyObj = util.getDefaultKeyConfig();
	
	for (key in keyConfig) {
		var keyValAr = keyConfig[key];
		var modAr = keyValAr[0];
		
		var ctrlElem = document.getElementById(key+ctrlSuffix);
		for(var k=0;k<3;k++){
			var menulist = document.createElement("menulist");
			var menulistTooltip=locale("cust_key_dropdown_tooltip")+ " " + (k+1);
			menulist.setAttribute("tooltiptext", menulistTooltip);
			var menupopup = document.createElement("menupopup");
			
			menulist.appendChild(menupopup);
			ctrlElem.appendChild(menulist);
			for (lbl in modifiersObj) {
				var menuItem = menulist.appendItem(lbl, modifiersObj[lbl], "");
				if (nonWindowOS) {
					menuItem.setAttribute("style", "font-size:11px;font-family:verdana;");
				}
				if (modifiersObj[lbl] == modAr[k]) {
					menulist.selectedItem=menuItem;
				}
			}
			if (menulist.selectedIndex == -1) {
				menulist.selectedIndex = 0;
			}
			menulist.setAttribute("oncommand","updateShortcut(this.parentNode);");
			if (nonWindowOS) {
				menulist.setAttribute("style", "margin:0px;font-size:11px;font-family:verdana;");
			}
		}
		var txtElem = document.createElement("textbox");
		txtElem.setAttribute("size", "12");
		txtElem.setAttribute("value", keyValAr[1]);
		txtElem.setAttribute("tooltiptext", locale("cust_key_txt_field_tooltip"));
		txtElem.addEventListener("keydown", displayKey, false);
		txtElem.addEventListener("click", function(eventObj){
			eventObj.target.value="";
			updateButtonStatus(eventObj.target.parentNode);
		}, false);
		if (nonWindowOS) {
			txtElem.setAttribute("style", "margin:0px;");
		}
		ctrlElem.appendChild(txtElem);
		
		var resetBtn = document.createElement("button");
		resetBtn.setAttribute("label", locale("cust_key_reset_btn"));
		resetBtn.setAttribute("tooltiptext", locale("cust_key_reset_btn_tooltip"));
		resetBtn.setAttribute("oncommand", "resetKeySequence(this.parentNode);");
		if (nonWindowOS) {
			resetBtn.setAttribute("style", "margin:0px;");
		}
		ctrlElem.appendChild(resetBtn);
		
		var clearBtn = document.createElement("button");
		clearBtn.setAttribute("label", locale("cust_key_clear_btn"));
		clearBtn.setAttribute("tooltiptext", locale("cust_key_clear_tooltip"));
		clearBtn.setAttribute("oncommand", "clearKeySequence(this.parentNode);");
		if (nonWindowOS) {
			clearBtn.setAttribute("style", "margin:0px;");
		}
		ctrlElem.appendChild(clearBtn);
		
		updateButtonStatus(ctrlElem);
	}
}

// for mac platform use different set of modifiers
function updateMacNotice() {
	try {
		if (window.navigator.platform.search("Mac") == 0) {
			modifiersObj=modifiersMacObj;
		}
		
		if (window.navigator.platform.search("Win") == -1) {
			// fix for non-window system where font size is larger
			nonWindowOS = true;
			var custKeyCont=document.getElementById("handy_dictionary_ext_cust_key_container");
			custKeyCont.style.fontSize="11px";
			custKeyCont.style.fontFamily="verdana";
			custKeyCont.style.height="330px";
		}
	} catch(e) {}
}

// display key-sequences in comma separated form
function getReadableValue(keyValAr) {
	var tempAr = new Array();
	var modAr = keyValAr[0];
	for (var i=0;i<modAr.length;i++){
		if (modAr[i] != null && modAr[i] != "") {
			tempAr.push(modAr[i]);
		}
	}
	if (keyValAr[1] != null && keyValAr[1] != "") {
		tempAr.push(keyValAr[1]);
	}
	return tempAr;
}

// retrieves and init keycode to keyname mapping
function initKeyMap() {
	for (var key in KeyEvent) {
		keyMap[KeyEvent[key]] = key.replace("DOM_", "");
	}
}

// listen and display key selected by user in text-field
function displayKey(eventObj) {
	eventObj.stopPropagation();
	eventObj.preventDefault();
	
	var keyName = keyMap[eventObj.keyCode];
	if (!keyName || keyFilterAr.indexOf(keyName) != -1) {
		alert(keyName + " " + locale("cust_key_txt_field_err"));
		return;
	}
	// if field is not empty then use backspace to clear the field
	if (keyName == "VK_BACK_SPACE" && eventObj.target.value != "") {
		eventObj.target.value="";
		updateButtonStatus(eventObj.target.parentNode);
		return;
	}
	// display numbers and letters in as is form
	if ((eventObj.keyCode >= 48 && eventObj.keyCode <= 57)
		|| (eventObj.keyCode >= 65 && eventObj.keyCode <= 90)) {
		eventObj.target.value=keyName.replace("VK_", "");
	} else {
		// display other key using VK_ prefix
		eventObj.target.value=keyName;
	}
	
	updateShortcut(eventObj.target.parentNode);
}

// check and clear drop-down if duplicate modifiers selected
function updateModifierControls(hBoxElem) {
	var modAr = hBoxElem.getElementsByTagName("menulist");
	if (modAr[0].selectedIndex > 0) {
		if (modAr[0].selectedIndex == modAr[1].selectedIndex) {
			modAr[1].selectedIndex=0;
		}
		if (modAr[0].selectedIndex == modAr[2].selectedIndex) {
			modAr[2].selectedIndex=0;
		}
	}
	if (modAr[1].selectedIndex > 0
		&& modAr[1].selectedIndex == modAr[2].selectedIndex) {
		modAr[2].selectedIndex=0;
	}
	return true;
}

// update shortcut of given command
function updateShortcut(hBoxElem) {
	updateModifierControls(hBoxElem);
	updateButtonStatus(hBoxElem);
}

function getKeyForControl(hBoxElem) {
	var idAttr = hBoxElem.getAttribute("id");
	return idAttr.replace(ctrlSuffix, "");
}

// set status for "reset" and "clear" button depending upon key-sequence
function updateButtonStatus(hBoxElem) {
	var modAr = hBoxElem.getElementsByTagName("menulist");
	var keyAr = hBoxElem.getElementsByTagName("textbox");
	var btnAr = hBoxElem.getElementsByTagName("button");
	if (modAr[0].selectedIndex <= 0 && modAr[1].selectedIndex <= 0
			&& modAr[2].selectedIndex <= 0 && keyAr[0].value == "") {
		btnAr[1].setAttribute("hidden", "true");
	} else {
		btnAr[1].setAttribute("hidden", "false");
	}
	
	var flag = isDefaultKeySequence(hBoxElem);
	btnAr[0].hidden=flag;
	
	var key = getKeyForControl(hBoxElem);
	var updatedStatusCtrl = document.getElementById(key);
	var currentKeyAr = getKeySequence(hBoxElem);
	var updatedKeyAr = getReadableValue(currentKeyAr);
	if (updatedKeyAr.length == 0) {
		updatedStatusCtrl.value="Disabled";
		updatedStatusCtrl.style.color="red";
	} else {
		updatedStatusCtrl.value=updatedKeyAr;
		updatedStatusCtrl.style.color="black";
	}
}

// disable shortcut
function clearKeySequence(hBoxElem) {
	var modAr = hBoxElem.getElementsByTagName("menulist");
	var keyAr = hBoxElem.getElementsByTagName("textbox");
	modAr[0].selectedIndex=0;
	modAr[1].selectedIndex=0;
	modAr[2].selectedIndex=0;
	keyAr[0].value="";
	
	updateButtonStatus(hBoxElem);
}

// reset to default value
function resetKeySequence(hBoxElem) {
	var idAttr = getKeyForControl(hBoxElem);
	var keyValAr = defaultKeyObj[idAttr];
	if (keyValAr == null) {return false;}
	var defaultModAr = keyValAr[0];
	var defaultKey = keyValAr[1];
	
	var modAr = hBoxElem.getElementsByTagName("menulist");
	var keyAr = hBoxElem.getElementsByTagName("textbox");

	for (var j = 0; j < modAr.length; j++) {
		if (defaultModAr[j] == null || defaultModAr[j] == "") {
			modAr[j].selectedIndex=0;
			continue;
		}
		for (var i = 0; i < modAr[j].itemCount; i++) {
			var menuitem = modAr[j].getItemAtIndex(i);
			if (menuitem.value == defaultModAr[j]) {
				modAr[j].selectedIndex=i;
			}
		}
	}
	keyAr[0].value=defaultKey;
	updateButtonStatus(hBoxElem);
}

// gets changed value of key-sequence
function getKeySequence(hBoxElem) {
	var modAr = hBoxElem.getElementsByTagName("menulist");
	var keyAr = hBoxElem.getElementsByTagName("textbox");
	
	var tempModAr = new Array();
	for (var i=0;i<modAr.length;i++){
		if (modAr[i].selectedIndex > 0) {
			tempModAr.push(modAr[i].selectedItem.value);
		}
	}
	var tempKey = keyAr[0].value;
	return [tempModAr, tempKey];
}

function isDefaultKeySequence(hBoxElem) {
	var idAttr = getKeyForControl(hBoxElem);
	var keyValAr = defaultKeyObj[idAttr];
	
	var currentKeyAr = getKeySequence(hBoxElem);
	
	return compareKeySequence(keyValAr, currentKeyAr);
}

function compareKeySequence(keyAr1, keyAr2) {
	if (keyAr1 == null || keyAr2 == null) {
		return false;
	}
	var modAr1 = keyAr1[0];
	var modAr2 = keyAr2[0];
	
	if (modAr1.length != modAr2.length) {
		return false;
	}
	
	for (var i=0;i<modAr1.length;i++) {
		if (modAr1[i] != modAr2[i]) {
			return false;
		}
	}
	return keyAr1[1] == keyAr2[1];
}

// persist user changes only if OK button is clicked
function saveChanges() {
	var updatedKeyConfig={};
	var updateFlag=false;
	for (key in keyConfig) {
		var keyValAr = keyConfig[key];
		
		var ctrlElem = document.getElementById(key+ctrlSuffix);
		var currentKeyAr = getKeySequence(ctrlElem);
		
		var modFlag = compareKeySequence(keyValAr, currentKeyAr);
		// include only modified entries
		if (!modFlag) {
			updatedKeyConfig[key]=currentKeyAr;
			updateFlag = true;
		}
	}
	
	// update preference only if keys are changed
	if (updateFlag) {
		util.setKeyConfig(updatedKeyConfig);
	}
	return true;
}