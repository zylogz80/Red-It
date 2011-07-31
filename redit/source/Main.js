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
		prefsStruct: {
			// This holds information on the user's preferences
			// These are stored in the cookie
			savedLogin: false,
			userName: false,
			password: false,
			homeReddit: "frontpage"
		},

		// Are we currently logged in?
		isLoggedIn: false,

		// The default new post type. Valid values are "link" and "text"
		newPostType: "link"
	},
	components: [




		{kind: enyo.PageHeader, className: "enyo-header-dark", components: [
			// Main app header
			// This contains the Red It logo, the go button, the subreddit bar, and the login/user button
			{kind: enyo.Image, src: "icons/red-it-nobg-48.png", style: "padding-right: 10px;"},
			{kind: enyo.Spacer},
			{kind: enyo.ToolButton, caption: "Go", className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark",onclick: "subredditSubmit"},
			{kind: enyo.ToolInput, name: "headerInputBox", hint: "Enter subreddit name", style: "width: 400px"},
			{kind: enyo.Spacer},
			{name: "headerLoginButton", kind: enyo.ToolButton, className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark", caption: "Login", onclick: "openLoginPopup"}
		]},

		{kind: enyo.SlidingPane, flex: 1, components: [
			//Sliding panes
			{name: "LeftPane", style: "width: 400px", kind: "readIT.leftView", onSelectedStory: "selectedStory", onNewPostPressed: "showNewPostBox"},
			{name: "RightPane", flex: 2,kind: "readIT.rightView", 	onResize: "resizeWebView", onUpVote: "upVote", onDownVote: "downVote"},
		]},

		//Reddit API services
		//These are all different instances of the custom readIT.RedditAPI kind
		//Each instance has a different purpose
		//The names are accurately descriptive
		{kind: "readIT.RedditAPI", name: "redditLoginService", onGetDataComplete: "loginComplete"},
		{kind: "readIT.RedditAPI", name: "redditUpVoteService", onPostDataComplete: "voteComplete"},
		{kind: "readIT.RedditAPI", name: "redditDownVoteService", onPostDataComplete: "voteComplete"},
		{kind: "readIT.RedditAPI", name: "redditSubmitStoryService", onPostDataComplete: "submitComplete"},

		//The preferences handler does the work of getting and setting values in the cookie
		{kind: "readIT.PrefsHandler", name: "prefsHandler"},

		//The scrim
		{kind: enyo.Scrim, name: "spinScrim"},

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
		]}
	],

	create: function() {
		//The create function
		//We use this to define some private variables

		//Finish inheritence from our parent kind
		this.inherited(arguments);

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
		this.$.spinScrim.show()
		this.$.newPostPopup.openAtCenter();
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
		this.prefsStruct.savedLogin = this.$.popupSaveCheckBox.getChecked();
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

// Begin on-off functions
////////////////////////////////////////////////////////////////////////////////////////////////////
	subredditSubmit: function() {
		//The user has hit the go button
		//Tell the left pane to set the current subreddit to the value in the subreddit input box
		//Make sure the "Hot" and "New" tabs are set correctly (because we always load hot first)
		//And refresh the story list

		//TODO
		//TODO: all of this could be handled in a single function in leftPane that we just pass the subreddit name to
		//TODO

		this.$.LeftPane.setCurrentSubreddit(this.$.headerInputBox.getValue());

	},
	savePrefs: function() {
		//Send the contents of the preferences struct to the prefsHandler for storage in the cookie
		this.$.prefsHandler.setPrefs(this.prefsStruct);
	},
	resizeWebView: function(){
		// Resize the web view. We call this if the right pane gets resized
		this.$.RightPane.webResize();
	}
// End on-off functions
////////////////////////////////////////////////////////////////////////////////////////////////////
});
