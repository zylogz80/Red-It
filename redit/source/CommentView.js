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
	published: {
		isLoggedIn: false
	},
	components: [
		{kind: "Header", name: "commentsHeader", style: "width: 100%", showing: "false", components: [
			{kind: enyo.VFlexBox, style: "width: 80%", components: [
				{name: "headerTextsdsdsd", content: "Viewing comments on:", style: "font-size: 14px"},				
				{name: "headerText", content: "Header", style: "font-size: 14px"}
			]},
			{kind: enyo.Spacer},
			{kind: "Button", caption: "Back"}
		]},
		{kind: enyo.FadeScroller, flex: 1, components: [ 
			// VirtualRepeater is a list that can be automatically filled with a number of items
			{name: "commentList", kind: enyo.VirtualList, tapHighlight: true, onSetupRow: "getListItem", components: [
				//{kind: enyo.Item,  name: "commentItem", layoutKind: enyo.HFlexLayout, tapHighlight: true, align: "center", components:[
					
					{kind: enyo.Item, name: "commentItem", onclick: "clickedOnItem", components: [

						{kind: enyo.RowGroup, name: "commentRowGroup", style: " width: 95%; margin-right: 6px;", components: [	
						
							{kind: enyo.VFlexBox, components: [

								{kind: enyo.HtmlContent, name: "commentText",style: "font-size: 14px"},
								{kind: enyo.HFlexBox, pack: "center", components: [ 
									{kind: enyo.Button, caption: "Options", style: "font-size: 12px; text-align: left; color: #8A8A8A", onclick: "showOptions"}
								
								]}
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
	],
	clickedOnItem: function(inSender, inEvent) {
		enyo.log("DEBUG: CLICKCKCKCKKS " + this.commentResults[inEvent.rowIndex].data.name.slice(3));
//		getCommentsForParent(this.commentResults[inEvent.rowIndex].data.name.slice(3));
	
	if ( this.commentResults[inEvent.rowIndex].data.body.length > 75) {
	
		this.$.headerText.setContent(this.commentResults[inEvent.rowIndex].data.body.substring(0,75) + "..." );
	} else {
		
		this.$.headerText.setContent(this.commentResults[inEvent.rowIndex].data.body);
		
	}
		
		enyo.log("http://www.reddit.com/"+this.permaLink+this.commentResults[inEvent.rowIndex].data.name.slice(3)+".json");
		
		this.$.getCommentReplies.setUrl("http://www.reddit.com/"+this.permaLink+this.commentResults[inEvent.rowIndex].data.name.slice(3)+".json");
		this.$.getCommentReplies.call();
		
	},
	showOptions: function(inSender, inEvent) {
		
		enyo.log("DEBUG: Trying to get sender index: " + enyo.json.stringify(inSender));
		
		this.$.optionMenu.openAtEvent(inSender);
	},
	create: function() {
		this.inherited(arguments);
		enyo.log("DEBUG: CommentView Exists");
		this.$.commentsHeader.setShowing(false);
		this.commentResults = [];
		
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
	getCommentsSuccess: function(inSender, inResponse) {

		this.$.commentsHeader.setShowing(false);


		enyo.log("DEBUG: CommentView getCommentsSuccess");
		// Put the rss results into an rssResults array
		this.commentResults = inResponse[1].data.children;
		//permaLinkArray = [];
		permaLinkArray = inResponse[0].data.children;
		this.storyObject = inResponse[0];
		this.permaLink = permaLinkArray[0].data.permalink;
		enyo.log("DEBUG: Permalink " + this.permaLink);

		// Re-render the item list to fill it with the rss results
		this.$.commentList.refresh();
	},
	getCommentRepliesSuccess: function(inSender, inResponse) {
		enyo.log("DEBUG: COMMENT REPLIES");

		this.$.commentsHeader.setShowing(true);

		
		//I don't understand this code at all
		//These three lines took hours of trial and error
		//But it works. Fuck you reddit api. <3 <3 <3
		tempObject = inResponse[1].data.children;
		tempObject2 = tempObject[0].data.replies;
		this.commentResults = tempObject2.data.children;
		//


		this.$.commentList.refresh();
	},
	getListItem: function(inSender, inIndex){
		enyo.log("DEBUG: CommentView getListItem");
		// This function gets automatically called with the VirtualRepeater gets rendered
		// Get the count of the all the RSS items resurned
		var count = this.commentResults[inIndex];
		// If the count is > 0
		if (count) {
			enyo.log("FUCKYA");
			// If the story has a thumbnail then display it
			var score = parseInt(count.data.ups) - parseInt(count.data.downs);
			this.$.commentRowGroup.setCaption("Comment by: " + count.data.author + ", Score: " + score);
			this.$.commentText.setContent(count.data.body);//count.data.body);
			// Returning true is how the item list knows to keep iterating
			return true;
		}
	}

})
