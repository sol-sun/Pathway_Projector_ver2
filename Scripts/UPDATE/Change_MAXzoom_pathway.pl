#!/usr/bin/env perl

use strict;
use warnings;
use G;


while(<../../Data/Info/*/*/*>){
    chomp;
    next unless /(\d{5})\.location/;
    my $map_id = $1;
    my $location_path = $_;
    open my $file, '<', "$location_path";
    my $location_json;
    while(<$file>){
	chomp;
	if (/zoom_level\":\"(\d)\"/){
	    my $maxzoom = $1 - 1;
	    s/$1/$maxzoom/;
	    $location_json .= "$_\n";
	}else{
	    $location_json .= "$_\n";
	}
    }
    close $file;

    system("rm $location_path");
    open my $out, '>', "$location_path";
    print $out $location_json;
    close $out;
}

while(<../../Data/Info/*/*/*/*>){
    chomp;
    next unless /(\d{5})\.location/;
    my $map_id = $1;
    my $location_path = $_;
    open my $file, '<', "$location_path";
    my $location_json;
    while(<$file>){
	chomp;
	if(/zoom_level\":\"(\d)\"/){
	    my $maxzoom = $1 - 1;
	    s/$1/$maxzoom/;
	    $location_json .= "$_\n";
	}else{
	    $location_json .= "$_\n";
	}
    }
    close $file;

    system("rm $location_path");
    open my $out, '>', "$location_path";
    print $out $location_json;
    close $out;
}
