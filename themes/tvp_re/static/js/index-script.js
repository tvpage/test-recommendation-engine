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
var apiBaseUrl = '//local.tvpage.com/api';
var profileStatistics = [];
var profileStats;

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

	$('#SudmitProfiles').click(function() {
		setProfilesMatch();
	});

	$('#NextProfiles').click(function() {
		nextProfiles();
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

function renderStatisticsNext(data){
	var dataSet = 0;
	dataSet += data.stat.product.no + data.stat.product.corrections + data.stat.product.yes;
	dataSet += data.stat.video.no + data.stat.video.corrections + data.stat.video.yes;
	dataSet += data.stat.match.no + data.stat.match.corrections + data.stat.match.yes;

	var yes = 0;
	yes += data.stat.product.yes + data.stat.video.yes + data.stat.match.yes;
	var no = 0;
	no += data.stat.product.no + data.stat.video.no + data.stat.match.no;
	$('#profileDataSet_'+data.profile).text(dataSet);
	$('#profileAccuracy_'+data.profile).text(yes+no == 0 ? '' : ( (yes / (yes+no)) * 100).toFixed(2) + '%');


	profileStats.product.yes += data.stat.product.yes;
	profileStats.product.no += data.stat.product.no;
	profileStats.product.corrections += data.stat.product.corrections;
	profileStats.video.yes += data.stat.video.yes;
	profileStats.video.no += data.stat.video.no;
	profileStats.video.corrections += data.stat.video.corrections;
	profileStats.match.yes += data.stat.match.yes;
	profileStats.match.no += data.stat.match.no;
	profileStats.match.corrections += data.stat.match.corrections;

	fetchStatisticsNext();

}
function fetchStatisticsNext(){
	var next = profileStatistics.shift();
	if ( typeof(next) == 'undefined' ){
console.log(profileStats);
                $("#profileVideosAccuracy").text( (profileStats.video.yes + profileStats.video.no == 0 ? 'n/a' : (profileStats.video.yes / (profileStats.video.yes + profileStats.video.no) ) * 100).toFixed(2) + '%' );
                $("#profileVideosDataSet").text( profileStats.video.yes + profileStats.video.no + profileStats.video.corrections );
                $("#profileProductsAccuracy").text( (profileStats.product.yes + profileStats.product.no == 0 ? 'n/a' : (profileStats.product.yes / (profileStats.product.yes + profileStats.product.no) ) * 100 ).toFixed(2) + '%' );
                $("#profileProductsDataSet").text( profileStats.product.yes + profileStats.product.no + profileStats.product.corrections );

		return;
	}
	$.ajax({
		url: apiBaseUrl + '/profiles/testProfileStatistics/' + next,
		jsonpCallback: "renderStatisticsNext",
		dataType: "jsonp",
		error: function(result, sts, err){
			console.log("Error fetching statistics for profile #" + next + ". " + err + ": " + sts);
			fetchStatisticsNext();
		}
	});
}
function fetchStatistics(){
	if ( profiles.length == 0 ){
		setTimeout(fetchStatistics, 1000);
		return;
	}

	profileStatistics = [];
	for ( x in profiles ){
		profileStatistics.push(profiles[x].id);
	}
	profileStats = {
		product: {
			yes: 0,
			no: 0,
			corrections: 0
		},
		video: {
			yes: 0,
			no: 0,
			corrections: 0
		},
		match: {
			yes: 0,
			no: 0,
			corrections: 0
		}

	};

	//for ( var i=0;i<2;i++ ){
		fetchStatisticsNext();
	//}

	/*
		$("#productRecommendationsVersion"></td>
                $("#productRecommendationsAccuracy"></td>
                $("#productRecommendationsDataSet"></td>

$.ajax({
		url: apiBaseUrl + '/profiles/testProductRecommendationStatistics',
		jsonpCallback: "productRecommendationStatistics",
		dataType: "jsonp"
	});*/
}
function productRecommendationStatistics(data){
	alert(JSON.stringify(data));
}

function nextProfiles(){
	if ( currentVideo == null )
		fetchProfileProducts();
	else
		fetchProfileVideos();
}
function setProfilesMatch() {
	var otherProfiles = currentProfiles.slice(0);

	var correct = $('#selectOtherProfileId').val();
	if ( correct != '' ){
		correct = correct.split('-');
		var otherProfile = {
			id: correct[1],
			version: correct[3],
			name: $("#selectOtherProfileId>option:selected").text(),
			_position: 9999,
			score: 0,
			isMatch: true,
			isCorrection: true
		};
		otherProfiles.push(otherProfile);
		$('#selectOtherProfileId').val('').trigger("change");;
	}

	var data = {
		videoId: currentVideo == null ? null : currentVideo.id,
		productId: currentProduct == null ? null : currentProduct.id,
		profiles: otherProfiles,
		user: localStorage.getItem("username")
	};

	$.ajax({
		url: apiBaseUrl + "/profiles/testVideoProfiles",
		type: "POST",
		crossDomain: true,
		dataType: 'json',
		data: JSON.stringify(data)
	});
	nextProfiles();
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

	if (typeof profileId !== 'undefined') {
		data.IsCorrection = true;
	}

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
	var $selectOtherProfileId = $('#selectOtherProfileId');
	$.each(data, function(key, profile) {
		var row = "";
		if (key % 2) {
			row += "<tr class='odd'>";
		} else {
			row += "<tr>";
		}
		row += "<td><a onclick='fetchViedoProfiles(" + profile.id + ", " + key+ ")' class='tvp-link'>" + profile.id + '. ' + profile.name + "</a></td>"
		row += "<td>" + profile.version + "</td>"
		row += "<td id='profileAccuracy_" + profile.id + "'></td>"
		row += "<td id='profileDataSet_" + profile.id + "'></td>"
		row += "</tr>";
		$tableBody.append(row);

		var po = '<option value="profile-' + profile.id + '-' + key + '-' + profile.version + '">' + profile.name + '</option>';
		$profileSelect.append(po);
		$selectOtherProfileId.append(po);
	});

	$profileSelect.select2();
	$selectOtherProfileId.select2();
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
	$("#VideoTitle").html(video.id + ') <b>' + video.title + '</b><br>' + video.description);
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
		$('#HeaderTitle').html('Recommedation training');
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
		$('#TVProductHolder img').attr('src', '');
		$('#TVProductHolder img').attr('src', currentProduct.imageUrl);
		renderProfilesView();
	} else {
		alert ("There's no Product Suggestions");
	}
	$(".spinner-overlay").hide();
}


function renderProfilesView() {
	if ( currentVideo == null ){
		$("#VideoTitle").html(currentProduct.id + ') <b>' + currentProduct.title + '</b><br/>' + currentProduct.description );
	}else{
		$("#VideoTitle").html(currentVideo.id + ') <b>' + currentVideo.title + '</b><br>' + currentVideo.description);
	}

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
	$("#VideoTitle").html(currentVideo.id + ')<b>' + currentVideo.title + '</b><br/>' + currentVideo.description);

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
