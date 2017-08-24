;(function(window){
  
  /**
   * Properties
   */  
  var entityType = null;
  var profiles = null;
  var currentEntity = null;
  var currentEntityProfiles = null;


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

  var getProfileEntities = function(){
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
        loginId: app.loginId
      },
      error: app.handleError
    }).done(function(res){
      if (app.utils.nope(res) || app.utils.nope(res.entity) || app.utils.nope(res.profiles))
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

  var renderEntityProfiles = function(){
    var html = "";
    for (var i = 0; currentEntityProfiles.length > i; i++)
      html += app.utils.render("#EntityProfileTemplate", currentEntityProfiles[i]);

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

  
  /**
   * Interaction
   */
  $(document).on('click', '#Submit', function(){
    var entityProfiles = currentEntityProfiles.slice(0);

    for ( var key in entityProfiles ){
      if ( typeof entityProfiles[key]._position == 'undefined' ){
        var entityProfile = entityProfiles[key];
        entityProfile._position = 0;
        entityProfile.isMatch = app.utils.nope(entityProfile.isMatch) ? false : entityProfile.isMatch;
      }
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

    var postData = {
      loginId: currentEntity.loginId || app.loginId,
      profiles: entityProfiles,
      user: app.user
    };

    var entityId = currentEntity.entityId;

    if ('video' === entityType){
      postData.videoId = entityId;
      postData.productId = null;
    }

    if ('product' === entityType) {
      postData.productId = entityId;
      postData.videoId = null;
    }

    $.ajax({
      url: app.apiBaseUrl + "/profilestest/videoProfiles",
      type: "post",
      crossDomain: true,
      dataType: 'json',
      data: JSON.stringify(postData),
      error: app.handleError,
      success: app.utils.reload
    });
  });

  $(document).on('click', '#Skip', app.utils.reload);

  
  /**
   * Entry point
   */

  $("#loginId").val(app.loginId);

  entityType = $.isEmptyObject(app.utils.getUrlParams()) ? "video" : app.utils.getUrlParams().entity;
  
  $.when.apply($,[
    
    getProfiles(),
    getProfileEntities()

  ]).then(function(res1, res2){
    
    profiles = res1;
    currentEntity = res2.entity;
    currentEntityProfiles = res2.profiles;
    
    renderProfiles();
    renderEntityDetails();
    renderEntityProfiles();

  });

}(window));