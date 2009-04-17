/*
	Model controls reading and writing of data. Triggers view methods via events when appropriate
*/

App.Model = {}

App.Model.init = function() {
	
	App.Model.Twitter = new SpazTwit();
	
	/*
		load up searches and display in view
	*/
	App.Model.savedSearches = App.Model.loadSearches();
	$.each(App.Model.savedSearches, function(i) {
		App.View.addNewSearch(this);
	});
	
};


App.Model.getSearchResults = function(searchstr) {
	sc.helpers.dump('gettingSearchResults');
	
	App.Model.Twitter.search(searchstr, null, 50);
};


App.Model.addSearch = function(str) {
	App.Model.savedSearches.push(str);
	App.Prefs.set('searches', App.Model.savedSearches);
};


App.Model.deleteSearch = function(searchstr) {
	App.Model.savedSearches = App.Model.savedSearches.filter(function(item) {
		return item != searchstr;
	});
	App.Prefs.set('searches', App.Model.savedSearches);
};




App.Model.loadSearches = function() {
	var searches = App.Prefs.get('searches');
	
	return searches;
};