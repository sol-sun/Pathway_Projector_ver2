#!/usr/bin/env perl

use strict;
use warnings;
use lib "../Scripts/pm";
use MongoDB;
use Config::Pit::RC4;
use Data::Dumper;
use JSON;


my $user = ${pit_get("MongoDB")}{'username'} or die 'username not found';
my $pass = ${pit_get("MongoDB")}{'password'} or die 'password not found';

my $client = MongoDB::MongoClient->new();
my $db = $client->get_database('Carpesys');
my $users = $db->get_collection('Element');

my $object = $users->find();
while(my $record = $object->next){
    print Dumper $$record{'xy'};
    print "\n";
}
