#!/usr/bin/env perl

package Get_Info;

use strict;
use warnings;
use Data::Dumper;

$, = "\n";

sub Get_Tile_Information{ # @coords(Get from subroutine named Tiler),@mapIDs, $category, $subcategory  $file,
    my @xy;
    my ($coords, $mapIDs, $category, $subcategory) = @_;
    my @coords = @{$coords};
    my @mapIDs = @{$mapIDs};
    $category =~ s/^\d+\._//g;
    $subcategory =~ s/\d+\.\d+_//g;
    
    for(my$i=0;$i<$#coords;$i=$i+2){
	push @xy, [$coords[$i], $coords[$i+1]];
    }
#    open my $file,'<', "flow.txt";
#    my (@array1, @array2);
#    while(<$file>){
#	if(/^\$VAR\d+\s=\s(\d+)/){
#	    push @array1, $1;
#	}
#    }
#    for(my$i=0;$i<$#array1;$i = $i+2){
#    print $array1[$i],"\n";    # print x;
#	push @array2, [$array1[$i],$array1[$i+1]];
#    $array2[$i] = [$array1[$i],$array1[$i+1]];
#    }
    
    $, = "\n";
    my @data;my $mapnum = 0;
    for my$xy(@xy){
	my $json;
##get NorthEast_xy
	my $NorEast_x = $$xy[0] + 980;
	my $SouWest_y = $$xy[1] + 1400;
	my $Center_x = $$xy[0] + ( ($NorEast_x - $$xy[0])/2 );
	my $Center_y = $$xy[1] + ( ($SouWest_y - $$xy[1])/2 );

	$json .= qq( {"Map_ID": "$mapIDs[$mapnum]", "Category":"$category", "SubCategory":"$subcategory", );
##get NorthEast and SouthWest latlng, center_latlng
	$json .= qq("NorthEast_x":$NorEast_x, "NorthEast_y":$$xy[1], );
	$json .= qq("SouthWest_x":$$xy[0], "SouthWest_y":$SouWest_y, );
	$json .= qq("Center_x":$Center_x, "Center_y":$Center_y);

	my @latlng;
#	@latlng = &xy2latlng($$xy[0],$SouWest_y);
#	$json .= qq("SouthWest_lat":"$latlng[0]", "SouthWest_lng":"$latlng[1]",);
#	@latlng = &xy2latlng($NorEast_x,$$xy[1]);
#	$json .= qq("NorthEast_lat":"$latlng[0]", "NorthEast_lng":"$latlng[1]",);
#	@latlng = &xy2latlng($Center_x, $Center_y);
#	$json .= qq("Center_lat":"$latlng[0]", "Center_lng":"$latlng[1]"}\n);
	push @data, $json;
	$mapnum++;
    }
    return @data;
}

#print qq(],
#"information":[{"zoom_level":"5", "next_Hierarchy": "Pathway"}]
#});

#print  Dumper@array2;

# x=980, y=1400;

sub xy2latlng{
    
    my ($x, $y) = @_;
    my $pi = 4 * atan2(1,1);
    my $rd = $pi / 180;
    my $length = 16384;
#    my $length = 8192;
    
    my $lng = ($x * 360) / $length - 180;
    my $tmp = (2 * $pi * $y / $length) - $pi;
    my $lat = ($pi / 4 - atan2(exp($tmp), 1)) * 2 / $rd;
    
    $lat = 85.05 if ($lat > 85.05);
    $lat = -85.05 if ($lat < -85.05);
    return ($lat, $lng);
    
}

sub tan{
    return sin($_[0]) / cos($_[0]);
}

1;
