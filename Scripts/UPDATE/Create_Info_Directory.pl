#!/usr/bin/env perl

use strict;
use warnings;
use Data::Dumper;
use G;

##Create DIR for metabolism Subcategory

open my $file, '<', "../../Data/Info/Other/Metabolism_Subcategory_list.dat";

my $Subcategory;

my %Subcategories;
while(<$file>){
    chomp;
    
    if($Subcategory && /\d{5}/){
	my @pathways = split(/\s/, $_);
	$Subcategories{"${Subcategory}"} = \@pathways;
	undef($Subcategory);
	next;
    }
    if(/\d\.\d{1,2}\s(\w+)/){
	$Subcategory = $1;
	next;
    }
}


for my $Sub(keys %Subcategories){
    mkdir "~/BAK/Metabolism/$Sub" or next;
    #    mkdir "../../Data/Info/Metabolism/$Sub" or next;
    for my $pathway(@{$Subcategories{$Sub}}){
	system("cp -r ~/BAK/$pathway ~/BAK/Metabolism/$Sub");
	#	system("cp -r ../../Data/Info/Metabolism/$pathway ../../Data/Info/Metabolism/$Sub");
    }
}

__END__

while(<$file>){
    chomp;
        if($Subcategory){
	##copy pathway_info directory to subcategory..
	my $copy_to =  "${Subcategory_path}"."${Subcategory}\n";
	copy   $copy_to;
	
	$Subcategory = '';
    }
    
    if (/\d\.\d\s(\w+)/){
	$Subcategory = $1;
	$Subcategory_path = "../../Data/Info/Metabolism/";

#	mkdir "B" or next;
#	mkdir "../../Data/Info/Metabolism/$Subcategory" or next;
#
    }
    
}
