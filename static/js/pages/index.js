//var currentVideo = null;
//var currentProduct = null;
//var currentProfiles = [];
//var currentProfile = null;
//var selectedProducts = [];
//var profileVersion = '';
//var player = null
//var playerDivId = '';

var profiles = [];
var products = [];
var profileStatistics = [];
var profileStats;

$( document ).ready(function() {

	//Fetch the profiles and render them
	$.ajax({
		url: app.apiBaseUrl + '/profiles',
		dataType: "jsonp",
		error: function() {
			$(".spinner-overlay").hide();
		}
	}).done(function(data){
		profiles = data;

		var profilesHtml = "";
		var optionsHtml = "";

	    for (var key in profiles){
	      var profile = profiles[key];
	      profile.key = key;
	      profile.nameEncoded = encodeURIComponent(profile.name);

	      profilesHtml += app.utils.render('#ProfileRowTemplate', profile);
	      optionsHtml += app.utils.render('#ProfileOptionTemplate', profile);
	    }

	  	$('#TVP-table').find('tbody').append(profilesHtml);
		$('#correctProfileId').append(optionsHtml).select2();
		$('#selectOtherProfileId').append(optionsHtml).select2();
	});

	$("#loginId").val(localStorage.getItem("loginId"));
	$("#loginId").change(function() {
		var loginId = $("#loginId").val().trim();
		localStorage.setItem("loginId", loginId);
		refreshWelcome();
	});

	function refreshWelcome(){
		var loginId = $("#loginId").val().trim();
		var msg = "Welcome " + localStorage.getItem("username");
		if ( loginId != "" )
			msg += ". Working on login #" + loginId;
		else
			msg += ". Working on all accounts";
		$("#UserWelcome").html(msg);
	}

	if (localStorage.getItem("username") !== null) {
		$("#ProfilesTable").show();
		$("#NameField").hide();
		refreshWelcome();
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

	/*$('#setCorrection').click(function() {
		var correct = $('#correctProfileId').val();
		correct = correct.split('-');
		setMatch(true, correct[1], correct[2]);
		$('#modalClose').click();
	});

	$('#TrueMatch').click(function() {
		setMatch(true);
	});
	$('#SkipMatch').click(function() {
		fetchProfileSuggestions(currentProfile.id, (currentVideo.entityType == 1 ? 'video' : 'product'));
	});

	$('#SudmitProducts').click(function() {
		setProductsMatch();
	});
	$('#SudmitProductsSkip').click(function() {
		fetchProductRecommendation();
	});

	$('#SudmitProfiles').click(function() {
		setProfilesMatch();
	});

	$('#NextProfiles').click(function() {
		nextProfiles();
	});

	setPlayer();*/
});

// function setPlayer() {
// 	playerDivId = 'TVPlayerHolder';
// 	player =  new TVPage.player({
//        'divId': playerDivId,
//        "apiBaseUrl": app.apiBaseUrl, // Only used for the transcript api call atm, allows to set the host for any api call, for e.x: '//app.tvpage.com';
//         "controls":{
//           active:true,
//           seekBar:{
//           },
//           floater:{
//           }
//         },
//         'analytics': {
//           tvpa: false
//         },
//        'onReady': function(a,b){
//           resizePlayer();
//        },

//        'onStateChange': function(a,b){
//           if (a == 'tvp:media:cued') {
//           	resizePlayer();
//           }
//        },

//        'onError': function(e){
//        }
//     });
// }

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
		var total;

		//standard video
		total = profileStats.video.yes + profileStats.video.no;
		var profileVideosAccuracy = total == 0 ? 'n/a' : ((profileStats.video.yes / total ) * 100).toFixed(2) + '%';
		var profileVideosDataSet = total + profileStats.video.corrections;

		//standard product
		total = profileStats.product.yes + profileStats.product.no;
		var profileProductsAccuracy = total == 0 ? 'n/a' : ((profileStats.product.yes / total ) * 100 ).toFixed(2) + '%';
		var profileProductsDataSet = total + profileStats.product.corrections;

		//standard recommend
		total = profileStats.recommend.yes + profileStats.recommend.no;
		var profileRecommendAccuracy = total == 0 ? 'n/a' : ((profileStats.recommend.yes / total ) * 100).toFixed(2) + '%';
		var profileRecommendDataSet = total + profileStats.recommend.corrections;

		//accuracy video
		total = profileStats.types[1].yes + profileStats.types[1].no;
		var profileVideosAccuracyOverall = total == 0 ? 'n/a' : ((profileStats.types[1].yes / total ) * 100).toFixed(2) + '%';
		var profileVideosDataSetOverall = total;

		//accuracy product
		total = profileStats.types[2].yes + profileStats.types[2].no;
		var profileProductsAccuracyOverall = total == 0 ? 'n/a' : ((profileStats.types[2].yes / total ) * 100).toFixed(2) + '%';
		var profileProductsDataSetOverall = total;

		//accuracy recommend
		total = profileStats.types[3].yes + profileStats.types[3].no;
		var profileRecommendAccuracyOverall = total == 0 ? 'n/a' : ((profileStats.types[3].yes / total ) * 100).toFixed(2) + '%';
		var profileRecommendDatasetOverall = total;


    //$("#profileVideosAccuracy").text( "" + profileVideosAccuracyOverall + " (overall: " + profileVideosAccuracy + ")" );
    $("#profileVideosDataSet").text( "" + profileVideosDataSetOverall + " inputs. (" + (profileStats.types[1].matched / profileStats.types[1].total * 100).toFixed(2) + "% total coverage - " + profileStats.types[1].matched + "/" + profileStats.types[1].total + ")" );// + " (overall: " + profileVideosDataSet + ")" );
    //$("#profileProductsAccuracy").text( "" + profileProductsAccuracyOverall + " (overall: " + profileProductsAccuracy + ")" );
    $("#profileProductsDataSet").text( "" + profileProductsDataSetOverall + " inputs. (" + (profileStats.types[2].matched / profileStats.types[2].total * 100).toFixed(2) + "% total coverage - " + profileStats.types[2].matched + "/" + profileStats.types[2].total + ")");// + " (overall: " + profileProductsDataSet + ":)" );
		//$("#productRecommendationsAccuracy").text("Video match rate: " + profileRecommendAccuracyOverall + ", Product match rate: " + profileRecommendAccuracy + "");
		$("#productRecommendationsAccuracy").text("Video exact match rate: " + profileRecommendAccuracyOverall);
		$("#productRecommendationsDataSet").text("Videos matched " + profileStats.types[3].yes + "/" + profileRecommendDatasetOverall);// + ", Products matched: " + profileRecommendDataSet + "");


		return;
	}
	$.ajax({
		url: app.apiBaseUrl + '/profilestest/profileStatistics/' + next,
		jsonpCallback: "renderStatisticsNext",
		dataType: "jsonp",
		error: function(result, sts, err){
			console.log("Error fetching statistics for profile #" + next + ". " + err + ": " + sts);
			fetchStatisticsNext();
		}
	});
}

function renderTestAccuracyStatistics(data){
	profileStats.types[data.testType] = data
}

function renderRecommendStatistics(data){
	profileStats.recommend = data.stat.match
}

function fetchStatistics(){
	if ( profiles.length == 0 ){
		setTimeout(fetchStatistics, 1000);
		return;
	}

	profileStatistics = [];
	for ( x in profiles ){
		//profileStatistics.push(profiles[x].id);
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
		},
		types: {
		}
	};

	$.ajax({
			url: app.apiBaseUrl + '/profilestest/accuracyStatistics/1?loginId=' + $("#loginId").val().trim(),
			jsonpCallback: "renderTestAccuracyStatistics",
			dataType: "jsonp",
			error: function(result, sts, err){
				console.log("Error fetching statistics for type #1" + ". " + err + ": " + sts);
			},
			success: function(){
		  	$.ajax({
		  			url: app.apiBaseUrl + '/profilestest/accuracyStatistics/2?loginId=' + $("#loginId").val().trim(),
		  			jsonpCallback: "renderTestAccuracyStatistics",
		  			dataType: "jsonp",
		  			error: function(result, sts, err){
		  				console.log("Error fetching statistics for type #2" + ". " + err + ": " + sts);
		  			},
						success: function(){
			 		  	$.ajax({
			 		  			url: app.apiBaseUrl + '/profilestest/accuracyStatistics/3?loginId=' + $("#loginId").val().trim(),
			 		  			jsonpCallback: "renderTestAccuracyStatistics",
			 		  			dataType: "jsonp",
			 		  			error: function(result, sts, err){
			 		  				console.log("Error fetching statistics for type #3" + ". " + err + ": " + sts);
			 		  			},
									success: function(){
										$.ajax({
												url: app.apiBaseUrl + '/profilestest/productRecommendationStatistics?loginId=' + $("#loginId").val().trim(),
												jsonpCallback: "renderRecommendStatistics",
												dataType: "jsonp",
												error: function(result, sts, err){
													console.log("Error fetching statistics for type #1" + ". " + err + ": " + sts);
												},
												success: function(){
													fetchStatisticsNext();
												}
										});
									}
			 		  	 });
						}
		  	 });
			}
	 });

}

function productRecommendationStatistics(data){
	alert(JSON.stringify(data));
}

// function nextProfiles(){
// 	if ( currentVideo == null )
// 		fetchProfileProducts();
// 	else
// 		fetchProfileVideos();
// }

// function setProfilesMatch() {
// 	var otherProfiles = currentProfiles.slice(0);
// 	for ( var x in otherProfiles ){
// 		if ( typeof otherProfiles[x]._position == 'undefined' )
// 			otherProfiles[x]._position = 0;
// 	}

// 	var correct = $('#selectOtherProfileId').val();
// 	if ( correct != '' ){
// 		correct = correct.split('-');
// 		var otherProfile = {
// 			id: correct[1],
// 			version: correct[3],
// 			name: $("#selectOtherProfileId>option:selected").text(),
// 			_position: 9999,
// 			score: 0,
// 			isMatch: true,
// 			isCorrection: true
// 		};
// 		otherProfiles.push(otherProfile);
// 		$('#selectOtherProfileId').val('').trigger("change");;
// 	}

// 	var data = {
// 		videoId: currentVideo == null ? null : currentVideo.id,
// 		productId: currentProduct == null ? null : currentProduct.id,
// 		loginId: (currentVideo == null ? (currentProduct == null ? $("#loginId").val().trim() : currentProduct.loginId) : currentVideo.loginId),
// 		profiles: otherProfiles,
// 		user: localStorage.getItem("username")
// 	};

// 	$.ajax({
// 		url: app.apiBaseUrl + "/profilestest/videoProfiles",
// 		type: "POST",
// 		crossDomain: true,
// 		dataType: 'json',
// 		data: JSON.stringify(data),
// 		success: function(){
// 			nextProfiles();
// 		},
// 		error: function(){
// 			nextProfiles(); //probably comes here due to CORS
// 		}
// 	});

// }

// function setProductsMatch() {
// 	var data = {
// 		version: profileVersion,
// 		videoId: currentVideo.id,
// 		products: products,
// 		user: localStorage.getItem("username")
// 	};

// 	$.ajax({
// 		url: app.apiBaseUrl + "/profilestest/productRecommendation",
// 		type: "POST",
// 		crossDomain: true,
// 		dataType: 'json',
// 		data: JSON.stringify(data)
// 	});
// 	fetchProductRecommendation();
// }

// function setMatch(valid, profileId, index) {
// 	var version = (typeof index !== 'undefined')? profiles[index].version : currentProfile.version;
// 	var pId = (typeof profileId !== 'undefined')? profileId : currentProfile.id;

// 	$('.tvp-button').attr('disabled','disabled');
// 	var data = {
// 		version: version,
// 		isMatch: valid,
// 		user: localStorage.getItem("username"),
// 		position: 0
// 	};
// 	data.title = currentVideo.title;
// 	data.description = currentVideo.description;

// 	if ( currentVideo.entityType == 1 ){
// 		data.videoId = currentVideo.id;
// 		data.loginId = currentVideo.loginId;
// 		data.title = currentVideo.title;
// 	}
// 	if ( currentVideo.entityType == 4 ){
// 		data.productId = currentVideo.id;
// 		data.loginId = currentVideo.loginId;

// 	}

// 	if (typeof profileId !== 'undefined') {
// 		data.isCorrection = true;
// 	}

// 	$.ajax({
// 		url: app.apiBaseUrl + "/profilestest/videoProfile/" + pId + "?loginId=" + $("#loginId").val().trim(),
// 		type: "POST",
// 		crossDomain: true,
// 		dataType: 'json',
// 		data: JSON.stringify(data)
// 	});

// 	fetchProfileSuggestions(currentProfile.id, (currentVideo.entityType == 1 ? 'video' : 'product'));
// }

// function fetchProductRecommendation() {
// 	$(".spinner-overlay").show();
// 	$.ajax({
// 		url: app.apiBaseUrl + "/profilestest/productRecommendation?loginId=" + $("#loginId").val().trim(),
// 		jsonpCallback: "renderProductRecommendationsView",
// 		dataType: "jsonp",
// 		error: function(){
// 			alert ("Error loading data");
// 			window.location.reload();
// 			$(".spinner-overlay").hide();
// 		}
// 	});
// }

// function fetchProfileVideos() {
// 	$(".spinner-overlay").show();
// 	$.ajax({
// 		url: app.apiBaseUrl + "/profilestest/profileVideos?loginId=" + $("#loginId").val().trim(),
// 		jsonpCallback: "renderProfileVideoView",
// 		dataType: "jsonp",
// 		error: function(){
// 			alert ("Error loading data");
// 			window.location.reload();
// 			$(".spinner-overlay").hide();
// 		}
// 	});
// }

// var negativeVideoTests = [];
// function fetchNegativeVideoTests() {
// 	$(".spinner-overlay").show();
// 	$.ajax({
// 		url: app.apiBaseUrl + "/profilestest/profile/negatives/videos?loginId=" + $("#loginId").val().trim(),
// 		jsonpCallback: "renderNegativeVideoTests",
// 		dataType: "jsonp",
// 		error: function(){
// 			alert ("Error loading data");
// 			window.location.reload();
// 			$(".spinner-overlay").hide();
// 		}
// 	});
// }

// var correctionRunId=0;

// function renderNegativeVideoTests(data){
//   $(".spinner-overlay").hide();
//   negativeVideoTests = data;
//   renderNegativeVideoTest();
// }

// function renderNegativeVideoTest(){
//   var video = negativeVideoTests.shift();
//   if (typeof video !== "object")
//     return;
  
//   correctionRunId=video.id;
  
//   $('#ProfilesTable').hide();
//   $('#TVPlayerHolder').show();
//   $('#TVProductHolder').hide();
  
//   var videoData = JSON.parse(video.data);
//   $.each(videoData, function (key, value) {
//     video[key]=value;
//   });
  
//   currentVideo=video;
//   player.loadVideo(createAsset(currentVideo));
  
//   $("#VideoTitle").html(video.entityId + ') <b>' + video.title + '</b><br>' + video.description);
// 	var $profilesGrid = $("#ProfilesGrid");
// 	var pt = '';
  
//   var profileCorrect = profiles[video.profileId_correct];
//   var profileAssigned = profiles[video.profileId_assigned];
  
//   profileCorrect.isMatch=false;
//   profileAssigned.isMatch=false;
  
//   currentProfiles=[];
//   currentProfiles[0] = profiles[video.profileId_correct];
//   currentProfiles[1] = profiles[video.profileId_assigned];
  
//   pt = '';
//   pt += '<div class="pure-u-1-4">';
//   pt += '<div class="product-img-thumb-wrapper ">';
//   pt += '<div id="profileId-' + profileCorrect.id + '" class="product-img-thumb" onclick="setProfile(0);" ></div>';
//   pt += '</div>';
//   pt += '<div class="product-title"><b>User: </b>' + profileCorrect.name + '</div>';
//   pt += '</div>';
  
//   pt += '<div class="pure-u-1-4">';
//   pt += '<div class="product-img-thumb-wrapper ">';
//   pt += '<div id="profileId-' + profileAssigned.id + '" class="product-img-thumb" onclick="setProfile(1);"></div>';
//   pt += '</div>';
//   pt += '<div class="product-title"><b>System: </b>' + profileAssigned.name + '</div>';  
//   pt += '</div>';
  
// 	$profilesGrid.html(pt);
// 	$("#SelectionView").show();
  
//   $('#SudmitProfiles').off('click').on('click', function() {
// 		correctProfilesMatch();
// 	});
  
//   $('#NextProfiles').off('click').on('click', function() {
//     renderNegativeVideoTest();
// 	});
  
// 	$('#ProfileRecommendationView').show();
// }

// function correctProfilesMatch(){
// 	var otherProfiles = currentProfiles.slice(0);
// 	for ( var x in otherProfiles ){
// 		if ( typeof otherProfiles[x]._position == 'undefined' )
// 			otherProfiles[x]._position = 0;
// 	}

// 	var correct = $('#selectOtherProfileId').val();
// 	if ( correct != '' ){
// 		correct = correct.split('-');
// 		var otherProfile = {
// 			id: correct[1],
// 			version: correct[3],
// 			name: $("#selectOtherProfileId>option:selected").text(),
// 			_position: 9999,
// 			score: 0,
// 			isMatch: true,
// 			isCorrection: true
// 		};
// 		otherProfiles.push(otherProfile);
// 		$('#selectOtherProfileId').val('').trigger("change");;
// 	}

// 	var data = {
//     entity: currentVideo,
//     runId: correctionRunId,
//     testId: currentVideo.testId,
// 		videoId: currentVideo == null ? null : currentVideo.entityId,
//     productId: null,
// 		loginId: (currentVideo == null ? (currentProduct == null ? $("#loginId").val().trim() : currentProduct.loginId) : currentVideo.loginId),
// 		profiles: otherProfiles,
// 		user: localStorage.getItem("username")
// 	};

// 	$.ajax({
// 		url: app.apiBaseUrl + "/profilestest/videoProfiles/correct",
// 		type: "POST",
// 		crossDomain: true,
// 		dataType: 'json',
// 		data: JSON.stringify(data),
// 		success: function(){
// 			renderNegativeVideoTest();
// 		},
// 		error: function(){
// 			renderNegativeVideoTest(); //probably comes here due to CORS
// 		}
// 	});
// }

// function fetchProfileProducts() {
// 	$(".spinner-overlay").show();
// 	$.ajax({
// 		url: app.apiBaseUrl + "/profilestest/profileProducts?loginId=" + $("#loginId").val().trim(),
// 		jsonpCallback: "renderProfileProductView",
// 		dataType: "jsonp",
// 		error: function(){
// 			alert ("Error loading data");
// 			window.location.reload();
// 			$(".spinner-overlay").hide();
// 		}
// 	});
// }

// function fetchProfileSuggestions(id, type) {
// 	currentProfile = profiles[id];
// 	$(".spinner-overlay").show();
// 	$.ajax({
// 		url: app.apiBaseUrl + '/profilestest/profile' + (type=='video' ? 'Videos' : 'Products') + '?loginId=' + $("#loginId").val().trim() + '&profileId=' + id,
// 		jsonpCallback: "renderProfileSuggestionsView",
// 		dataType: "jsonp",
// 		error: function(a,b,c){
// 			alert ("Error loading data");
// 			window.location.reload();
// 			$(".spinner-overlay").hide();
// 		}
// 	});
// }

// function renderProfileSuggestionsView(data) {
// 	$(".spinner-overlay").hide();
// 	$('.tvp-button').removeAttr('disabled');
// 	if (typeof data.entity !== "undefined" ) {

// 		$('#ProfilesTable').hide();

// 		currentVideo = data.entity;
// 		renderProfileView(currentVideo);
// 	} else {
// 		alert ("No entity returned");
// 		window.location.reload();
// 	}
// }

// function renderProfileView(video) {
// 	$('.tvp-button').removeAttr('disabled');
// 	$("#VideoTitle").html(video.id + ') <b>' + video.title + '</b><br>' + video.description);
// 	$("#ProfileTitle").html(currentProfile.name);

// 	if ( video.entityType == 1 ){
// 		$('#TVProductHolder').hide();
// 		$('#TVPlayerHolder').show();
// 		player.loadVideo(createAsset(video));
// 	}else{
// 		$('#TVProductHolder').show();
// 		$('#TVPlayerHolder').hide();

// 		$('#TVProductHolder img').attr('src', '');
// 		$('#TVProductHolder img').attr('src', video.imageUrl);
// 	}

// 	$("#SelectionView").show();
// 	$('#VideoProfileView').show();
// }


// function renderProductRecommendationsView(data) {
// 	if (typeof data.video !== "undefined" && typeof data.products !== "undefined" && data.products.length > 0) {
// 		// setPlayer("TVPlayerHolderPR");
// 		currentVideo = data.video;
// 		products = data.products;
// 		profileVersion = data.profileVersion;
// 		$('#ProfilesTable').hide();
// 		$('#TVProductHolder').hide();
// 		$('#TVPlayerHolder').show();
// 		player.loadVideo(createAsset(currentVideo));
// 		renderProductView();
// 	} else {
// 		alert ("There's no Products");
// 	}
// 	$(".spinner-overlay").hide();
// }

// function renderProfileVideoView(data) {
// 	if (typeof data.entity !== "undefined" && typeof data.profiles !== "undefined" ) {
// 		// setPlayer("TVPlayerHolderPR");
// 		currentVideo = data.entity;
// 		currentProduct = null;
// 		currentProfiles = data.profiles;
// 		$('#ProfilesTable').hide();
// 		$('#TVPlayerHolder').show();
// 		$('#TVProductHolder').hide();
// 		player.loadVideo(createAsset(currentVideo));
// 		renderProfilesView();
// 	} else {
// 		alert ("There's no Video Suggestions");
// 	}
// 	$(".spinner-overlay").hide();
// }

// function renderProfileProductView(data) {
// 	if (typeof data.entity !== "undefined" && typeof data.profiles !== "undefined" ) {
// 		// setPlayer("TVPlayerHolderPR");
// 		currentVideo = null;
// 		currentProduct = data.entity;
// 		currentProfiles = data.profiles;
// 		$('#ProfilesTable').hide();
// 		$('#TVProductHolder').show();
// 		$('#TVPlayerHolder').hide();
// 		$('#TVProductHolder img').attr('src', '');
// 		$('#TVProductHolder img').attr('src', currentProduct.imageUrl);
// 		renderProfilesView();
// 	} else {
// 		alert ("There's no Product Suggestions");
// 	}
// 	$(".spinner-overlay").hide();
// }

// function renderProfilesView() {
// 	if ( currentVideo == null ){
// 		$("#VideoTitle").html(currentProduct.id + ') <b>' + currentProduct.title + '</b><br/>' + currentProduct.description );
// 	}else{
// 		$("#VideoTitle").html(currentVideo.id + ') <b>' + currentVideo.title + '</b><br>' + currentVideo.description);
// 	}

// 	var $profilesGrid = $("#ProfilesGrid");
// 	var pt = '';
// 	$.each(currentProfiles, function(key, profile) {
// 		pt += '<div class="pure-u-1-4">';
//         pt += '<div class="product-img-thumb-wrapper ">';
//         pt += '<div id="profileId-' + profile.id + '" onclick="setProfile(' + key + ')" class="product-img-thumb" ></div>';
//         pt += '</div>';
//         pt += '<div class="product-title">' + profile.name + '</div>';
//         pt += '</div>';

// 		currentProfiles[key].isMatch = false;
// 	});

// 	$profilesGrid.html(pt);
// 	$("#SelectionView").show();
// 	$('#ProfileRecommendationView').show();
// }

// function setProfile(index) {
// 	var $selected = $('#profileId-' + currentProfiles[index].id);
// 	if (!$selected.parent().hasClass('active')) {
// 		$selected.parent().addClass('active');
// 		currentProfiles[index].isMatch = true;

// 	} else {
// 		$selected.parent().removeClass('active');
// 		currentProfiles[index].isMatch = false;
// 	}
// }

// function renderProductView() {
// 	$("#VideoTitle").html(currentVideo.id + ')<b>' + currentVideo.title + '</b><br/>' + currentVideo.description);

// 	var $productsGrid = $("#ProductsGrid");
// 	var pt = '';
// 	$.each(products, function(key, product) {
// 		pt += '<div class="pure-u-1-4">';
//         pt += '<div class="product-img-thumb-wrapper ">';
//         pt += '<div id="productId-' + product.id + '" onclick="setProduct(' + key + ')" class="product-img-thumb tooltip" style="background-image: url(' + product.imageUrl + ');"><div class="tooltiptext">' + product.description + '</div></div>';
//         pt += '</div>';
//         pt += '<div class="product-title">' + product.title + '</div>';
//         pt += '</div>';

// 		products[key].isMatch = false;
// 	});

// 	$productsGrid.html(pt);
// 	$("#SelectionView").show();
// 	$('#ProductsRecommendationView').show();
// }

// function setProduct(index) {
// 	var $selected = $('#productId-' + products[index].id);
// 	if (!$selected.parent().hasClass('active')) {
// 		$selected.parent().addClass('active');
// 		products[index].isMatch = true;

// 	} else {
// 		$selected.parent().removeClass('active');
// 		products[index].isMatch = false;
// 	}
// }

// function createAsset (obj){
// 	if (!obj || "object" !== typeof obj || obj.length == 0 || typeof obj.asset == "undefined") return;

//     var asset = obj.asset;
//     asset.assetId = obj.id;
//     asset.assetTitle = obj.title;
//     asset.loginId = obj.loginId;


//     if (!asset.sources) asset.sources = [{ file: asset.videoId }];
//    	asset.type = asset.type || 'youtube';

//     return asset;
// };



// function resizePlayer() {
// 	player.resize($('#' + playerDivId).width(), document.getElementById(playerDivId).offsetHeight);
// }