/*
	View controls modifications to the UI
*/

App.View = {}

App.View.init = function() {
	App.Prefs.loadWindowState();
	
	App.View.Tpl = new SpazTemplate();
	App.View.Tpl.addTemplateMethod('search_result', App.View._createMessageElement);
	
	$().bind('new_search_timeline_data', function(e, data, info) {
		var count_new = 0;
		
		$('#messagelist li.message[data-query!='+info.query+']').remove();
		
		for (var i in data) {
			if (App.View.addMessage(data[i])) {
				count_new++;
			};
		};
		sc.helpers.removeExtraElements('#messagelist li.message', App.Prefs.get('max-timeline-length'));
		sc.helpers.updateRelativeTimes('#messagelist li.message .message-create-time', 'data-created_at');
		$('#messagelist li.message').attr('data-query', info.query);
		
		App.View.hideStatus();
		
		if (count_new > 0) {
			App.View.showNotification(count_new+ ' new results', 'There were '+count_new+' results for the query "'+info.query+'"');
		}
		
		
	});
	
	$().bind('error_search_timeline_data', function(e, info) {
		App.View.showStatus('ERROR:"'+info.msg+'" from '+info.url);
		setTimeout(6000, App.View.hideStatus);
	});
	
	$('#statusbar').click(App.View.hideStatus);
	
};


App.View.addMessage = function(msgobj) {
	if ($('#'+msgobj.id).length < 1) {
		var msgelm = App.View.Tpl.parseTemplate('search_result', msgobj);
		$.data(msgelm, 'unixtime', msgobj.unixtime);
		sch.dump(msgelm);
		$('#messagelist').prepend(msgelm);
		$('#messagelist .message-meta a').attr('target', 'ti:systembrowser');
		return true;
	}
	return false;
	
};






App.View.setSelectedSearch = function(selected_elm) {
	$('.saved-search').removeClass('selected');
	$(selected_elm).addClass('selected');
}


App.View.clearMessageList = function() {
	$('#messagelist').empty();
};


App.View.beginNewSearchResults = function() {
	App.View.clearMessageList();
}

App.View.endNewSearchResults = function() {
	$('.message:even').addClass('even');
	$('.message:odd').addClass('odd');
}

App.View.promptForNewSearch = function() {
	var rs = prompt("Enter a new search:", 'spaz');
	if (rs) {
		sc.helpers.dump('promptForNewSearch:'+rs);
		$().trigger('newSearchSubmitted', [rs.toString()]);
	}
};


App.View.createSearchElement = function(str) {
	sc.helpers.dump('createSearchElement:'+str);
	var srel  = '';
	srel += '<li class="saved-search">'+str+'</li>';
	return srel;
};


App.View.addNewSearch = function(str) {
	sc.helpers.dump('addNewSearch:'+str);
	var srel = App.View.createSearchElement(str);
	$('#saved-searches').append(srel);
};


App.View.deleteSearch = function(searchstr) {
	$('.saved-search').each( function(i) {
		if ($(this).text() == searchstr) {
			$(this).remove();
		}
	})
};


App.View.showSearchContextMenu = function(e) {
	App.View.buildSearchContextMenu(e);
};


App.View.buildSearchContextMenu = function(e) {
	var search = $(e.target).text()
	var menu = Titanium.UI.createMenu();
	menu.addItem("Delete search", function(e) {
		$().trigger('deleteSearch', [search]);
	});
	Titanium.UI.setContextMenu(menu);
	return menu;
};

App.View.resetContextMenu = function(e) {
	Titanium.UI.setContextMenu(null);
};

App.View.showNotification = function(title, message, icon, delay, callback) {

    // var notification = Titanium.Notification.createNotification(window);
    // notification.setTitle("title");
    // notification.setMessage("this is a message");
    // notification.setIcon("app://logo_large.png");
    // notification.setDelay(5000);
    // notification.setCallback(function () {
    //   alert("i've been clicked");
    // });
    // notification.show();

	var notification = Titanium.Notification.createNotification(window);
	notification.setTitle(title);
	notification.setMessage(message);
	
	if (!icon) {
		notification.setIcon("app://icon48.png");
	} else {
		notification.setIcon(icon);
	}
	
	if (callback) {
		notification.setCallback(callback);
	}
	
	if (!delay) {
		notification.setDelay(5000);
	} else {
		notification.setDelay(delay);
	}
	
	notification.show();

};


App.View.showStatus = function(msg) {
	if (App.View.statusTimeout) {
		clearTimeout(App.View.statusTimeout);
	}

	$('#statusbar-wrapper').show();
	$('#statusbar').html(msg);
	if (!$('#statusbar').is(':visible')) {
		$('#statusbar').show('slide', {direction:'down'}, 250);
	}
	
//	App.View.statusTimeout = setTimeout(App.View.hideStatus, 6000);

};


App.View.hideStatus = function() {
	if ($('#statusbar').is(':visible')) {
		$('#statusbar').hide('slide', {direction:'down'}, 250, function() {
			$('#statusbar').html('');
			$('#statusbar-wrapper').hide();
		});
	}
};


App.View._createMessageElement = function(msgobj) {
	var tg_code = 'target="ti:systembrowser"';
	
	msgobj.text = sch.autolink(msgobj.text, 'both', tg_code);
	msgobj.text = sch.autolinkTwitterScreenname(msgobj.text, '<a href="http://twitter.com/#username#" '+tg_code+'>@#username#</a>');
	msgobj.text = sch.autolinkTwitterHashtag(msgobj.text, '<a href="http://search.twitter.com/search?q=#hashtag_enc#" '+tg_code+'>##hashtag#</a>');
	
	var msgelm  = '';
	msgelm += '<li class="message" id="'+msgobj.id+'">';
	msgelm += '<div class="message-avatar"><a href="http://twitter.com/'+msgobj.from_user+'" title="'+msgobj.from_user+'" '+tg_code+'><img src="'+msgobj.profile_image_url+'" title="'+msgobj.from_user+'"/></a></div>';
	msgelm += '<div class="message-body">';
	msgelm += '<div class="message-text"><strong><a href="http://twitter.com/'+msgobj.from_user+'" title="'+msgobj.from_user+'" '+tg_code+'>'+msgobj.from_user +'</a>:</strong> ';
	msgelm += msgobj.text
	msgelm += '</div>';
	msgelm += '<div class="message-meta">From '+sch.fromHTMLSpecialChars(msgobj.source)+' &bull; <a href="http://twitter.com/'+msgobj.from_user+'/status/'+msgobj.id+'" '+tg_code+' data-created_at="'+msgobj.created_at+'" class="message-create-time"></a> &bull; <a class="button message-action message-action-reply" href="http://twitter.com/home?status=@'+msgobj.from_user+'&in_reply_to_status_id='+msgobj.id+'" '+tg_code+'>@reply</a></div>';
	msgelm += '</div>';
	msgelm += '</li>';
	
	return msgelm;
};