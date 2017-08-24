;(function(window){
  
  /**
   * Properties
   */  
  var entityType = null;
  var profiles = null;
  var currentEntity = null;
  var currentProfiles = [];
  var profileNegatives = null;
  var player = null;


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

  var getProfileNegatives = function(){
    var def = $.Deferred();

    $.ajax({
      url: app.apiBaseUrl + "/profilestest/profile/negatives/videos",
      dataType: "jsonp",
      data: {
        loginId: app.loginId
      },
      error: app.handleError
    }).done(function(res){
      if (app.utils.nope(res) || !res.length)
        def.resolve(false);

      for (var key in res) {
        var item = res[key];
        var itemData = JSON.parse(item.data);

        for (var dataKey in itemData)
          item[dataKey] = itemData[dataKey];
      }

      def.resolve(res);
    });

    return def.promise();
  };

  var renderEntityDetails = function(){
    $("#EntityDetails").html(app.utils.render("#EntityDetailsTemplate",currentEntity));

    if ('video' === entityType) {
      if ($('#TVPlayerHolder').length) {
        player.play(currentEntity);
      } else {
        $('#SelectionView').append( app.utils.render("#PlayerTemplate", {}) );

        player = new Player('player', {
          api_base_url: app.apiBaseUrl,
          data: [currentEntity],
          autoplay: true
        });
      }
    }

    if ('product' === entityType)
      $('#SelectionView').append( app.utils.render("#ProductTemplate", currentEntity) );
  };

  var renderEntityProfiles = function(){
    var correct = currentProfiles[0];
    correct.from = 'User';

    var assigned = profiles[currentEntity.profileId_assigned];
    assigned.from = 'System';

    var html = '';
    
    html += app.utils.render('#EntityProfileTemplate', correct);
    html += app.utils.render('#EntityProfileTemplate', assigned);
    
    $("#ProfilesGrid").html(html);
  };

  var renderProfiles = function(){
    var html = "";
    for (var key in profiles){
      var profile = profiles[key];
      profile.key = key;
      html += app.utils.render("#ProfileOptionTemplate", profile);
    }

    $('#selectOtherProfileId').append(html).select2();
  };

  var prepareProfileNegatives = function(){
    currentEntity = profileNegatives.shift();
    
    if (!$.isPlainObject(currentEntity))
      return;

    renderEntityDetails();

    var correctProfile = profiles[currentEntity.profileId_correct];
    correctProfile.isMatch = false;
    currentProfiles.push(correctProfile);

    var assignedProfile = profiles[currentEntity.profileId_assigned];
    assignedProfile.isMatch = false;
    currentProfiles.push(assignedProfile);

    renderEntityProfiles();
  };

  
  /**
   * Interaction
   */
  $(document).on('click', '#Submit', function(){
    var entityProfiles = currentProfiles.slice(0);
    for ( var key in entityProfiles ){
      if ('undefined' === typeof entityProfiles[key]._position)
        entityProfiles[key]._position = 0;
    }

    var $profileSelect = $('#selectOtherProfileId');

    var selected = $profileSelect.val();
    if (selected) {
      selected = selected.split('-');

      entityProfiles.push({
        id: selected[1],
        version: selected[3],
        name: $profileSelect.find('option:selected').text(),
        _position: 9999,
        score: 0,
        isMatch: true,
        isCorrection: true
      });

      $profileSelect.val('').trigger("change"); 
    }

    var entityId = currentEntity.entityId;

    var postData = {
      entity: currentEntity,
      runId: entityId,
      testId: currentEntity.testId,
      loginId: currentEntity.loginId || app.loginId,
      profiles: entityProfiles,
      user: app.user
    };

    if ('video' === entityType){
      postData.videoId = entityId;
      postData.productId = null;
    }

    if ('product' === entityType) {
      postData.productId = entityId;
      postData.videoId = null;
    }

    $.ajax({
      url: app.apiBaseUrl + "/profilestest/videoProfiles/correct",
      type: "post",
      crossDomain: true,
      dataType: 'json',
      data: JSON.stringify(postData),
      success: prepareProfileNegatives,
      error: prepareProfileNegatives
    });
  });

  $(document).on('click', '#Skip', prepareProfileNegatives);

  
  /**
   * Entry point
   */

  $("#loginId").val(app.loginId);
  
  entityType = $.isEmptyObject(app.utils.getUrlParams()) ? "video" : app.utils.getUrlParams().entity;

  $.when.apply($,[

    getProfiles(),
    getProfileNegatives()
    
  ]).then(function(res1, res2){
    
    profiles = res1;
    profileNegatives = res2;

    renderProfiles();
    prepareProfileNegatives();

  });

}(window));