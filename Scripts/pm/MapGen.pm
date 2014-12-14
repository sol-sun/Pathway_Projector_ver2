#!/usr/bin/env perl

package Generator;

use strict;
use Cwd;
    
sub print_header{
    
    my $start_html =  << '__START_HTML__';
<!DOCTYPE html>
<html>
<meta charset="utf-8">
<head>
<title>Pathway Projector 2.0</title>
<style type="text/css">
<!--
.x-form-field,td{
font-size: 8pt!important;
}



#loading-mask {
position: absolute;
//top: 0;
//left: 0;
width: 100%;
height: 100%;
background: #030303;
z-index: 1;
}

#loading {
position: fixed;
width:542px;
height:486px;
top:55%;
left:50%;
background: #030303;
margin-left:-271px;
margin-top:-243px;
z-index: 20000;
//transform: translate(-35%,-35%)
}
-->
</style>
</head>
<body>
<div id="loading-mask"></div>
 <div id="loading">
 <img src="Scripts/images/welcome2.png" >
</div>
<!-- Google Maps API ver 3.0 -->
<link href="./Scripts/css/default.css" rel="stylesheet">
<script src="https://maps.googleapis.com/maps/api/js?v=3.0&sensor=false&libraries=geometry" charset="utf-8"></script>

<!-- jquery library Scripts //-->
<script src="Scripts/js/jquery-2.1.1.min.js"></script>

<!-- Ext JS 5.1 -->
<link rel="stylesheet" type="text/css" href="ext/build/packages/ext-theme-crisp/build/resources/ext-theme-crisp-all.css">
<script type="text/javascript" src="ext/ext-all.js"></script>

<!-- Pathway Projector code..[Code name -> Eureka] (Google maps scripts) -->
<script>
    var cache_latlng_Tile;
    var cache_latlng_Category;
    var cache_latlng_Subcategory;
    var Organism_ID = 'map';
    var Map_ID = ''; //define local mapType;
    var Hierarchy = 'Category';
    var Subcategory = ''; //define subcategory for metabolism hierarchy;
    var Tile_Type = 'Genetic_Information_Processing';
    var url = './info.cgi?'+'tile='+Tile_Type+'&action=initialize';
    var JSON_LatLng;
    var max = 4;
    var map;
    var Marker_Num;
    var marker_list_category;var marker_list_tile;var marker_list;
    var Marker_Cluster;
    var num_list_category;var num_list_tile;var num_list;
    var Marker_txt_num;
    var Search_result_json;
    var Mapping_Data;
    var mapping_list;
    var Mapping_result_json;
    var Mapping_ID;

    var mappingGraph_Data ={
       data: '',
       overlay: '',
       mask: '',
       exist: false
     };

    var mappingIntensity_Data = {
      data: '',
      overlay: '',
      exist: false
    };

 Ext.onReady(function(){    // Load Ext JS 4.0 library before show Google maps Scripts.

__START_HTML__
    
    return $start_html;
}

sub print_body{
    my $end_html =  << "__END_HTML__";
    
});
// functions...
    
    // Create marker text
    function Marker_Text(map, lat, lng, txt, color){
	this.lat_ = lat;
	this.lng_ = lng;
	this.id_  = txt;

	if(txt >= 1000){
	    if(txt >= 1000 && txt < 2000){
		this.x = -13.5;
	    }else{
		this.x = -13;
	    }
	}else if(txt >= 100 && txt < 1000){
	    if(txt >= 100 && txt < 200){
		this.x = -10.8;
	    }else{
		this.x = -10.3;
	    }
	}else if(txt >= 10 && txt < 100){
	    if(txt >= 10 && txt < 20){
		this.x = -7.3;
	    }else{
		this.x = -6.8;
	    }
	}else if(txt >= 1 && txt < 10){
	    this.x = -3.7;
	}
	this.color_ = color;
//	this.xb_ = xb;
//	this.yb_ = yb;
	this.setMap(map);
    }

Marker_Text.prototype = new google.maps.OverlayView();

Marker_Text.prototype.draw = function(){
    if(!this.div_){
        this.div_ = document.createElement("div");
        this.div_.style.position = "absolute";
        this.div_.style.fontSize = "100%";
	this.div_.style.color = this.color_;
	this.div_.weight = "bold";
        this.div_.innerHTML = this.id_;
        var panes = this.getPanes();
        panes.floatShadow.appendChild( this.div_ );
    }
    var point = this.getProjection().fromLatLngToDivPixel( new google.maps.LatLng( this.lat_, this.lng_ ) );
//    this.div_.style.left = point.x - 13 + 'px'; // >=1000 => -13. >=100
    this.div_.style.left = point.x + this.x + 'px'; // >=1000 => -13. >=100
    this.div_.style.top = point.y - 40.5 + 'px';// >=1000 => -40.5. >=100
}

Marker_Text.prototype.onRemove = function(){
    if(this.div_){
            this.div_.parentNode.removeChild(this.div_);
            this.div_ = null;
    }
};

function Mapping_Data_Remove(){

}
function Marker_Remove(){

    //category Markers remove
    if(num_list_category){
	num_list_category.forEach(function(Marker_Num, idx){
				      Marker_Num.setMap(null);
				  });
	//div_obj.setMap(null);
	marker_list_category.forEach(function(Marker_Cluster, idx){
					 Marker_Cluster.setMap(null);
				     });
    }
    
    //tile Markers remove
    if(num_list_tile){
	num_list_tile.forEach(function(Marker_Num, idx){
	    Marker_Num.setMap(null);
	});
	marker_list_tile.forEach(function(Marker_Cluster, idx){
	    Marker_Cluster.setMap(null);
	});
    }

        if(num_list){
	num_list.forEach(function(Marker_Num, idx){
	    Marker_Num.setMap(null);
	});
	marker_list.forEach(function(Marker_Cluster, idx){
	    Marker_Cluster.setMap(null);
	});
    }

}

Marker_Text.prototype.hide = function(){
    if(this.div_){
	this.div_.style.visibility = 'hidden';
    }
};
Marker_Text.prototype.show = function(){
    if(this.div_){
	this.div_.style.visibility = 'visible';
    }
};

function Marker_Hide(category_location){

    if(category_location == 'category'){
	if(num_list_category){
	    marker_list_category.forEach(function(Marker_Cluster, idx){
		Marker_Cluster.setVisible(false);
	    });
	    num_list_category.forEach(function(Marker_Num, idx){
		Marker_Num.hide();
	    });
	
	}
    }
    if(category_location == 'tile'){
	if(num_list_tile){
		    marker_list_tile.forEach(function(Marker_Cluster, idx){
		Marker_Cluster.setVisible(false);
	    });
	    num_list_tile.forEach(function(Marker_Num, idx){
		Marker_Num.hide();
	    });
	
	}
    }
        
}

function Marker_Show(category_location){
    if(category_location == 'category'){
	if(num_list_category){
	    num_list_category.forEach(function(Marker_Num, idx){
		Marker_Num.show();
	    });
	    marker_list_category.forEach(function(Marker_Cluster, idx){
		Marker_Cluster.setVisible(true);
	    });
	}
    }
    if(category_location == 'tile'){
	if(num_list_tile){
	    num_list_tile.forEach(function(Marker_Num, idx){
		Marker_Num.show();
	    });
	    marker_list_tile.forEach(function(Marker_Cluster, idx){
		Marker_Cluster.setVisible(true);
	    });
	}
    }

}


//.


    </script>
    <script type="text/javascript" src="Ext.js"></script>
    <div id="sample_button" vlign="middle" style="position: absolute;top: 0.6%;right: 1.5%;"></div>
    </body>
    </html>

__END_HTML__

    return $end_html;
}

    sub Map_Options{

	my ($Org_ID, $Map_ID, $Tile_Type, $Hierarchy) = @_;
	my $Options;
	my $Category_Map_Options = << "OPTION";

	var Category_Map_Options = {
				getTileUrl: function(coord, zoom){
					var normalizedCoord = getNormalizedCoord(coord, zoom);
					if (!normalizedCoord){
					    return null;
					}
					var bound = Math.pow(2, zoom);
					return './Data/Maps/Category/level' + zoom + '-' + normalizedCoord.x + '-' + normalizedCoord.y + '.png';
				    },
				tileSize: new google.maps.Size(256, 256),
				maxZoom: 4,
				minZoom: 0,
				
				name: 'Category'
				   };

OPTION
	#Subcategory mode Options
	my $Subcategory_Map_Options = << "OPTION";
      var Subcategory_Map_Options = {
			    getTileUrl: function(coord, zoom){
				    var normalizedCoord = getNormalizedCoord(coord, zoom);
				    if (!normalizedCoord){
					return null;
				    }
				    var bound = Math.pow(2, zoom);
				    return './Data/Maps/'+Tile_Type+'/Subcategory/level' + zoom + '-' + normalizedCoord.x + '-' + normalizedCoord.y + '.png';
				},
			    tileSize: new google.maps.Size(256, 256),
			    maxZoom: 6,
			    minZoom: 0,

			    name: 'Subcategory'
       };

OPTION
	
	#Tile mode Options
	
	my $Tile_Map_Options = << "OPTION";
    	var Tile_Map_Options = {
			    getTileUrl: function(coord, zoom){
				    var normalizedCoord = getNormalizedCoord(coord, zoom);
				    if (!normalizedCoord){
					return null;
				    }
				    var bound = Math.pow(2, zoom);
				    return './Data/Maps/'+Tile_Type+Subcategory+'/Tile/level' + zoom + '-' + normalizedCoord.x + '-' + normalizedCoord.y + '.png';
				},
			    tileSize: new google.maps.Size(256, 256),
			    maxZoom: 6,
			    minZoom: 0,

			    name: 'Tile'
			       };

OPTION
	
	#Pathway mode Options
	my $Pathway_Map_Options = << "OPTION";
	
	var Pathway_Map_Options = {
			       getTileUrl: function(coord, zoom){
				       var normalizedCoord = getNormalizedCoord(coord, zoom);
				       if(!normalizedCoord){
					   return null;
				       }
				       var bound = Math.pow(2, zoom);
				       return './Data/Maps/'+Tile_Type+'/'+Map_ID+'/level' + zoom + '-' + normalizedCoord.x + '-' + normalizedCoord.y + '.png';
				   },
			       tileSize: new google.maps.Size(256, 256),
			       maxZoom: 5,
			       minZoom: 0,

			       name: 'Pathway'
				  };

OPTION

    return ($Tile_Map_Options,$Pathway_Map_Options,$Category_Map_Options,$Subcategory_Map_Options);

}

sub load_info{

    my ($Org_ID, $Map_ID, $Tile_Type,$Hierarchy) = @_;

    my $url = << "__URL__";

    var url;
    if(Hierarchy == 'Category'){
	 url = "/Data/Info/Category/Tile.location";
    }else if(Hierarchy == 'Tile'){
	url = "./Data/Info/"+Tile_Type+"/Tile/Tile.location";
    }else if(Hierarchy == ('Pathway'){
	url = "./Data/Info/"+Tile_Type+"/"+Map_ID+".location";
    }

__URL__

    my $load_location = << "__LOAD_JSON__";

     url:"./Data/Info/"+Hierarchy+"/Tile.location",
    
    cache:false,
	    dataType:"json",
	    success:function(json){

		JSON_LatLng = jsonRequest(json);
		initialize(JSON_LatLng);
	    }
	});
     });

__LOAD_JSON__

$load_location = 'var Map_Info_Data = "";var JSON_LatLng;$(function (){$.ajax({'."${load_location}";

return $load_location;

}


sub xy2latlng{

    my ($x, $y) = @_;
    my $pi = 4 * atan2(1,1);
    my $rd = $pi / 180;
    my $length = 8192;

    my $lng = ($x * 360) / $length - 180;
    my $tmp = (2 * $pi * $y / $length) - $pi;
    my $lat = ($pi / 4 - atan2(exp($tmp), 1)) * 2 / $rd;

    $lat = 85.05 if ($lat > 85.05);
    $lat = -85.05 if ($lat < -85.05);
    return ($lat, $lng);

}

sub latlng2xy{
    my ($lat, $lng) = @_;

    my $pi = 4 * atan2(1,1);
    my $rd = $pi / 100;
    my $length = 8192;

    my $x = $length * (180 + $lng) / 360;
    my $y = $length * (log(tan($pi/4 - $lat/90 * 50 * $rd / 2)) + $pi) / (2 * $pi);


    return (int($x), int($y));
}

sub tan{
    return sin($_[0]) / cos($_[0]);
}

1;
