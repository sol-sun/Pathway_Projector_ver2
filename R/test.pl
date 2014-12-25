#!/usr/bin/env perl

use strict;
use warnings;
use Data::Dumper;
use JSON;

open my $file, '<', "test.json";
my $data;

while(<$file>){
    chomp($_);
    $data = $_;
    last;
}

my $json = decode_json( $data );

print Dumper $json;
