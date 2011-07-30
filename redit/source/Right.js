enyo.kind({
	name: "readIT.rightView",
	kind: enyo.SlidingView,
	layoutKind: enyo.VFlexLayout,
	
	dragAnywhere: false,
	events: {
		onUpVote:"",
		onDownVote: ""
	},
	published: {
		storyStruct: {
			url : "",
			title : "",
			image : "",
			score : "",
			comments : "",
			reddit: "",
			likes: "",
			id : "" },
		isLoggedIn: false
	
	},
	components: [

		{kind: enyo.TabGroup, components: [
			{name: "headerStoryTab", caption: "View Story", disabled: "true", onclick: "showStory"},
			{name: "headerCommentsTab", caption: "View Comments",  disabled: "true",onclick: "showComments"}
		]},

		{kind: enyo.Pane, name: "paneControl", flex: 1, transitionKind: "enyo.transitions.LeftRightFlyin", components: [
			{kind: "readIT.commentView", name: "commentView"},

			{kind: enyo.WebView, name: "webViewer", url: "http://linkedlistcorruption.com/redit/welcome.html"}
		]},

		{kind: enyo.Toolbar, pack: "center", align: "center",components: [             
			// Bottom tool bar
			{kind: enyo.GrabButton, slidingHandler: true},         
			{kind: enyo.RadioGroup, components: [
				{name:"footerUpButton", caption: "Up", className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark", disabled: "true", onclick: "doUpVote", depressed: false},
				{name:"footerDownButton",caption: "Down", className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark", disabled: "true", onclick: "doDownVote", depressed: false}
			]},
			
			{kind: enyo.ToolButton, className: "enyo-grouped-toolbutton-dark enyo-radiobutton-dark", name: "shareButton", disabled: "true", caption: "Share", onclick: "shareMenuShow"},
			
			]},
		{kind: enyo.Menu, name: "shareMenu", components: [
			{caption: "Email", onclick: "sendEmail"},
			{caption: "Messaging", onclick: "sendMessage"},
		]},
		{name: "emailService", 		kind: "PalmService", 
									service: "palm://com.palm.applicationManager/", 
									method: "open", 
		},
		{name: "messagingService", 	kind: "PalmService", 
									service: "palm://com.palm.applicationManager/", 
									method: "open", 
		}	
		

	],
	sendEmail : function(inSender, inResponse) {
		var params =  {
			"summary":"I found this on Reddit with Red It for webOS. Check it out!",
			"text":"Title: '"+this.storyStruct.title+"' URL: " +this.storyStruct.url+"" 
		};
		this.$.emailService.call({"id": "com.palm.app.email", "params":params});
	},
	sendMessage : function(inSender, inResponse) {

    var  params =  {
        "composeRecipients" : 
        {
            "address"     : "9193895334",
            
         },
        "messageText"     : "Title: '"+this.storyStruct.title+"' URL: " +this.storyStruct.url+"" 
	};  
		this.$.messagingService.call({"id": "com.palm.app.messaging", "params":params});
	},
	shareMenuShow: function() {
		
		this.$.shareMenu.openAtControl(this.$.shareButton);
	},
	showStory: function(){
		this.$.paneControl.selectViewByName("webViewer");	
	},
	showComments: function() {
		this.$.paneControl.selectViewByName("commentView");	
	},
	create: function() {
		
		this.inherited(arguments);
		
		this.$.webViewer.clearCache();
		
		this.areButtonsEnabled = false;
		
		// Disable the footer controls by default as no story
		// is currently active
		this.$.footerUpButton.setDepressed(false);
		this.$.footerDownButton.setDepressed(false);
		
		// TODO: Load a default welcome page
	},
	acceptStoryFromLeftPane: function(inStoryStruct) {
		// This function recieves the contents of a story struct
		// from the left pane
		this.storyStruct.url = inStoryStruct.url;
		this.storyStruct.title = inStoryStruct.title;
		this.storyStruct.image = inStoryStruct.image;
		this.storyStruct.score = inStoryStruct.score;
		this.storyStruct.comments = inStoryStruct.comments;
		this.storyStruct.reddit = inStoryStruct.reddit;
		this.storyStruct.likes = inStoryStruct.likes;
		this.storyStruct.id = inStoryStruct.id;

		this.$.headerStoryTab.setDisabled(false);
		this.$.headerCommentsTab.setDisabled(false);
		this.$.shareButton.setDisabled(false);

		if ( this.isLoggedIn = true ) {
			this.$.footerUpButton.setDisabled(false);
			this.$.footerDownButton.setDisabled(false);
		}

		//Update the visual representation of the story
		this.updateStoryUI();
		


	},
	activateButtons: function() {


	},
	updateStoryUI: function(storyStruct) {
		// Use this function to update the displayed story UI info
		// such as the title, headers, footers, etc

		this.$.webViewer.setUrl(this.storyStruct.url);

		
		if ( this.storyStruct.likes == true && this.isLoggedIn == true) {
			this.$.footerUpButton.setDepressed(true);
			this.$.footerDownButton.setDepressed(false);
		};
		if ( this.storyStruct.likes == false && this.isLoggedIn == true) {
			this.$.footerUpButton.setDepressed(false);
			this.$.footerDownButton.setDepressed(true);
		};
		if ( this.storyStruct.likes == null && this.isLoggedIn == true) {
			this.$.footerUpButton.setDepressed(false);
			this.$.footerDownButton.setDepressed(false);
		
		};

		
	},
	webResize: function() {
		this.$.webViewer.resize();
	}
})
