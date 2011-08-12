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

	kind: enyo.AppMenu, 
	name: "readIT.appMenu", 
	
	components: [
	
		{kind: enyo.Scrim, name: "theScrim"},
	
		{caption: "About Red It", onclick: "showAbout"},
		{caption: "Help", onclick: "showHelp"},
		{caption: "Red It Code", onclick: "showCode"},
		{caption: "Email the Developer", onclick: "showSupport"},
		
		{name: "appManager", 		kind: "PalmService", 
									service: "palm://com.palm.applicationManager/", 
									method: "open", 
		}

	],
	
	showCode: function() {
		var params = {
			"url" : "https://github.com/zylogz80/Red-It"
		};
		this.$.appManager.call({"id": "com.palm.app.browser", "params":params});
	},

	showAbout: function() {
		var params = {
			"url" : "http://www.linkedlistcorruption.com/redit/inapp-about.html"
		};
		this.$.appManager.call({"id": "com.palm.app.browser", "params":params});
	},
	
	showHelp: function() {
		var params = {
			"url" : "http://linkedlistcorruption.com/redit/help.html"
		};
		this.$.appManager.call({"id": "com.palm.app.browser", "params":params});
	},
	
	showSupport: function() {
		var params =  {
			 "recipients":[{
				"type": "email",
				"contactDisplay":"Red It Feedback",
				"role":1,
				"value":"reditfeedback@linkedlistcorruption.com"
			}],		
			"summary":"Red It Beta Feedback",
			"text": "Thank you for electing to send feedback about Red It! Whatever you've got to say, I'd like to hear it. Thanks in advance.<br><br>My Feedback<br>------------------------------------------------------------------<br><br><br><br>Do you give Red It's developer permission to contact you regarding your feedback?<br>------------------------------------------------------------------<br><br><br><br>"
		};
		this.$.appManager.call({"id": "com.palm.app.email", "params":params});
	}

	
})
