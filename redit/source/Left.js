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
		hotSelected: ""
	},
	events: {
		onNewPostPressed: "",
		onSelectedStory: ""
	},
	components: [
		{kind: enyo.TabGroup, components: [
			{name: "headerTopTab", caption: "Hot Stories", onclick: "selectHotStories"},
			{name: "headerNewTab", caption: "Newest Stories", onclick: "selectNewStories"}
		]},

	//FadeScroller is a scrollable area that fades to the bg color at the edges
	{kind: enyo.FadeScroller, flex: 1, components: [ 
			// VirtualRepeater is a list that can be automatically filled with a number of items
			{name: "uiList", kind: enyo.VirtualList, tapHighlight: true, onSetupRow: "getListItem", components: [
				{kind: enyo.Item,  name: "itemEntry", layoutKind: enyo.HFlexLayout, tapHighlight: false, onclick:"sendStoryToRightPane", align: "center", components:[
						{name: "storyImage", kind: enyo.Image, style: "margin-right: 8px;height: 48px; width: 48px;", showing: false, src:""},
						{kind: enyo.VFlexBox, components: [
							{name: "storyDescription"},
							{style: "font-size: 12px; text-align: left; color: #8A8A8A", components: [
								{kind: enyo.HFlexBox, components: [
									{name: "storyInfo" },
									{name: "storyComma", content: ""},
									{content: "&nbsp;"},
									{name: "storyVoteStatus"}
								]}
							]}
						]}
				]}
			]}
		]},
		{kind: enyo.Toolbar, pack: "center",  align: "center",components: [             
			//Bottom Tool bar
		    {kind: "ToolButtonGroup", components: [
				{caption: "New Post", name: "newPostButton", disabled: "true", className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark",onclick: "doNewPostPressed"}
			]}
		]},
		// The webservice is what grabs data from the web
		{kind: enyo.WebService, 
			url: "http://reddit.com/.json", 
			name: "getStories", 
			onSuccess:"getStoriesSuccess", 
			onFailure:"getStoriesFail"
		}
	],
	create: function() {
		// Overload the constructor. Call the inherited constructor.
		this.inherited(arguments); 
		// Empty array
		this.rssResults = [];

		//This variable is populated with a pointer to an item in the list when it is selected
		//we do this so that when the user selects another story we can change the background color of the old story back to normal
		this.selectedRow = false;
		// Call the function to get the stories
		this.$.getStories.call();
	},

	refreshStoryList: function(inValue) {
		this.selectedRow = false;
	
		// Go button was pressed. Set the URL for the web service and then call the service
		switch (inValue) {
			case "": 
				this.$.getStories.setUrl("http://reddit.com/r/frontpage.json");
				break;
			case "new":
				if (this.currentSubreddit == "") {this.$.getStories.setUrl("http://reddit.com/new.json?sort=new");}
				if (this.currentSubreddit != "") {this.$.getStories.setUrl("http://reddit.com/r/"+this.currentSubreddit+"/new.json?sort=new");}
				break;
			default:
				this.$.getStories.setUrl("http://reddit.com/r/"+this.currentSubreddit+".json");
				break;
		}
		this.$.getStories.call();
		
	},
	
	selectHotStories: function() {
		this.refreshStoryList();
		this.$.headerNewTab.setDepressed(false);

	},
	selectNewStories: function() {
		this.refreshStoryList("new");
		this.$.headerTopTab.setDepressed(false);
	},
	
	getStoriesSuccess: function(inSender, inResponse) {
		// Put the rss results into an rssResults array
		this.rssResults = inResponse.data.children;
		// Re-render the item list to fill it with the rss results
		this.$.uiList.refresh();
		this.$.uiList.punt();
	},
	getStoriesFail: function(){
		// Getting the stories failed for some reason
		this.$.theButton.setCaption("Getting stories failed");
	},
	newPost: function() {
		this.doNewPostPressed();
	},
	sendStoryToRightPane: function(inSender, inEvent) {
		// The user has selected a story. We need to push the story to the right pane for display.

		this.selectedRow = inEvent.rowIndex;
		
		
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
			id : "" };

		//populate the structure with values from the reddit API for the selected story
		storyStruct.id = this.rssResults[inEvent.rowIndex].data.name;
		storyStruct.url = this.rssResults[inEvent.rowIndex].data.url;
		storyStruct.title = this.rssResults[inEvent.rowIndex].data.title;
		storyStruct.reddit = this.rssResults[inEvent.rowIndex].data.subreddit;
		storyStruct.likes = this.rssResults[inEvent.rowIndex].data.likes;
		//If a story title is too long trucate it and append elipsis
		if ( storyStruct.title.length > 45) {
			storyStruct.title = storyStruct.title.substring(0,45) + "...";
		}
		
		//If the story doesn't have a thumbnail grab reddit's default "no image" thumbnail
		storyStruct.image = this.rssResults[inEvent.rowIndex].data.thumbnail;
		if (!storyStruct.image) {
			storyStruct.image = "http://www.reddit.com/static/noimage.png";
		}
		
		storyStruct.score = this.rssResults[inEvent.rowIndex].data.score;
		storyStruct.comments = this.rssResults[inEvent.rowIndex].data.num_comments;
		
		//After the struct is populated pass it to the right pane
		this.owner.$.RightPane.acceptStoryFromLeftPane(storyStruct);

		},

	getListItem: function(inSender, inIndex){
		// This function gets automatically called with the VirtualRepeater gets rendered
		// Get the count of the all the stories returned
		var count = this.rssResults[inIndex];
		// If the count is > 0
		if (count) {
			// If the story has a thumbnail then display it
			
			if (inIndex == this.selectedRow && this.selectedRow != false) {
				this.$.itemEntry.setStyle("background-color: #CFE6FF;");
			} else {
				this.$.itemEntry.setStyle("background-color: null;");
			}
		
			if ( count.data.thumbnail != "" ) {
				this.$.storyDescription.setStyle("width: 320px");
				this.$.storyImage.setShowing(true);
				this.$.storyImage.setSrc(count.data.thumbnail);

			}
			if ( count.data.thumbnail == "" ) {
				this.$.storyImage.setShowing(false);

			}
			
			this.$.storyDescription.setContent(count.data.title);
			this.$.storyInfo.setContent("Score: "  + count.data.score + ", Submitted by: " + count.data.author);
			
			if ( count.data.likes == true) {
				// thing to do if upvoted
				this.$.storyVoteStatus.setStyle("color: #FCA044");
				this.$.storyComma.setContent(",");
				this.$.storyVoteStatus.setContent("You upvoted!")
			}
			if (count.data.likes == false) {
				//thing to do if downvoted
				this.$.storyVoteStatus.setStyle("color: #5797FF");
				this.$.storyComma.setContent(", ");
				this.$.storyVoteStatus.setContent("You downvoted!");
			}
			// Returning true is how the item list knows to keep iterating
			return true;
		}
	}
})
