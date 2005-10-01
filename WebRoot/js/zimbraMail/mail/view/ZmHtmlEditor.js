/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.1
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.1 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite.
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2005 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

/** 
 * Html Editor
 *
 * @author Ross Dargahi
 */
function ZmHtmlEditor(parent, className, posStyle, content, mode) {
	if (arguments.length == 0) return;
	className = className || "ZmHtmlEditor";
	
	DwtHtmlEditor.call(this, parent, className, posStyle, content, mode, "/zimbra/public/blank.html");

	this.addStateChangeListener(new AjxListener(this, this._rteStateChangeListener));	
	
	var settings = this.parent._appCtxt.getSettings();
	settings.addChangeListener(new AjxListener(this, this._settingsChangeListener));
};

ZmHtmlEditor.prototype = new DwtHtmlEditor();
ZmHtmlEditor.prototype.constructor = ZmHtmlEditor;


// Consts
ZmHtmlEditor._VALUE = "value";

ZmHtmlEditor.prototype.isHtmlEditingSupported =
function() {
	var isSupported = DwtHtmlEditor.prototype.isHtmlEditingSupported.call(this);
	if (isSupported) {
		// browser supports html edit but check if user pref allows it
		isSupported = this.parent._appCtxt.get(ZmSetting.HTML_COMPOSE_ENABLED);
	}
	
	return isSupported;
};

ZmHtmlEditor.prototype.setMode = 
function(mode, convert) {
	DwtHtmlEditor.prototype.setMode.call(this, mode, convert);
	
	// show/hide toolbars based on mode
	this._toolbar1.setVisible(mode == DwtHtmlEditor.HTML);
	this._toolbar2.setVisible(mode == DwtHtmlEditor.HTML);
};

ZmHtmlEditor.prototype.getBodyFieldId = 
function() {
	return this._mode == DwtHtmlEditor.HTML ? this._iFrameId : this._textAreaId;
};

// returns the text version of the html message
ZmHtmlEditor.prototype.getTextVersion = 
function() {
	return this._mode == DwtHtmlEditor.HTML
		? this._convertHtml2Text()
		: this.getContent();
};

// Re-sets design mode for buggy gecko-based browser
ZmHtmlEditor.prototype.reEnableDesignMode = 
function() {
	if (AjxEnv.isGeckoBased) {
		this._enableDesignMode([this._getIframeDoc()]);
	}
};

ZmHtmlEditor.prototype.addEventCallback = 
function(callback) {
	this._eventCallback = callback;
}

ZmHtmlEditor.prototype._initialize = 
function() {
	this._createToolBar1(this);
	this._createToolBar2(this);

	DwtHtmlEditor.prototype._initialize.call(this);
};

ZmHtmlEditor.prototype._styleListener =
function(ev) {
	this.setStyle(ev._args.newValue);
};

ZmHtmlEditor.prototype._fontNameListener =
function(ev) {
	this.setFont(ev._args.newValue);
};

ZmHtmlEditor.prototype._fontSizeListener =
function(ev) {
	this.setFont(null, null, ev._args.newValue);
};

ZmHtmlEditor.prototype._directionListener =
function(ev) {
	this.setTextDirection(ev.item.getData(ZmHtmlEditor._VALUE));
};

ZmHtmlEditor.prototype._indentListener =
function(ev) {
	this.setIndent(ev.item.getData(ZmHtmlEditor._VALUE));
};

ZmHtmlEditor.prototype._insElementListener =
function(ev) {
	this.insertElement(ev.item.getData(ZmHtmlEditor._VALUE));
};

ZmHtmlEditor.prototype._justificationListener =
function(ev) {
	this.setJustification(ev.item.getData(ZmHtmlEditor._VALUE));
};

ZmHtmlEditor.prototype._fontStyleListener =
function(ev) {
	this.setFont(null, ev.item.getData(ZmHtmlEditor._VALUE));
};

ZmHtmlEditor.prototype._fontColorListener =
function(ev) {
	this.setFont(null, null, null, ev.detail, null);
};

ZmHtmlEditor.prototype._fontHiliteListener =
function(ev) {
	this.setFont(null, null, null, null, ev.detail);
};

ZmHtmlEditor.prototype._createToolBar1 =
function(parent) {
	var tb = this._toolbar1 = new DwtToolBar(parent, "ToolBar", DwtControl.RELATIVE_STYLE, 2);
	tb.setVisible(this._mode == DwtHtmlEditor.HTML);

	this._createStyleSelect(tb);
	this._createFontFamilySelect(tb);
	this._createFontSizeMenu(tb);
	new DwtControl(tb, "vertSep");
	
	var listener = new AjxListener(this, this._fontStyleListener);
	var b = this._boldButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("Bold");
	b.setToolTipContent(ZmMsg.boldText);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.BOLD_STYLE);
	b.addSelectionListener(listener);
	
	b = this._italicButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("Italics");
	b.setToolTipContent(ZmMsg.italicText);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.ITALIC_STYLE);
	b.addSelectionListener(listener);
	
	b = this._underlineButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("Underline");
	b.setToolTipContent(ZmMsg.underlineText);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.UNDERLINE_STYLE);
	b.addSelectionListener(listener);
	
	b = this._strikeThruButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("StrikeThru");
	b.setToolTipContent(ZmMsg.strikeThruText);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.STRIKETHRU_STYLE);
	b.addSelectionListener(listener);

	b = this._superscriptButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("SuperScript");
	b.setToolTipContent(ZmMsg.superscript);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.SUPERSCRIPT_STYLE);
	b.addSelectionListener(listener);
	
	b = this._subscriptButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("Subscript");
	b.setToolTipContent(ZmMsg.subscript);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.SUBSCRIPT_STYLE);
	b.addSelectionListener(listener);
};

ZmHtmlEditor.prototype._createToolBar2 =
function(parent) {
	var tb = this._toolbar2 = new DwtToolBar(parent, "ToolBar", DwtControl.RELATIVE_STYLE, 2);
	tb.setVisible(this._mode == DwtHtmlEditor.HTML);
	
	var listener = new AjxListener(this, this._justificationListener);
	var b = this._leftJustifyButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("LeftJustify");
	b.setToolTipContent(ZmMsg.leftJustify);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.JUSTIFY_LEFT);
	b.addSelectionListener(listener);
	
	b = this._centerJustifyButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("CenterJustify");
	b.setToolTipContent(ZmMsg.centerJustify);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.JUSTIFY_CENTER);
	b.addSelectionListener(listener);

	b = this._rightJustifyButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("RightJustify");
	b.setToolTipContent(ZmMsg.rightJustify);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.JUSTIFY_RIGHT);
	b.addSelectionListener(listener);
	
	b = this._fullJustifyButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setImage("FullJustify");
	b.setToolTipContent(ZmMsg.justify);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.JUSTIFY_FULL);
	b.addSelectionListener(listener);
	
	new DwtControl(tb, "vertSep");

	var insElListener = new AjxListener(this, this._insElementListener);
	b = this._listButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE,  "TBButton");
	b.setToolTipContent(ZmMsg.bulletedList);
	b.setImage("BulletedList");
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.UNORDERED_LIST);
	b.addSelectionListener(insElListener);
	
	b = this._numberedListButton = new DwtButton(tb, DwtButton.TOGGLE_STYLE, "TBButton");
	b.setToolTipContent(ZmMsg.numberedList);
	b.setImage("NumberedList");
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.ORDERED_LIST);
	b.addSelectionListener(insElListener);

	listener = new AjxListener(this, this._indentListener);	
	b = this._outdentButton = new DwtButton(tb, null, "TBButton");
	b.setToolTipContent(ZmMsg.outdent);
	b.setImage("Outdent");
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.OUTDENT);
	b.addSelectionListener(insElListener);
	
	b = this._indentButton = new DwtButton(tb, null, "TBButton");
	b.setToolTipContent(ZmMsg.indent);
	b.setImage("Indent");
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.INDENT);
	b.addSelectionListener(insElListener);
	
	new DwtControl(tb, "vertSep");

	b = this._fontColorButton = new DwtButton(tb, null, "TBButton");
	b.setImage("FontColor");
	b.setToolTipContent(ZmMsg.fontColor);
	var m = new DwtMenu(b, DwtMenu.COLOR_PICKER_STYLE);
	var cp = new DwtColorPicker(m);
	cp.addSelectionListener(new AjxListener(this, this._fontColorListener));
	b.setMenu(m);
	
	b = this._fontBackgroundButton = new DwtButton(tb, null, "TBButton");
	b.setImage("FontBackground");
	b.setToolTipContent(ZmMsg.fontBackground);
	m = new DwtMenu(b, DwtMenu.COLOR_PICKER_STYLE);
	cp = new DwtColorPicker(m);
	cp.addSelectionListener(new AjxListener(this, this._fontHiliteListener));
	b.setMenu(m);
	
	new DwtControl(tb, "vertSep");
	
	b = this._horizRuleButton = new DwtButton(tb, null, "TBButton");
	b.setImage("HorizRule");
	b.setToolTipContent(ZmMsg.horizRule);
	b.setData(ZmHtmlEditor._VALUE, DwtHtmlEditor.HORIZ_RULE);
	b.addSelectionListener(insElListener);
};

ZmHtmlEditor.prototype._createStyleSelect =
function(tb) {
	var listener = new AjxListener(this, this._styleListener);
	var s = this._styleSelect = new DwtSelect(tb, null);
	s.addChangeListener(listener);
	
	s.addOption("Normal", true, DwtHtmlEditor.PARAGRAPH);
	s.addOption("Heading 1", false, DwtHtmlEditor.H1);
	s.addOption("Heading 2", false, DwtHtmlEditor.H2);
	s.addOption("Heading 3", false, DwtHtmlEditor.H3);
	s.addOption("Heading 4", false, DwtHtmlEditor.H4);
	s.addOption("Heading 5", false, DwtHtmlEditor.H5);
	s.addOption("Heading 6", false, DwtHtmlEditor.H6);
	s.addOption("Address", false, DwtHtmlEditor.ADDRESS);
	s.addOption("Preformatted", false, DwtHtmlEditor.PREFORMATTED);
};

ZmHtmlEditor.prototype._createFontFamilySelect =
function(tb) {
	var listener = new AjxListener(this, this._fontNameListener);
	var s = this._fontFamilySelect = new DwtSelect(tb, null);
	s.addChangeListener(listener);
	
	var fontFamily = this.parent._appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);
	
	s.addOption("Arial", fontFamily == "Arial", DwtHtmlEditor.ARIAL);
	s.addOption("Times New Roman", fontFamily == "Times New Roman", DwtHtmlEditor.TIMES);
	s.addOption("Courier New", fontFamily == "Courier New", DwtHtmlEditor.COURIER);
	s.addOption("Verdana", fontFamily == "Verdana", DwtHtmlEditor.VERDANA);
};

ZmHtmlEditor.prototype._createFontSizeMenu =
function(tb) {
	var listener = new AjxListener(this, this._fontSizeListener);
	var s = this._fontSizeSelect = new DwtSelect(tb, null);
	s.addChangeListener(listener);
	
	var fontSize = this.parent._appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);

	s.addOption("1 (8pt)", fontSize == "8pt", 1);
	s.addOption("2 (10pt)", fontSize == "10pt", 2);
	s.addOption("3 (12pt)", fontSize == "12pt", 3);
	s.addOption("4 (14pt)", fontSize == "14pt", 4);
	s.addOption("5 (18pt)", fontSize == "18pt", 5);
	s.addOption("6 (24pt)", fontSize == "24pt", 6);
	s.addOption("7 (36pt)", fontSize == "36pt", 7);
};

ZmHtmlEditor.prototype._rteStateChangeListener =
function(ev) {

	this._boldButton.setToggled(ev.isBold);
	this._underlineButton.setToggled(ev.isUnderline);
	this._italicButton.setToggled(ev.isItalic);
	this._strikeThruButton.setToggled(ev.isStrikeThru);
	this._subscriptButton.setToggled(ev.isSubscript);
	this._superscriptButton.setToggled(ev.isSuperscript);
	
	this._numberedListButton.setToggled(ev.isOrderedList);
	this._listButton.setToggled(ev.isUnorderedList);

	if (ev.style)
		this._styleSelect.setSelectedValue(ev.style);

	if (ev.fontFamily)
		this._fontFamilySelect.setSelectedValue(ev.fontFamily);
		
	if (ev.fontSize && ev.fontFamily != "")
		this._fontSizeSelect.setSelectedValue(ev.fontSize);
	
	if (ev.justification == DwtHtmlEditor.JUSTIFY_LEFT) {
		this._leftJustifyButton.setToggled(true);
		this._centerJustifyButton.setToggled(false);
		this._rightJustifyButton.setToggled(false);
		this._fullJustifyButton.setToggled(false);		
	} else if (ev.justification == DwtHtmlEditor.JUSTIFY_CENTER) {
		this._leftJustifyButton.setToggled(false);
		this._centerJustifyButton.setToggled(true);
		this._rightJustifyButton.setToggled(false);
		this._fullJustifyButton.setToggled(false);		
	} else if (ev.justification == DwtHtmlEditor.JUSTIFY_RIGHT) {
		this._leftJustifyButton.setToggled(false);
		this._centerJustifyButton.setToggled(false);
		this._rightJustifyButton.setToggled(true);
		this._fullJustifyButton.setToggled(false);		
	} else if (ev.justification == DwtHtmlEditor.JUSTIFY_FULL) {
		this._leftJustifyButton.setToggled(false);
		this._centerJustifyButton.setToggled(false);
		this._rightJustifyButton.setToggled(false);
		this._fullJustifyButton.setToggled(true);		
	}
};

ZmHtmlEditor.prototype._settingsChangeListener = 
function(ev) {
	var setting = ev.source;
	if (setting.id == ZmSetting.COMPOSE_INIT_FONT_COLOR ||
		setting.id == ZmSetting.COMPOSE_INIT_FONT_FAMILY ||
		setting.id == ZmSetting.COMPOSE_INIT_FONT_SIZE)
	{
		this._initialStyle = this._getInitialStyle(true);
		var iframeDoc = this._getIframeDoc();
		var initHtml = "<html><head>" + this._getInitialStyle(false) + "</head><body></body></html>";
		iframeDoc.open();
		iframeDoc.write(initHtml);
		iframeDoc.close();

		// update DwtSelect to reflect to new font size or family
		if (setting.id == ZmSetting.COMPOSE_INIT_FONT_FAMILY) {
			var fontfamily = this.parent._appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);
			var selectedValue = null;
			if (fontfamily == "Arial") 					selectedValue = DwtHtmlEditor.ARIAL;
			else if (fontfamily == "Times New Roman") 	selectedValue = DwtHtmlEditor.TIMES;
			else if (fontfamily == "Courier New") 		selectedValue = DwtHtmlEditor.COURIER;
			else if (fontfamily == "Verdana") 			selectedValue = DwtHtmlEditor.VERDANA;
			if (selectedValue)
				this._fontFamilySelect.setSelectedValue(selectedValue);
		} else if (setting.id == ZmSetting.COMPOSE_INIT_FONT_SIZE) {
			var fontsize = this.parent._appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);
			var selectedValue = null;
			if (fontsize == "8pt") 		 selectedValue = 1;
			else if (fontsize == "10pt") selectedValue = 2;
			else if (fontsize == "12pt") selectedValue = 3;
			else if (fontsize == "14pt") selectedValue = 4;
			else if (fontsize == "18pt") selectedValue = 5;
			else if (fontsize == "24pt") selectedValue = 6;
			else if (fontsize == "36pt") selectedValue = 7;
			if (selectedValue)
				this._fontSizeSelect.setSelectedValue(selectedValue);
		}
	}
};

ZmHtmlEditor.prototype._handleEditorEvent = 
function(ev) {
	var rv = this._eventCallback ? this._eventCallback.run(ev) : true;
	if (rv)
		rv = DwtHtmlEditor.prototype._handleEditorEvent.call(this, ev);
	return rv;
};

ZmHtmlEditor.prototype._getInitialFontFamily = 
function() {
	// get font family user preference
	var familyPref = this.parent._appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_FAMILY);
	familyPref = familyPref.toLowerCase(); // normalize value
	
	var fontFamily = DwtHtmlEditor._TIMES;
	if (familyPref.search(DwtHtmlEditor._VERDANA_RE) != -1)
		fontFamily = DwtHtmlEditor._VERDANA;
	else if (familyPref.search(DwtHtmlEditor._ARIAL_RE) != -1)
		fontFamily = DwtHtmlEditor._ARIAL;
	else if (familyPref.search(DwtHtmlEditor._COURIER_RE) != -1)
		fontFamily = DwtHtmlEditor._COURIER;
	
	return fontFamily;
};

ZmHtmlEditor.prototype._getInitialFontSize = 
function() {
	return this.parent._appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_SIZE);
};

ZmHtmlEditor.prototype._getInitialFontColor = 
function() {
	return this.parent._appCtxt.get(ZmSetting.COMPOSE_INIT_FONT_COLOR);
};
