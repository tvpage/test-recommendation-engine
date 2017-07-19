;(function(window){
  var entityType = null;
  var profiles = null;
  var currentEntity = null;
  var currentEntityProfiles = null;

  var getUrlParams = function(){
    var o = {};
    if (!window.location || !('search' in location))
      return o;

    var kv = location.search.substr(1).split('?'), params = [];
    for (var i = 0; i < kv.length; i++) { params.push(kv[i]); }
    for (var i = 0; i < params.length; i++) {
        var param = params[i].split('=');
        if (param[0])
          o[param[0]] = decodeURIComponent(param[1]);
    }
    return o;
  };

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
  }

  var renderProfiles = function(){
    var html = "";
    for (var key in profiles){
      var profile = profiles[key];
      profile.key = key;
      html += app.utils.render("#ProfileOptionTemplate", profile);
    }

    $('#selectOtherProfileId').append(html).select2();
  };

  //Load the profiles and this video profiles and render both, first check the params of the
  //url to know which entity we are training.
  entityType = $.isEmptyObject(getUrlParams()) ? "video" : getUrlParams().entity;
  
  $.when.apply($,[
    getProfiles(),
    getProfileEntities()
  ]).then(function(res1, res2){
    profiles = res1;
    
    renderProfiles();

    currentEntity = res2.entity;
    currentEntityProfiles = res2.profiles;

    renderEntityDetails();
    renderEntityProfiles();
  });

  //Submit a match
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
    if ( !selected )
      return;

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

    var postData = {
      loginId: currentEntity.loginId || app.loginId,
      profiles: entityProfiles,
      user: localStorage.getItem("username")
    };

    var entityId = currentEntity.id;

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

  //Skip the current set, reload the page
  $(document).on('click', '#Skip', app.utils.reload);

}(window));