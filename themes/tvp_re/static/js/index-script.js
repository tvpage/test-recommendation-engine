var videos = [];
var videoOffset = 0;
var profiles = [];
var currentProfile = null;
var products = [];

$( document ).ready(function() {
	fetchProfiles();

	if (localStorage.getItem("username") !== null) {
		$("#UserWelcome").html("Welcome " + localStorage.getItem("username"));
		$("#ProfilesTable").show();
		$("#NameField").hide();

	}

	$("#SetName").click(function() {
		var userName = $("#username").val().trim();
		if (userName != '') {
			localStorage.setItem("username", userName);
			window.location.reload();
		} else {
			alert("Enter Name")
		}
		
	});

	$('#FalseMatch').click(function() {
		setMatch(false);
	});

	$('#TrueMatch').click(function() {
		setMatch(true);
	});

});

function fetchProfiles() {
	$.ajax({
		url: 'http://local.tvpage.com/api/profiles',
		jsonpCallback: "renderProfiles",
		dataType: "jsonp",
	});
}

function setMatch(valid) {
	$('.tvp-button').attr('disabled','disabled');
	console.log(currentProfile);
	console.log(videos[0]);
	var data = {
		version: currentProfile.version,
		videoId: videos[0].id,
		isMatch: valid,
		user: "some user"
	};

	$.ajax({
		url: "http://local.tvpage.com/api/profiles/testVideoProfile/" + currentProfile.id,
		type: "POST",
		crossDomain: true,
		dataType: 'json',
		data: JSON.stringify(data)
	});
	videoOffset++;
	fetchViedoProfiles(currentProfile.id, profiles.indexOf(currentProfile), videoOffset);
}

function renderProfiles(data) {
	profiles = data;
	var $tableBody = $('#TVP-table').find('tbody');
	$.each(data, function(key, profile) {
		var row = "";
		if (key % 2) {
			row += "<tr class='odd'>";
		} else {
			row += "<tr>";
		}
		row += "<td><a onclick='fetchViedoProfiles(" + profile.id + ", " + key+ ")' class='tvp-link'>" + profile.name + "</a></td>"
		row += "<td>" + profile.version + "</td>"
		row += "<td></td>"
		row += "<td></td>"
		row += "<td></td>"
		row += "<td></td>"
		row += "</tr>";
		$tableBody.append(row);
	});
}

function fetchProductRecommendation() {
	$.ajax({
		url: "http://local.tvpage.com/api/profiles/testProductRecommendation",
		jsonpCallback: "renderProductRecommendationsView",
		dataType: "jsonp",
		error: function(){
			alert ("There's no Videos");
			window.location.reload();
		}
	});
}

function fetchViedoProfiles(id, index) {
	currentProfile = profiles[index];
	$.ajax({
		url: 'http://local.tvpage.com/api/profiles/testVideoProfile/' + id + "?o=" + videoOffset,
		jsonpCallback: "renderVideoProfilesView",
		dataType: "jsonp",
		error: function(){
			alert ("There's no Videos");
			window.location.reload();
		}
	});
}

function renderVideoProfilesView(data) {
	$('.tvp-button').removeAttr('disabled');
	if (typeof data.videos !== "undefined" && data.videos.length > 0) {
		videos = data.videos;
		$('#HeaderTitle').html('Profile Recommedation Engine');
		$('#ProfilesTable').hide();

		currentVideo = videos[0];
		renderProfileView(currentVideo);
		
	} else {
		alert ("There's no Videos");
	}
}

function renderProfileView(video) {
	$("#VideoTitle").html(video.title);
	$("#ProfileTitle").html(currentProfile.name);

	$('#VideoProfileView').show();
}


function renderProductRecommendationsView(data) {
	if (typeof data.video !== "undefined" && typeof data.products !== "undefined" && data.products.length > 0) {
		videos[0] = data.video;
		products = data.products;
		$('#HeaderTitle').html('Product Recommedation Engine');
		$('#ProfilesTable').hide();
		renderProductView();
	} else {
		alert ("There's no Products");
	}
}


function renderProductView() {
	$("#VideoTitlePR").html(videos[0].title);



	$('#ProductsRecommendationView').show();
}