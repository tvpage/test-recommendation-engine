;(function(window){    
  
  /**
   * Properties
   */
  var entityType = null;
  var profiles = null;
  var currentProfileId = null;
  var currentProfile = null;
  var currentEntity = null;

  
  /**
   * Methods
   */
  var getProfiles = function(){
    var def = $.Deferred();

    if (profiles && profiles.length)
      def.resolve(profiles);

    $.ajax({
      url: app.apiBaseUrl + '/profiles',
      dataType: "jsonp",
      error: app.handleError
    }).done(function(res){
      if (app.utils.nope(res))
        def.resolve(false);

      def.resolve(res);
    });

    return def.promise();
  };

  var getProfileSuggestions = function(){
    var def = $.Deferred();
    
    var endPoint = app.apiBaseUrl + '/profilestest/profile';
    if ('video' === entityType)
      endPoint += 'Videos';

    if ('product' === entityType)
      endPoint += 'Products';

    $.ajax({
      url: endPoint,
      dataType: "jsonp",
      data: {
        loginId: app.loginId,
        profileId: currentProfileId
      },
      error: app.handleError
    }).done(function(res){
      if (app.utils.nope(res) || app.utils.nope(res.entity))
        def.resolve(false);

      def.resolve(res);
    });

    return def.promise();
  };

  var renderEntityDetails = function(){
    $("#EntityDetails").html(app.utils.render("#EntityDetailsTemplate",currentEntity));

    if ('video' === entityType) {
      $('#SelectionView').append( app.utils.render("#PlayerTemplate", {}) );

      var player = new Player('player', {
        api_base_url: app.apiBaseUrl,
        data: [currentEntity],
        autoplay: true
      });
    }

    if ('product' === entityType)
      $('#SelectionView').append( app.utils.render("#ProductTemplate", currentEntity) );
  };

  var renderProfiles = function(){
    var html = "";
    for (var key in profiles){
      var profile = profiles[key];
      profile.key = key;
      html += app.utils.render("#ProfileOptionTemplate", profile);
    }

    $('#CorrectProfileId').append(html).select2();
  };

  var renderProfileDetails = function() {
    $("#ProfileTitle").html(currentProfile.name);
  };

  var sendMatch = function(profile){
    var postData = {
      version: (profile || currentProfile).version,
      isMatch: true,
      user: app.user,
      position: 0,
      title: currentEntity.title,
      description: currentEntity.description,
      loginId: currentEntity.loginId
    };

    postData[entityType + 'Id'] = currentEntity.id;

    if (profile)
      postData.isCorrection = true;

    $.ajax({
      url: app.apiBaseUrl + "/profilestest/videoProfile/" + (profile || currentProfile).id + "?loginId=" + app.loginId,
      type: "post",
      crossDomain: true,
      dataType: 'json',
      data: JSON.stringify(postData)
    });
  };


  /**
   * Interaction
   */
  $(document).on('click', '#TrueMatch', function(){
    sendMatch();
  });

  $(document).on('click', '#SetCorrection', function(){
    var correctProfile = $('#CorrectProfileId').val();
    correctProfile = correctProfile.split('-');

    sendMatch(profiles[correctProfile[1]]);
    
    $('#modalClose').click();
  });

  
  var dialogFx = new DialogFx( $('#FalseMatchDialog')[0] );
  $('#FalseMatch').on('click',dialogFx.toggle.bind(dialogFx));

  $(document).on('click', '#Skip', app.utils.reload);

  
  /**
   * Entry point
   */

  $("#loginId").val(app.loginId);
  
  var urlParams = app.utils.getUrlParams();
  if ($.isEmptyObject(urlParams))
    return;

  entityType = urlParams.entity;
  currentProfileId = urlParams.profileId;

  $.when.apply($,[
    
    getProfiles(),
    getProfileSuggestions()    

  ]).then(function(res1, res2){
    
    profiles = res1;
    currentEntity = res2.entity;
    currentProfile = profiles[currentProfileId];
    
    renderProfiles();
    renderEntityDetails();
    renderProfileDetails();

  });

}(window));