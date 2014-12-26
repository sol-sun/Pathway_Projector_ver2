#!/usr/bin/env perl

use strict;
use warnings;
use Data::Dumper;
use JSON;

open my $file, '<', "out";
my $data;

while(<$file>){
    chomp($_);
    $data = $_;
    last;
}

my $mapping_tile = decode_json( $data );


my @black = (0, 0, 0);
my @red = (255, 0, 0);
my @green = (0, 255, 0);

for my $cat(keys %{$mapping_tile}){

    if($cat eq 'Metabolism'){
        for my$subcat(keys %{$mapping_tile->{$cat}}){
            my @pushmapping_tile = ();
            for my $map(keys %{$mapping_tile->{$cat}->{$subcat}}){
                $mapping_tile->{$cat}->{$subcat}->{$map}->{'upcolor'} = '#'. unpack("H6", pack("C3", map{ (($green[$_] - $black[$_]) * ($mapping_tile->{$cat}->{$subcat}->{$map}->{'up'}/$mapping_tile->{$cat}->{$subcat}->{$map}->{'total'} * 100)/100) + $black[$_]} (0..2) ) );
                $mapping_tile->{$cat}->{$subcat}->{$map}->{'downcolor'} = '#'. unpack("H6", pack("C3", map{ (($red[$_] - $black[$_]) * ($mapping_tile->{$cat}->{$subcat}->{$map}->{'down'}/$mapping_tile->{$cat}->{$subcat}->{$map}->{'total'} * 100)/100) + $black[$_]} (0..2) ) );
                
                push @pushmapping_tile,  $mapping_tile->{$cat}->{$subcat}->{$map};
                delete $mapping_tile->{$cat}->{$subcat}->{$map};
            }
            $mapping_tile->{$cat}->{$subcat} = \@pushmapping_tile;

        }

    }
    else{
        my @push2mapping_tile = ();
        for my$map(keys %{$mapping_tile->{$cat}}){

            $mapping_tile->{$cat}->{$map}->{'upcolor'} = '#'. unpack("H6", pack("C3", map{ (($green[$_] - $black[$_]) * ($mapping_tile->{$cat}->{$map}->{'up'}/$mapping_tile->{$cat}->{$map}->{'total'} * 100)/100) + $black[$_]} (0..2) ) );
            $mapping_tile->{$cat}->{$map}->{'downcolor'} = '#'. unpack("H6", pack("C3", map{ (($red[$_] - $black[$_]) * ($mapping_tile->{$cat}->{$map}->{'down'}/$mapping_tile->{$cat}->{$map}->{'total'} * 100)/100) + $black[$_]} (0..2) ) );

            push @push2mapping_tile,  $mapping_tile->{$cat}->{$map};
            delete $mapping_tile->{$cat}->{$map};
        }
        $mapping_tile->{$cat} = \@push2mapping_tile;
    }

}

print Dumper $mapping_tile;
