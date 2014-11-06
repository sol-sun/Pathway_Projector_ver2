
#!/usr/bin/env perl

use strict;
use warnings;

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

while(</var/www/html/suzuki/P2/Data/Info/*/Tile/Tile.location>){
    my $Tile_location_path = $_;
    
    open my $file, '<', "${Tile_location_path}";
    
    my $addCenter_JSON;
    my $exists_center = 1;
    
    while(<$file>){
	chomp();
    
	if(/Center/){
	    $exists_center = 0;
	    last;
	}
	
	my ($SouthWest_lat, $SouthWest_lng, $NorthEast_lat, $NorthEast_lng);
	$SouthWest_lat = $1 if /SouthWest_lat\":\"(\-?\d+.\d+)/;
	$SouthWest_lng = $1 if /SouthWest_lng\":\"(\-?\d+.\d+)/;
	$NorthEast_lat = $1 if /NorthEast_lat\":\"(\-?\d+.\d+)/;
	$NorthEast_lng = $1 if /NorthEast_lng\":\"(\-?\d+.\d+)/;
	
	unless(defined($SouthWest_lat)){
	    $addCenter_JSON .= qq($_\n);
	}else{
	    my ($South_x, $South_y) = latlng2xy($SouthWest_lat, $SouthWest_lng);
	    my ($North_x, $North_y) = latlng2xy($NorthEast_lat, $NorthEast_lng);
	    my $Center_x = $South_x + ( ($North_x - $South_x)/2 );
	    my $Center_y = $North_y + ( ($South_y - $North_y)/2 );
	    my ($Center_lat,$Center_lng) = xy2latlng($Center_x, $Center_y);
	    
	    s/(\s\}\,?)/, \"Center_lat\":\"$Center_lat\", \"Center_lng\":"$Center_lng"$1/;
	    
	    $addCenter_JSON .= qq($_\n);
	}
	
    }
    close ($file);
    
    if($exists_center){
	open my $out, '>', "${Tile_location_path}";
	print $out $addCenter_JSON;
	close ($out);
    }else{
	print "${Tile_location_path}: includes Center_latlng\n";
    }
    
}
