//var currentVideo = null;
//var currentProduct = null;
//var currentProfiles = [];
//var currentProfile = null;
//var selectedProducts = [];
//var profileVersion = '';
//var player = null
//var playerDivId = '';

$( document ).ready(function() {

  var app = {
    apiBaseUrl: "local.tvpage.com/api"
  };
	$.ajax({
		url: '//' + app.apiBaseUrl + '/profilestest/report/accuracy',
		dataType: "jsonp",
		error: function() {
		}
	}).done(function(data){
      var xaxis=[];
      var yaxis=[];
      for (var i in data) {
        yaxis.push( Math.round(Number(data[i][1])/ (Number(data[i][0]) + Number(data[i][1])) * 100));
        xaxis.push(i);
      }

      Highcharts.chart('report-accuracy', {

      legend: {
        enabled: false
      },
      title: {
          text: 'Accuracy'
      },

      subtitle: {
          text: 'Breakdown of Accuracy by Version'
      },

      yAxis: {
          title: {
              text: 'Accuracy'
          }
      },
      xAxis: {
          categories: xaxis
      },

      series: [{
          data: yaxis
      }]
    });
  });
  
	//Fetch the profiles and render them
	$.ajax({
		url: '//' + app.apiBaseUrl + '/profilestest/report/size',
		dataType: "jsonp",
		error: function(){}
  }).done(function(data){
      var xaxis=[];
      var yaxis=[];
      for (var i in data) {
        yaxis.push(Number(data[i]["_cnt"]));
        xaxis.push(data[i]["version"]);
      }

      Highcharts.chart('report-size', {
      legend: {
        enabled: false
      },
        
      title: {
          text: 'Size'
      },

      subtitle: {
          text: 'Breakdown of Dataset Size by Version'
      },

      yAxis: {
          title: {
              text: 'Size'
          }
      },
      xAxis: {
          categories: xaxis
      },

      series: [{
          data: yaxis
      }]
    });
	    
  });

	//Fetch the profiles and render them
	$.ajax({
		url: '//' + app.apiBaseUrl + '/profilestest/report/coverage',
		dataType: "jsonp",
		error: function() {
		}
	}).done(function(data){
    var xaxis=[];
    var yaxis=[];
    for (var i in data) {
      yaxis.push(Number(data[i]["_cnt"]));
      xaxis.push(data[i]["name"]);
    }
    Highcharts.chart('report-coverage', {
      
      legend: {
        enabled: false
      },
      
      chart: {
        type: "bar"
      },
      title: {
          text: 'Coverage'
      },
      subtitle: {
          text: 'Test Coverage by Profile'
      },
      yAxis: {
        title: {
          text: 'Coverage'
        }
      },
      xAxis: {
          categories: xaxis
      },
      series: [{
          data: yaxis
      }]
    });
  });

	//Fetch the profiles and render them
	$.ajax({
		url: '//' + app.apiBaseUrl + '/profilestest/report/newcases',
		dataType: "jsonp",
		error: function() {
		}
	}).done(function(data){
    var xaxis=[];
    var yaxis=[];
    for (var i in data) {
      yaxis.push(Number(data[i]["_cnt"]));
      xaxis.push(data[i]["name"]);
    }
    Highcharts.chart('report-newcases', {
      
      legend: {
        enabled: false
      },
      
      chart: {
        type: "bar"
      },
      title: {
          text: 'New Cases'
      },
      subtitle: {
          text: 'Test Coverage by Profile for new Test Cases'
      },
      yAxis: {
        title: {
          text: 'Coverage'
        }
      },
      xAxis: {
          categories: xaxis
      },
      series: [{
          data: yaxis
      }]
    });
  });
});
