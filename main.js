// event listener for first video load only (old layout)
$(window).on("load", function() {
	/*-* OLD LAYOUT CODE STARTS HERE *-*/

	// first loaded video
	if ($("body").attr("data-spf-name") === "watch") {
		oldLayoutStart();
	}
	// recommended channels on the homepage
	// note: this code only works if you're logged in
	var homepage_observer_ol = new MutationObserver(function(mutationsList) {
		mutationsList.forEach(function(mutation) {
			if (mutation.type === "childList") {
				var channels = $("div#feed > #feed-main-what_to_watch > ol").children("li");
				for (var i = 0; i < channels.length; i+=1) {
					var channel_text = channels.eq(i).find("span.shelf-annotation.shelf-title-annotation").text();
					// these channels are always channels that you're not subscribed to
					if (channel_text === "Recommended channel for you" || channel_text === "Recommended videos for you") {
						channels.eq(i).hide();
					}
					// these seem to be youtube's automatic channels like "Movies" and whatnot, from what i've seen
					else if (new RegExp(/by .*/).test(channel_text)) {
						channels.eq(i).hide();
					}
				}
			}
		});
	});
	// make sure we do the hostname/pathname test on first load as well
	if (window.location.hostname === "www.youtube.com" && window.location.pathname === "/") {
		homepage_observer_ol.observe($("div#feed > #feed-main-what_to_watch > ol").get(0), {childList: true});
	}
	// every loaded video after the first one (in the same tab)
	$(window).on("spfdone", function() {
		if (window.location.hostname === "www.youtube.com" && window.location.pathname === "/") {
			homepage_observer_ol.observe($("div#feed > #feed-main-what_to_watch > ol").get(0), {childList: true});
		}

		oldLayoutStart();
	});

	/*-* OLD LAYOUT CODE ENDS HERE *-*/


	/*-* NEW LAYOUT CODE STARTS HERE *-*/

	// recommended channels on the homepage (new layout)
	// note: this code only works if you're logged in
	var homepage_observer_nl = new MutationObserver(function(mutationsList) {
		mutationsList.forEach(function(mutation) {
			if (mutation.type === "childList") {
				var channels = $("ytd-two-column-browse-results-renderer > ytd-section-list-renderer > div#contents").children("ytd-item-section-renderer");
				for (var i = 0; i < channels.length; i+=1) {
					var channel_text = channels.eq(i).find("yt-formatted-string#title-annotation").text();
					// these channels are always channels that you're not subscribed to
					if (channel_text === "Recommended channel for you") {
						channels.eq(i).hide();
					}
					// these seem to be youtube's automatic channels like "Movies" and whatnot, from what i've seen
					else if (new RegExp(/by .*/).test(channel_text)) {
						channels.eq(i).hide();
					}
				}
			}
		});
	});
	// warning: fires A LOT OF TIMES
	// (at least once every time you hover over something + a ton of other times)
	// likely an event that listens for all (or at least most) other events?
	$(document.body).on("yt-action", function() {
		if (window.location.hostname === "www.youtube.com" && window.location.pathname === "/") {
			homepage_observer_nl.observe($("ytd-two-column-browse-results-renderer > ytd-section-list-renderer > div#contents").get(0), {childList: true});
		}
		newLayoutStart();
	});

	/*-* NEW LAYOUT CODE ENDS HERE *-*/
});

function oldLayoutStart() {
	$('#watch-related > button').hide();
	oldLayoutRecommends();
}

function oldLayoutRecommends() {
	var channel_name = $('#watch7-user-header').children().eq(1).children().eq(0).text();
	var recommendations = $('.watch-sidebar-body > .video-list > li');

	// autoplay check
	var rec_name = recommendations.eq(0).children().eq(0).children().eq(0).children().eq(2).text();
	if (rec_name !== channel_name && $("div#watch7-sidebar-modules").children("div.watch-sidebar-section").length === 2) {
		// note: if you can find an actual, tried and true way to disable autoplay here, i will love you forever

		// hide the entire autoplay bit along with the separation line underneath it
		$('.watch-sidebar-section').eq(0).hide();
		$('.watch-sidebar-separation-line').eq(0).hide();
		// hide the "next video" button next to the play button
		$('.ytp-next-button').hide();

		console.log("Hid autoplay; name "+rec_name+" did not match channel name");
	}

	// when a playlist is being played, the first item on the sidebar is always a mix, so hide that
	// the mix hiding code below doesn't do this because it assumes the mix is the SECOND item on the sidebar
	// (and most of the time, it's right)
	if ($("div#watch-appbar-playlist")) {
		$("ul#watch-related").children().eq(0).hide();
	}

	// check the recommendation directly below autoplay to see if it's a mix
	// if yes, hide it cause fuck those
	var mix_title = recommendations.eq(1).children().eq(0).children().eq(1).text();
	var vid_title = $('#eow-title').attr('title');
	if (mix_title === 'Mix - '+vid_title) {
		recommendations.eq(1).hide();
		console.log("Hid a mix");
	}

	// hide sidebar recommendations
	var i = mix_title === 'Mix - '+vid_title ? 2 : 1;
	for (i = i; i < recommendations.length; i+=1) {
		// if recommendation name doesn't match channel name, hide the recommendation entirely
		var rec_name = recommendations.eq(i).find("span.stat.attribution").children("span").eq(0).text();
		if (rec_name !== channel_name) {
			recommendations.eq(i).hide();
			console.log("Hid element "+i+'; name '+rec_name+' did not match channel name');
		}
		else if (rec_name === channel_name && recommendations.eq(i).css("display") === "none") {
			recommendations.eq(i).show();
		}
	}

	// hide those recommendations you get after the video's over
	// note that those cards don't load until the video's almost done,
	// meaning we have to wait for them to appear before fucking with them
	$("video").on("ended", function() {
		recommendations = $(".ytp-endscreen-content").children("a");
		for (var i = 0; i < recommendations.length; i+=1) {
			rec_name = recommendations.eq(i).find("span.ytp-videowall-still-info-author").text();
			rec_name = rec_name.split(' • ')[0];
			if (rec_name !== channel_name && recommendations.eq(i).css("display") !== "none") {
				recommendations.eq(i).hide();
				console.log("Hid end card "+i);
			}
		}
	});

	// delete the onload listener
	// for some reason, $(window).one("load", ...) doesn't work, so we just have to do this instead
	$(window).off("load");
}

function newLayoutStart() {
	$('#continuations').hide();
	newLayoutRecommends();
}

function newLayoutRecommends() {
	var channel_name = $("#owner-container > #owner-name > .yt-simple-endpoint.style-scope.yt-formatted-string").text();
	var recommendations = $(".style-scope.ytd-watch > #items > *");

	// autoplay check
	var rec_name = recommendations.eq(0).find("#byline").text();
	if (rec_name !== channel_name && recommendations.eq(0).css("display") !== "none") {
		var ap_button = $("ytd-compact-autoplay-renderer div#toggleButton");
		// this means autoplay is enabled; let's fix that
		if ($("ytd-compact-autoplay-renderer > #head > paper-toggle-button").attr("aria-pressed") === "true") {
			ap_button.click();
		}
		recommendations.eq(0).hide();
		// hide the "next video" button next to the play button
		$("a.ytp-next-button.ytp-button").hide();
		console.log("Hid autoplay; name "+rec_name+" did not match channel name");
	}

	// check next element to see if it's a mix
	// if yes, hide it cause fuck those
	var mix_title = recommendations.eq(1).find("#video-title").attr("title");
	var vid_title = $("#info #container > h1 > yt-formatted-string").text();
	if (mix_title === 'Mix - '+vid_title && recommendations.eq(1).css("display") !== "none") {
		recommendations.eq(1).hide();
		console.log("Hid a mix");
	}

	// hide sidebar recommendations
	var i = mix_title === 'Mix - '+vid_title ? 2 : 1;
	for (i = i; i < recommendations.length; i+=1) {
		var rec_name = recommendations.eq(i).find("#dismissable #byline-inner-container > yt-formatted-string").text();
		if (rec_name !== channel_name && recommendations.eq(i).css("display") !== "none") {
			recommendations.eq(i).hide();
			console.log("Hid element "+i+"; name "+rec_name+" did not match channel name");
		}
		// the above code can be finicky when selecting other videos, so undo any unwanted hiding just in case
		else if (rec_name === channel_name && recommendations.eq(i).css("display") === "none") {
			recommendations.eq(i).show();
		}
	}

	// hide those recommendations you get after the video's over
	// note that those cards don't load until the video's almost done,
	// meaning we have to wait for them to appear before fucking with them
	try {
		var video_end_recs = new MutationObserver(function(mutationsList, observer) {
			mutationsList.forEach(function(mutation) {
				if (mutation.type === "childList") {
					recommendations = $("#ytp-endscreen-content").children("a");
					for (var i = 0; i < recommendations.length; i+=1) {
						var rec_name = recommendations.eq(i).find("span.ytp-videowall-still-info-author");
						rec_name = rec_name.split(" • ")[0];
						if (rec_name !== channel_name && recommendations.eq(i).css("display") !== "none") {
							recommendations.eq(i).hide();
							console.log("Hid end card "+i);
						}
					}
					observer.disconnect();
				}
			});
		});
		video_end_recs.observe($(".ytp-endscreen-content").get(0), {childList: true});
	}
	catch (e) {} // in case the event handler fires before the ytp-endscreen-content element actually exists
}