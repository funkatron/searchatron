/*
	Controller handles events and triggers model and/or view methods
*/

App.Controller = {}

App.Controller.init = function() {
	
	
	/*
		Window event bindings
	*/
	Titanium.UI.currentWindow.addEventListener(function(event) {
		switch(event) {
			case 'resized':
				App.Prefs.saveWindowState();
				break;
			case 'moved':
				App.Prefs.saveWindowState();
				break;
		};
	});

	
	
	/*
		DOM event bindings via delegation
	*/
	$('.saved-search').live('click', function(e) {
		var searchstr = $(e.target).text();
		App.Prefs.set('current-search', searchstr);
		App.View.setSelectedSearch(e.target);
		$().trigger('startSearch');
	});
	$('#add-search').live('click', function(e) {
		App.View.promptForNewSearch();
	});
	$('#open-prefs').live('click', function(e) {
		alert("prefs not yet implemented");
	});
	$('.saved-search').live('contextmenu', function(e) {
		App.View.showSearchContextMenu(e);
	});
	$('*').live('contextmenu', function(e) {
		if (!$(e.target).hasClass('saved-search')) {
			App.View.resetContextMenu(e);
		}
		
	});
	
	


	/*
		Custom event bindings
	*/
	$().bind('startSearch', function() {
		App.View.showStatus("Sending search request…");
		var searchstr = App.Prefs.get('current-search');
		if (searchstr) {
			App.Model.getSearchResults(searchstr);
		}
	});
	
	$().bind('beginNewSearchResults', function(e) {
		App.View.showStatus("Processing response…");
		App.View.beginNewSearchResults();
	});

	$().bind('endNewSearchResults', function(e) {
		App.View.hideStatus();
		App.View.endNewSearchResults();
	});
	
	$().bind('newSearchSubmitted', function(e, str) {
		// update the model
		sc.helpers.dump('newSearchSubmitted:'+str);
		App.Model.addSearch(str);
		
		// update the view
		sc.helpers.dump('searchAdded:'+str);
		App.View.addNewSearch(str);
	});
	
	$().bind('deleteSearch', function(e, searchstr) {
		// update view
		App.View.deleteSearch(searchstr);
		
		// update model
		App.Model.deleteSearch(searchstr);
	});

	
	$().bind('refreshCurrentView', function() {
		$().trigger('startSearch');
	})


	/*
		Repeating timed events
	*/
	App.Controller.timers = {};
	App.Controller.timers.refresh = $.timer(App.Prefs.get('refresh-rate'), function() {
		$().trigger('startSearch');
	});

};