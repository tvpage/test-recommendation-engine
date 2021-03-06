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
    apiBaseUrl: "beta.tvpage.com/api"
  };
	$.ajax({
		url: '//' + app.apiBaseUrl + '/profiles/report/accuracy',
		dataType: "jsonp",
		error: function() {
		}
	}).done(function(data){
      if (!Array.isArray(data)) { 
        return false;
      }
      var xdata=[];
      var versions = {};
      for (var i=0; i<data.length;i++) {
        xdata.push(i);
        var obj = data[i];
        for (var version in obj) {
          if (!versions.hasOwnProperty(version)){
            versions[version]=[];
            for (var j=0;j<i;j++) {
              versions[version].push(null);
            }
          }
          var perc = Math.round(Number(obj[version][1])/ (Number(obj[version][0]) + Number(obj[version][1])) * 100);
          versions[version].push(perc);
        }
      }
      
      var series = [];
      for (var v in versions) {
        series.push({
          name: v,
          data: versions[v]
        });
      }
  
    Highcharts.chart('report-accuracy', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Accuracy'
        },
        subtitle: {
            text: 'Breakdown by Run x Test Data Version'
        },
        xAxis: {
            categories: xdata,
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {},
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        credits: {
            enabled: false
        },
        series: series
    });
  });
  
	//Fetch the profiles and render them
	$.ajax({
		url: '//' + app.apiBaseUrl + '/profiles/report/size',
		dataType: "jsonp",
		error: function(){}
  }).done(function(data){
    
      var xaxis=[];
      var yaxis=[];
      var series = [];
      for (var i in data) {
        series.unshift({
          name: String(data[i]["version"]),
          data: [Number(data[i]["_cnt"])],
          stack: 'version'
        });
      }

      Highcharts.chart('report-size', {
      chart: {
        type: 'column' 
      },
      credits: {
          enabled: false
      },
      
      plotOptions: {
        column: {
            stacking: 'normal'
        }
      },
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
          categories: ["Version"]
      },

      series:series
    });
	    
  });

	//Fetch the profiles and render them
	$.ajax({
		url: '//' + app.apiBaseUrl + '/profiles/report/coverage',
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
      credits: {
          enabled: false
      },
      
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
		url: '//' + app.apiBaseUrl + '/profiles/report/newcases',
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
      credits: {
          enabled: false
      },
      
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

	$.ajax({
		url: '//' + app.apiBaseUrl + '/profiles/report/version',
		dataType: "jsonp",
		error: function() {
		}
	}).done(function(data){
    var htmlString = '';
    if (!data) {
      htmlString =
        '<a href="#" class="list-group-item list-group-item-action flex-column align-items-start">' + 
        '<div class="d-flex w-100 justify-content-between">' + 
        '<h5 class="mb-2" id="tvp-index-version">Version Unknown</h5>' +
        '<small class="text-muted"><span class="badge badge-danger">Down</span></small>' +
        '</div>' + 
        '<p class="mb-1" id="">Problem with Index</p>' + 
        '<div><small></small></div>' + 
        '</a>';
    }else {
      htmlString =
        '<a href="#" class="list-group-item list-group-item-action flex-column align-items-start">' + 
        '<div class="d-flex w-100 justify-content-between">' + 
        '<h5 class="mb-2" id="tvp-index-version">Version '+ data.version+'</h5>' +
        '<small class="text-muted"><span class="badge badge-success">Live</span></small>' +
        '</div>' + 
        '<p class="mb-1" id=""></p>' + 
        '<div><small>Live since ' + data.date +'</small></div>' + 
        '</a>';
      
    }
    $('#tvp-version').html(htmlString);
  });
});
