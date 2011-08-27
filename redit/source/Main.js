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

//This is the mainView kind
//The mainView comprises the main portion of the app
//The side panes and other kinds are components of this kind
//Hi. You should listen to Nine Inch Nails more. 
enyo.kind({
	name: "readIT.mainView",
	kind: enyo.VFlexBox,
	published: {
		// Published properties
		// These are accessed via auto-created getters and setters
		userStruct: 	{
			// This holds informaiton on the user
			name : "",
			hasMail: "",
			modHash : "",
			linkKarma : "",
			commentKarma : "",
			isGold: ""
		},

		// Are we currently logged in?
		isLoggedIn: false,

		// The default new post type. Valid values are "link" and "text"
		newPostType: "link",
		
		currentSubreddit: "reddit.com"
	},
	components: [
	
		//Simple "You need to be logged in to Reddit to do that!" popup
		//Shown when trying to vote when not logged in
		//I can gray-out the vote buttons on the footer but I can't to anything to the buttons under the swipable items
		//Hence this
		{kind: "notLoggedInPopup", name: "errorPopup", scrim: true, scrimClassName: "errorScrim"},
		{kind: enyo.Scrim, name: "errorScrim"},


		{kind: enyo.PageHeader, className: "enyo-header-dark", style: "height: 75px;",components: [
			// Main app header
			// This contains the Red It logo, the go button, the subreddit bar, and the login/user button
			{kind: enyo.Image, src: "icons/red-it-nobg-48.png", name: "reditIcon", style: "padding-right: 10px;"},
			{kind: enyo.Spacer},
			{kind: enyo.Spinner, name: "headerSpinner", showing: "false"},
			{kind: enyo.ToolButton, name: "homeButton", icon: "icons/iconset/home.png", className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark",onclick: "goHome"},
			{kind: enyo.ToolInput, selectAllOnFocus: "true", name: "headerInputBox", hint: "Enter subreddit name", style: "width: 400px", onkeypress: "trapEnterKey"},
			//{kind: enyo.ToolButton, icon: "icons/beta.png", className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark", style: "align: center", align: "center", pack: "center", onclick: "openBetaPopup"},
			{kind: enyo.ToolButton, name: "bookmarkButton", icon: "icons/iconset/bookmarks.png", className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark",onclick: "openBookmarks"},

			{kind: enyo.Spacer},
			{name: "headerLoginButton", kind: enyo.ToolButton, className: "enyo-grouped-toolbutton-dark, enyo-radiobutton-dark", caption: "Login", onclick: "openLoginPopup"}
		]},

		{kind: enyo.SlidingPane, flex: 1, components: [
			//Sliding panes
			{name: "LeftPane", style: "width: 400px", kind: "readIT.leftView", onSelectedStory: "selectedStory", onLoginError: "voteButNotLoggedIn",onNewPostPressed: "showNewPostBox", onCompleteDataLoad: "hideHeaderSpinner", onStartDataLoad: "showHeaderSpinner"},
			{name: "RightPane", flex: 2,kind: "readIT.rightView", 	onResize: "resizeWebView", onUnVote: "unVote", onUpVote: "upVote", onLoginError: "voteButNotLoggedIn", onNewCommentPressed: "openCommentPopup", onDownVote: "downVote", onCompleteDataLoad: "hideHeaderSpinner", onStartDataLoad: "showHeaderSpinner"},
		]},

		//Bookmarks Popup
		{kind: enyo.Toaster, layoutKind: enyo.VFlexLayout, flyInFrom: "right", style: "top: 0px; bottom: 0px", lazy: false, components: [
			{className: "enyo-sliding-view-shadow"},
			{kind: enyo.PageHeader, style: "height: 75px;", className: "enyo-header-dark", components: [ 
				{kind: enyo.Spacer},
				{kind: enyo.RadioGroup, components: [
					{name:"favoriteSubredditsButton", kind: enyo.radioButton, icon: "icons/iconset/fav-subreddits.png",className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark", disabled: false, onclick: "showFavSubreddits", depressed: false},
					{name:"allSubredditsButton",kind: enyo.radioButton, icon: "icons/iconset/all-subreddits.png", className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark", disabled: false, onclick: "showAllSubreddits", depressed: false},
					{name:"searchSubredditsButton",kind: enyo.radioButton, icon: "icons/iconset/topbar-search-icon.png", className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark", disabled: false, onclick: "showSearchBar", depressed: false},

				]},
				{kind: enyo.Spacer}
			]},
			{kind: enyo.Toolbar, name: "searchBar", showing: false, align: "center", pack: "center", components: [
				{kind: enyo.ToolInput, selectAllOnFocus: "true", name: "subredditSearchBox", hint: "Subreddit search", onkeypress: "trapSearchEnterKey"},
				//{kind: enyo.ToolButton, icon: "icons/iconset/topbar-search-icon.png", onclick: "searchSubreddits"}

			]},
	
	
			{kind: enyo.FadeScroller, flex: 1, style: "width: 350px; background-color: #BABABA", components: [ 
				{name: "bookmarkList",lazy: false, kind: enyo.VirtualList, tapHighlight: true, onSetupRow: "getBookmarkItems", components: [
					{kind: enyo.Item,lazy: false, name: "bookmarkItem", layoutKind: enyo.VFlexLayout, tapHighlight: true, onclick: "selectedBookmark", components: [
						//{kind: enyo.RowGroup,lazy: false, name: "commentRowGroup", style: "width: 95%; margin-right: 6px;", components: [	
							{content: "", name: "bookmarkTitle"},
							{content: "", name: "bookmarkDescription", style: "font-size: 12px; text-align: left; color: #8A8A8A"}
						//]}
					]}
				]}
			]},
			{kind: enyo.Toolbar, pack: "center",  align: "center", components: [  
				{kind: enyo.GrabButton, slidingHandler: true},      
				{kind: enyo.toolButton, icon: "icons/iconset/back.png", name: "loadPrevSubredditsPageButton", className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark", disabled: true, onclick: "loadPrevSubredditsPage"},
				{kind: enyo.toolButton, icon: "icons/iconset/next.png", name: "loadNextSubredditsPageButton", className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark", disabled: true, onclick: "loadNextSubredditsPage"}
   
			]}
		]},


		//Reddit API services
		//These are all different instances of the custom readIT.RedditAPI kind
		//Each instance has a different purpose
		//The names are accurately descriptive
		{kind: "readIT.RedditAPI", name: "redditLoginService", onGetDataComplete: "loginComplete"},
		{kind: "readIT.RedditAPI", name: "redditUpVoteService", onPostDataComplete: "voteComplete"},
		{kind: "readIT.RedditAPI", name: "redditDownVoteService", onPostDataComplete: "voteComplete"},
		{kind: "readIT.RedditAPI", name: "redditSubmitStoryService", onPostDataComplete: "submitComplete"},
		{kind: "readIT.RedditAPI", name: "redditSubmitCommentService", onPostDataComplete: "replyComplete", onFail: "replyFailed"},

		//The preferences handler does the work of getting and setting values in the cookie
		{kind: "readIT.PrefsHandler", name: "prefsHandler"},

		//The scrim
		{kind: enyo.Scrim, name: "spinScrim"},
		
		{name: "betaPopup", kind: enyo.Popup, dismissWithClick: false, modal: true, components: [
		
			{kind: enyo.RowGroup, caption: "Beta Feedback", components: [
							{kind: enyo.ToolButton, caption: "Bug Report", onclick: "submitBug"},
							{kind: enyo.ToolButton, caption: "Submit Feedback", onclick: "submitFeedback"}
			
			]}
		
		]},

		{name: "loginPopup", kind: enyo.Popup, dismissWithClick: false, modal: true, components: [ 
			//The login pop-up box
			//This contains a RowGroup, user and password input boxes, and some controls
			{kind: enyo.RowGroup, caption: "Log In to Reddit", components:[
				{kind: enyo.HFlexBox, align: "center", components: [ 
					{name: "popupUserNameInput", width: "100%", kind: enyo.Input, hint: "User Name", spellcheck: false, autocorrect: false, autowordcomplete: false, autoCapitalize: "lowercase"} 
				]},
				{kind: enyo.HFlexBox, align: "center", components: [ 
					{name: "popupPasswordInput", width: "100%", kind: enyo.PasswordInput, hint: "Password", spellcheck: false, autocorrect: false, autowordcomplete: false, autoCapitalize: "lowercase"} 
				]},
				{kind: enyo.HFlexBox, align: "center", components: [ 
					{name: "popupLoginButton", kind: enyo.Button, caption: "Log in to Reddit", onclick: "loginButtonClicked"},
					{name: "popupCancelButton", kind: enyo.Button, caption: "Close this box", onclick: "closeLoginPopup"}
				]},
				{kind: enyo.HFlexBox, align: "center", components: [ 
					{name: "popupSaveCheckBox", kind: enyo.CheckBox, style: "margin-right: 10px", onChange: "checkBoxHandler"},
					{content: "Save username and password"}
				]}
			]}
		]},
		
		{name: "newPostPopup", align: "center", kind: enyo.Popup, dismissWithClick: false, modal: true, components: [
			//The new post dialog box
			{kind: enyo.RowGroup, caption: "Submit a Story", components: [
				{kind: enyo.HFlexBox, style: "width: 500px",align: "center", pack: "center",components: [
					{kind: enyo.RadioGroup, components: [
						{name: "newPostTextStoryButton", caption: "Submit Link", onclick: "newStoryStyleLink"},
						{name: "newPostLinkStoryButton", caption: "Submit Text", onclick: "newStoryStyleText"}
					]}
				]},
				{kind: enyo.HFlexBox, style: "width: 500px",align: "center", pack: "center",components: [
					{kind: enyo.Input, style: "width: 500px", alwaysLooksFocused: true,name: "newPostStoryTitle",  hint: "Story Title"},
				]},
				{kind: enyo.HFlexBox,style: "width: 500px", align: "center", pack: "center",components: [

					{kind: enyo.Input, style: "width: 500px",alwaysLooksFocused: true,name: "newPostStoryContent",hint: "Story URL"},
				]},
				{kind: enyo.HFlexBox,style: "width: 500px", align: "center", pack: "center",components: [

					{kind: enyo.Input, style: "width: 500px",alwaysLooksFocused: true,name: "newPostStorySubreddit",hint: "Subreddit to submit to."},
				]},
				{kind: enyo.HFlexBox, align: "center", pack: "center",components: [ 
					{name: "newStorySubmitButton", kind: enyo.Button, caption: "Submit Story", onclick: "submitNewStory"},
					{name: "newStoryCancelButton", kind: enyo.Button, caption: "Close this box", onclick: "hideNewPostBox"}
				]}				
			
			]}
		]},
		
		{name: "newCommentPopup", align: "center", kind: enyo.Popup, dismissWithClick: false, modal: true, components: [
			//The new post dialog box
			{kind: enyo.RowGroup, caption: "Submit a comment", components: [
				{kind: enyo.HFlexBox,  style: "width: 500px",align: "center", pack: "center",components: [
					{kind: enyo.Input, style: "width: 500px", alwaysLooksFocused: true,name: "commentInputBox",  hint: "Enter your comment"},
				]},

				{kind: enyo.HFlexBox, align: "center", pack: "center",components: [ 
					{name: "newCommentSubmitButton", kind: enyo.Button, caption: "Submit Comment", onclick: "submitNewComment"},
					{name: "newCommentCancelButton", kind: enyo.Button, caption: "Close this box", onclick: "hideNewCommentPopup"}
				]}				
			
			]}
		]},
		
		
		{kind: "readIT.appMenu", name: "appMenu", onSelectIconButtons: "setIconButtons", onSelectTextButtons: "setTextButtons"},
		
				
		{name: "emailService", 		kind: "PalmService", 
									service: "palm://com.palm.applicationManager/", 
									method: "open", 
		},
		
		{kind: enyo.WebService, 
			url: "http://www.reddit.com/reddits/mine.json", 
			name: "getBookmarks", 
			onSuccess:"getBookmarksSuccess",
			timeout: "30000", 
			onFailure:"replyFailed"
		},
	],
	
//App Menu Related Functions
///////////////////////////////////////////
	setIconButtons: function() {
		//Intercept the onSelectIconButtons event from the appMenu
		//Set all of the buttons in the app to use icons

		//Main
		this.$.bookmarkButton.setCaption("");		
		this.$.homeButton.setCaption("");
		this.$.favoriteSubredditsButton.setCaption("");
		this.$.allSubredditsButton.setCaption("");
		this.$.loadPrevSubredditsPageButton.setCaption("");
		this.$.loadNextSubredditsPageButton.setCaption("");
		this.$.searchSubredditsButton.setCaption("");
		this.$.searchSubredditsButton.setIcon("icons/iconset/topbar-search-icon.png");
		this.$.loadPrevSubredditsPageButton.setIcon("icons/iconset/back.png");
		this.$.loadNextSubredditsPageButton.setIcon("icons/iconset/next.png");
		this.$.favoriteSubredditsButton.setIcon("icons/iconset/fav-subreddits.png");
		this.$.allSubredditsButton.setIcon("icons/iconset/all-subreddits.png");		
		this.$.bookmarkButton.setIcon("icons/iconset/bookmarks.png");
		this.$.homeButton.setIcon("icons/iconset/home.png");
		
		//Left
		this.$.LeftPane.$.newPostButton.setIcon("icons/iconset/new-card.png");
		this.$.LeftPane.$.refreshButton.setIcon("icons/iconset/refresh.png");
		this.$.LeftPane.$.loadMoreButton.setIcon("icons/iconset/next.png");



		this.$.LeftPane.$.newPostButton.setCaption("");
		this.$.LeftPane.$.refreshButton.setCaption("");
		this.$.LeftPane.$.loadMoreButton.setCaption("");
		
		//Right
		this.$.RightPane.$.footerUpButton.setIcon("icons/iconset/upboat.png");
		this.$.RightPane.$.footerDownButton.setIcon("icons/iconset/downboat.png");
		this.$.RightPane.$.shareButton.setIcon("icons/iconset/share.png");
		this.$.RightPane.$.commentButton.setIcon("icons/iconset/comment.png");
		this.$.RightPane.$.backButton.setIcon("icons/iconset/back.png");
		this.$.RightPane.$.footerUpButton.setCaption("");
		this.$.RightPane.$.footerDownButton.setCaption("");
		this.$.RightPane.$.shareButton.setCaption("");
		this.$.RightPane.$.commentButton.setCaption("");
		this.$.RightPane.$.backButton.setCaption("");	
		
	},
	
	setTextButtons: function() {
		//Intercept the onSelectTextButtons event from the appMenu
		//Set all of the buttons in the app to use text

		//Main
		this.$.bookmarkButton.setIcon("");
		this.$.homeButton.setIcon("");
		this.$.favoriteSubredditsButton.setIcon("");
		this.$.allSubredditsButton.setIcon("");	
		this.$.loadPrevSubredditsPageButton.setCaption("Previous");
		this.$.loadNextSubredditsPageButton.setCaption("Next");
		this.$.searchSubredditsButton.setCaption("Search");
		this.$.searchSubredditsButton.setIcon("");
		this.$.loadPrevSubredditsPageButton.setIcon("");
		this.$.loadNextSubredditsPageButton.setIcon("");
		this.$.favoriteSubredditsButton.setCaption("Favs");
		this.$.allSubredditsButton.setCaption("All");
		this.$.bookmarkButton.setCaption("Bookmarks");
		this.$.homeButton.setCaption("Home");

		//Left
		this.$.LeftPane.$.newPostButton.setIcon("");
		this.$.LeftPane.$.refreshButton.setIcon("");
		this.$.LeftPane.$.loadMoreButton.setIcon("");
		this.$.LeftPane.$.newPostButton.setCaption("New Post");
		this.$.LeftPane.$.refreshButton.setCaption("Refresh");
		this.$.LeftPane.$.loadMoreButton.setCaption("Next Page");
		
		//Right
		this.$.RightPane.$.footerUpButton.setIcon("");
		this.$.RightPane.$.footerDownButton.setIcon("");
		this.$.RightPane.$.shareButton.setIcon("");
		this.$.RightPane.$.commentButton.setIcon("");
		this.$.RightPane.$.backButton.setIcon("");
		this.$.RightPane.$.footerUpButton.setCaption("Up Vote");
		this.$.RightPane.$.footerDownButton.setCaption("Down Vote");
		this.$.RightPane.$.shareButton.setCaption("Share");
		this.$.RightPane.$.commentButton.setCaption("Add Comment");
		this.$.RightPane.$.backButton.setCaption("Back a Level");
	},
	openAppMenuHandler: function() {
		this.$.appMenu.open();
	},
	closeAppMenuHandler: function() {
		this.$.appMenu.close();
	},
//End App Menu Functions
////////////////////////////////////////////	

//Beta Feedback functions
///////////////////////////////////
	submitBug: function() {
				var params =  {
			        "recipients":[{"type": "email",
            "contactDisplay":"Red It Bugs",
            "role":1,
            "value":"reditbugs@linkedlistcorruption.com"}],		
			"summary":"Red It Beta Bug Report",
			"text": "Thank you for electing to submit a bug report for the Red It Beta. Please fill the following fields out as accurately and completely as possible. Please Note: This form should only be used for bug reports, not for feature requests or general feedback. Bugs are mistakes or errors in already implemented functionality of Red It. If you'd like to request a feature or provide general feedback please use the 'Send Feedback' button instead. Thanks very much. <br><br>What anomolous behavior did you observe?<br>-------------------------------------------------------------------------<br><br><br>Why do you think this is a bug?<br>-------------------------------------------------------------------------<br><br><br>What steps would need to be taken to reproduce this issue?<br>-------------------------------------------------------------------------<br><br><br>What were you doing when the problem occured?<br>-------------------------------------------------------------------------<br><br><br>Have you observed this multiple times? If so, how many times have you observed it?<br>-------------------------------------------------------------------------<br><br><br>Is there any other information that may be helpful in identifying and resolving this issue?<br>-------------------------------------------------------------------------<br><br><br>May Red It's developer contact you if there are further questions about this bug?<br>-------------------------------------------------------------------------<br><br><br>Thanks again for submitting a bug report during the Red It Beta!<br>-Adam"
		};
		this.$.emailService.call({"id": "com.palm.app.email", "params":params});
		this.$.spinScrim.hide();
		this.$.betaPopup.close();
		
	},
	
	submitFeedback: function() {
				var params =  {
			        "recipients":[{"type": "email",
            "contactDisplay":"Red It Feedback",
            "role":1,
            "value":"reditfeedback@linkedlistcorruption.com"}],		
			"summary":"Red It Beta Feedback",
			"text": "Thank you for electing to send feedback for the Red It Beta. Whatever you've got to say, we'd like to hear it. Please Note: This form should be used for general feedback, not bug reports. If you've encountered something you think is a bug please use the 'Bug Report' button instead. Thanks in advance.<br><br>My Feedback<br>------------------------------------------------------------------<br><br><br><br>Do you give Red It's developer permission to contact you regarding your feedback?<br>------------------------------------------------------------------<br><br><br><br>"
		};
		this.$.emailService.call({"id": "com.palm.app.email", "params":params});
		this.$.spinScrim.hide();
		this.$.betaPopup.close();
		
	},
	openBetaPopup: function() {
		
		this.$.spinScrim.show();
		this.$.betaPopup.openAtCenter();
		
	},
//End Beta Feedback Functions
////////////////////////////////////
	
//Comment related functions
///////////////////////////////////
	replyFailed: function() {
		//Adding a comment failed for some reason
	},
	submitNewComment: function() {
		this.$.redditSubmitCommentService.submitReply(	this.$.RightPane.$.commentView.getCurrentCommentParent(), 
														this.$.commentInputBox.getValue(), 
														this.$.RightPane.storyStruct.reddit, 
														this.userStruct.modHash);
	},	
	replyComplete: function() {
		this.$.RightPane.$.commentView.refreshView();
		this.$.LeftPane.refreshStoryList();
		this.hideNewCommentPopup();
	},
	openCommentPopup: function() {
		this.$.spinScrim.show();
		this.$.newCommentPopup.openAtCenter();
		this.$.commentInputBox.setValue("");

	},
	hideNewCommentPopup: function() {
		this.$.spinScrim.hide();
		this.$.newCommentPopup.close();
		
	},
// End comment functions
//////////////////////////////////////


	showHeaderSpinner: function() {
		this.$.headerSpinner.setShowing(true);
	},
	hideHeaderSpinner: function() {
		this.$.headerSpinner.setShowing(false);
	
	},
	create: function() {
		//The create function

		//Finish inheritence from our parent kind
		this.inherited(arguments);
		
		//Bookmark related variables
		this.bookmarkArray = [];
		this.bookmarkNextPage = null;
		this.bookmarkPrevPage = null;
		this.bookmarkDepth = 0;

		this.prefsStruct = {
			savedLogin: false,
			userName: false,
			password: false,
			homeReddit: "frontpage"
		};


		//Preferences initialization code
		//The initPrefs() function checks to see if a Red It preferences cookie already exists
		//If it does exist we load it; if it doesn't exist we create it
		//The preferences cookie stores a prefsStruct
		this.$.prefsHandler.initPrefs();
		
		//Populate the preferences structure with the value in the cookie
		this.prefsStruct = this.$.prefsHandler.getPrefs();
		
		//If the user saves his or her login info then auto login
		if ( this.prefsStruct.savedLogin == true) {
			this.loginBegin();
		}
	},

////////////////////////////////////////////////////////////////////////////////////////////////////
// Begin story submission functions
	submitNewStory: function() {
		//Submit a new story
		//Call the correct reddit API function depending on whether or not
		//we are submitting a link or some text
		//The functions we are calling are methods of the redditSubmitStoryService instance of the redditAPI kind
	
		if ( this.newPostType == "link" ) {
			//Submitting a link
			this.$.redditSubmitStoryService.submitLink(	this.userStruct.modHash, 
														this.$.newPostStoryContent.getValue(), 
														this.$.newPostStorySubreddit.getValue(), 
														this.$.newPostStoryTitle.getValue());
			
		}
		if ( this.newPostType == "text") {
			//Submitting some text
			this.$.redditSubmitStoryService.submitText(	this.userStruct.modHash, 
														this.$.newPostStoryContent.getValue(), 
														this.$.newPostStorySubreddit.getValue(), 
														this.$.newPostStoryTitle.getValue());
		}
	},
	
	submitComplete: function() {
		// A new story submission is completed
		// Hide the new post box and clear the text in the input boxes
		this.hideNewPostBox();
		this.$.newPostStoryTitle.setValue("");
		this.$.newPostStoryContent.setValue("");
		this.$.newPostStorySubreddit.setValue("");
	},

	newStoryStyleText: function() {
		//Modify the submittion box to better visually suit text submission
		this.$.newPostStoryContent.setStyle("width: 500px; height: 150px");
		this.$.newPostStoryContent.setHint("Story Text");
		this.newPostType = "text";
	
	},

	newStoryStyleLink: function() {
		//Modify the submittion box to better visually suit link submission
		this.$.newPostStoryContent.setStyle("width: 500px; height: 48px");
		this.$.newPostStoryContent.setHint("Story URL");
		this.newPostType = "link";
	},

	showNewPostBox: function() {
		//Show the scrim and the new post box
		this.$.spinScrim.show();
		this.$.newPostPopup.openAtCenter();
		this.$.newPostStoryTitle.setValue("");
		this.$.newPostStoryContent.setValue("");
		this.$.newPostStorySubreddit.setValue(this.currentSubreddit);
	},

	hideNewPostBox: function() {
		//Hide the scrim and the new post box
		this.$.spinScrim.hide()
		this.$.newPostPopup.close();
	},
// End Story Submission functions
////////////////////////////////////////////////////////////////////////////////////////////////////

// Begin vote related functions
////////////////////////////////////////////////////////////////////////////////////////////////////
	upVote: function(){
		// Gets the story struct from the story that is loaded on the right pane
		// and sends that to the Reddit API for an up vote
		this.storyStruct = this.$.RightPane.getStoryStruct();
		
		this.$.redditUpVoteService.submitVote(	this.storyStruct.id, //Story ID 
												"1", // Up Vote			
												this.userStruct.modHash);//User Mod Hash
			
		this.storyStruct.likes = true;
		this.$.RightPane.setStoryStruct(this.storyStruct);	

	},
	downVote: function(){
		// Gets the story struct from the story that is loaded on the right pane
		// and sends that to the Reddit API for a down vote		

		this.storyStruct = this.$.RightPane.getStoryStruct();

		this.$.redditDownVoteService.submitVote(	this.storyStruct.id, //Story ID 
											"-1", // Down Vote			
											this.userStruct.modHash);//User Mod Hash
												
		this.storyStruct.likes = false;
		this.$.RightPane.setStoryStruct(this.storyStruct);	

	},

	unVote: function() {
		// Gets the story struct from the story that is loaded on the right pane
		// and sends that to the Reddit API for a vote removal		
		this.storyStruct = this.$.RightPane.getStoryStruct();

		this.$.redditUpVoteService.submitVote(	this.storyStruct.id, //Story ID 
												"0", // Up Vote			
												this.userStruct.modHash);//User Mod Hash
												
		this.storyStruct.likes = null;
		this.$.RightPane.setStoryStruct(this.storyStruct);	

	},


	voteComplete: function() {
		// Refreshes the story list after a vote
		this.$.LeftPane.refreshStoryList();
	},
	
	voteButNotLoggedIn: function() {
		
		this.$.errorPopup.openAtCenter();
		
	},
// End vote related functions
////////////////////////////////////////////////////////////////////////////////////////////////////

// Begin log in related functions
////////////////////////////////////////////////////////////////////////////////////////////////////
	loginBegin: function() {
		//Initiates the login process
		//Closes the login popup
		//Gets the username and password from the input boxes
		//Sends the user credentials to the Reddit API
		this.$.loginPopup.close(); 
		var userName = this.prefsStruct.userName; 
		var password= this.prefsStruct.password; 
		this.$.redditLoginService.submitLogin(userName, password); 
	},
	
	loginComplete: function () {
		//Handles login completion
		//redditLoginService calls this function on success
		//Populate the user struct with the values from the Reddit API
		//Change the login button text to the user name
		//Hide the scrim
		//Set the isLoggedIn properties of all of our kinds
		//Enable the new post button; we're logged in so posting is allowed now
		this.userStruct = this.$.redditLoginService.getUser(); //Populate the user structure with the user data from the Reddit API
		
		this.$.headerLoginButton.setCaption(this.userStruct.name); //Set the caption of the header button to the user name
		
		if (this.userStruct.isGold == true) {
			this.$.headerLoginButton.setCaption(this.userStruct.name);
			this.$.reditIcon.setSrc("icons/red-it-nobg-48-gold.png");
			
		}
		
		
		this.$.spinScrim.hide(); // hide the scrim
		this.isLoggedIn = true; 
		this.$.RightPane.setIsLoggedIn(true);
		this.$.RightPane.$.commentView.setIsLoggedIn(true);
		this.$.LeftPane.setIsLoggedIn(true);
		this.$.LeftPane.setUserModHash(this.userStruct.modHash);
		this.$.LeftPane.$.newPostButton.setDisabled(false);
	},
	openLoginPopup: function() {
		//Open the login popup and show the scrim
		//If the user credentials are saved in the preferences struct get the user info from that
		this.$.spinScrim.show();
		this.$.loginPopup.openAtCenter();
		if ( this.prefsStruct.savedLogin == true ) {
			this.$.popupUserNameInput.setValue(this.prefsStruct.userName);
			this.$.popupPasswordInput.setValue(this.prefsStruct.password);
			this.$.popupSaveCheckBox.setChecked(this.prefsStruct.savedLogin);
		}
	},
	loginButtonClicked: function() {
		//The login button has been clicked by the user
		//Set the preferences struct to the values in the input boxes
		//Save the preferences
		//Initiate login
		this.prefsStruct.userName = this.$.popupUserNameInput.getValue();
		this.prefsStruct.password = this.$.popupPasswordInput.getValue();
		
		if ( this.$.popupSaveCheckBox.getChecked() == true) {
			
			this.prefsStruct.savedLogin = true;
			
		}
		this.savePrefs();
		this.loginBegin();
	
	},
	checkBoxHandler: function() {
		// Manages the checkboxes in the login window
		if (this.$.popupSaveCheckBox.getChecked() == true ) {
			this.prefsStruct.savedLogin = true;
		}
		if (this.$.popupSaveCheckBox.getChecked() == false ) {
			this.prefsStruct.savedLogin = false;
		}
	},
	closeLoginPopup: function() {
		// Closes the login popup and hides the scrim
		this.$.loginPopup.close();
		this.$.spinScrim.hide();
	},
// End log in related functions
////////////////////////////////////////////////////////////////////////////////////////////////////

// Begin one-off functions
////////////////////////////////////////////////////////////////////////////////////////////////////
	subredditSubmit: function() {
		//The user has hit the go button
		//Tell the left pane to set the current subreddit to the value in the subreddit input box
		//Make sure the "Hot" and "New" tabs are set correctly (because we always load hot first)
		//And refresh the story list

		 if ( this.parseInput(this.$.headerInputBox.getValue() ) == true) { 
			this.showHeaderSpinner();
			this.currentSubreddit = this.$.headerInputBox.getValue();
			this.$.LeftPane.setCurrentSubreddit(this.$.headerInputBox.getValue());
			this.$.LeftPane.$.uiList.punt();
		} else {
			
			this.$.headerInputBox.setValue("");
			this.$.headerInputBox.setHint("Enter a valid subreddit name. No funny stuff.");
			
		}


	},
	
	parseInput: function(stringToParse) {
		
		var regExp = /^([a-zA-Z0-9_-]+)$/;
		if(regExp.test(stringToParse)==false)
		{
			return false;
		}
		return true;
		
	},	
	savePrefs: function() {
		//Send the contents of the preferences struct to the prefsHandler for storage in the cookie
		this.$.prefsHandler.setPrefs(this.prefsStruct);
	},
	resizeWebView: function(){
		// Resize the web view. We call this if the right pane gets resized
		this.$.RightPane.webResize();
	},
	
	trapEnterKey: function(inSender, inKeyCode) {
		
		if (inKeyCode.keyCode == 13) {

			this.$.headerInputBox.forceBlur();


			enyo.keyboard.setManualMode(true);
			enyo.keyboard.hide();
			enyo.keyboard.setManualMode(false);

			this.subredditSubmit();
		
		};
	},
	
	goHome: function() {
		//Home button was pressed
		//Return to the user's Reddit frontpage
		
		this.showHeaderSpinner();
		this.currentSubreddit = "";
		this.$.LeftPane.setCurrentSubreddit("");
		this.$.LeftPane.$.uiList.punt();
		this.$.headerInputBox.setValue("");
		

	},
// End one-off functions
////////////////////////////////////////////////////////////////////////////////////////////////////

// Begin Bookmark functions
////////////////////////////////////////////////////////////////////////////////////////////////////

	openBookmarks: function() {
		//Called when the bookmarks button gets pressed
		//Tell the bookmarks webservice to go off and get subreddits

		this.$.favoriteSubredditsButton.setDepressed(true);
		this.$.allSubredditsButton.setDepressed(false);
		this.$.searchSubredditsButton.setDepressed(false);
		
		this.showFavSubreddits();
	},
	
	getBookmarksSuccess: function(inSender, inResponse) {
		//Bookmarks returned successful; we now have a list of subreddits

		//Put the bookmarks into an array. Put the previous and next names into variables so we can naviagte through the reddits
		this.bookmarkArray = inResponse.data.children;
		this.bookmarkNextPage = inResponse.data.after;
		this.bookmarkPrevPage = inResponse.data.before;

		enyo.log(this.$.getBookmarks.getUrl());
		enyo.log("DEBUG: next in object " + inResponse.data.after);
		enyo.log("DEBUG: prev in object " + inResponse.data.before);		
		enyo.log("DEBUG: next " + this.bookmarkNextPage);
		enyo.log("DEBUG: prev " + this.bookmarkPrevPage);
		
		//Make the next and previous buttons active if appropriate
		if ( this.bookmarkNextPage == null ) { this.$.loadNextSubredditsPageButton.setDisabled(true); } else { this.$.loadNextSubredditsPageButton.setDisabled(false); };
		if ( this.bookmarkPrevPage == null ) { this.$.loadPrevSubredditsPageButton.setDisabled(true); } else { this.$.loadPrevSubredditsPageButton.setDisabled(false); };
		

		
		//Open the pane with the subreddit bookmark UI
		this.$.toaster.open();		

		//Load and refresh the bookmarkList UI
		this.$.bookmarkList.refresh();
		this.$.bookmarkList.punt();
		
		
	},
	
	getBookmarkItems: function(inSender, inIndex) {
		//Display the list of subreddits
		
		//Set the current row to the index of the row we're displaying
		var currentRow = this.bookmarkArray[inIndex];
		
		//If there's a row in the bookmark array that corrosponds to our current position in the list play ball
		if ( currentRow ) {
			
			//Draw the UI and get out of dodge
			this.$.bookmarkTitle.setContent(currentRow.data.title);
			this.$.bookmarkDescription.setContent(this.textCutterUpper(currentRow.data.description));
			return true;
		}
	},
	
	textCutterUpper: function(inSomeString) {
		//Truncates (and adds elipses, or elipsises, or whatever, to) text greater than 70 chars long 
		var returnText = "";
		if ( inSomeString.length > 50) {
			returnText = inSomeString.substring(0,50) + "...";
		} else {
			returnText = inSomeString;
		}
		return returnText;
	},
	
	showFavSubreddits: function() {
		//Show the user's subreddits
		
		this.$.loadPrevSubredditsPageButton.setShowing(true);
		this.$.loadNextSubredditsPageButton.setShowing(true);
		
		this.$.favoriteSubredditsButton.setDepressed(true);
		this.$.allSubredditsButton.setDepressed(false);
		this.$.searchSubredditsButton.setDepressed(false);
		
		
		this.$.searchBar.setShowing(false);
		this.bookmarkDepth = 0;
		this.$.getBookmarks.setUrl("http://www.reddit.com/reddits/mine.json");
		this.$.getBookmarks.call();
	},
	
	showAllSubreddits: function()  {
		
		this.$.loadPrevSubredditsPageButton.setShowing(true);
		this.$.loadNextSubredditsPageButton.setShowing(true);
		
		this.$.favoriteSubredditsButton.setDepressed(false);
		this.$.allSubredditsButton.setDepressed(true);
		this.$.searchSubredditsButton.setDepressed(false);
		//Show all subreddits
		this.$.searchBar.setShowing(false);
		this.bookmarkDepth = 0;
		this.$.getBookmarks.setUrl("http://www.reddit.com/reddits/.json");
		this.$.getBookmarks.call();
	},

	loadNextSubredditsPage: function() {
		//There are more subreddits than Reddit will send in one request
		//This allows us to "go forward a page" in the list of subreddits
		
		this.bookmarkDepth = this.bookmarkDepth + 1;
		var currentURL = this.$.getBookmarks.getUrl();
		
		//We use the current URL of the webservice to determine if we are working with all subreddits or user favorite subreddits
		//so that we can set the next URL appropriately
		if ( currentURL.search("mine") == -1) {			
			this.$.getBookmarks.setUrl("http://www.reddit.com/reddits/.json?count="+this.bookmarkDepth+"00&after="+this.bookmarkNextPage)
			this.$.bookmarkList.punt();
			this.$.getBookmarks.call();
			
		} else {			
			this.$.getBookmarks.setUrl("http://www.reddit.com/reddits/mine.json?count="+this.bookmarkDepth+"00&before="+this.bookmarkNextPage);
			this.$.bookmarkList.punt();
			this.$.getBookmarks.call()	;		
		};
	},

	loadPrevSubredditsPage: function() {
		//There are more subreddits than Reddit will send in one request
		//This allows us to "go back a page" in the list of subreddits

		this.bookmarkDepth = this.bookmarkDepth - 1;
		var currentURL = this.$.getBookmarks.getUrl();

		//We use the current URL of the webservice to determine if we are working with all subreddits or user favorite subreddits
		//so that we can set the next URL appropriately
		if ( currentURL.search("mine") == -1) {
			this.$.getBookmarks.setUrl("http://www.reddit.com/reddits/.json?count="+this.bookmarkDepth+"00&before="+this.bookmarkPrevPage)
			this.$.bookmarkList.punt();
			this.$.getBookmarks.call();
			
		} else {
			this.$.getBookmarks.setUrl("http://www.reddit.com/reddits/mine.json?count="+this.bookmarkDepth+"00&before="+this.bookmarkPrevPage);
			this.$.bookmarkList.punt();
			this.$.getBookmarks.call()	;		
		};		
	},
	
	selectedBookmark: function(inSender, inRow) {
		enyo.log("DEBUG: Entered selectedBookmark");
		
		//We've clicked on a subreddit.
		//Set the text in the bar, load it, and close the toaster
		
		var selectedSubreddit = this.bookmarkArray[inRow.rowIndex].data.display_name;
		
		this.$.headerInputBox.setValue(selectedSubreddit);
		this.subredditSubmit();
		this.$.toaster.close();
		
	},
	
	searchSubreddits: function() {
		this.bookmarkDepth = 0;
		this.$.getBookmarks.setUrl("http://www.reddit.com/reddits/search.json?q="+this.$.subredditSearchBox.getValue());
		this.$.getBookmarks.call();
	},
	
	showSearchBar: function() {
		this.$.loadPrevSubredditsPageButton.setShowing(false);
		this.$.loadNextSubredditsPageButton.setShowing(false);
		this.$.favoriteSubredditsButton.setDepressed(false);
		this.$.allSubredditsButton.setDepressed(false);
		this.$.searchSubredditsButton.setDepressed(true);
		this.$.subredditSearchBox.setValue("");
		this.bookmarkArray = [];
		this.$.searchBar.setShowing(true);
		this.$.bookmarkList.refresh();
		
	},
	trapSearchEnterKey: function(inSender, inKeyCode) {
		
		if (inKeyCode.keyCode == 13) {

			this.$.subredditSearchBox.forceBlur();


			enyo.keyboard.setManualMode(true);
			enyo.keyboard.hide();
			enyo.keyboard.setManualMode(false);

			this.searchSubreddits();
		
		};
	},
	
// End Bookmark functions
////////////////////////////////////////////////////////////////////////////////////////////////////
		

});
