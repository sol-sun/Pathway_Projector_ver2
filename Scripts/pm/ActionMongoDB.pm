#!/usr/bin/env perl

package ActionMongoDB;

use strict;
use warnings;
use MongoDB;
use JSON;
use Data::Dumper;
use utf8;
use Encode;

$, = ", ";
##Category data(MondoDB)
my (@Category, @json);


my ($sw_x, $sw_y);
my ($ne_x, $ne_y);

@Category = ('Metabolism', 'Genetic_Information_Processing', 'Environmental_Information_Processing', 'Cellular_Processes', 'Organismal_Systems', 'Drug_Development');

 ($sw_x, $sw_y) = latlng2xy("-50.457504020420565","-63.984375");
 ($ne_x, $ne_y) = latlng2xy("53.69670647530323","61.962890625");

$json[0] = qq({ "Category":"Metabolism", "LatLng":{ "sw_lat":-50.457504020420565, "sw_lng":-63.984375, "ne_lat":53.69670647530323, "ne_lng":61.962890625}, "xy":{"sw_x":$sw_x, "sw_y":$sw_y, "ne_x":$ne_x, "ne_y":$ne_y}, "max_zoom":5, "next_hierarchy":"Tile" }\n);

 ($sw_x, $sw_y) = latlng2xy("53.69670647530323","-63.984375");
 ($ne_x, $ne_y) = latlng2xy("85.035941506574","61.962890625");
$json[1] = qq({ "Category":"Genetic_Information_Processing", "latlng":{ "sw_lat":53.69670647530323, "sw_lng":-63.984375, "ne_lat":85.035941506574, "ne_lng":61.962890625}, "xy":{"sw_x":$sw_x, "sw_y":$sw_y, "ne_x":$ne_x, "ne_y":$ne_y},"max_zoom":5 ,"next_hierarchy":"Tile"}\n);

 ($sw_x, $sw_y) = latlng2xy("1.4061088354351594","61.962890625");
 ($ne_x, $ne_y) = latlng2xy("76.96033358827414","180");
$json[2] = qq({ "Category":"Environmental_Information_Processing", "latlng":{"sw_lat":1.4061088354351594, "sw_lng":61.962890625, "ne_lat":76.96033358827414, "ne_lng":180},"xy":{"sw_x":$sw_x, "sw_y":$sw_y, "ne_x":$ne_x, "ne_y":$ne_y},"max_zoom":5 ,"next_hierarchy":"Tile"}\n);

 ($sw_x, $sw_y) = latlng2xy("-76.28954161916204","-179.912109375");
 ($ne_x, $ne_y) = latlng2xy("1.4061088354351594","-63.984375");
$json[3] = qq({ "Category":"Cellular_Processes", "latlng":{"sw_lat":-76.28954161916204, "sw_lng":-179.912109375, "ne_lat":1.4061088354351594,"ne_lng":-63.984375},"xy":{"sw_x":$sw_x, "sw_y":$sw_y, "ne_x":$ne_x, "ne_y":$ne_y},"max_zoom":5 ,"next_hierarchy":"Tile"}\n);

 ($sw_x, $sw_y) = latlng2xy("1.4061088354351594","-179.912109375");
 ($ne_x, $ne_y) = latlng2xy("76.96033358827414","-63.984375");
$json[4] = qq({ "Category":"Organismal_Systems", "latlng":{"sw_lat":1.4061088354351594, "sw_lng":-179.912109375, "ne_lat":76.96033358827414, "ne_lng":-63.984375},"xy":{"sw_x":$sw_x, "sw_y":$sw_y, "ne_x":$ne_x, "ne_y":$ne_y}, "max_zoom":5 ,"next_hierarchy":"Tile"}\n);

 ($sw_x, $sw_y) = latlng2xy("-76.28954161916204","61.962890625");
 ($ne_x, $ne_y) = latlng2xy("1.4061088354351594","180");
$json[5] = qq({ "Category":"Human_Diseases", "latlng":{"sw_lat":-76.28954161916204, "sw_lng":61.962890625, "ne_lat":1.4061088354351594, "ne_lng":180},"xy":{"sw_x":$sw_x, "sw_y":$sw_y, "ne_x":$ne_x, "ne_y":$ne_y}, "max_zoom":5 ,"next_hierarchy":"Tile"}\n);

 ($sw_x, $sw_y) = latlng2xy("-85.08136441846642","-63.984375");
 ($ne_x, $ne_y) = latlng2xy("-50.457504020420565","61.962890625");
$json[6] = qq({ "Category":"Drug_Development", "latlng":{"sw_lat":-85.08136441846642, "sw_lng":-63.984375, "ne_lat":-50.457504020420565, "ne_lng":61.962890625},"xy":{"sw_x":$sw_x, "sw_y":$sw_y, "ne_x":$ne_x, "ne_y":$ne_y}, "max_zoom":5 ,"next_hierarchy":"Tile"}\n);

$json[7] = qq({ "Information":{"Zoom_Level":"4", "next_Hierarchy":"Tile"}}\n);
##

    
#my $result = &INSERT("Carpesys", "Category", "root", "Taiyo1992", @json);
#print $result;
#print "\n";


#my $result = &FIND("Carpesys", "Pathway_Maps", "Taiyo", "yktm1102", '{}');

sub FIND{
  my ($db, $col, $id, $pass, $query_json) = @_;
  
  my $client = MongoDB::MongoClient->new();
  $client->authenticate("$db", "$id", "$pass");
  my $Database = $client->get_database("$db");
  my $Collection = $Database->get_collection($col);
  my @id_;
  
  my $query = eval{decode_json $query_json} or return 0;
  
  my $result = eval{$Collection->find($query)} or return 0;
  
  my @array;
  while(my $row = $result->next){
    push @array, {'Map_ID'=>"$row->{Map_ID}", 'LatLng'=>{'CN_LAT'=>"$row->{LatLng}->{cn_lat}", 'CN_LNG'=>"$row->{LatLng}->{cn_lng}", 'SW_LAT'=>"$row->{LatLng}->{sw_lat}", 'SW_LNG'=>"$row->{LatLng}->{sw_lng}", 'NE_LAT'=>"$row->{LatLng}->{ne_lat}", 'NE_LNG'=>"$row->{LatLng}->{ne_lng}"},'XY'=>{'CN_X'=>"$row->{XY}->{cn_x}", 'CN_Y'=>"$row->{XY}->{cn_y}",'SW_X'=>"$row->{XY}->{sw_x}", 'SW_Y'=>"$row->{XY}->{sw_y}", 'NE_X'=>"$row->{XY}->{ne_x}", 'NE_Y'=>"$row->{XY}->{ne_y}"}};
  }
  return(@array);
  
  #  return ($result);
}

#my $query_json = "{""}";
#my $update_json = "{}";

#my $result = &UPDATE("Carpesys", "Pathway_Maps", "Taiyo", "yktm1102", );

sub UPDATE{ #ARG => ($DB_Name, $Collections_Name, $root_ID, $root_pass, $query_json, $update_json)

  my ($db, $col, $id, $pass, $query_json, @update_json) = @_;

  my $client = MongoDB::MongoClient->new();
  $client->authenticate('admin', "$id", "$pass");
  my $Database = $client->get_database("$db");
  my $Collection = $Database->get_collection($col);
  my @id_;

  my $query = eval{decode_json $query_json} or return 0;

  for my $update_json(@update_json){
    my $update = eval{decode_json $update_json} or return 0;
    
    push @id_, eval{$Collection->update($query, $update, {"upsert"=> 1, "multiple"=>1})} or return 0;
  }

  return 1;
  
}


sub INSERT{ #ARG => ($DB_Name, $Collections_Name, $root_ID, $root_pass, @insert_data_of_json_style );

  my ($db, $col, $id, $pass, @json) = @_;
  
  my $client = MongoDB::MongoClient->new();
  $client->authenticate('admin', "$id", "$pass");
  my $Database = $client->get_database("$db");
  my $Collection = $Database->get_collection("$col");
  
  my @id_;
  
  for(my$i=0;$i<=$#json;$i++){
    $json[$i] = eval{decode_json $json[$i]} or return 0;
    push @id_, eval{$Collection->insert($json[$i])} or return 0;
  }
  return 1;
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


=pod
	Pathway_Elements
	...
	
	Pathway_Maps
	MapID(00010) Category(Metabolism) SubCategory(Energy_metabolism) coords information: "[{"zoom_level"}]"
	
	Category
	'Category':"...", "coords":"", "max_zoom":""
	
	Subcategory
=cut


#1;
