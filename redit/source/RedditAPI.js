/*
RedditAPI
This kind is used to talk to the Reddit API to get and set data on
Reddit. This API doesn't wrap around the entire Reddit API. Just the
parts that require authentication or make sense together. Fetching
stories (for example) is handled elsewhere

This kind can be used as a component much like a webService. 
{kind: "readIT.RedditAPI", name: "redditAPI}

RedditAPI exposes 4 events: onLoginComplete, onGetDataComplete,
onPostDataComplete, onFail. These events allow the owner of 
RedditAPI to use different instances of RedditAPI for different 
tasks. For example a login routine may have onLoginComplete call
a function that then calls a user data gathering method of RedditAPI
that then throws an onGetdataComplete that calls a login complete 
function. 

Example:
{kind: "readIT.RedditAPI", 	name: "redditAPI"
							onLoginComplete: "fetchUser",
							onGetDataComplete: "loginComplete"}
							
owner.beginLogin: funciton() {
	this.$.redditAPI.submitLogin("user", "password");
}
owner.fetchUser: function() {
	this.$.redditAPI.getMyUserData();
	this.userStruct = this.$.redditAPI.getUser();
}
owner.loginComplete: function() {
	enyo.log("We're logged in now!");
}


*/
enyo.kind({
	name: "readIT.RedditAPI",
	kind: enyo.Service,
	events: {
		onLoginComplete: "",
		onGetDataComplete: "",
		onPostDataComplete: "",
		onFail: ""
	},
	published: {
		// This is where we store our user data after a login
		user:	{
			name : "",
			hasMail: "",
			modHash : "",
			linkKarma : "",
			commentKarma : "",
			isGold: ""
		}
	},
	components: [
		{kind: enyo.WebService, 
			// This service does the job of user authentication
			// from this we get the cookie
			url: "http://www.reddit.com/api/login", 
			method: "POST",
			name: "loginWebService", 
			onSuccess:"loginSuccess", 
			onFailure:"webServiceFailure"
		},
		{kind: enyo.WebService, 
			// This service gets the user's information
			// we get a lot from this, including the modhash.
			url: "http://www.reddit.com/api/me.json", 
			method: "GET",
			name: "myUserDataWebService", 
			onSuccess:"myUserDataSuccess", 
			onFailure:"webServiceFailure"
		},
		{kind: enyo.WebService, 
			// This service is used to vote on stories
			url: "http://www.reddit.com/api/vote", 
			method: "POST",
			name: "voteWebService", 
			onSuccess:"postSuccess", 
			onFailure:"webServiceFailure"
		},
		{kind: enyo.WebService, 
			// This service is used to submit new stories
			url: "http://www.reddit.com/api/submit", 
			method: "POST",
			name: "postWebService", 
			onSuccess:"submitSuccess", 
			onFailure:"webServiceFailure"
		},	
		{kind: enyo.WebService, 
			// This service is used to get data on a user
			// Requires the name of the user
			url: "http://www.reddit.com/user/about.json", 
			method: "GET",
			name: "otherUserWebService", 
			onSuccess:"otherUserDataSuccess", 
			onFailure:"webServiceFailure"
		},	
		{kind: enyo.WebService, 
			// This service is used to comment
			url: "http://www.reddit.com/api/reply", 
			method: "POST",
			name: "replyWebService", 
			onSuccess:"postSuccess", 
			onFailure:"webServiceFailure"
		}
	],	
	submitVote: function(thingID, upOrDown, userModHash) {
		// Vote on a story or comment
		this.$.voteWebService.call({id: thingID, dir: upOrDown, uh: userModHash});
		
	},
	submitReply: function(thingID, replyText, subRedditName, userModHash) {
		// Reply to a story or comment
		this.$.replyWebService.call({thing_id: thingID, text: replyText, r: subRedditName, uh: userModHash});
	},
	submitLink: function(userModHash, submissionURL, subRedditName, submissionTitle) {

		this.$.postWebService.call({uh: userModHash, kind: "link", url: submissionURL, sr: subRedditName, title: submissionTitle, r: subRedditName});
		// Submit a link
	},
	submitText: function(userModHash, submissionText, subRedditName, submissionTitle) {

		this.$.postWebService.call({uh: userModHash, kind: "self", text: submissionText, sr: subRedditName, title: submissionTitle, r: subRedditName});
		// Submit some text
	},
	getMyUserData: function() {
		this.$.myUserDataWebService.call();
	},
	getOtherUserData: function(otherUserName) {
		this.$.otherUserDataWebService.setUrl("http://www.reddit.com/user/"+otherUserName+"/about.json");
		this.$.otherUserDataWebService.call();
	},
	submitLogin: function(userName, password) {
		this.$.loginWebService.call({user: userName, passwd: password});
	},
	webServiceFailure: function() {
		this.doFail();
	},
	postSuccess: function (inSender, inResponse, inRequest) {
		this.doPostDataComplete();
	},
	submitSuccess: function (inSender, inResponse, inRequest) {
		this.doPostDataComplete();
	},
	getSuccess: function () {
		this.doGetDataComplete();
	},
	loginSuccess: function () {
		this.$.myUserDataWebService.call();
	},
	myUserDataSuccess: function(inSender, inResponse, inRequest) {
			this.user.name = inResponse.data.name; 
			this.user.hasMail = inResponse.data.has_mail;
			this.user.modHash = inResponse.data.modhash;
			this.user.linkKarma = inResponse.data.link_karma;
			this.user.commentKarma = inResponse.data.comment_karma;
			this.user.isGold = inResponse.data.is_gold;
			this.doGetDataComplete();
	},
	otherUserDataSuccess: function() {
			this.user.name = inResponse.data.name;
			this.user.hasMail = inResponse.data.has_mail;
			this.user.linkKarma = inResponse.data.link_karma;
			this.user.commentKarma = inResponse.data.comment_karma;
			this.user.isGold = inResponse.data.is_gold;
			this.doGetDataComplete();
	}
});
