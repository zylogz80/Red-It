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
	name: "readIT.commentView",
	layoutKind: enyo.VFlexLayout,
	kind: enyo.Control,
	style: "background-image: url('icons/dark-gray-texture.png')",
	published: {
		isLoggedIn: false,
		userModHash: ""
	},
	components: [
		{kind: "Header", name: "commentsHeader", style: "width: 100%", components: [
//			{kind: "Button", caption: "Back"},
			{kind: enyo.Spinner, name: "loadingSpinnger", showing: "true"},
			{kind: enyo.VFlexBox, style: "width: 80%", components: [
				{name: "headerTextsdsdsd", content: "Viewing comments on:", style: "font-size: 12px"},				
				{name: "headerText", content: "Loading...", style: "font-size: 16px"}
			]},
			{kind: enyo.Spacer},
			{kind: "Button", caption: "Comment"}
		]},
		{kind: enyo.FadeScroller, flex: 1, components: [ 
			// VirtualRepeater is a list that can be automatically filled with a number of items
			{name: "commentList", kind: enyo.VirtualList, tapHighlight: true, onSetupRow: "getListItem", components: [
				//{kind: enyo.Item,  name: "commentItem", layoutKind: enyo.HFlexLayout, tapHighlight: true, align: "center", components:[
					//424242
					{kind: enyo.SwipeableItem, name: "commentItem", onclick: "clickedOnItem", style: "background-image: url('icons/gray-texture.png')",confirmCaption: enyo._$L("Up Vote"), onConfirm: "commentUpVote", onCancel: "commentDownVote",cancelCaption: enyo._$L("Down Vote"), components: [

						{kind: enyo.RowGroup, name: "commentRowGroup", style: "width: 95%; margin-right: 6px;", components: [	
						
							{kind: enyo.VFlexBox, components: [

								{kind: enyo.HtmlContent, name: "commentText",style: "color: white;font-size: 14px"},
								{name: "storyVoteStatus"}
								//{kind: enyo.HFlexBox, pack: "center", components: [ 
									//{kind: enyo.Button, caption: "Options", style: "font-size: 12px; text-align: left; color: #8A8A8A", onclick: "showOptions"}
								
								//]}
							]}
						]}
					]}
				//]}
			]}
		]},
		{kind: enyo.WebService, 
			name: "getComments", 
			onSuccess:"getCommentsSuccess", 
			onFailure:"getCommentsFail"
		}	,
		{kind: enyo.WebService, 
			name: "getCommentReplies", 
			onSuccess:"getCommentRepliesSuccess", 
			onFailure:"getCommentsFail"
		}	,
		{kind: enyo.Menu, name: "optionMenu", components: [
			{name: "optionChildren", caption: "Comments on this comment", onclick: "sendEmail"},
			{name: "optionUpVote", caption: "Up Vote", onclick: "sendMessage"},
			{name: "optionDownVote", caption: "Down Vote", onclick: "sendMessage"},
		]},	
		
		{kind: "readIT.RedditAPI", name: "redditVoteService", onPostDataComplete: "voteComplete"},


	],
	
	commentUpVote: function(inSender, inIndex) {
		
		commentID = this.commentResults[inIndex].data.name;
		
		
		this.$.redditVoteService.submitVote(commentID, "1", this.userModHash);
		
	},
	commentDownVote: function(inSender, inIndex) {
		
		commentID = this.commentResults[inIndex].data.name;
		
		
		this.$.redditVoteService.submitVote(commentID, "-1", this.userModHash);		
		
	},
	
	voteComplete: function() {
		enyo.log
		this.$.commentList.refresh();
		
	},
	
	clickedOnItem: function(inSender, inEvent) {


		
		enyo.log("http://www.reddit.com/"+this.permaLink+this.commentResults[inEvent.rowIndex].data.name.slice(3)+".json");
		
		this.$.loadingSpinnger.setShowing(true);
		this.$.headerText.setContent("Loading...");
		this.$.commentList.setShowing(false);
		
		this.$.getCommentReplies.setUrl("http://www.reddit.com/"+this.permaLink+this.commentResults[inEvent.rowIndex].data.name.slice(3)+".json");
		this.$.getCommentReplies.call();

		if ( this.commentResults[inEvent.rowIndex].data.body.length > 55) {
			this.$.headerText.setContent(this.commentResults[inEvent.rowIndex].data.body.substring(0,55) + "..." );
		} else {
			this.$.headerText.setContent(this.commentResults[inEvent.rowIndex].data.body);
		}
		
	},
	
	showOptions: function(inSender, inEvent) {
		
		enyo.log("DEBUG: Trying to get sender index: " + enyo.json.stringify(inSender));
		
		this.$.optionMenu.openAtEvent(inSender);
	},
	
	create: function() {
		this.inherited(arguments);
		enyo.log("DEBUG: CommentView Exists");
		this.commentResults = [];
		this.noStory = false;
		
		//This is pretty obscure but the only way to get a single comment's thread is:
		// reddit.com/<permalink>/<comment-id>
		//The permalink is returned in a different object (2 objects are returned when getting comments) so it isn't saved in comment results
		//We save the permalink here
		this.permaLink = "";
		
		//Store information on the currently selected story, just in case
		this.storyObject = []
	},

	getCommentsForParent: function(inCommentParentID) {
		enyo.log("DEBUG: CommentView getCommentsForParent" + "http://www.reddit.com/comments/"+inCommentParentID+".json");
		// Get comments for any parent
		// The parents could be a story or
		// or it could be another comment
		this.$.getComments.setUrl("http://www.reddit.com/comments/"+inCommentParentID+".json");
		this.$.getComments.call();
	},


	getCommentsFail: function(){
		
		enyo.log("DEBUG: Some shit went wrong");
	}
,

	getCommentsSuccess: function(inSender, inResponse) {

		enyo.log("DEBUG: CommentView getCommentsSuccess");
		// Put the rss results into an rssResults array
		this.commentResults = inResponse[1].data.children;
		
		tempObject2 = this.commentResults[0];
		if ( tempObject2 ) {
			this.noStory = false;
		} 	else {
			this.noStory = true;
			enyo.log("DEBUG: No stories bitch");
		}
		
		
		//permaLinkArray = [];
		//permaLinkArray = inResponse[0].data.children;
		this.storyObject = inResponse[0].data.children;;
		this.permaLink = this.storyObject[0].data.permalink;
		enyo.log("DEBUG: Permalink " + this.permaLink);
		
		if ( this.storyObject[0].data.title.length > 55) {
			this.$.headerText.setContent(this.storyObject[0].data.title.substring(0,55) + "..." );
		} else {
			this.$.headerText.setContent(this.storyObject[0].data.title);
		}
		

		// Re-render the item list to fill it with the rss results
		this.$.commentList.setShowing(true);
		this.$.commentList.refresh();
		this.$.commentList.punt();
		this.$.loadingSpinnger.setShowing(false);
		


	},


	getCommentRepliesSuccess: function(inSender, inResponse) {
		enyo.log("DEBUG: COMMENT REPLIES");

		this.$.commentsHeader.setShowing(true);

		
		//I don't understand this code at all
		//These three lines took hours of trial and error
		//But it works. Fuck you reddit api. <3 <3 <3
		tempObject = inResponse[1].data.children;
		tempObject2 = tempObject[0].data.replies;
		if ( tempObject2 ) {
			this.commentResults = tempObject2.data.children;
			this.noStory = false;
		} 	else {
			this.noStory = true;
			enyo.log("DEBUG: No stories bitch");
		}
			
		//

		this.$.commentList.setShowing(true);
		this.$.commentList.refresh();
		this.$.loadingSpinnger.setShowing(false);

	},



	getListItem: function(inSender, inIndex){
		enyo.log("DEBUG: CommentView getListItem");
		// This function gets automatically called with the VirtualRepeater gets rendered
		// Get the count of the all the RSS items resurned
		if (this.noStory == true) {
			this.$.commentRowGroup.setCaption("No comments found!");
			this.$.commentText.setContent("There are no comments on this yet. Why don't you add one? Or not. Whatever.");
			this.noStory = false;
			return true;
		}
		var count = this.commentResults[inIndex];
		// If the count is > 0
		if (count) {
			var score = parseInt(count.data.ups) - parseInt(count.data.downs);
			this.$.commentRowGroup.setCaption("Comment by: " + count.data.author + ", Score: " + score);
			this.$.commentText.setContent(count.data.body);//count.data.body);
			// Returning true is how the item list knows to keep iterating
			if ( count.data.likes == true) {
				// thing to do if upvoted
				this.$.storyVoteStatus.setStyle("color: #FCA044; font-size: 12px");
				this.$.storyVoteStatus.setContent("You upvoted!")
			}
			if (count.data.likes == false) {
				//thing to do if downvoted
				this.$.storyVoteStatus.setStyle("color: #5797FF; font-size: 12px");
				this.$.storyVoteStatus.setContent("You downvoted!");
			}
			return true;
		} 
	}

})
