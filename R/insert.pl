#!/usr/bin/env perl

use strict;
use warnings;
use lib "../Scripts/pm";
use ActionMongoDB;
use utf8;
use Encode;
use JSON;
use Data::Dumper;


my @json;
my $obj;

{
    {
	{
	    my $map = "00362";
	    
	    push @json, qq( {"path":"4016864/00362/C00091.png", "latlng":{"sw_lat":-3.59019998070089, "sw_lng":78.1917063222296, "ne_lat":-3.59019998070089, "ne_lng":78.1917063222296 }} );
	    push @json,  qq( {"path":"4016864/00362/C00036.png", "latlng":{"sw_lat":58.7533111271693, "sw_lng":92.3861318830726, "ne_lat":58.7533111271693, "ne_lng":92.3861318830726 }} );

	}
	@json = ();	
	my $json = join(',', @json);
	
	my @json2;
	push @json2, qq( {"Map_ID":"map", "object":$json} );
    }
    @json2 = ();
    my $json2 = join(',', @json2);
    my $result = qq ({"Mapping_ID": "$Mapping_ID", "data": @json2 });
}



#my $insert = qq({"Mapping_ID":"4016864", "DATA":[{"Map_ID":"00362", "object":[{"path":"4016864/00362/C00091.png", "latlng":{"sw_lat":-3.59019998070089, "sw_lng":78.1917063222296, "ne_lat":-3.59019998070089, "ne_lng":78.1917063222296}}]}]});
#push @array, $insert;


#my $result = &ActionMongoDB::INSERT("Carpesys", "Mapping_Data", "root", "Taiyo1992", @array);
#print $result,"\n";

		 
