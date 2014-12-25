#!/usr/bin/env perl

use strict;
use warnings;

#my @black = (0, 0, 0);
my @black = (255, 255, 255);
my @red = (255, 0, 0);
my @green = (0, 255, 0);

my $element_color = unpack("H6", pack("C3", map{ (($red[$_] - $black[$_]) * 30/100) + $black[$_]} (0..2) ) );
print $element_color;
