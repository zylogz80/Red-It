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
	name: "readIT.rightView",
	kind: enyo.SlidingView,
	layoutKind: enyo.VFlexLayout,
	
	dragAnywhere: false,
	events: {
		onUpVote:"",
		onDownVote: "",
		onCompleteDataLoad: "",
		onStartDataLoad: "",
		onNewCommentPressed: ""
	},
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
			is_self: "" },
		isLoggedIn: false,
		userModHash: ""
	
	},
	components: [

		{kind: enyo.TabGroup, components: [
			{kind:enyo.TabButton, name: "headerStoryTab", caption: "View Story", disabled: "true", onclick: "showStory"},
			{kind:enyo.TabButton, name: "headerCommentsTab", caption: "View Comments",  disabled: "true", onclick: "showComments"}
		]},

		{kind: enyo.Pane, name: "paneControl", flex: 1, components: [
			{kind: enyo.WebView, name: "webViewer", onLoadComplete: "doCompleteDataLoad", url: "http://linkedlistcorruption.com/redit/welcome.html"},
			
			{kind: "readIT.commentView", name: "commentView"},
			
			{kind: "readIT.selfPostView", name: "selfPostView"}


		]},

		{kind: enyo.Toolbar, pack: "center", align: "center",components: [             
			// Bottom tool bar
			{kind: enyo.GrabButton, slidingHandler: true},         
			{kind: enyo.RadioGroup, components: [
				{name:"footerUpButton", caption: "Up", className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark", disabled: "true", onclick: "doUpVote", depressed: false},
				{name:"footerDownButton",caption: "Down", className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark", disabled: "true", onclick: "doDownVote", depressed: false}
			]},
			
			{kind: enyo.ToolButton, className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark", name: "shareButton", disabled: "true", caption: "Share", onclick: "shareMenuShow"},

			{kind: enyo.ToolButton, className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark", name: "backButton", disabled: "true", showing: "false", caption: "Previous Comment", onclick: "backButtonPressed"},

			
			{kind: enyo.ToolButton, className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark", name: "commentButton", disabled: "true", showing: "false", caption: "Add Comment", onclick: "doNewCommentPressed"}
			
			
			]},
		{kind: enyo.Menu, name: "shareMenu", components: [
			{caption: "Email", onclick: "sendEmail"},
			{caption: "Messaging", onclick: "sendMessage"},
		]},
		{name: "emailService", 		kind: "PalmService", 
									service: "palm://com.palm.applicationManager/", 
									method: "open", 
		},
		{name: "messagingService", 	kind: "PalmService", 
									service: "palm://com.palm.applicationManager/", 
									method: "open", 
		}	
		

	],
	sendEmail : function(inSender, inResponse) {
		var params =  {
			"summary":"I found this on Reddit with Red It for webOS. Check it out!",
			"text":"Title: '"+this.storyStruct.title+"' URL: " +this.storyStruct.url+"" 
		};
		this.$.emailService.call({"id": "com.palm.app.email", "params":params});
	},
	sendMessage : function(inSender, inResponse) {

		var params =  {
			"messageText": "Saw this on Reddit: " + this.storyStruct.url
		};
		this.$.messagingService.call({"id": "com.palm.app.messaging", "params":params});
	},
	shareMenuShow: function() {
		
		this.$.shareMenu.openAtControl(this.$.shareButton);
	},
	showStory: function(){
		this.$.footerUpButton.setShowing(true);
		this.$.footerDownButton.setShowing(true);
		this.$.shareButton.setShowing(true);
		this.$.commentButton.setShowing(false);
		this.$.backButton.setShowing(false);

		if (this.storyStruct.is_self == false) {
			this.$.paneControl.selectViewByName("webViewer");
		} else {
			this.$.paneControl.selectViewByName("selfPostView");
		};
	},
	showComments: function() {
		this.$.footerUpButton.setShowing(false);
		this.$.footerDownButton.setShowing(false);
		this.$.shareButton.setShowing(false);
		this.$.commentButton.setShowing(true);
		this.$.backButton.setShowing(true);

		this.$.paneControl.selectViewByName("commentView");	
		this.doCompleteDataLoad();
	},
	create: function() {
		
		this.inherited(arguments);
		
		
		this.$.commentButton.setShowing(false);
		this.$.backButton.setShowing(false);

		this.$.paneControl.selectViewByName("webViewer");
		//this.$.paneControl.selectViewByName("selfPostView");
		
		this.$.webViewer.clearCache();
		
		this.areButtonsEnabled = false;
		
		// Disable the footer controls by default as no story
		// is currently active
		this.$.footerUpButton.setDepressed(false);
		this.$.footerDownButton.setDepressed(false);
		
		// TODO: Load a default welcome page
	},
	acceptStoryFromLeftPane: function(inStoryStruct) {
		// This function recieves the contents of a story struct
		// from the left pane
		this.storyStruct.url = inStoryStruct.url;
		this.storyStruct.title = inStoryStruct.title;
		this.storyStruct.image = inStoryStruct.image;
		this.storyStruct.score = inStoryStruct.score;
		this.storyStruct.comments = inStoryStruct.comments;
		this.storyStruct.reddit = inStoryStruct.reddit;
		this.storyStruct.likes = inStoryStruct.likes;
		this.storyStruct.id = inStoryStruct.id;
		this.storyStruct.permalink = inStoryStruct.permalink;
		this.storyStruct.is_self = inStoryStruct.is_self;

		this.$.headerStoryTab.setDisabled(false);
		this.$.headerCommentsTab.setDisabled(false);
		this.$.shareButton.setDisabled(false);
		this.$.commentButton.setDisabled(false);
		this.$.backButton.setDisabled(false);


		if ( this.isLoggedIn == true ) {
			this.$.footerUpButton.setDisabled(false);
			this.$.footerDownButton.setDisabled(false);
			//this.$.commentButton.setDisabled(false);
		}

		//Update the visual representation of the story
		this.updateStoryUI();
		//this.$.commentView.getCommentsForParent(this.storyStruct.id.slice(3));
		this.$.commentView.setCurrentCommentParent(this.storyStruct.id);
		this.$.commentView.initCommentsForStory(this.storyStruct.permalink);
		this.$.commentView.setUserModHash(this.userModHash);
		


	},
	activateButtons: function() {


	},
	updateStoryUI: function(storyStruct) {
		// Use this function to update the displayed story UI info
		// such as the title, headers, footers, etc

		if (this.storyStruct.is_self == false) {
			this.$.paneControl.selectViewByName("webViewer");
			this.$.webViewer.setUrl(this.storyStruct.url);
		} else {
			this.$.selfPostView.setStoryStruct(this.storyStruct);
			this.$.selfPostView.update();
			this.$.paneControl.selectViewByName("selfPostView");
			this.doCompleteDataLoad();
		};
		
		if ( this.storyStruct.likes == true && this.isLoggedIn == true) {
			this.$.footerUpButton.setDepressed(true);
			this.$.footerDownButton.setDepressed(false);
		};
		if ( this.storyStruct.likes == false && this.isLoggedIn == true) {
			this.$.footerUpButton.setDepressed(false);
			this.$.footerDownButton.setDepressed(true);
		};
		if ( this.storyStruct.likes == null && this.isLoggedIn == true) {
			this.$.footerUpButton.setDepressed(false);
			this.$.footerDownButton.setDepressed(false);
		
		};

		
	},
	webResize: function() {
		this.$.webViewer.resize();
	},
	
	backButtonPressed: function() {
		
		this.$.commentView.backButtonPressed();
		
	}
})
