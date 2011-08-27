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
	name: "notLoggedInPopup", 
	dismissWithClick: true, 
	modal: true,
	align: "center",
	components: [
		{kind: enyo.HFlexBox, align: "center", name: "theBox" , components: [	
			{kind: enyo.Image, src: "icons/exclaim.png"},
			{content: "Uh oh!<br>You need to be logged in to Reddit to do that!"}
		]}
	],
	
	showError: function(errorText) {
		this.$.test.setContent(errorText);
	}
	
})
