class OldLayout {
	hideHomepageRecommends() {
		var subbed_channel_names = $("ul#guide-channels").find("span.display-name").children("span");
		subbed_channel_names = subbed_channel_names.map(function(){return $.trim($(this).text())}).get();
		subbed_channel_names.push("From your subscriptions");
		var listed_channel_elements = $("div#feed-main-what_to_watch > ol").children("li");
		var listed_channel_names = $("div#feed-main-what_to_watch > ol").children("li").find("h2:not(h2:has(b)) .branded-page-module-title-text, h2 > .branded-page-module-title-text, b > a.spf-link");
		listed_channel_names = listed_channel_names.map(function(){return $.trim($(this).text())}).get();
		listed_channel_names.forEach(function(name, i) {
			if (!subbed_channel_names.includes(name) && listed_channel_elements.eq(i).css("display") !== "none") {
				listed_channel_elements.eq(i).hide();
				console.log("Hid channel "+name+" as it was not on the subscription list");
			}
			else if (subbed_channel_names.includes(name) && listed_channel_elements.eq(i).css("display") === "none") {
				listed_channel_elements.eq(i).show();
			}
		});
	}

	hideTrendingRecommends() {
		var subbed_channel_names = $("ul#guide-channels").find("span.display-name").children("span");
		subbed_channel_names = subbed_channel_names.map(function(){return $.trim($(this).text())}).get();
		var trending_video_elements = $("li.expanded-shelf-content-item-wrapper, li.yt-shelf-grid-item");
		var trending_video_names = trending_video_elements.map(function() {
			return $.trim($(this).find(".yt-lockup-byline a").text());
		}).get();
		trending_video_names.forEach(function(name, i) {
			if (!subbed_channel_names.includes(name) && trending_video_elements.eq(i).css("display") !== "none") {
				trending_video_elements.eq(i).hide();
				console.log("Hid video from channel "+name+" as it was not on the subscription list");
			}
		});
		var trending_video_sections = $("ol.section-list > li");
		for (var i = 0; i < trending_video_sections.length; i++) {
			if (trending_video_sections.eq(i).find("li.expanded-shelf-content-item-wrapper:visible, li.yt-shelf-grid-item:visible").length === 0) {
				trending_video_sections.eq(i).hide();
			}
		}
	}

	hideRecommends() {
		$('#watch-related > button').hide();

		var channel_name = $('#watch7-user-header').children().eq(1).children().eq(0).text();
		var recommendations = $('.watch-sidebar-body > .video-list > li');

		// autoplay check
		var rec_name = recommendations.eq(0).children().eq(0).children().eq(0).children().eq(2).text();
		if (rec_name !== channel_name && $("div#watch7-sidebar-modules").children("div.watch-sidebar-section").length === 2) {
			$("video").on("progress", function() {
				var checkbox = $("input#autoplay-checkbox")[0];
				if (checkbox.checked === true) {
					checkbox.click();
				}
			});

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
			$(".ytp-next-button").show();
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
}

class NewLayout {
	getSubbedChannels() {
		var subbed_channel_names = [];
		var ytInitialGuideData = $("script:contains('var ytInitialGuideData')");
		if (ytInitialGuideData.length !== 0) {
			// neat trick, but i'm not sure if it works in all cases...
			ytInitialGuideData = JSON.parse(ytInitialGuideData[0].innerText.match(/ytInitialGuideData = (.+);/)[1]);
			subbed_channel_names = ytInitialGuideData["items"][1]["guideSubscriptionsSectionRenderer"]["items"].map((x) => {
				try {
					return x["guideEntryRenderer"]["title"];
				} catch (e) {
					if (e instanceof TypeError);
					else throw e;
				}
			}).concat(ytInitialGuideData["items"][1]["guideSubscriptionsSectionRenderer"]["items"][ytInitialGuideData["items"][1]["guideSubscriptionsSectionRenderer"]["items"].length - 1]["guideCollapsibleEntryRenderer"]["expandableItems"].map((x) => {
				return x["guideEntryRenderer"]["title"];
			})).filter((x)=>{return (x !== undefined && x !== "Browse channels")});
		}
		else {
			// ...so fall back to the old method if those cases ever come up
			if (!document.getElementById("sections")) {
				var event = new Event("mouseenter");
				document.getElementById("guide-button").dispatchEvent(event);
			}
			subbed_channel_names = $("div#sections > :nth-child(2) > div#items ytd-guide-entry-renderer:not(#expander-item):not(#collapser-item):not(:last-child)");
			subbed_channel_names = subbed_channel_names.map(function() {return $.trim($(this).find("yt-formatted-string").eq(0).text())}).get();
			// for some reason, random subs will have periods after their names on the sidebar, so strip those
			subbed_channel_names = $.map(subbed_channel_names, function(sub, i) {
				return sub.replace(/(.*?) \./, "$1");
			});
		}
		subbed_channel_names.push("From your subscriptions");
		return subbed_channel_names;
	}

	hideHomepageRecommends() {
		// youtube's new layout only shows a few subscriptions, so force the rest to show up
		if ($("div#expandable-items").children().length === 0) {
			$("#expander-item").click();
		}

		new Promise((resolve, reject) => {
			setTimeout(function() {
				if ($("div#expandable-items").children().length !== 0 || $("div#sections > :nth-child(2) > div#items").children().length <= 2) {
					resolve("");
				}
			}, 10);
		}).then((successMessage) => {
			var subbed_channel_names = this.getSubbedChannels();
			// worth noting that there's more than one "ytd-two-column-browse-results-renderer" in a youtube page,
			// likely because of youtube's "never ever load a new page" philosophy,
			// so just use the one that involves homepage recommendations
			var listed_channel_elements = $("ytd-two-column-browse-results-renderer[page-subtype='home']").find("ytd-item-section-renderer, ytd-rich-item-renderer");
			var listed_channel_names = listed_channel_elements.map(function() {
				if ($(this).find("#title-annotation > a, yt-formatted-string.ytd-channel-name > a").length !== 0) {
					return $.trim($(this).find("#title-annotation > a, yt-formatted-string.ytd-channel-name > a").eq(0).text());
				}
				else {
					return $.trim($(this).find("span#title").text());
				}
			}).get();
			listed_channel_names.forEach(function(name, i) {
				if (!subbed_channel_names.includes(name) && listed_channel_elements.eq(i).css("display") !== "none") {
					listed_channel_elements.eq(i).hide();
					console.log("Hid channel "+name+" as it was not on the subscription list");
				}
				else if (subbed_channel_names.includes(name) && listed_channel_elements.eq(i).css("display") === "none") {
					listed_channel_elements.eq(i).show();
				}
			});
			// youtube changed their homepage layout recently,
			// adding a "Breaking news" section,
			// and a "Free to watch" section with movies nobody cares about
			$("ytd-rich-section-renderer").hide();
		});
	}

	hideTrendingRecommends() {
		// youtube's new layout only shows a few subscriptions, so force the rest to show up
		if ($("div#expandable-items").children().length === 0) {
			$("#expander-item").click();
		}
		var subbed_channel_names = $("div#sections > :nth-child(2) > div#items").find("ytd-guide-entry-renderer:not(#expander-item):not(#collapser-item):not(:last-child)");
		subbed_channel_names = subbed_channel_names.map(function() {return $.trim($(this).find("span.title").eq(0).text())}).get();
		var trending_video_elements = $("ytd-video-renderer, ytd-grid-video-renderer");
		var trending_video_names = trending_video_elements.map(function() {
			if ($(this).find("a[href*='/channel']").length !== 0) {
				return $.trim($(this).find("a[href*='/channel']").text());
			}
			else {
				return $.trim($(this).find("a[href*='/user']").text());
			}
		}).get();
		trending_video_names.forEach(function(name, i) {
			if (!subbed_channel_names.includes(name) && trending_video_elements.eq(i).css("display") !== "none") {
				trending_video_elements.eq(i).hide();
				console.log("Hid video from channel "+name+" as it was not on the subscription list");
			}
		});
		// certain parts of the trending page are contained in their own sections instead of being individual videos,
		// so if we've hidden all the videos in a particular section, we'll hide the section as well
		var trending_video_sections = $("ytd-item-section-renderer");
		for (var i = 0; i < trending_video_sections.length; i++) {
			if (trending_video_sections.eq(i).find("ytd-video-renderer:visible, ytd-grid-video-renderer:visible").length === 0) {
				trending_video_sections.eq(i).hide();
			}
		}
	}
	
	// worth noting that because of the horseshit dynamic loading that youtube's new layout loves abusing,
	// lots of weird "else if" statements have to exist in order to keep things functioning
	hideRecommends() {
		$("#continuations > yt-next-continuation > paper-button").hide();

		var channel_name = $("#upload-info a").text();
		var recommendations = $("div#related div#items > *");

		// autoplay prevention check
		// In my testing, the control was not toggled off properly so it must include the block below
		if ($("#toggle").attr("aria-pressed") === "true") {
			$("#toggle").click();
		}

		var rec_name = recommendations.eq(0).find("yt-formatted-string#byline, yt-formatted-string.ytd-channel-name").text();
		if (rec_name !== channel_name) {
			recommendations.eq(0).hide();
			$(".ytp-next-button").hide();
			$("video").on("progress", function() {
				if ($("#toggle").attr("aria-pressed") === "true") {
					$("#toggle").click();
				}
			});
		}
		else {
			recommendations.eq(0).show();
		}
		// when a playlist is being played, the first item on the sidebar is always a mix, so hide that
		// the mix hiding code below doesn't do this because it assumes the mix is the SECOND item on the sidebar
		// (and most of the time, it's right)
		if ($("ytd-playlist-panel-renderer").attr("hidden") !== "hidden" && !recommendations.eq(0).is("ytd-compact-autoplay-renderer")) {
			recommendations.eq(0).hide();
			/*
			// Check for empty playlist that is still visible and remove the motherfucker
			if($("ytd-playlist-panel-renderer").length){
				$("ytd-playlist-panel-renderer").hide();
			}
			*/
		}

		// check the recommendation directly below autoplay to see if it's a mix
		// if yes, hide it cause fuck those
		var mix_title = recommendations.eq(1).find("yt-formatted-string#byline, yt-formatted-string.ytd-channel-name").eq(0).text();
		var vid_title = $("h1 > yt-formatted-string").text();
		if (mix_title === "Mix - "+vid_title) {
			recommendations.eq(1).hide();
		}

		// hide sidebar recommendations
		var i = mix_title === 'Mix - '+vid_title ? 2 : 1;
		for (i = i; i < recommendations.length; i+=1) {
			// if recommendation name doesn't match channel name, hide the recommendation entirely
			rec_name = recommendations.eq(i).find("yt-formatted-string#byline, yt-formatted-string.ytd-channel-name").text();
			if (rec_name !== channel_name && recommendations.eq(i).css("display") !== "none") {
				recommendations.eq(i).hide();
				console.log("Hid element "+i+'; name '+rec_name+' did not match channel name');
			}
			// fyi: "rec_name === channel_name" returns false at first and doesn't return true until slightly later,
			// because of youtube's horseshit dynamic loading
			else if (rec_name === channel_name && recommendations.eq(i).css("display") === "none") {
				recommendations.eq(i).show();
			}
		}

		// hide those recommendations you get after the video's over
		// note that those cards don't load until the video's almost done,
		// meaning we have to wait for them to appear before fucking with them
		$("video").on("ended", function() {
			recommendations = $(".ytp-endscreen-content").children("a");
			for (var i = 0; i < recommendations.length; i++) {
				rec_name = recommendations.eq(i).find("span.ytp-videowall-still-info-author").eq(0).text();
				rec_name = rec_name.split(' • ')[0];
				if (rec_name !== channel_name && recommendations.eq(i).css("display") !== "none") {
					recommendations.eq(i).hide();
					console.log("Hid end card "+i+"; name "+rec_name+" did not match channel name");
				}
				// "it just works"
				else if (rec_name === channel_name && recommendations.eq(i).css("display") === "none") {
					recommendations.eq(i).show();
				}
			}
		});

		// delete the onload listener
		// for some reason, $(window).one("load", ...) doesn't work, so we just have to do this instead
		$(window).off("load");
	}
}

// event listener for first video load only
$(document).ready(function() {
	/*-* OLD LAYOUT CODE STARTS HERE *-*/
	var old_layout = new OldLayout();
	var new_layout = new NewLayout();

	// first loaded video
	if ($("body").attr("data-spf-name") === "watch") {
		old_layout.hideRecommends();
	}
	else if ($("body").attr("data-spf-name") === "other") {
		if (window.location.pathname === "/") {
			// recommended channels on the homepage
			// note: this code only works if you're logged in
			var homepage_observer_ol = new MutationObserver(function (mutationsList) {
				mutationsList.forEach(function(mutation) {
					if (mutation.type === "childList") {
						old_layout.hideHomepageRecommends();
					}
				});
			});
			new Promise((resolve, reject) => {
				setTimeout(function() {
					if ($("div#feed > #feed-main-what_to_watch > ol")) {
						resolve();
					}
				}, 10);
			}).then((successMessage) => {
				old_layout.hideHomepageRecommends();
				homepage_observer_ol.observe($("div#feed > #feed-main-what_to_watch > ol").get(0), {childList: true});
			});
		}
		else if (window.location.pathname === "/feed/trending") {
			old_layout.hideTrendingRecommends();
		}
	}
	// runs when the user clicks on another video or whatever without changing tabs
	$(window).on("spfdone", function() {
		switch (window.location.pathname) {
			case "/":
				old_layout.hideHomepageRecommends();
				new Promise((resolve, reject) => {
					setTimeout(function() {
						if ($("div#feed > #feed-main-what_to_watch > ol")) {
							resolve();
						}
					}, 10);
				}).then((successMessage) => {
					old_layout.hideHomepageRecommends();
					homepage_observer_ol.observe($("div#feed > #feed-main-what_to_watch > ol").get(0), {childList: true});
				});
			case "/feed/trending":
				old_layout.hideTrendingRecommends();
			case "/watch":
				old_layout.hideRecommends();
			default:
		}
	});
	/*-* OLD LAYOUT CODE ENDS HERE *-*/

	/*-* NEW LAYOUT CODE STARTS HERE *-*/
	if ($("body").attr("dir")) {
		// when you hit a "subscribe" button on a video,
		// this element recommends you a bunch of other channels
		$("#inline-recs-list-renderer").hide();
		$("ytd-app").on("yt-visibility-refresh", function() {
			switch (window.location.pathname) {
				case "/":
					new_layout.hideHomepageRecommends();
					break;
				case "/feed/trending":
					new_layout.hideTrendingRecommends();
					break;
				default:
					new_layout.hideRecommends();
					break;
			}
		});
	}
	/*-* NEW LAYOUT CODE ENDS HERE *-*/
});
