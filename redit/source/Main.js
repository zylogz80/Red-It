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
	




		{kind: enyo.PageHeader, className: "enyo-header-dark", components: [
			// Main app header
			// This contains the Red It logo, the go button, the subreddit bar, and the login/user button
			{kind: enyo.Image, src: "icons/red-it-nobg-48.png", style: "padding-right: 10px;"},
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
			{name: "LeftPane", style: "width: 400px", kind: "readIT.leftView", onSelectedStory: "selectedStory", onNewPostPressed: "showNewPostBox", onCompleteDataLoad: "hideHeaderSpinner", onStartDataLoad: "showHeaderSpinner"},
			{name: "RightPane", flex: 2,kind: "readIT.rightView", 	onResize: "resizeWebView", onUpVote: "upVote", onNewCommentPressed: "openCommentPopup", onDownVote: "downVote", onCompleteDataLoad: "hideHeaderSpinner", onStartDataLoad: "showHeaderSpinner"},
		]},

		{kind: enyo.Toaster, flyInFrom: "right", style: "top: 0px; bottom: 0px", lazy: false, components: [
			{className: "enyo-sliding-view-shadow"},
					{name: "bookmarkList",lazy: false, kind: enyo.VirtualList, tapHighlight: true, onSetupRow: "getBookmarkItems", components: [
						{kind: enyo.Item,lazy: false, name: "bookmarkItem", layoutKind: enyo.VFlexLayout, tapHighlight: false, onClick: "selectedBookmark", components: [
							{kind: enyo.RowGroup,lazy: false, name: "commentRowGroup", style: "width: 95%; margin-right: 6px;", components: [	
								//{kind: enyo.Button, caption: "Derp"},
								{content: "", name: "bookmarkTitle"},
								{content: "", name: "bookmarkDescription", style: "font-size: 12px; text-align: left; color: #8A8A8A"}
							]}
						]}
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
		
		this.bookmarkArray = [];

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
	},
	downVote: function(){
	// Gets the story struct from the story that is loaded on the right pane
	// and sends that to the Reddit API for a down vote		
	this.storyStruct = this.$.RightPane.getStoryStruct();
		this.$.redditDownVoteService.submitVote(	this.storyStruct.id, //Story ID 
												"-1", // Down Vote			
												this.userStruct.modHash);//User Mod Hash
	},
	voteComplete: function() {
		// Refreshes the story list after a vote
		this.$.LeftPane.refreshStoryList();
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
		this.$.spinScrim.hide(); // hide the scrim
		this.isLoggedIn = true; 
		this.$.RightPane.setIsLoggedIn(true);
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
		this.showHeaderSpinner();
		this.currentSubreddit = "";
		this.$.LeftPane.setCurrentSubreddit("");
		this.$.LeftPane.$.uiList.punt();
		this.$.headerInputBox.setValue("");
		

	},
	
	openBookmarks: function() {
		
		this.$.getBookmarks.call()
		enyo.error("DEBUG: entered openBookmarks");
		
	},
	
	getBookmarksSuccess: function(inSender, inResponse) {
		
		enyo.error("DEBUG: entered getBookmarksSuccess");
		this.bookmarkArray = inResponse.data.children;
		
		enyo.error("DEBUG: bookmarkArray is : " + this.bookmarkArray);

		
		
		this.$.toaster.open();		
		
		
		this.$.bookmarkList.refresh();
		
		
	},
	
	getBookmarkItems: function(inSender, inIndex) {
		
		enyo.error("DEBUG: entered getBookmarkItems");
		
		var currentRow = this.bookmarkArray[inIndex];
		
		enyo.error("DEBUG: currentRow is : " + currentRow);
		
		if ( currentRow ) {
			
			
			this.$.bookmarkTitle.setContent(currentRow.data.title);
			this.$.bookmarkDescription.setContent(currentRow.data.description);
			
			return true;
			
		}
		
	}
	
		
// End one-off functions
////////////////////////////////////////////////////////////////////////////////////////////////////
});
