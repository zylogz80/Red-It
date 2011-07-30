enyo.kind({
	name: "readIT.PrefsHandler",
	kind: enyo.Service,
	events: {
		onGotPrefsSuccess: "",
		onGotPrefsFailed: "",
		onSetPrefsSuccess: ""
	},
	components: [ ],
	create: function() {
		this.inherited(arguments);
		this.prefsStruct = {
			savedLogin: false,
			userName: false,
			password: false,
			homeReddit: "frontpage"
		};

	},
	initPrefs: function() {
		if (!enyo.getCookie('appPrefs')) {
			enyo.setCookie('appPrefs', this.prefsStruct);
		}
	},
	getPrefs: function() {
		this.prefsStruct = enyo.json.parse(enyo.getCookie('appPrefs'));
		return this.prefsStruct;
	},
	setPrefs: function(inPrefsStruct) {
		enyo.setCookie('appPrefs', enyo.json.stringify(inPrefsStruct));
		
	}
})
