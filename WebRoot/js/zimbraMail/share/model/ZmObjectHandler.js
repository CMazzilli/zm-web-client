/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2004, 2005, 2006, 2007, 2009 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * @overview
 * 
 * This file contains the ZmObjectHandler.
 * 
 */

/**
 * @class
 *
 * This is the constructor for the zimlet object handler.
 * 
 * @param	{String}	typeName	the type name
 * @param	{String}	className	the class name
 */
ZmObjectHandler = function(typeName, className) {
	if (arguments.length > 0) {
		this.init(typeName, className);
	}
}

ZmObjectHandler.prototype.constructor = ZmObjectHandler;

/**
 * Called by the Zimlet framework to indicate that the object.
 * 
 * @param	{String}	typeName	the type name
 * @param	{String}	className	the class name; if <code>null</code>, "Object" will be used
 */
ZmObjectHandler.prototype.init =
function(typeName, className) {
	this._typeName = typeName;
	this._className = className ? className : "Object";
};

/**
 * Returns a string representation of the object.
 * 
 * @return		{String}		a string representation of the object
 */
ZmObjectHandler.prototype.toString = 
function() {
	// If you can find a cleaner way to get the name of 
	// a sub-class without hard coding each instance
	// in a toString() method feel free to change.
	if(!this._toString) {
		var ctor = "" + this.constructor;
		ctor = ctor.substring(0,ctor.indexOf("("));
		this._toString = ctor.substring("function ".length);
	}
	return this._toString;
};

/**
 * Gets the type name.
 * 
 * @return	{String}		the type name
 */
ZmObjectHandler.prototype.getTypeName =
function() {
	return this._typeName;
};

/**
 * Gets the class name for a given object.
 * 
 * @param	{Object}		obj		the object
 * @param	context		the content (not used)
 * @return	{String}		the class name
 */
ZmObjectHandler.prototype.getClassName =
function(obj, context) {
	return this._className;
};

/**
 * Gets the hovered class name for the given object.
 * 
 * @param	{Object}		obj		the object
 * @param	context		the content (not used)
 * @return	{String}		the hovered class name
 */
ZmObjectHandler.prototype.getHoveredClassName =
function(obj, context) {
	var cname = this.getClassName(obj);
	if (this._cachedClassNameForHovered !== cname) {
		this._cachedClassNameForHovered = cname;
		this._classNameHovered = cname + "-" + DwtCssStyle.HOVER;
	}
	return this._classNameHovered;
};

/**
 * Gets the active class name for a given object.
 * 
 * @param	{Object}		obj		the object
 * @param	context		the content (not used)
 * @return	{String}		the active class name
 */
ZmObjectHandler.prototype.getActiveClassName =
function(obj, context) {
	var cname = this.getClassName(obj);
	if (this._cachedClassNameForActive !== cname) {
		this._cachedClassNameForActive = cname;
		this._classNameActive = cname + "-" + DwtCssStyle.ACTIVE;
	}
	return this._classNameActive;
};

/**
 * @private
 */
ZmObjectHandler.prototype.findObject =
function(content, startIndex) {
	if (startIndex === 0) {
		this._lastMatch = null;
		this._noMatch = false;
	}
	if (this._noMatch) {return null;}
	if (this._lastMatch && this._lastMatch.index >= startIndex) {
		return this._lastMatch;
	}
	this._lastMatch = this.match(content, startIndex);
	this._noMatch = (this._lastMatch === null);
	return this._lastMatch;
};


/**
 * OVERRIDE: Usage should return a non-null result in the format of
 * String.match if text on the line matched the handler regular expression.
 * 
 * <pre>
 * var result = handler.match(line);
 * result[0] // should be matched string
 * result.index // should be location within line match occurred
 * </pre>
 * 
 * Handlers can also set result.context which will be passed back to
 * them during the various method calls (getToolTipText, etc).
 * 
 * Handlers should set regex.lastIndex to startIndex and then use regex.exec(content).
 * 
 * Handlers should also use the "g" option when constructing their regex.
 */
ZmObjectHandler.prototype.match =
function(content, startIndex) {
	return null;
};

/**
 * Generates content inside the <code><span></code> tag.
 * 
 * @return	{Number}	the content index
 * @private
 * */
ZmObjectHandler.prototype._getHtmlContent =
function(html, idx, obj, context, spanId) {
	html[idx++] = AjxStringUtil.htmlEncode(obj, true);
	return idx;
};

/**
 * Generates the <code><span></code> tag.
 * 
 * @return	{Number}	the content index
 * @private
 */
ZmObjectHandler.prototype.generateSpan = 
function(html, idx, obj, spanId, context) {
	html[idx++] = "<span class='";
	html[idx++] = this.getClassName(obj);
	html[idx++] = "' id='";
	html[idx++] = spanId;
	html[idx++] = "'>";
	idx = this._getHtmlContent(html, idx, obj, context, spanId);
	html[idx++] = "</span>";
	return idx;
};

/**
 * OVERRIDE: Checks if the handler has tool tip text.
 * 
 * @param		{Object}	obj			the object
 * @param		{Object}	context		the context
 * @return		<code>true</code> if the handler has tool tip text; <code>false</code> otherwise
 */
ZmObjectHandler.prototype.hasToolTipText =
function(obj, context) {
	return true;
};

/**
 * OVERRIDE: Gets the handler tool tip text.
 * 
 * @param		{Object}	obj			the object
 * @param		{Object}	context		the context
 * @return		{String}	the handler has tool tip text
 */
ZmObjectHandler.prototype.getToolTipText =
function(obj, context) {
	return AjxStringUtil.htmlEncode(obj);
};

/**
 * OVERRIDE: Populates the handler tool tip text.
 * 
 * @param		{Object}	obj			the object
 * @param		{Object}	context		the context
 */
ZmObjectHandler.prototype.populateToolTip =
function(obj, context) {
};

/**
 * OVERRIDE: Gets the action menu.
 * 
 * @param		{Object}	obj			the object
 * @param		{String}	span		the span element
 * @param		{Object}	context		the context
 * @return		the action menu
 */
ZmObjectHandler.prototype.getActionMenu =
function(obj, span, context) {
	return null;
};

/**
 * OVERRIDE: This method is called when the handler is selected.
 * 
 * @param		{Object}	obj			the object
 * @param		{String}	span		the span element
 * @param		{Object}	ev			the event
 * @param		{Object}	context		the context
 * @see		#clicked()
 */
ZmObjectHandler.prototype.selected =
function(obj, span, ev, context) {
	return this.clicked(span, obj, context, ev);
};

/**
 * OVERRIDE: This method is called when the handler is clicked.
 * 
 * @param		{Object}	obj			the object
 * @param		{String}	span		the span element
 * @param		{Object}	ev			the event
 * @param		{Object}	context		the context
 */
ZmObjectHandler.prototype.clicked =
function(span, obj, context, ev) {
};

/**
 * This method is called when the handler is hovered-over.
 * 
 * @private
 */
ZmObjectHandler.prototype.hoverOver = function(object, context, x, y) {
	var shell = DwtShell.getShell(window);
	var tooltip = shell.getToolTip();
	tooltip.setContent(this.getToolTipText(object, context));
	tooltip.popup(x, y);
	this.populateToolTip(object, context);
};

/**
 * This method is called when the handler is hovered-out.
 * 
 * @private
 */
ZmObjectHandler.prototype.hoverOut = function(object, context) {
	var shell = DwtShell.getShell(window);
	var tooltip = shell.getToolTip();
	tooltip.popdown();
};