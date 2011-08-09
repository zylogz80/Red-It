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
			{kind: enyo.Spinner, name: "loadingSpinner", showing: "true"},
			{kind: enyo.VFlexBox, style: "width: 80%", components: [
				{name: "headerTextsdsdsd", content: "Viewing comments on:", style: "font-size: 12px"},				
				{name: "headerText", content: "Loading...", style: "font-size: 16px"}
			]},
			{kind: enyo.Spacer},
			{kind: "Button", caption: "Back", disabled: "true", name: "backButton", onclick: "backButtonPressed"},
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

//Begin Comment Vote Code	
	commentUpVote: function(inSender, inIndex) {
		commentID = this.commentResults[inIndex].data.name;
		this.$.redditVoteService.submitVote(commentID, "1", this.userModHash);
		
	},
	commentDownVote: function(inSender, inIndex) {
		commentID = this.commentResults[inIndex].data.name;
		this.$.redditVoteService.submitVote(commentID, "-1", this.userModHash);		
	},
	voteComplete: function() {
		this.$.commentList.refresh();
	},
//End Comment Vote Code


	clickedOnItem: function(inSender, inEvent) {

		this.commentDepth = this.commentDepth+1;

		this.$.backButton.setDisabled(false);
		
		this.$.loadingSpinner.setShowing(true);
		this.$.headerText.setContent("Loading...");
		this.$.commentList.setShowing(false);
		
		
		
		this.getCommentsByPermaLink(this.permaLink+this.commentResults[inEvent.rowIndex].data.name.slice(3));
		
		
		
		//this.$.getCommentReplies.setUrl("http://www.reddit.com/"+this.permaLink+this.commentResults[inEvent.rowIndex].data.name.slice(3)+".json");
		//this.$.getCommentReplies.call();

		if ( this.commentResults[inEvent.rowIndex].data.body.length > 55) {
			this.$.headerText.setContent(this.commentResults[inEvent.rowIndex].data.body.substring(0,55) + "..." );
		} else {
			this.$.headerText.setContent(this.commentResults[inEvent.rowIndex].data.body);
		}
		
	},
	
	backButtonPressed: function() {
		
		this.$.getCommentReplies.setUrl("http://www.reddit.com/"+this.commentParent.permaLink+this.commentParent.commentID +".json");
		this.$.getCommentReplies.call();

		
	},
/*	
	showOptions: function(inSender, inEvent) {
		
		
		this.$.optionMenu.openAtEvent(inSender);
	},
*/
	create: function() {
		this.inherited(arguments);
		this.commentResults = [];
		this.noStory = false;
		
		//This is pretty obscure but the only way to get a single comment's thread is:
		// reddit.com/<permalink>/<comment-id>
		//The permalink is returned in a different object (2 objects are returned when getting comments) so it isn't saved in comment results
		//We save the permalink here
		this.permaLink = "";
		
		//Store information on the currently selected story, just in case
		this.storyObject = [];
		
		//Store information on the previously selected comment
		//This is used for the back button functionality
		this.commentParent = {"commentID": "", "permaLink": ""};
		
		this.commentDepth = 0;
	},

	initCommentsForStory: function(inPermaLink) {
		this.commentDepth = 0;
		this.permaLink = inPermaLink;
		this.getCommentsByPermaLink(this.permaLink);
	},

	getCommentsByPermaLink: function(inPermaLink) {
		enyo.log("COMMENTS: getCommentsByPermaLink : " + "http://www.reddit.com"+inPermaLink+".json");
		
		this.$.getCommentReplies.setUrl("http://www.reddit.com"+inPermaLink+".json");
		
		this.$.getCommentReplies.call()
	},


	getCommentsFail: function(){
		
	}
,


	getCommentRepliesSuccess: function(inSender, inResponse) {

		this.$.commentsHeader.setShowing(true);

		//This comment is a monument
		//It marks the spot where unintelligible voodoo code once stood

		//Two objects are returned:
		//							inResponse[0] - Info on the story
		//							inResponse[1] - The comments
		//Because we're only interested in the comments we go right for object 1:		
		
		//The special sauce:
		//--------------------------------------------------------------------------------------------
		//When we're looking at the comment on a story we just want commentObject[index].data.children
		//But when we're looking at a comment on a comment we want commentObject[index].data.replies
		//This is a major fuckup on Reddit's part AFAIC
		//We can get around this by keeping track of how "deep" we are in the comment tree
		//We start with a commentDepth of 0
		//As we click on comments we increase commentDepth
		//If commentDepth > 0 then we are interested in replies
		//If commentDepth = 0 then we are interested in children
		if (this.commentDepth == 0) {
			commentObject = inResponse[1].data.children;
			
			if ( commentObject ) {
				this.noStory = false;
			} 	else {
				this.noStory = true;

			}
			
		} else {
			tempObject = inResponse[1].data.children;
			tempObject2 = tempObject[0].data.replies;		
			if ( tempObject2 ) {
				commentObject = tempObject2.data.children;
			} else {
					this.noStory = true;
			}
			
		}



			if ( this.noStory == false ) {
				this.commentResults = commentObject;
			} 	else {
				this.commentResults = [];

			}

		
		


		this.$.commentList.setShowing(true);
		this.$.commentList.refresh();
		this.$.commentList.punt();
		this.$.loadingSpinner.setShowing(false);

	},



getListItem: function(inSender, inIndex){
enyo.log("DEBUG: CommentView getListItem");
// This function gets automatically called with the VirtualRepeater gets rendered
// Get the count of the all the RSS items resurned
if (this.noStory == true) {
enyo.log("DEBUG: getListItem: noStore == true was trapped");
this.$.commentItem.setSwipeable(false);
this.$.commentRowGroup.setCaption("No comments found!");
this.$.commentText.setContent("There are no comments on this yet. Why don't you add one? Or not. Whatever.");

//this.commentResults = [];
return true;
this.noStory = false;
}

var count = this.commentResults[inIndex];
// If the count is > 0
if (count && this.noStory == false) {
	enyo.log("FUCK YOU");
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
