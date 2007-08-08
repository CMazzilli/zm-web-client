/*
 * ***** BEGIN LICENSE BLOCK *****
 * Version: ZPL 1.2
 * 
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.2 ("License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.zimbra.com/license
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See
 * the License for the specific language governing rights and limitations
 * under the License.
 * 
 * The Original Code is: Zimbra Collaboration Suite Web Client
 * 
 * The Initial Developer of the Original Code is Zimbra, Inc.
 * Portions created by Zimbra are Copyright (C) 2004, 2005, 2006 Zimbra, Inc.
 * All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * ***** END LICENSE BLOCK *****
 */

ZmClientCmdHandler = function() {
	this._settings = {};
};

ZmClientCmdHandler.prototype.execute =
function(cmdStr, searchController) {

	if (!cmdStr) { return; }

	cmdStr = AjxStringUtil.trim(cmdStr, true);
	
	if (cmdStr == "") { return; }
	
	cmdStr = cmdStr.toLowerCase();
	var argv = cmdStr.split(/\s/);
	var arg0 = argv[0];

	if (arg0 == "debug") {
		if (!argv[1]) { return; }
		if (argv[1] == "t") {
			var on = DBG._showTiming;
			var newState = on ? "off" : "on";
			this._alert("Turning timing info " + newState);
			DBG.showTiming(!on);
		} else {
			var level = argv[1];
			DBG.setDebugLevel(level);
			this._alert("Setting debug level to: " + level);
		}
	} else if (arg0 == "support") {
		if (!argv[1]) return;
		var feature = argv[1].toUpperCase();
		var setting = "ZmSetting." + feature + "_ENABLED"
		var id = eval(setting);
		var on = appCtxt.get(id);
		if (on == undefined) {
			this._alert("No such setting: " + setting);
			return;
		}
		var newState = on ? "off" : "on";
		alert("Turning " + feature + " support " + newState);
		this._settings[id] = !on;
		appCtxt.getAppController().restart(this._settings);
	} else if (arg0 == "instant_notify") {
		var on = false;
		if (argv[1] && argv[1] == 1) {
			on = true;
		}
		this._alert("Set instant notify to "+ (on ? "ON" : "OFF"));
		appCtxt.getAppController().setInstantNotify(on);
	} else if (arg0 == "poll") {
		if (!argv[1]) return;
		appCtxt.set(ZmSetting.POLLING_INTERVAL, argv[1]);
		var pi = appCtxt.get(ZmSetting.POLLING_INTERVAL); // LDAP time format converted to seconds
		if (appCtxt.getAppController().setPollInterval()) {
			this._alert("Set polling interval to " + pi + " seconds");
		} else {
			this._alert("Ignoring polling interval b/c we are in Instant_Polling mode ($set:instant_notify 0|1)");
		}
	} else if (arg0 == "noop") {
		appCtxt.getAppController().sendNoOp();
		this._alert("Sent NoOpRequest");
	} else if (arg0 == "a") {
		if (!this._assistantDialog) {
			AjxDispatcher.require("Assistant");
			this._assistantDialog = new ZmAssistantDialog();
		}
		searchController.setSearchField("");
		this._assistantDialog.popup();
	} else if (arg0 == "rr") {		
		appCtxt.getApp(ZmApp.CALENDAR).getReminderController().refresh();
	} else if (arg0 == "rh") {
		appCtxt.getApp(ZmApp.CALENDAR).getReminderController()._housekeepingAction();
	} else if (arg0 == "toast") {
		appCtxt.setStatusMsg("Your options have been saved.", ZmStatusView.LEVEL_INFO);
		appCtxt.setStatusMsg("Unable to save options.", ZmStatusView.LEVEL_WARNING);
		appCtxt.setStatusMsg("Message not sent.", ZmStatusView.LEVEL_CRITICAL);
	} else if (arg0 == "get") {
		if (!argv[1]) return;
		var item = argv[1];
		if (item == "version") {		
			alert("Client Information\n\n" +
			      "Client Version: " + appCtxt.get(ZmSetting.CLIENT_VERSION) + "\n" +
			      "Client Release: " + appCtxt.get(ZmSetting.CLIENT_RELEASE) + "\n" +
			      "    Build Date: " + appCtxt.get(ZmSetting.CLIENT_DATETIME));
		}
	} else if (arg0 == "refresh") {
		ZmCsfeCommand.setSessionId(null);
		appCtxt.getAppController().sendNoOp();
	}
};

ZmClientCmdHandler.prototype._alert = 
function(msg, level) {
	appCtxt.setStatusMsg(msg, level);
};
