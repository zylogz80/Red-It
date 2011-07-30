enyo.kind({
	name: "readIT.commentView",
	layoutKind: enyo.VFlexLayout,
	kind: enyo.Control,
	published: {
		isLoggedIn: false
	},
	components: [
		{content: "FuckYa!"},
		{kind: enyo.FadeScroller, flex: 1, components: [ 
			// VirtualRepeater is a list that can be automatically filled with a number of items
			{name: "commentList", kind: enyo.VirtualList, tapHighlight: true, onSetupRow: "getListItem", components: [
				{kind: enyo.Item,  name: "commentItem", layoutKind: enyo.HFlexLayout, tapHighlight: true, align: "center", components:[
						{name: "commentText"}
				]}
			]}
		]},
		{kind: enyo.WebService, 
			name: "getComments", 
			onSuccess:"getCommentsSuccess", 
			onFailure:"getCommentsFail"
		}		
	],
	create: function() {
		enyo.log("DEBUG: CommentView Exists");
		this.commentResults = [];
	},
	getCommentsForParent: function(inCommentParentID) {
		enyo.log("DEBUG: CommentView getCommentsForParent");
		// Get comments for any parent
		// The parents could be a story or
		// or it could be another comment
		inCommentParentID = "irytq";
		this.$.getComments.setUrl("http://www.reddit.com/comments/"+inCommentParentID+".json");
		this.$.getComments.call();
	},
	getCommentsSuccess: function(inSender, inResponse) {
enyo.log("DEBUG: CommentView getCommentsSuccess");
	enyo.log("DEBUG: AFTER GETTING STORIES LOGGED IN? : " + this.isLoggedIn);
		// Put the rss results into an rssResults array
		this.commentResults = inResponse.data.children;
		// Re-render the item list to fill it with the rss results
		this.$.commentList.refresh();
	},
		getListItem: function(inSender, inIndex){
		enyo.log("DEBUG: CommentView getListItem");
		// This function gets automatically called with the VirtualRepeater gets rendered
		// Get the count of the all the RSS items resurned
		var count = this.commentResults[inIndex];
		// If the count is > 0
		if (count) {
			// If the story has a thumbnail then display it
			this.$.commentText.setContent("testing");//count.data.body_html);
			// Returning true is how the item list knows to keep iterating
			return true;
		}
	}
	
	
	

	})
