/*global google Tabletop*/
/*jslint browser:true*/

var spreadsheet = 'https://docs.google.com/spreadsheet/pub?key=0AhLgoEUzhCg_dHdVSDJueXJlOEhBTmdaNE9MSldfQkE&output=html';

var count = 1;
var taskData = new Array();

var taskVisuals = [];

function buildContent( data ){

	var twitterLogo = "	https://abs.twimg.com/a/1382598364/images/resources/twitter-bird-blue-on-white.png";
	
	var contentString = '<table class="table table-bordered">' +
							'<tbody>' +
								'<tr>' + 
									'<th>Company</th>' + 
									'<td><a href="' + data.website + '"</a>' + data.company + '</td>' +
									'<td align="center"><a href="https://twitter.com/' + data.twitter + '"</a><img src=images/' + data.photo + ' alt="Twitter" height="50" width="50"></td>' + 
								'</tr>' +
								'<tr><th>Name</th><td colspan="2">' + data.name + '</td></tr>' +
								'<tr><th>Product</th><td colspan="2">' + data.product + '</td></tr>' +
								'<tr><th>Address</th><td colspan="2">' + data.address + '</td></tr>' +
							'</tbody>' +
						'<table>';
	
	return contentString;
}


function buildOverview( data ){
	
	var overview = document.getElementById( "overview" );
	
	var tr = document.createElement( 'tr' );
	
	tr.innerHTML = '<td><strong>' + count + '</strong></td>' + 
					'<td>' + data.name + '</td>' + 
					'<td>' + data.company + '</td>' + 
					'<td>' + data.tasks + '</td>' +
					'<td>' + data.repository + '</td>' +
					'<td>' + data.language + '</td>' +
					'<td>' + data.paas + '</td>'; 
				//	'<td><img src=images/' + data.photo + ' alt="Twitter" height="50" width="50"></td>';
	
	overview.appendChild( tr );
	
	count = count + 1;
	
}

function photoGrid( data ){
	
	
	var thumbs = document.getElementById( "thumbnails" );
	
	var li = document.createElement( 'li' );
	li.className = 'span3';
	
	li.innerHTML = '<a href="#" class="thumbnail">' + 
						'<img alt="260x180" style="width: 260px; height: 180px;" src="images/' + data.photo +'">' +
						'<span class="person">' + data.name + '</span>'
					'</a>';
	
	thumbs.appendChild( li );
}

/**
 * Plots information about a single team on a map
 * @param {Object} team A single team from the sxsw database
 */
function plot(team){
	
	if( team.latitude && team.longitude ){
	
		var position = new google.maps.LatLng ( team.latitude, team.longitude );
		
		var marker = new google.maps.Marker({
			position: position,
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				fillOpacity: 0.7,
				fillColor: 'red',
				strokeOpacity: 0.9,
				strokeColor: 'red',
				strokeWeight: 3,
				scale: 5
			},
			title: team.team,
			map: this.map
		});
		
	
		var that = this;
		google.maps.event.addListener(marker, 'click', function() {
			that.popup.setContent( buildContent(team) );
			that.popup.open(that.map, marker);
		});
	}
}

function codeAddress( address ) {
//	var address = document.getElementById('address').value;
	
		var geocoder = new google.maps.Geocoder();

	geocoder.geocode( { 'address': address.location}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			
			console.log( address.location );
			console.log( results[0].geometry.location );	
			
			map.setCenter(results[0].geometry.location);
			var marker = new google.maps.Marker({
			    map: map,
			    position: results[0].geometry.location
			});
	    } else {
	      alert('Geocode was not successful for the following reason: ' + status);
	    }
	});
}


/**
 * Creates a map and plots data from the provided spreadsheet on the map.
 * @param {Object} data The spreadsheet data object from tabletop.
 */
function showInfo(data) {
	
	var water = "#228db2";
	var landscape = "#a4bfd1";
	var maplabel = "#41778d";
		
	var styles = [
	  
	  { "featureType": "landscape", "stylers": [ { "visibility": "simplified" } ] },
	  { "featureType": "water", "stylers": [ { "visibility": "simplified" }, { "color": water } ] },
	  { "featureType": "landscape", "stylers": [ { "color": landscape } ] },
	  { "featureType": "road", "stylers": [ { "visibility": "off" } ] },
	  { "featureType": "poi", "stylers": [ { "visibility": "off" } ] },
	  { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [ { "color": maplabel }, { "weight": 0.5 } ] },
	  { "featureType": "administrative", "elementType": "labels", "stylers": [ { "color": maplabel }, { "weight": 0.1 } ] },
	  { "featureType": "administrative.province", "stylers": [ { "visibility": "off" } ] }

	];

    var mapOptions = {
		mapTypeControlOptions: { mapTypeIds: [ 'Styled'] },
		center: new google.maps.LatLng( 51.5167, 9.9167 ),
		zoom: 2,
		mapTypeId: 'Styled'
	};

	//create and style the map
	var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);	
	var styledMapType = new google.maps.StyledMapType( styles, { name: 'sxsw' } );
    map.mapTypes.set('Styled', styledMapType);  
    
    //create popup window that will be used when clicking markers
    var popup = new google.maps.InfoWindow();
    
    //plot each team on the map
    var that = { map: map, popup: popup };
    data.profiles.elements.forEach( photoGrid );
    data.profiles.elements.forEach( plot, that );
    data.profiles.elements.forEach( buildOverview );
}

function isin(n,a){
  for (var i=0;i<a.length;i++){
    if (a[i]== n) {
      var b = true;
      return b;
    } else {
      var c = false;
      return c;
   }
  }
}

function unique(a){
  var arr = [];
  for (var i=0;i<a.length;i++){
    if (!isin(a[i],arr)){
      arr.push(a[i]);
    }
  }

 return arr;
}

function taskChart( data ){
	taskData.push( data.tasks );
}

function countItems( item ){
	
	var items = 0;
	
	for( var i = 0; i < taskData.length; i++ ){
		
		if( taskData[i] === item ){
			items++;
		}
	}
	
//	var entry = 
}

function buildMetrics( data ){
	data.profiles.elements.forEach( taskChart );
	var items = unique( taskData );
	
	items.forEach( countItems );
	
	console.log( items );
}

function drawCharts(){
	
	Tabletop.init( { key: spreadsheet, callback: buildMetrics } );
	
	var data = google.visualization.arrayToDataTable([
      ['Task', 'Hours per Day'],
      ['Work',     11],
      ['Eat',      2],
      ['Commute',  2],
      ['Watch TV', 2],
      ['Sleep',    7]
    ]);

    var options = {
      title: 'My Daily Activities',
      pieHole: 0.4,
    };

    var chart = new google.visualization.PieChart(document.getElementById('donutchart'));
    chart.draw(data, options);	
}

 
function drawChart() {
	drawCharts();
}


window.onload = function() {
    Tabletop.init({ key: spreadsheet, callback: showInfo });
};