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
		userModHash: "",
		currentCommentParent: ""
	},
	events: {
		onLoginError: ""
	},
	components: [
	
		{kind: "readit.MarkdownConverter", name: "markdownConverter"},
	
		{kind: "Header", name: "commentsHeader", style: "width: 100%", components: [
			{kind: enyo.Spinner, name: "loadingSpinner", showing: "true"},
			{kind: enyo.VFlexBox, style: "width: 95%", components: [
				{name: "headerMessage", content: "Viewing comments on:", style: "font-size: 12px"},				
				{name: "headerText", content: "Loading...", style: "font-size: 16px"}
			]}
		]},
			{kind: enyo.Item, name: "noCommentItem", style: "background-image: url('icons/gray-texture.png')", showing: "false", components: [
				{kind: enyo.RowGroup, style: "width: 95%; margin-right: 6px;", caption: "No comments found!", components: [
					{kind: enyo.HtmlContent,  style: "color: white;font-size: 14px", content: "There are no comments on this yet. Why don't you add one? Or not. Whatever."}
				]}
			]},
		{kind: enyo.FadeScroller, flex: 1, components: [ 

			// VirtualRepeater is a list that can be automatically filled with a number of items
			{name: "commentList", kind: enyo.VirtualList, tapHighlight: true, onSetupRow: "getListItem", components: [

					{kind: enyo.SwipeableItem, name: "commentItem", onclick: "clickedOnItem", style: "background-image: url('icons/gray-texture.png')",confirmCaption: enyo._$L("Up Vote"), onConfirm: "commentUpVote", onCancel: "commentDownVote",cancelCaption: enyo._$L("Down Vote"), components: [

						{kind: enyo.RowGroup, name: "commentRowGroup", style: "width: 95%; margin-right: 6px;", components: [	
						
							{kind: enyo.VFlexBox, components: [

								{kind: enyo.HtmlContent, name: "commentText",style: "color: white;font-size: 14px", onLinkClick: "linkClicked"},
								{kind: enyo.HFlexBox, components: [
									{name: "storyVoteStatus"},
									{content: "&nbsp;"},
									{name: "commentReplyStatus"}
								]}
							]}
						]}
					]}

			]}
			

		]},
		
		{name: "appManager", 		kind: "PalmService", 
									service: "palm://com.palm.applicationManager/", 
									method: "open", 
		},
		



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

	linkClicked: function(inSender, inUrl) {
		var params = {
			"url" : inUrl
		};
		this.$.appManager.call({"id": "com.palm.app.browser", "params":params});
		
	},

//Begin Comment Vote Code	
	commentUpVote: function(inSender, inIndex) {
		
		if (this.isLoggedIn == true ) {
			commentID = this.commentResults[inIndex].data.name;
			this.$.redditVoteService.submitVote(commentID, "1", this.userModHash);
		} else {
			
			this.doLoginError();
			
		};
		
	},
	commentDownVote: function(inSender, inIndex) {
		if (this.isLoggedIn == true ) {

			commentID = this.commentResults[inIndex].data.name;
			this.$.redditVoteService.submitVote(commentID, "-1", this.userModHash);		
		} else {
			
			this.doLoginError();
			
		};

	},
	voteComplete: function() {
		this.getCommentsByPermaLink(this.commentHistory[this.commentDepth]);
		this.$.commentList.refresh();
	},
//End Comment Vote Code

	clickedOnItem: function(inSender, inEvent) {
		
		this.owner.$.backButton.setDisabled(false);

		this.commentDepth = this.commentDepth+1;
		
		this.$.loadingSpinner.setShowing(true);
		this.$.headerText.setContent("Loading...");
		this.$.commentList.setShowing(false);
		
		this.commentHistory[this.commentDepth] = this.permaLink+this.commentResults[inEvent.rowIndex].data.name.slice(3);
		this.commentIDHistory[this.commentDepth] = this.commentResults[inEvent.rowIndex].data.name;
		this.currentCommentParent = this.commentIDHistory[this.commentDepth];
		
		this.getCommentsByPermaLink(this.permaLink+this.commentResults[inEvent.rowIndex].data.name.slice(3));
		
		this.$.headerText.setContent(this.textCutterUpper(this.commentResults[inEvent.rowIndex].data.body));
		
		
		this.$.commentList.punt();
		
	},

	textCutterUpper: function(inSomeString) {
		//Truncates (and adds elipses, or elipsises, or whatever, to) text greater than 70 chars long 
		
		var returnText = "";
		
		if ( inSomeString.length > 70) {
			returnText = inSomeString.substring(0,70) + "...";
		} else {
			returnText = inSomeString;
		}
		
		return returnText;
	},

	backButtonPressed: function() {

		if (this.commentDepth > 0) {
			this.noStory = false;
			this.$.noCommentItem.setShowing(false);
			this.$.loadingSpinner.setShowing(true);
			this.$.headerText.setContent("Loading...");
			this.$.commentList.setShowing(false);
			this.commentDepth = this.commentDepth - 1;
			this.currentCommentParent = this.commentIDHistory[this.commentDepth];
			this.getCommentsByPermaLink(this.commentHistory[this.commentDepth]);
			this.$.commentList.setShowing(true);
			this.$.commentList.refresh();
			this.$.commentList.punt();
			this.$.loadingSpinner.setShowing(false);
			
		}
		
	},

	create: function() {
		this.inherited(arguments);
		this.commentResults = [];
		this.noStory = false;
		this.$.noCommentItem.setShowing(false);
		
		//This is pretty obscure but the only way to get a single comment's thread is:
		// reddit.com/<permalink>/<comment-id>
		//The permalink is returned in a different object (2 objects are returned when getting comments) so it isn't saved in comment results
		//We save the permalink here
		this.permaLink = "";
		
		//Store information on the currently selected story, just in case
		this.storyObject = [];

		//Keeps track of the permalinks for back button funcitonality
		this.commentHistory = [];
		//Keeps track of the current selected object ID for commenting
		this.commentIDHistory = [];

		
		this.commentDepth = 0;
	},

	initCommentsForStory: function(inPermaLink) {
		this.owner.$.backButton.setDisabled(true);
		this.commentDepth = 0;
		this.permaLink = inPermaLink;
		this.commentHistory[this.commentDepth] = inPermaLink;
		this.commentIDHistory[this.commentDepth] = this.currentCommentParent;
		this.getCommentsByPermaLink(this.permaLink);
		this.$.commentList.setShowing(false);
		this.$.commentList.punt();
	},
	
	
	refreshView: function() {
		
		this.getCommentsByPermaLink(this.commentHistory[this.commentDepth]);
		this.$.commentList.refresh();
		
	},

	getCommentsByPermaLink: function(inPermaLink) {
		
		this.noStory = false;
		
		if (this.commentDepth == 0) {
			
			this.owner.$.backButton.setDisabled(true);
		}
		
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
		
		//this.noStory should really be called this.noComment
		//we set it to true or false depending on whether or not there are comments for a given item
		//we use this to control when we display comments or the "no comments found" item"
		if (this.commentDepth == 0) {
			commentObject = inResponse[1].data.children;
			
			//This is purely so we can determine if there are comments or not
			commentCheckObject = commentObject[0];
		
			//If commentDepth == 0 then we are looking at comments on the story, not on other comments
			//As such we need to grab the story object and extract the title for the comment header
			storyObject = inResponse[0].data.children;
			this.$.headerText.setContent(this.textCutterUpper(storyObject[0].data.title));
			
			if ( commentCheckObject) {
				this.noStory =  false;
			} 	else {
				this.noStory = true;

			}
			
			
		} else {
			tempObject = inResponse[1].data.children;
			tempObject2 = tempObject[0].data.replies;		

			this.$.headerText.setContent(this.textCutterUpper(tempObject[0].data.body));
			
			if ( tempObject2 ) {
				commentObject = tempObject2.data.children;
			} else {
					this.noStory = true;
					
			}
			
		}


		if ( this.noStory == false ) {
			this.commentResults = commentObject;
			this.$.commentList.setShowing(true);
			this.$.noCommentItem.setShowing(false);
			this.$.commentList.refresh();
			
			this.$.loadingSpinner.setShowing(false);
			this.$.noCommentItem.setShowing(false);
		}
		if (this.noStory == true)  {
			this.commentResults = [];
			this.$.commentList.setShowing(false);
			this.$.noCommentItem.setShowing(true);
			this.$.loadingSpinner.setShowing(false);
		}

	},

	getListItem: function(inSender, inIndex){

		var count = this.commentResults[inIndex];
		// If the count is > 0
		if (count && this.noStory == false) {
			var score = parseInt(count.data.ups) - parseInt(count.data.downs);
			this.$.commentRowGroup.setCaption("Comment by: " + count.data.author + ", Score: " + score);
			this.$.commentText.setContent(this.$.markdownConverter.convertToHTML(count.data.body_html));//count.data.body);
			
			if ( count.data.replies != "" ) {
				
				this.$.commentReplyStatus.setStyle("color: #CACACA;font-size: 12px");
				this.$.commentReplyStatus.setContent("This comment has replies. Tap to veiw them or to reply yourself!");
				
			} else {
				
				this.$.commentReplyStatus.setStyle("color: #CACACA;font-size: 12px");
				this.$.commentReplyStatus.setContent("No one has replied to this comment. Tap and comment to be the first!");
				
			};
			
			// Returning true is how the item list knows to keep iterating
			if ( count.data.likes == true) {
				// thing to do if upvoted
				this.$.storyVoteStatus.setStyle("color: #FCA044; font-size: 12px");
				this.$.storyVoteStatus.setContent("You upvoted!");
				return true;
			}
			if (count.data.likes == false) {
				//thing to do if downvoted
				this.$.storyVoteStatus.setStyle("color: #5797FF; font-size: 12px");
				this.$.storyVoteStatus.setContent("You downvoted!");
				return true;
			} else {
				
				this.$.storyVoteStatus.setContent("");
				return true;
				
			}
		
		}
	}

})
