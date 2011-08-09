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

	kind: enyo.Popup, 
	name: "errorPopup", 
	dismissWithClick: true, 
	modal: true,
	align: "center",
	components: [
		{kind: enyo.HFlexBox, align: "center", name: "theBox" , components: [	
			{kind: enyo.Image, src: "icons/exclaim.png"},
			{content: "Uh oh! I can't talk to Reddit!<br><span style='font-size: 14px'>Are you connected to the internet?<br>If so then this could be an error in webOS or at Reddit.<br>Give it some time and see if it works later.<br>If the issue persists try rebooting your device.<br>This is not a bug in the Red It app.<span>"}
		]}
	],
	
	showError: function(errorText) {
		this.$.test.setContent(errorText);
	}
	
})
