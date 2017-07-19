;(function(window){

	var app = {
  	apiBaseUrl: SiteParams.apibaseurl,
    loginId: localStorage.getItem('loginId') || $('#loginId').val().trim(),
  	profileVersion: null
  };

	app.handleError = function(){
		alert('Error with the request');
	};

  //Utils and helpers
  app.utils = {
    reload: function(){
      window.location.reload();
      return false;
    },
    nope: function(val){
      return "undefined" === typeof val;
    },
    isFunction: function(val){
      return "function" === typeof val;
    },
    render: function(templateId, data) {
      if ('object' !== typeof data)
        return false;

      tmpl = $(templateId || '').html().trim();

      return tmpl.replace(/\{([\w\.]*)\}/g, function(str, key) {
        var keys = key.split("."),
          v = data[keys.shift()];
        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]];
        return (typeof v !== "undefined" && v !== null) ? v : "";
      });
    }
  };

  window.app = app;

}(window));