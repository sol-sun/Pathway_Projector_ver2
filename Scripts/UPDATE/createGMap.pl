#!/usr/bin/env perl

use strict;
use warnings;
use G;


while(<./Info/*/*/*.location>){
    next if /Tile/;
    my $path = $_;
        
    open my $file, '<', "$_";
    while(<$file>){
	chomp;
	if(/\"zoom_level\":\"(\d)/){
	    my $maxzoom = $1+2;
	    $path =~ s/Info/Maps/;
	    $path =~ s/location/png/;
	    my $path_cp = $path;
	    $path_cp =~ s/\.png//;
	    `perl ~/Perl_Scripts/GMap.pm $path $maxzoom;`;
	    last;
	}

    }
    close $file;

}
