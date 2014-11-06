#:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
# This file is part of G-language Genome Analysis Environment package
#
#     Copyright (C) 2001-2013 Keio University
#:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
# 
# G-language GAE is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public
# License as published by the Free Software Foundation; either
# version 2 of the License, or (at your option) any later version.
# 
# G-language GAE is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public
# License along with G-language GAE -- see the file COPYING.
# If not, write to the Free Software Foundation, Inc.,
# 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
# 
#END_HEADER
#
# written by Kazuharu Arakawa <gaou@sfc.keio.ac.jp> at
# G-language Project, Institute for Advanced Biosciences, Keio University.
#

package G::Tools::GMap;

use strict;
use base qw(Exporter);
use autouse 'File::Basename'=>qw(basename);
use SelfLoader;

use SubOpt;
use G::Messenger;



our @EXPORT = qw(
		 generateGMap
		 );

&generateGMap("$ARGV[0]", -level=>"$ARGV[1]", -path=>"$ARGV[2]");

__DATA__

#::::::::::::::::::::::::::::::
#          Perldoc
#::::::::::::::::::::::::::::::

=head1 NAME

  G::Tools::GMap - Map generation using Google Map API with large images.

=head1 DESCRIPTION

  This class is a part of G-language Genome Analysis Environment, 
  providing functions using Google Map API.

=cut


#::::::::::::::::::::::::::::::
#    Let the code begin...
#::::::::::::::::::::::::::::::


=head2 generateGMap

  Name: generateGMap   -   generate Google Map View from given image file

  Description:
    This method generates a zoomable AJAX viewer interface for the
    given image, by splitting the image and generating the HTML page,
    using Google Maps API v.2. Open the "index.html" file with your
    browser when the directory containing split images and the HTML
    is generated. 

    Note that it will take a very long time to generate images 
    with levels greater than 6. 

  Usage: 
    generateGMap("imageFileName.png");
    Here the image format can be anything supported by ImageMagick.
    For best viewing experience, square image is preferred.

    When you wish to make the generated map public, obtain a Google
    Map API Key from 
       http://www.google.com/apis/maps/signup.html
    and replace the string "YOUR_GOOGLE_MAP_KEY_HERE" within the
    generated HTML. 

  Options:
    -level       maximum zoom level. (default: 6)
                 This value should be larger than 3.
                 Image width size is 2^(level - 1) * 256, so width at
                 level = 6 is 8192. 
    -javascript  string of javascript code to place within the generated HTML file
    -colors      number of colors (default: 255)
    -apikey      specify your Google Maps API key with this option

  References:
    1. Google Maps API Documentation. http://www.google.com/apis/maps/documentation/
    2. Arakawa K et al. "Genome Projector: zoomable genome map with multiple views."
       BMC Bioinformatics  2009 10:31

  Author: 
    Kazuharu Arakawa (gaou@sfc.keio.ac.jp)

  History:
    20090716-01 added -apikey option
    20090710-01 added cgr option to use internally with cgr() and kmer_table()
    20090709-01 3D map controller, and added xy2latlng function
    20080911-01 replaced -posterize option with -colors
    20080909-01 slightly changed the algorithm to make it about twice faster
    20080509-01 added -posterize option
    20070707-01 stopped tiling in the x-direction by default
    20070621-01 initial posting
    
=cut



sub generateGMap{
    opt_default(level=>6, posterize=>16, colors=>255, cgr=>0, apikey=>"YOUR_GOOGLE_MAP_KEY_HERE", vips=>1);
    my @argv       = opt_get(@_);
    my $file       = shift @argv;
    my $level      = opt_val("level");
    my $javascript = opt_val("javascript");
    my $posterize  = opt_val("colors");
    my $cgr        = opt_val("cgr");
    my $apikey     = opt_val("apikey");
    my $optvips    = opt_val("vips");
    my $path       = opt_val("path");
    
    $posterize = 16 if($cgr);

    my $vips    = $optvips ? `whereis vips` : '';
    $vips       =~ s/vips:\s+//g;
    my $tmpname = '/tmp/' . time(); 
    $level = 3 if ($level < 3);

    my $filename = basename($file);
    my $name = $filename;
    
    if($name =~ /(.*)\..*$/){
	$name = $1;
    }
    mkdir($name);

    
    require Image::Size;
    my ($width, $height) = Image::Size::imgsize($file);
    my $maxwidth = 256 * 2 ** ($level - 1);
    
    if($width == $height){
	if($width == $maxwidth && $file =~ /png$/){
	    system(sprintf("cp %s %s/level%d.png", $file, $name, $level - 1));
	}else{
	    system(sprintf("convert +dither -colors $posterize -background black -size %dx%d -resize %dx%d %s %s/level%d.png", $width, $height, $maxwidth, $maxwidth, $file, $name, $level - 1));
	}
    }else{
	my ($xdif, $ydif, $size) = (0,0, $width);
	
	if($width > $height){
	    $size = $width;
	    $ydif = int(($width - $height) / 2);
	}else{
	    $size = $height;
	    $xdif = int(($height - $width) / 2);
	}

	system(sprintf("convert +dither -colors $posterize -background black  -extent %dx%d -roll +%s+%s %s %s/%s.png", $size, $size, $xdif, $ydif, $file, $name, $name));
	system(sprintf("convert +dither -colors $posterize -background black  %s/%s.png -size %dx%d -resize %dx%d %s/level%d.png", $name, $name, $size, $size, $maxwidth, $maxwidth, $name, $level - 1));
    }
    chdir($name);

    my $maxlevel = $level - 1;

    my $pid = fork();
    
    if($pid){
    }elsif(defined $pid){
	for(my $i = $maxlevel; $i >= 1; $i --){
	    my $tiles = 2 ** $i;
	    my $size = $tiles * 256;
	    my $j = $i - 1;

#	    msg_error "shrink level$j\n";

	    if($vips){
		if($j == 0){
		    system(sprintf("vips im_shrink level%d.png level0-0-0.png 2 2", $i, $j)) unless(-e "level$j.png");
		}else{
		    system(sprintf("vips im_shrink level%d.png level%d.png 2 2", $i, $j)) unless(-e "level$j.png");
		}
	    }else{
		if($j == 0){
		    system(sprintf("convert +dither -colors $posterize -background black level%d.png -size %dx%d -resize %dx%d level0-0-0.png", $i, $size, $size, $size/2, $size/2)) unless(-e "level$j.png");
		}else{
		    system(sprintf("convert +dither -colors $posterize -background black level%d.png -size %dx%d -resize %dx%d level%d.png", $i, $size, $size, $size/2, $size/2, $j)) unless(-e "level$j.png");
		}
	    }
	}
	exit;
    }else{
	die("fork failed.");
    }

    for(my $i = $maxlevel; $i >= 1; $i --){
	my $tiles = 2 ** $i;
	my $size  = $tiles * 256;

	my $checkfile = 'level0-0-0.png';
	$checkfile = 'level' . ($i - 1) . '.png' unless($i == 1);

#	msg_error("checking availability of $checkfile\n");

	unless(-e $checkfile || $i == $maxlevel){
	    sleep(1);
	    redo();
	}

#	msg_error "start generation of level $i\n";

	if($vips){
	    for my $c (1..$tiles){
		$c --;

		system("vips im_extract_area level$i.png $tmpname-level$i-$c.png " . $c * 256 . " 0 256 $size &&" .
		       "convert +dither -colors $posterize -background black $tmpname-level$i-$c.png -crop 256x256 level$i-$c-%d.png &&" .
		       "rm $tmpname-level$i-$c.png $and");
	    }
	}else{
	    system("convert +dither -colors $posterize -background black level$i.png -crop 256x256 level$i-%d.png");
	    
	    for(my $y = 1; $y <= $tiles; $y ++){
		for(my $x = 1; $x <= $tiles; $x ++){
		    rename(sprintf("level%d-%d.png", $i, ($y - 1) * $tiles + ($x - 1)), sprintf("level%d-%d-%d.png", $i, $x - 1, $y - 1));
		}
	    }
	}
    }
    waitpid($pid, 0);
 
    open(OUT, '>' . 'index.html') || die($!);
    
    print OUT << "__HTML__";

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">    
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
  <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
    <title>Google Map View of $name - generated by G-language GAE</title>

    <script src="http://maps.google.com/maps?file=api&v=2&key=$apikey"
            type="text/javascript" charset="utf-8"></script>
<!--    <script src="http://googlemaps.googlermania.com/gmapkit/api?js=gmapkitmapcontrols3d.js" type="text/javascript"></script> -->

    <script type="text/javascript">
    //<![CDATA[

    var map;

    function customGetTileURL(a,b) {
        return "level" + b + "-" + a.x + "-" + a.y + ".png"
    }

    function resize(){
	var map_obj=document.getElementById("map");
	var disp=getDispSize();
	map_obj.style.width=(disp.width - 20)+"px";
	map_obj.style.height=(disp.height - 20)+"px";
	if( map ){
	       map.checkResize();
	       map.panTo(new GLatLng(0, 0));
	}
    }

    function getDispSize(){
	if(document.all){
	       if(window.opera){
		   return {width:document.body.clientWidth,height:document.body.clientHeight};
	       }else{
		   return {width:document.documentElement.clientWidth,height:document.documentElement.clientHeight};
	       }
	} else if(document.layers || document.getElementById){
	       return {width:window.innerWidth,height:window.innerHeight};
	}
    }

    function xy2latlng(x,y) {
	var pi  = Math.PI;
	var rd  = pi / 180;
	var length = 8192;
     
	var lng = (x * 360) / length - 180;
	var tmp = (2 * pi * y / length) - pi;
	var lat = (pi / 4 - Math.atan2(Math.exp(tmp), 1)) * 2 / rd;
     
        if (lat > 85.05) lat = 85.05;
	if (lat < -85.05) lat = -85.05;
	return [lat, lng];
    }

    function load() {
      if (GBrowserIsCompatible()) {
        resize();

        var copyright = new GCopyright(1,
                              new GLatLngBounds(new GLatLng(-90, -180), new GLatLng(90, 180)), 0,
                              "<a href=\\"http://www.g-language.org/\\" target=\\"_blank\\"><img src=\\"http://restauro-g.iab.keio.ac.jp/Res-Pic/glang.png\\" border=0></a>");
        var copyrightCollection = new GCopyrightCollection();
        copyrightCollection.addCopyright(copyright);

       // Create a new Mercator projection instance 
        var zoomlevel = $maxlevel;
	var projection = new GMercatorProjection(18); 

       // add an exposed copy of the tileBounds array 
	   projection.tileBounds = []; 
        var c = 1; 
        for(var d = 0; d <= 17; d++){ 
            projection.tileBounds.push(c); 
            c *= 2 
	    } 

       // == a method that checks if the y value is in range 
       // == but *doesnt* wrap the x value == 
       projection.tileCheckRange = function(a,b,c){ 
	   var d=this.tileBounds[b]; 
	   if (a.y<0||a.y>=d) { 
	       return false; 
	   } 

	   if(a.x<0||a.x>=d){ 
	       return false; 
	   } 
          return true 
	  } 

        // == a method that returns the width of the tilespace ==       
	    projection.getWrapWidth = function(zoom) { 
		return 99999999999999; 
	    } 

        //create a custom picture layer
        var pic_tileLayers = [ new GTileLayer(copyrightCollection , 0, 17)];
        pic_tileLayers[0].getTileUrl = customGetTileURL;
        pic_tileLayers[0].isPng = function(){ return true};
        pic_tileLayers[0].getOpacity = function() { return 1.0; };
        var pic_customMap = new GMapType(pic_tileLayers, projection, "View1",
            {maxResolution:zoomlevel, minResolution:1, errorMessage:"Data not available"});

        //Now create the custom map. Would normally be G_NORMAL_MAP,G_SATELLITE_MAP,G_HYBRID_MAP
        map = new GMap2(document.getElementById("map"), {mapTypes:[pic_customMap]});
        //map.addControl(new GMapKitMapControls3d());
        map.addControl(new GLargeMapControl());
        map.addControl(new GMapTypeControl());
	map.addControl(new GOverviewMapControl());
        map.enableDoubleClickZoom();
	map.enableContinuousZoom();
	map.enableScrollWheelZoom();
        map.setCenter(new GLatLng(0, 0), 2, pic_customMap);

///////// Definition of Zoom range v
        var minZoom= 1;
	var maxZoom= $maxlevel;
	var spoint = map.getCenter();
	var szoom = map.getZoom();
	if (szoom > maxZoom) {
	       szoom = maxZoom;
	} else if (szoom < minZoom) {
	       szoom = minZoom;
	}
	var maptypes = map.getMapTypes();
	for (var i = 0; i < maptypes.length; i++) {
	     maptypes[i].getMinimumResolution = function() {
	          return minZoom;
             };
             maptypes[i].getMaximumResolution = function() {
                  return maxZoom;
             };
        }
///////// Definition of Zoom range ^


/////////////////////////////////////////////////////////////////////////////////////
//Add any markers here e.g.
//      map.addOverlay(new GMarker(new GLatLng(x,y)));
/////////////////////////////////////////////////////////////////////////////////////


        $javascript;
      }
    }
__HTML__

	 if($cgr){
	     print OUT << "__HTML__";

	 function doSearch() {
	     map.clearOverlays();

	     var seq = document.getElementById('query').value.toLowerCase();
	     if(seq.length < 1) return;
	     if(seq.match(/[^atgcnATGCN]/)) return;

		 var i = 0;
		 var j = 0;
		 		 
		 for(i = 0; i <= seq.length; i ++){
			if(seq.substr(i,1) == 'n')
				j ++;
		 }

 		 var sequences = new Array();
		 sequences.push(seq);

		 for(i = 0; i<j; i++){
		    for(var n = 0; n < sequences.length; n ++){
				if(sequences[n].match(/n/)){
					sequences.push(sequences[n].replace(/n/, 't'));
					sequences.push(sequences[n].replace(/n/, 'g'));
					sequences.push(sequences[n].replace(/n/, 'c'));
					sequences[n] = sequences[n].replace(/n/, 'a');
				}
			}
		 }

		for (i = 0; i <= sequences.length; i ++){ 
	    if(sequences[i] == null){continue;}
	     var width = 4096/Math.pow(2, seq.length - 1);
	     var ud = sequences[i];
	     var rl = sequences[i];
	     ud = ud.replace(/[ac]/g, 0);
	     ud = ud.replace(/[gt]/g, 1);
	     rl = rl.replace(/[ag]/g, 0);
	     rl = rl.replace(/[ct]/g, 1); 
	     
	     var x = parseInt(ud, 2) * width;
	     var y = parseInt(rl, 2) * width;
	     
	     var x1 = xy2latlng(x,y);
	     var x2 = xy2latlng(x + width, y);
	     var x3 = xy2latlng(x + width, y + width);
	     var x4 = xy2latlng(x + width/2, y + width);
	     var x5 = xy2latlng(x, y + width);

	     var polygon = new GPolygon([
					 new GLatLng(x1[0], x1[1]),
					 new GLatLng(x2[0], x2[1]),
					 new GLatLng(x3[0], x3[1]),
					 new GLatLng(x4[0], x4[1]),
					 new GLatLng(x4[0], x5[1]),
					 new GLatLng(x1[0], x1[1])
					 ]);
	
	     if(seq.length > 6) 
			map.addOverlay(new GMarker(new GLatLng(x1[0], x1[1])));	     

	     map.addOverlay(polygon, '#000000', 3, 0.5, '#FF0000', 0.5);
		}
	 }


    //]]>
    </script>
  </head>
  <body onresize="resize()" onload="load()" onunload="GUnload()">
    <div style="z-index:100;position:absolute;left:40%;margin-top:10px;">
    Search: <input type="search" name="query" id="query" placeholder="Search" autosave="gbt" results="10" size=30 onKeyUp="doSearch()"/>
    </div>
    <div id="map" style="z-index:0;position:absolute"></div>
  </body>
</html>

__HTML__

}else{

    print OUT << "__HTML__";
    //]]>
    </script>
  </head>
  <body onresize="resize()" onload="load()" onunload="GUnload()">
    <div id="map"></div>
  </body>
</html>

__HTML__
}

    close(OUT);

    chdir("../");
    msg_error("Google Map View is generated in $name directory.\n");
}

1;

