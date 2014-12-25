#!/usr/bin/env perl
use strict;
use warnings;
use lib "../Scripts/pm";
use MapGen;
use ActionMongoDB;
use JSON;
use Data::Dumper;
use Time::HiRes;  

my $start_time = Time::HiRes::time;  
  

## tile mapping datas
my ($up, $down, $total, $mapping_tile);
##
$down = 1;
$up = 0;
$total++;

my $client = MongoDB::MongoClient->new();
$client->authenticate('Carpesys', 't11881tm', 'taiyo1102');
my $database = $client->get_database('Carpesys');
my $Element = $database->get_collection('Element');
my $Pathway_Maps = $database->get_collection('Pathway_Maps');

my $object = $Element->find({'Meta.cpd' => "C00001"});

while(my $record = $object->next){
     my $map_id = $$record{'Pathway'};

    ## find in Pathway_Maps collections
    my $category = $Pathway_Maps->find({'Map_ID' => "$map_id"});
     while(my $recordOfPathway_Maps = $category->next){
         my $latlng = $$recordOfPathway_Maps{'LatLng'};
         my $tile_type = $$recordOfPathway_Maps{'Category'};
         if(exists $mapping_tile->{$tile_type}->{$map_id}){
             $mapping_tile->{$tile_type}->{$map_id}->{'count'}++;
             $mapping_tile->{$tile_type}->{$map_id}->{'up'}++;
             $mapping_tile->{$tile_type}->{$map_id}->{'down'}++;

         }else{
             $mapping_tile->{$tile_type}->{$map_id}->{'latlng'} = $latlng;
             $mapping_tile->{$tile_type}->{$map_id}->{'count'}++;
             $mapping_tile->{$tile_type}->{$map_id}->{'up'}++;
             $mapping_tile->{$tile_type}->{$map_id}->{'down'}++;
         }
    }
}

for my$cat(keys %{$mapping_tile}){
    my @push2mapping_tile = ();
    for my$map(keys %{$mapping_tile->{$cat}}){
        push @push2mapping_tile,  $mapping_tile->{$cat}->{$map};
        #push @{$mapping_tile->{$cat}} , $mapping_tile->{$cat}->{$map};
        delete $mapping_tile->{$cat}->{$map};
    }
    $mapping_tile->{$cat} = \@push2mapping_tile;

}

print Dumper $mapping_tile;


