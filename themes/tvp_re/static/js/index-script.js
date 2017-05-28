var videos = [];
var currentVideo = null;
var currentProduct = null;
var currentProfiles = [];
var profiles = [];
var currentProfile = null;
var products = [];
var selectedProducts = [];
var profileVersion = '';
var player = null
var playerDivId = '';
var apiBaseUrl = '//test.tvpage.com/api';

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

	$('#SudmitProducts').click(function() {
		setProductsMatch();
	});

	$('#SudmitProfiles').click(function() {
		setProfilesMatch();
	});

	setPlayer();

});

function setPlayer() {
	playerDivId = 'TVPlayerHolder';
	player =  new TVPage.player({
       'divId': playerDivId,
       "apiBaseUrl": apiBaseUrl, // Only used for the transcript api call atm, allows to set the host for any api call, for e.x: '//app.tvpage.com';
        "controls":{
          active:true,
          seekBar:{
          },
          floater:{
          }             
        },
        'analytics': {
          tvpa: false
        },
       'onReady': function(a,b){
          resizePlayer();
       },

       'onStateChange': function(a,b){
          if (a == 'tvp:media:cued') {
          	resizePlayer();
          }
       },

       'onError': function(e){
       }
    });
}

function fetchProfiles() {
	$.ajax({
		url: apiBaseUrl + '/profiles',
		jsonpCallback: "renderProfiles",
		dataType: "jsonp",
		error: function() {
			$(".spinner-overlay").hide();
		}
	});
}

function setProfilesMatch() {
	var data = {
		videoId: currentVideo == null ? null : currentVideo.id,
		productId: currentProduct == null ? null : currentProduct.id,
		profiles: currentProfiles,
		user: localStorage.getItem("username")
	};

	$.ajax({
		url: apiBaseUrl + "/profiles/testVideoProfiles",
		type: "POST",
		crossDomain: true,
		dataType: 'json',
		data: JSON.stringify(data)
	});
	if ( currentVideo == null )
		fetchProfileProducts();
	else
		fetchProfileVideos();
}

function setProductsMatch() {
	var data = {
		version: profileVersion,
		videoId: currentVideo.id,
		products: products,
		user: localStorage.getItem("username")
	};

	$.ajax({
		url: apiBaseUrl + "/profiles/testProductRecommendation",
		type: "POST",
		crossDomain: true,
		dataType: 'json',
		data: JSON.stringify(data)
	});
	fetchProductRecommendation();
}

function setMatch(valid) {
	$('.tvp-button').attr('disabled','disabled');
	var data = {
		version: currentProfile.version,
		videoId: currentVideo.id,
		isMatch: valid,
		user: localStorage.getItem("username"),
		position: currentVideo._position
	};

	$.ajax({
		url: apiBaseUrl + "/profiles/testVideoProfile/" + currentProfile.id,
		type: "POST",
		crossDomain: true,
		dataType: 'json',
		data: JSON.stringify(data)
	});

	currentVideo = videos[videos.indexOf(currentVideo) + 1];
	if (typeof currentVideo !== "undefined") {
		renderProfileView(currentVideo);
	} else {
		fetchViedoProfiles(currentProfile.id, profiles.indexOf(currentProfile));
	}
	
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
	$(".spinner-overlay").show();
	$.ajax({
		url: apiBaseUrl + "/profiles/testProductRecommendation",
		jsonpCallback: "renderProductRecommendationsView",
		dataType: "jsonp",
		error: function(){
			alert ("There's no Videos");
			window.location.reload();
			$(".spinner-overlay").hide();
		}
	});
}

function fetchProfileVideos() {
	$(".spinner-overlay").show();
	$.ajax({
		url: apiBaseUrl + "/profiles/testProfileVideos",
		jsonpCallback: "renderProfileVideoView",
		dataType: "jsonp",
		error: function(){
			alert ("There's no Videos");
			window.location.reload();
			$(".spinner-overlay").hide();
		}
	});
}
function fetchProfileProducts() {
	$(".spinner-overlay").show();
	$.ajax({
		url: apiBaseUrl + "/profiles/testProfileProducts",
		jsonpCallback: "renderProfileProductView",
		dataType: "jsonp",
		error: function(){
			alert ("There's no Videos");
			window.location.reload();
			$(".spinner-overlay").hide();
		}
	});
}

function fetchViedoProfiles(id, index) {
	currentProfile = profiles[index];
	$(".spinner-overlay").show();
	$.ajax({
		url: apiBaseUrl + '/profiles/testVideoProfile/' + id,
		jsonpCallback: "renderVideoProfilesView",
		dataType: "jsonp",
		error: function(){
			alert ("There's no Videos");
			window.location.reload();
			$(".spinner-overlay").hide();
		}
	});
}

function renderVideoProfilesView(data) {
	$(".spinner-overlay").hide();
	$('.tvp-button').removeAttr('disabled');
	if (typeof data.videos !== "undefined" && data.videos.length > 0) {
		
		videos = data.videos;
		$('#HeaderTitle').html('Profile Recommedation Engine');
		$('#ProfilesTable').hide();

		currentVideo = videos[0];
		renderProfileView(currentVideo);
	} else {
		alert ("There's no Videos");
		window.location.reload();
	}
}

function renderProfileView(video) {
	$('.tvp-button').removeAttr('disabled');
	$("#VideoTitle").html(video.title);
	$("#ProfileTitle").html(currentProfile.name);

	$('#TVProductHolder').hide();
	$('#TVPlayerHolder').show();
	player.loadVideo(createAsset(video));

	$("#SelectionView").show();
	$('#VideoProfileView').show();
}


function renderProductRecommendationsView(data) {
	if (typeof data.video !== "undefined" && typeof data.products !== "undefined" && data.products.length > 0) {
		// setPlayer("TVPlayerHolderPR");
		currentVideo = data.video;
		products = data.products;
		profileVersion = data.profileVersion;
		$('#HeaderTitle').html('Product Recommedation Engine');
		$('#ProfilesTable').hide();
		$('#TVProductHolder').hide();
		$('#TVPlayerHolder').show();
		player.loadVideo(createAsset(currentVideo));
		renderProductView();
	} else {
		alert ("There's no Products");
	}
	$(".spinner-overlay").hide();
}

function renderProfileVideoView(data) {
	if (typeof data.entity !== "undefined" && typeof data.profiles !== "undefined" && data.profiles.length > 0) {
		// setPlayer("TVPlayerHolderPR");
		currentVideo = data.entity;
		currentProduct = null;
		currentProfiles = data.profiles;
		$('#HeaderTitle').html('Video Profiles');
		$('#ProfilesTable').hide();
		$('#TVPlayerHolder').show();
		$('#TVProductHolder').hide();
		player.loadVideo(createAsset(currentVideo));
		renderProfilesView();
	} else {
		alert ("There's no Video Suggestions");
	}
	$(".spinner-overlay").hide();
}
function renderProfileProductView(data) {
	if (typeof data.entity !== "undefined" && typeof data.profiles !== "undefined" && data.profiles.length > 0) {
		// setPlayer("TVPlayerHolderPR");
		currentVideo = null;
		currentProduct = data.entity;
		currentProfiles = data.profiles;
		$('#HeaderTitle').html('Product Profiles');
		$('#ProfilesTable').hide();
		$('#TVProductHolder').show();
		$('#TVPlayerHolder').hide();
		$('#TVProductHolder img').attr('src', currentProduct.imageUrl);
		renderProfilesView();
	} else {
		alert ("There's no Product Suggestions");
	}
	$(".spinner-overlay").hide();
}


function renderProfilesView() {
	$("#VideoTitle").html(currentVideo == null ? currentProduct.title : currentVideo.title);

	var $profilesGrid = $("#ProfilesGrid");
	var pt = '';
	$.each(currentProfiles, function(key, profile) {
		pt += '<div class="pure-u-1-4">';
        pt += '<div class="product-img-thumb-wrapper ">';
        pt += '<div id="profileId-' + profile.id + '" onclick="setProfile(' + key + ')" class="product-img-thumb" ></div>';
        pt += '</div>';
        pt += '<div class="product-title">' + profile.name + '</div>';
        pt += '</div>';
		
		currentProfiles[key].isMatch = false;
	});

	$profilesGrid.html(pt);
	$("#SelectionView").show();
	$('#ProfileRecommendationView').show();
}

function setProfile(index) {
	var $selected = $('#profileId-' + currentProfiles[index].id);
	if (!$selected.parent().hasClass('active')) {
		$selected.parent().addClass('active');
		currentProfiles[index].isMatch = true;

	} else {
		$selected.parent().removeClass('active');
		currentProfiles[index].isMatch = false;
	}
}


function renderProductView() {
	$("#VideoTitle").html(currentVideo.title);

	var $productsGrid = $("#ProductsGrid");
	var pt = '';
	$.each(products, function(key, product) {
		pt += '<div class="pure-u-1-4">';
        pt += '<div class="product-img-thumb-wrapper ">';
        pt += '<div id="productId-' + product.id + '" onclick="setProduct(' + key + ')" class="product-img-thumb" style="background-image: url(' + product.imageUrl + ');"></div>';
        pt += '</div>';
        pt += '<div class="product-title">' + product.title + '</div>';
        pt += '</div>';
		
		products[key].isMatch = false;
	});

	$productsGrid.html(pt);
	$("#SelectionView").show();
	$('#ProductsRecommendationView').show();
}

function setProduct(index) {
	var $selected = $('#productId-' + products[index].id);
	if (!$selected.parent().hasClass('active')) {
		$selected.parent().addClass('active');
		products[index].isMatch = true;

	} else {
		$selected.parent().removeClass('active');
		products[index].isMatch = false;
	}
}


function createAsset (obj){
	if (!obj || "object" !== typeof obj || obj.length == 0 || typeof obj.asset == "undefined") return;

    var asset = obj.asset;
    asset.assetId = obj.id;
    asset.assetTitle = obj.title;
    asset.loginId = obj.loginId;


    if (!asset.sources) asset.sources = [{ file: asset.videoId }];
   	asset.type = asset.type || 'youtube';

    return asset;
};



function resizePlayer() {
	player.resize($('#' + playerDivId).width(), document.getElementById(playerDivId).offsetHeight);
}
