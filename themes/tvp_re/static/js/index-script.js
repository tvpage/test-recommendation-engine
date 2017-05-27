var videos = [];
var currentVideo = null;
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

	var dlgtrigger = document.querySelector( '[data-dialog]' ),
	somedialog = document.getElementById( dlgtrigger.getAttribute( 'data-dialog' ) ),
	dlg = new DialogFx( somedialog );

	dlgtrigger.addEventListener( 'click', dlg.toggle.bind(dlg) );

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

	$('#setCorrection').click(function() {
		var correct = $('#correctProfileId').val();
		correct = correct.split('-');
		setMatch(true, correct[1], correct[2]);
		$('#modalClose').click();
	});

	$('#TrueMatch').click(function() {
		setMatch(true);
	});

	$('#SudmitProducts').click(function() {
		setProductsMatch();
	});

	setPlayer();

});

function showAlternateProfileModal() {
	console.log("qwedf");
}

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

function setMatch(valid, profileId, index) {
	var version = (typeof index !== 'undefined')? profiles[index].version : currentProfile.version;
	var pId = (typeof profileId !== 'undefined')? profileId : currentProfile.id;

	$('.tvp-button').attr('disabled','disabled');
	var data = {
		version: version,
		videoId: currentVideo.id,
		isMatch: valid,
		user: localStorage.getItem("username"),
		position: currentVideo._position
	};

	$.ajax({
		url: apiBaseUrl + "/profiles/testVideoProfile/" + pId,
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
	var $profileSelect = $('#correctProfileId');
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

		var po = '<option value="profile-' + profile.id + '-' + key + '">' + profile.name + '</option>';
		$profileSelect.append(po);
	});

	$profileSelect.select2();
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
		$('#HeaderTitle').html('Profile training');
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
		$('#HeaderTitle').html('Recommedation training');
		$('#ProfilesTable').hide();
		player.loadVideo(createAsset(currentVideo));
		renderProductView();
	} else {
		alert ("There's no Products");
	}
	$(".spinner-overlay").hide();
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
