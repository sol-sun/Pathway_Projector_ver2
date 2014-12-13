#!/usr/bin/env perl
$, = ",";
use strict;
use warnings;
use JSON;
use Data::Dumper;


open my $file, '<', "test.txt";

while(<$file>){
  chomp;
  my $hash =  decode_json($_);

  my @sw_xy = &latlng2xy($hash->{'latlng'}->{'sw_lat'}, $hash->{'latlng'}->{'sw_lng'});
  my @ne_xy = &latlng2xy($hash->{'latlng'}->{'ne_lat'}, $hash->{'latlng'}->{'ne_lng'});

  $hash->{'xy'}->{'sw_x'} = $sw_xy[0];
  $hash->{'xy'}->{'sw_y'} = $sw_xy[1];
  $hash->{'xy'}->{'ne_x'} = $ne_xy[0];
  $hash->{'xy'}->{'ne_y'} = $ne_xy[1];
  $hash->{'Subcategory'} =~ s/ /_/g;
  my $result = encode_json($hash);
  print $result;
  print ",";

}

close $file;


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
