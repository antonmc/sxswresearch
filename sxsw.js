/*global google Tabletop uniq console map*/
/*jslint browser:true*/

var spreadsheet = 'https://docs.google.com/spreadsheet/pub?key=0AhLgoEUzhCg_dHdVSDJueXJlOEhBTmdaNE9MSldfQkE&output=html';

var count = 1;
var taskData = new Array();
var repoData = new Array();
var paasData = new Array();

var taskVisuals = [];
var repoVisuals = [];
var paasVisuals = [];

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


function taskChart( data ){
	taskData.push( data.tasks );
}

function repoChart( data ){
	repoData.push( data.repository );
}

function paasChart( data ){
	paasData.push( data.paas );
}

function countTaskItems( item ){	
	var items = 0;	
	if( item !== "" ){	
		for( var i = 0; i < taskData.length; i++ ){			
			if( taskData[i] == item ){
				items++;
			}
		}		
		var entry = [ item, items ];		
		taskVisuals.push( entry );
	}
}

function countRepoItems( item ){
	var items = 0;
	if( item !== "" ){
		for( var i = 0; i < repoData.length; i++ ){
			var cleanString = repoData[i].replace(/[\|&;\$%@"<>\(\)\+,]/g, "");
			if( cleanString === item ){
				items++;
			}
		}
		var entry = [ item, items ];
		repoVisuals.push( entry );
	}
}

function countPaasItems( item ){
	var items = 0;
	if( item !== "" ){
		for( var i = 0; i < paasData.length; i++ ){
			var cleanString = paasData[i].replace(/[\|&;\$%@"<>\(\)\+,]/g, "");
			if( cleanString === item ){
				items++;
			}
		}
		var entry = [ item, items ];
		paasVisuals.push( entry );
	}
}

function buildMetrics( data ){
	
	data.profiles.elements.forEach( taskChart );
	taskVisuals.push( [ 'Task Management', 'Occurrances' ] );
	
	var items = _.uniq( taskData );
	items.forEach( countTaskItems );
	
	var taskVisualData = google.visualization.arrayToDataTable(taskVisuals);

    var options = {
      title: 'Task Management Tools',
      pieHole: 0.4,
    };

    var chart = new google.visualization.PieChart(document.getElementById('donutchart'));
    chart.draw(taskVisualData, options);
    
    data.profiles.elements.forEach( repoChart );
	repoVisuals.push( [ 'Repository Management', 'Occurrances' ] );
	
	items = _.uniq( repoData );
	items.forEach( countRepoItems );
	
	var repoVisualData = google.visualization.arrayToDataTable(repoVisuals);

    var options = {
      title: 'Repositories',
      pieHole: 0.4,
    };

    var chart = new google.visualization.PieChart(document.getElementById('repochart'));
    chart.draw(repoVisualData, options);
    
    /* PaaS */
    
    data.profiles.elements.forEach( paasChart );
	paasVisuals.push( [ 'Platforms', 'Occurrances' ] );
	
	items = _.uniq( paasData );
	items.forEach( countPaasItems );
	
	var paasVisualData = google.visualization.arrayToDataTable(paasVisuals);

    var options = {
      title: 'Platform as a Service',
      pieHole: 0.4,
    };

    var chart = new google.visualization.PieChart(document.getElementById('paaschart'));
    chart.draw(paasVisualData, options);
}

function drawCharts(){
	Tabletop.init( { key: spreadsheet, callback: buildMetrics } );		
}
 
function drawChart() {
	drawCharts();
}

window.onload = function() {
    Tabletop.init({ key: spreadsheet, callback: showInfo });
};