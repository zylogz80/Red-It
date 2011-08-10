/*
    Red It: A beautiful and functional Reddit browser for webOS tablets 
    Copyright (C) 2011  Adam R. Drew adam@linkedlistcorruption.com

	This file is part of Red It.

    Red It is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
enyo.kind({
	name: "readIT.PrefsHandler",
	kind: enyo.Service,
	events: {
		onGotPrefsSuccess: "",
		onGotPrefsFailed: "",
		onSetPrefsSuccess: ""
	},
	components: [ ],
	create: function() {
		this.inherited(arguments);
		this.prefsStruct = {
			savedLogin: false,
			userName: false,
			password: false,
			homeReddit: "frontpage"
		};

	},
	initPrefs: function() {
		
		enyo.log("DEBUG : Entering initPrefs : this.prefsStruct : " + enyo.json.stringify(this.prefsStruct));
		
		if (!enyo.getCookie('appPrefs')) {
			enyo.setCookie('appPrefs', enyo.json.stringify(this.prefsStruct));
		}
	},
	getPrefs: function() {
		
		enyo.log("DEBUG : Entering getPrefs : this.prefsStruct : " + enyo.json.stringify(this.prefsStruct));

		
		this.prefsStruct = enyo.json.parse(enyo.getCookie('appPrefs'));
		
		enyo.log("DEBUG : Leaving getPrefs : this.prefsStruct : " + enyo.json.stringify(this.prefsStruct));
		
		return this.prefsStruct;
	},
	setPrefs: function(inPrefsStruct) {
		enyo.setCookie('appPrefs', enyo.json.stringify(inPrefsStruct));
		
	}
})
