App = {}

$().ready(function() {
	App.init();
});

App.init = function() {
	
	// window.htmlLoader.navigateInSystemBrowser = true;
	
	/*
		Init and load prefs
	*/
	App.Prefs = new SpazPrefs({
		'searches':['spaz', 'al3x', 'poop'],
		'post-via':'web',
		'refresh-rate':1000*120, // two minutes
		'users':{}
	});
	App.Prefs.load();
	


	App.View.init();
	
	App.Model.init();
	
	App.Controller.init();
	
	
	/*
		Make window visible now that all is loaded
	*/
	// window.nativeWindow.visible = true;
	
};
