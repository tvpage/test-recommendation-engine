;(function(window){

  /**
   * Properties
   */
  var profileVersion = null;
  var recommendedProducts = null;
  var recommendedProductsVideo = null;
  var player = null;


  /**
   * Methods
   */
  var getRecommendedProducts = function(cback){
    return $.ajax({
      url: app.apiBaseUrl + "/profilestest/productRecommendation",
      dataType: "jsonp",
      data: {
        loginId: app.loginId
      },
      error: app.handleError
    }).done(function(res){
      if (app.utils.nope(res) || app.utils.nope(res.video) || app.utils.nope(res.products))
        app.handleError();

      if (app.utils.isFunction(cback))
        cback(res);
    });
  };

  var renderRecommendedSet = function(){
    var html = "";
    for (var i = 0; recommendedProducts.length > i; i++)
      html += app.utils.render("#RecommendedProductTemplate", recommendedProducts[i]);

    $("#ProductsGrid").html(html);
    $("#VideoDetails").html(app.utils.render("#VideoDetailsTemplate",recommendedProductsVideo));
  };


  /**
   * Interaction
   */
  $(document).on('click', '.recommended-product', function(){
    $(this).toggleClass('match');
  });

  $(document).on('click', '#Submit', function(){
    var $matches = $('.recommended-product.match');
    
    for (var i = 0; $matches.length > i; i++) {
      var productId = $matches.eq(i).data('id');

      for (var j = 0; j < recommendedProducts.length; j++) {
        var recommendedProduct = recommendedProducts[j];

        recommendedProduct.isMatch = productId == recommendedProduct.id;
      }
    }

    $.ajax({
      url: app.apiBaseUrl + "/profilestest/productRecommendation",
      type: "post",
      crossDomain: true,
      dataType: 'json',
      data: JSON.stringify({
        version: profileVersion,
        videoId: recommendedProductsVideo.id,
        products: recommendedProducts,
        user: app.user
      })
    });
  });

  $(document).on('click', '#Skip', app.utils.reload);
  
  
  /**
   * Entry point
   */

  $("#loginId").val(app.loginId);

  getRecommendedProducts(function(data){
    profileVersion = data.profileVersion;
    recommendedProducts = data.products;
    recommendedProductsVideo = data.video;

    renderRecommendedSet();

    player = new Player('player', {
      api_base_url: app.apiBaseUrl,
      data: [recommendedProductsVideo],
      autoplay: true
    });
  });

}(window));