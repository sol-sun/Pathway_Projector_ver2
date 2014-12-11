#!/usr/bin/env perl

use strict;
use warnings;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use lib "Scripts/pm";
use MapGen;

my $q = new CGI;

# Map param
my $Org_ID = 'map';
my $Map_ID = '';
my $Hierarchy = 'Category';
my $Tile_Type = '';

print $q->header();

print Generator::print_header;#<html> .. <script type="test/javascript">

#set Map options;( "$Org_ID(e.g. hsa, eco)","$Map_ID(e.g. 00010, 01100)", "$Tile_Type(e.g. ./Metabolism, ./Human Disease)" );
my ($Category_Map_Options,$Tile_Map_Options, $Pathway_Map_Options) = Generator::Map_Options($Org_ID, $Map_ID, $Tile_Type);

my $ajax = '$.ajax';
my $var =  '$';
print << "__html__";

$Category_Map_Options;
$Tile_Map_Options;
$Pathway_Map_Options;

var Category_Map = new google.maps.ImageMapType(Category_Map_Options);
var Tile_Map = new google.maps.ImageMapType(Tile_Map_Options);
var Pathway_Map = new google.maps.ImageMapType(Pathway_Map_Options);
var maxzoom;

var action = '&tile='+Tile_Type+'&action=initialize';
var ajax = ${ajax}({
	type: "POST",
	    url: 'info.cgi',
	    cache: false,
		    dataType: "json",
	    data:  action,
	    success: function(json){
	    maxzoom = json.Information.Zoom_Level;
	    initialize();
	}
	
    });

function initialize(/*JSON_LatLng,Markers_LatLng JSON_LatLng JSON data*/ ) {

    var myLatlng = new google.maps.LatLng(0, 0);

    var mapOptions = {
	center: myLatlng,
	zoom: 0,
	maxZoom : 6,
	minZoom : 0,
	streetViewControl: false,
	backgroundColor: '#050204',
	featureType: "all",
	gridSize: 50,
	mapTypeControl:false,
	disableDefaultUI: true,
	mapTypeControlOptions: {
	mapTypeIds: ['Category','Tile','Pathway']
	}
    };

    // MapObject Generate;
    map = new google.maps.Map(document.getElementById('map-canvas'),
				  mapOptions);
    map.mapTypes.set('category', Category_Map);
    map.mapTypes.set('tile', Tile_Map);
    map.mapTypes.set('pathway', Pathway_Map);
    map.setMapTypeId('category');

    var currentInfoWindow = null;

    google.maps.event.addListener(map, 'click', function(event){


				      // Infowindow will close if window is open.
				      if (currentInfoWindow)currentInfoWindow.close();
				      //.
				      var current_lat = event.latLng.lat(), current_lng = event.latLng.lng();



				      var param = 'lat='+ current_lat +'&lng='+ current_lng  +'&hie='+ Hierarchy + '&mapID=' + Map_ID;
//show img for mapping
				      if(Mapping_ID){
					  param = param + '&mapping=' + Mapping_ID;
				      }
				      
				      var action = '&action=Click_Search';
				      var ajax = ${ajax}({

				        type: "POST",
					url: "info.cgi",
					data: {},
					cache: false,
					dataType: "json",
					data: param + action,
					success: function(json){
				       if(json){
					   if(Hierarchy=='Pathway'){
					
					   var infowindow = new google.maps.InfoWindow({
						   content: json.html,
						       position: new google.maps.LatLng(json.latlng[0],json.latlng[1])//LatLng
						       });
					   infowindow.open(map);
					   currentInfoWindow = infowindow;
					   }

				       }

				   },
				       
				       });
			   
				  });

__html__

    print << "__html__";

    // changed maptype tile2local, local2tile
    google.maps.event.addListener(map, 'zoom_changed', function(){
	
	if(map.getZoom() > maxzoom ){
	    map.setZoom(maxzoom);
	}
	var current_maptype = map.getMapTypeId();
	var current_zoom = map.getZoom();
	var current_latlng = map.getCenter();
	var current_lat = current_latlng.lat(), current_lng = current_latlng.lng();
	
	if(current_maptype != 'pathway' && current_zoom >= maxzoom){ // JSON_LatLng[3]
	    if (currentInfoWindow)currentInfoWindow.close();
	    var param = 'lat='+ current_lat +'&lng='+ current_lng  +'&hie='+ Hierarchy + '&mapID=' + Map_ID + '&tile=' + Tile_Type;
	    var action = '&action=Zoom_UP';
	    var ajax = ${ajax}({
		    
		    type: "POST",
			url: "info.cgi",
			data: {},
			cache: false,
			dataType: "json",
			data: param + action,
			success: function(json){
			if(json){			    
			    window.setTimeout(function(){

                        /** Change Layer **/
			    if(Hierarchy == 'Category'){

				Tile_Type = json.Category;
				Hierarchy = json.next_hierarchy;
				map.setMapTypeId('tile');
				maxzoom = json.max_zoom;
				cache_latlng_Category = current_latlng;

			    }else if(Hierarchy == 'Tile'){
				Map_ID = json.Map_ID;
				Hierarchy = 'Pathway';
				map.setMapTypeId('pathway');
				maxzoom = 4;
				cache_latlng_Tile = current_latlng;

			    }
 
   	  		   /** Graph Mapping displayed **/
                           Change_Hierarchy( Hierarchy, Tile_Type, Map_ID );

			    map.setZoom(1);
			    map.panTo(new google.maps.LatLng(0,0));
					      }, 650);


			}
		    },
			});
	}else if(current_maptype != 'category' && current_zoom == 0){
	    if (currentInfoWindow)currentInfoWindow.close();
	    window.setTimeout(function(){
				  var param = 'lat='+ current_lat +'&lng='+ current_lng  +'&hie='+ Hierarchy + '&mapID=' + Map_ID + '&tile=' + Tile_Type;
				  var action = '&action=Zoom_OUT';
				  var ajax = ${ajax}({
					      type: "POST",
						  url: "info.cgi",
						  data: {},
						  cache: false,
						  dataType: "json",
						  data: param + action,
						  success: function(json){
						  if(json){
						      if(current_maptype == 'pathway'){
							  Hierarchy = 'Tile';
							  maxzoom = json.max_zoom;
							  map.setMapTypeId('tile');
							  map.setZoom(maxzoom - 1);
							  map.setCenter(cache_latlng_Tile);

						      }else if(current_maptype == 'tile'){
							  Hierarchy = 'Category';
							  maxzoom = json.Information.Zoom_Level;
							  map.setMapTypeId('category');
							  map.setZoom(maxzoom -1);
							  map.setCenter(cache_latlng_Category);
						      }

						  }
   	  		   /** Graph Mapping displayed **/
                           Change_Hierarchy( Hierarchy, Tile_Type, Map_ID );

					      },
						  });

			      },650);

	}

				  });
    
}


// Normalizes the coords that tiles repeat across the x axis (horizontally)
// like the standard Google map tiles.
function getNormalizedCoord(coord, zoom) {

    var y = coord.y;
    var x = coord.x;

  // tile range in one direction range is dependent on zoom level
  // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
//  var tileRange = 1 << zoom;

  // don't repeat across y-axis (vertically) and x-axis (horizocally)
//  if (y < 0 || y >= tileRange || x < 0 || x >= tileRange) {
//    return null;
//  }

  return {
    x: x,
    y: y
  };
}
__html__

print Generator::print_body;
