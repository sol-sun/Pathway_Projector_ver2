#!/usr/bin/env perl

package Convert;

use strict;
use warnings;

sub xy2latlng{
    
    my ($x, $y) = @_;
    my $pi = 4 * atan2(1,1);
    my $rd = $pi / 180;
#    my $length = 16384; 
    my $length = 8192;
    
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
