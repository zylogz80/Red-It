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

	kind: enyo.Control, 
	name: "readIT.selfPostView", 
	layoutKind: enyo.VFlexLayout,
	style: "background-image: url('graphics/paper-texture.jpg');font-family:georgia;",
	published: {
		storyStruct: {
			url : "",
			title : "",
			image : "",
			score : "",
			comments : "",
			reddit: "",
			likes: "",
			id : "",
			permalink: "",
			is_self: "" }
	},
	components: [
		{kind: enyo.Scroller, flex: 1, components: [
			{kind: enyo.HFlexBox, align: "center", pack: "center", components: [
				{kind: enyo.Spacer},
				{kind: enyo.Image, pack: "center", align: "center", src: "graphics/reddit-seal.png"},
				{kind: enyo.Spacer}
			]},
			{name: "title", kind: enyo.HtmlContent, style: "padding-left: 2em; padding-right: 2em;font-size: 16px; color: #252525", content: "Loading..."},
			{name: "body", kind: enyo.HtmlContent, style: "padding-left: 2em; padding-right: 2em;padding-top: 1em;  font-size: 24px; color: #0A0A0A",content: "'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'"},
			{kind: enyo.HFlexBox, align: "center", pack: "center", components: [
				{kind: enyo.Spacer},
				{name: "signature", kind: enyo.HtmlContent, style: "padding-right: 2em; font-size: 20px; color: #0A0A0A; padding-top: 1em;", content: "- Lucifer"} 
			]},
			{kind: enyo.Image, src: "graphics/stain.png"}
		]},
		{kind: enyo.WebService, 
			name: "getStory", 
			onSuccess:"getStorySuccess", 
			onFailure:"getStoryFail"
		}
	],
	
	create: function() {
		this.inherited(arguments);
		this.$.body.setShowing(false);
		this.$.signature.setShowing(false);
	},
	
	getStorySuccess: function(inSender, inResponse) {
		//Fetching the story data succeeded
		
		storyObject = inResponse[0].data.children;
		//enyo.log("storyObject: " + enyo.json.stringify(storyObject));
		//enyo.log("Author: " + storyObject[0].data.author);
		//enyo.log("Title: " + storyObject[0].data.title);
		//enyo.log("Text: " + storyObject[0].data.selftext_html);
		
		this.$.title.setContent(storyObject[0].data.title);
		this.$.body.setContent(storyObject[0].data.selftext);
		this.$.signature.setContent("- " + storyObject[0].data.author);
		
		this.$.body.setShowing(true);
		this.$.signature.setShowing(true);
		
	},
	getStoryFail: function() {
		//Getting the story details failed for some reason
		enyo.log("DEBUG: selfPostView : Getting the story info failed");
		
	},
	update: function() {
		//Call the webservice on the URL for the story in the story struct
		this.$.getStory.setUrl(this.storyStruct.url + ".json");
		this.$.getStory.call();
	}
	
})
