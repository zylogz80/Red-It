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
	name: "readIT.leftView",
	kind: enyo.SlidingView,
	dragAnywhere: false,
	published: {
		isLoggedIn: false,
		currentSubreddit: "",
		hotSelected: "",
		userModHash: ""
	},
	events: {
		onNewPostPressed: "",
		onSelectedStory: "",
		onCompleteDataLoad: "",
		onStartDataLoad: "",
		onLoginError: ""
	},
	components: [
			
		{kind: "errorPopup", name: "errorPopup"},
		{kind: enyo.Scrim, name: "errorScrim"},
		
		{kind: enyo.TabGroup, components: [
			{name: "headerTopTab", caption: "Hot Stories", onclick: "selectHotStories"},
			{name: "headerNewTab", caption: "Newest Stories", onclick: "selectNewStories"}
		]},

	//FadeScroller is a scrollable area that fades to the bg color at the edges
	{kind: enyo.FadeScroller, flex: 1, components: [ 
			// VirtualRepeater is a list that can be automatically filled with a number of items
			{name: "uiList", kind: enyo.VirtualList, tapHighlight: true, onSetupRow: "getListItem", components: [
				{kind: enyo.SwipeableItem,  name: "itemEntry", layoutKind: enyo.HFlexLayout, tapHighlight: false, onclick:"sendStoryToRightPane", align: "center", confirmCaption: enyo._$L("Up Vote"), onConfirm: "storyUpVote", onCancel: "storyDownVote",cancelCaption: enyo._$L("Down Vote"), components:[
						{name: "storyImage", kind: enyo.Image, style: "margin-right: 8px;height: 48px; width: 48px;", showing: false, src:""},
						{kind: enyo.VFlexBox, components: [
							{name: "storyDescription"},
							{style: "font-size: 12px; text-align: left; color: #8A8A8A", components: [
								{kind: enyo.HFlexBox, components: [
									{name: "storyInfo" },
									{name: "storyComma", content: ""},
									{content: ""},
									{name: "storyVoteStatus"}
								]},
								{kind: enyo.HFlexBox, components: [
									{name: "storySubreddit"},
									{content: "&nbsp;"},
									{name: "storyNumComments"}
								]}
							]}
							
							
						]}
						
				]}
				
				
			]}
			
			
		]},  
		{kind: enyo.Toolbar, pack: "center",  align: "center",components: [             
			//Bottom Tool bar
//		    {kind: "ToolButtonGroup", components: [
				{kind: enyo.toolButton, icon: "icons/iconset/new-card.png", name: "newPostButton", disabled: "true", className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark",onclick: "doNewPostPressed"},
				{kind: enyo.toolButton, icon: "icons/iconset/refresh.png", name: "refreshButton", className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark",onclick: "refreshList"},
				{kind: enyo.toolButton, icon: "icons/iconset/next.png", name: "loadMoreButton", className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark", disabled: true, onclick: "loadMore"}

//			]}
		]},
		// The webservice is what grabs data from the web
		{kind: enyo.WebService, 
			url: "http://www.reddit.com/.json", 
			name: "getStories", 
			onSuccess:"getStoriesSuccess",
			timeout: "30000", 
			onFailure:"getStoriesFail"
		},
		{kind: "readIT.RedditAPI", name: "redditVoteService", onPostDataComplete: "voteComplete"},

	],
	storyUpVote: function(inSender, inIndex) {
		if ( this.isLoggedIn == true ) {	
			storyID = this.arrayOfStories[inIndex].data.name;
			this.$.redditVoteService.submitVote(storyID, "1", this.userModHash);
			this.refreshStoryList();
		} else {
			this.doLoginError();
		}
		
	},
	storyDownVote: function(inSender, inIndex) {
		if ( this.isLoggedIn == true ) {	
			storyID = this.arrayOfStories[inIndex].data.name;
			this.$.redditVoteService.submitVote(storyID, "-1", this.userModHash);		
			this.refreshStoryList();
		} else {
			this.doLoginError();
		}
	},

	create: function() {
		// Overload the constructor. Call the inherited constructor.
		this.inherited(arguments); 
		// Empty arrays for stories and the ID of the next set of stories
		this.arrayOfStories = [];
		this.moreStoriesID = "";
		this.currentTab = "hot";

		//This variable is populated with a pointer to an item in the list when it is selected
		//we do this so that when the user selects another story we can change the background color of the old story back to normal
		this.selectedRow = "notActive";
		// Call the function to get the stories
		this.$.getStories.call();
	},

	loadMore: function() {
		//This function gets called when the user taps the "Load More" button
		//This function goes out and gets more stories in the subreddit
		//Apparantly not everyone has Reddit set to send 100 stories per page :P N00Bs
		
		//Fetch more on front page
		//http://www.reddit.com/.json?count=100&after=t3_jt3us
		if (this.currentSubreddit == "") {
			//Code to grab more stories for front page
			if ( this.$.headerNewTab.getDepressed() == true) {/* Set URL to new for frontpage*/ this.$.getStories.setUrl("http://reddit.com/new.json?sort=new&after="+this.moreStoriesID); };
			if ( this.$.headerTopTab.getDepressed() == true) {/* Set URL to hot for frontpage*/ this.$.getStories.setUrl("http://reddit.com/.json?after="+this.moreStoriesID); };

		}
		
		//Fetch more in a subreddit
		//http://www.reddit.com/r/Palm/.json?count=100&after=t3_gta2x
		if (this.currentSubreddit != "") {
			//Code to grab more stories for subreddit
			if ( this.$.headerNewTab.getDepressed() == true) {/* Set URL to new for subreddit*/ this.$.getStories.setUrl("http://reddit.com/r/"+this.currentSubreddit+"/new.json?sort=new&after="+this.moreStoriesID); };
			if ( this.$.headerTopTab.getDepressed() == true) {/* Set URL to hot for subreddit*/ this.$.getStories.setUrl("http://reddit.com/r/"+this.currentSubreddit+".json?after="+this.moreStoriesID); };
		}
		
		this.refreshStoryList();
		this.$.uiList.punt();
		
	},

	refreshStoryList: function() {
		
		this.$.getStories.call();
		
	},
	
	selectHotStories: function() {
		this.doStartDataLoad();
		if (this.currentSubreddit != "") {this.$.getStories.setUrl("http://reddit.com/r/"+this.currentSubreddit+".json");}
		if (this.currentSubreddit == "") {this.$.getStories.setUrl("http://reddit.com/.json");}
		//We want to remove the highlighted row ONLY IF we are are switching tabs, otherwise we want to leave the highlighted row as it
		if ( this.currentTab != "hot" ) {  this.selectedRow = "notActive"; };
		this.currentTab = "hot";
		this.refreshStoryList();
		this.$.uiList.punt();
		this.$.headerNewTab.setDepressed(false);
		this.$.headerTopTab.setDepressed(true);
		


	},
	selectNewStories: function() {
		this.doStartDataLoad();
		if (this.currentSubreddit == "") {this.$.getStories.setUrl("http://reddit.com/new.json?sort=new");}
		if (this.currentSubreddit != "") {this.$.getStories.setUrl("http://reddit.com/r/"+this.currentSubreddit+"/new.json?sort=new");}
		//We want to remove the highlighted row ONLY IF we are are switching tabs, otherwise we want to leave the highlighted row as it
		if ( this.currentTab != "new" ) {  this.selectedRow = "notActive"; };
		this.currentTab = "new";
		this.refreshStoryList();
		this.$.uiList.punt();
		this.$.headerTopTab.setDepressed(false);
		this.$.headerNewTab.setDepressed(true);

	},
	
	refreshList: function() {
		
		//enyo.log("DEBUG: Entered refreshList")
		//enyo.og("DEBUG: this.$.headerTopTab.getDepressed == " + 
		
		if ( this.$.headerTopTab.getDepressed() == true) {
			this.selectHotStories();
		};
		
		if ( this.$.headerNewTab.getDepressed() == true) {
			this.selectNewStories();
		};
	},
	
	getStoriesSuccess: function(inSender, inResponse) {
		// Put the stories into an array
		this.arrayOfStories = inResponse.data.children;
		
		// Get the "after" ID. This is what we need to go after to fetch more stories
		var tempObject = inResponse;
		this.moreStoriesID = inResponse.data.after;
				
		if (this.moreStoriesID != null) {
			
			this.$.loadMoreButton.setDisabled(false);
			
		} else {
			
			this.$.loadMoreButton.setDisabled(true);
			
		}
				
		// Re-render the item list to fill it with the rss results
		this.$.uiList.refresh();
		//this.$.uiList.punt();
		
		//This event gets fired so that the main pane can stop the loading spinner
		//when we're loading a new subreddit. It's not trapped otherwise.
		this.doCompleteDataLoad();
	},
	getStoriesFail: function(){
		// Getting the stories failed for some reason
		//this.$.errorScrim.show();
		this.owner.$.spinScrim.show();
		this.$.errorPopup.openAtCenter();
		//this.$.theButton.setCaption("Getting stories failed");
	},
	newPost: function() {
		this.doNewPostPressed();
	},
	sendStoryToRightPane: function(inSender, inEvent) {
		// The user has selected a story. We need to push the story to the right pane for display.

		//Fire the StartDataLoad event. Main will hear this and start the spinner.
		this.doStartDataLoad();

		//Store the index of the row we clicked on in this.selectedRow
		//We want to know what row is selected so that we can highlight it
		this.selectedRow = inEvent.rowIndex;

		//Refresh the list. This will use this.selectedRow to determine what row to highligh
		this.$.uiList.refresh();
		
		// Create a story structure to pass to the right panel
		var storyStruct = {
			url : "",
			title : "",
			image : "",
			score : "",
			comments : "",
			reddit: "",
			likes: "",
			id : "",
			permalink: "",
			is_self: "" };

		//The array of stories is this.arrayOfStories[] which is populated in this.getStoriesSuccess()
		//populate the structure with values from the reddit API for the selected story
		storyStruct.id = this.arrayOfStories[inEvent.rowIndex].data.name;
		storyStruct.url = this.arrayOfStories[inEvent.rowIndex].data.url;
		storyStruct.title = this.arrayOfStories[inEvent.rowIndex].data.title;
		storyStruct.reddit = this.arrayOfStories[inEvent.rowIndex].data.subreddit;
		storyStruct.likes = this.arrayOfStories[inEvent.rowIndex].data.likes;
		storyStruct.permalink = this.arrayOfStories[inEvent.rowIndex].data.permalink;
		storyStruct.is_self = this.arrayOfStories[inEvent.rowIndex].data.is_self;
		storyStruct.score = this.arrayOfStories[inEvent.rowIndex].data.score;
		storyStruct.comments = this.arrayOfStories[inEvent.rowIndex].data.num_comments;
		
		//If a story title is too long trucate it and append elipsis
		if ( storyStruct.title.length > 45) {
			storyStruct.title = storyStruct.title.substring(0,45) + "...";
		}
		
		//If the story doesn't have a thumbnail grab reddit's default "no image" thumbnail
		storyStruct.image = this.arrayOfStories[inEvent.rowIndex].data.thumbnail;
		if (!storyStruct.image) {
			storyStruct.image = "http://www.reddit.com/static/noimage.png";
		}

		//After the struct is populated pass it to the right pane
		//I know that messing with objects in the owner's $ is "wrong" and you are 
		//supposed to use events. I just don't care. I use it where required.
		//Events are a nice concept, and work well some places, but they create speghetti code in other places
		this.owner.$.RightPane.setUserModHash(this.userModHash);
		this.owner.$.RightPane.acceptStoryFromLeftPane(storyStruct);
		},

	setCurrentSubreddit: function(inSubreddit) {
		//Set the current subreddit and refresh the story list with hot stories in that subreddit
		this.selectedRow = "notActive";
		this.currentSubreddit = inSubreddit;
		this.selectHotStories();
	},

	getListItem: function(inSender, inIndex){
		// This function gets called for each row the VirtualRepeater renders
		// inIndex is the index number of the row we are rendering
		
		//Get the entry in the arrayOfStories that corrosponds to the row being rendered
		//Note: count was a terrible variable name choice here. 
		//I originally misunderstood and thought we were counting something.
		var count = this.arrayOfStories[inIndex];
		
		//Proceed-on if there is a story in the array at the current position in the repeater
		if (count) {
			// If the story has a thumbnail then display it
			
			if (inIndex == this.selectedRow && this.selectedRow != "notActive") {
				this.$.itemEntry.setStyle("background-color: #CFE6FF;");
			} else {
				this.$.itemEntry.setStyle("background-color: null;");
			}
			
		
			//Why Reddit? Why do I have to filter all these bogus images passed with relative paths? Why? IF THERE'S NOTHING THERE JUST FUCKING SEND NOTHING!
			if ( count.data.thumbnail != "" &&  count.data.thumbnail != "/static/noimage.png" &&  count.data.thumbnail != "/static/self_default2.png") {
				this.$.storyDescription.setStyle("width: 320px");
				this.$.storyImage.setShowing(true);
				this.$.storyImage.setSrc(count.data.thumbnail);

			}
			if ( count.data.thumbnail == "" || count.data.thumbnail == "/static/noimage.png" || count.data.thumbnail == "static/self_default2.png") {
				this.$.storyImage.setShowing(false);

			}
			
			this.$.storyDescription.setContent(count.data.title);
			this.$.storyInfo.setContent("Score: "  + count.data.score + ", Submitter: " + count.data.author);
			this.$.storySubreddit.setContent("Subreddit: " + count.data.subreddit + ",");
			this.$.storyNumComments.setContent(count.data.num_comments + " comments");
			
			if ( count.data.likes == true) {
				// thing to do if upvoted
				this.$.storyVoteStatus.setStyle("color: #FCA044");
				this.$.storyComma.setContent(",");
				this.$.storyVoteStatus.setContent("You upvoted!")
				return true;
			}
			if (count.data.likes == false) {
				//thing to do if downvoted
				this.$.storyVoteStatus.setStyle("color: #5797FF");
				this.$.storyComma.setContent(", ");
				this.$.storyVoteStatus.setContent("You downvoted!");
				return true;
			} else {
				this.$.storyComma.setContent("");
				this.$.storyVoteStatus.setContent("");			
				return true;	
			}
			// Returning true is how the item list knows to keep iterating
			return true;
		}
	}
})
