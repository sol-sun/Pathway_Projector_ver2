#!/usr/bin/env perl

$\ = "\n";
use strict;
use warnings;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use Time::HiRes;
use Data::Dumper;#use lib '/Users/miyaharataiyou/perl5/lib/perl5/';
use Statistics::R;
use lib "../Scripts/pm";
use ActionMongoDB;
use File::Copy 'copy';
use Archive::Zip;
use Errno ();
use JSON;

## R start set
my $R = Statistics::R->new();
$R->startR;

my $start_time = Time::HiRes::time;
##.

## CGI start set
my $cgi = new CGI;
my $input_data = $cgi->param("Input_Data");
print "Content-type: text/html;charset=utf-8;\n\n";
##.

## Mongo DB start set
my $client = MongoDB::MongoClient->new();
$client->authenticate('Carpesys', 't11881tm', 'taiyo1102');
my $database = $client->get_database('Carpesys');
my $collection = $database->get_collection('Element');
my $collection2 = $database->get_collection('Mapping_Data');
##.

open my $file, '<', "mapping.data";
my ($Query_ID, $Graph_Type);
my ($Time, $Frequency);
my $Mapping_ID = ((time % 1296000) * 10 + int(rand(10)) + 1048576);
my @Mapping_Pathways;

## Mapping DATA Directory
#umask(0);
unless (mkdir ("./$Mapping_ID", 0755) or $! == Errno::EEXIST){
    die "failed to create dir:./$Mapping_ID:$!";
}
##.

my %JSON;
while(<$file>){
    chomp;
    if(defined($Query_ID) && $_ =~ m|\d+,\d+|){
	my @datas = split(/,/);
	$Time .= qq("$datas[0]",);
	$Frequency .= qq($datas[1],);
	next;
    }elsif($_ =~ m|//|){
	chop($Time);
	chop($Frequency);
	my $return_num =  &R_Graph($Query_ID, $Mapping_ID, $Graph_Type, $Time, $Frequency, \@Mapping_Pathways);
	
	if($return_num == 0){ ## Generate Graph is failed
	    $R->stopR();
	    printf("%0.3f",Time::HiRes::time - $start_time);
	    die "$Query_ID: Generate Barplot is failed\n";
	}
	($Query_ID, $Graph_Type, $Time, $Frequency) = undef;
	@Mapping_Pathways = ();
    }
    
    if(/^>([A-Za-z]\d{5}),([line|bar]+)/){
	my $object;
	($Query_ID, $Graph_Type) = ($1, $2);
	if($Query_ID =~ m/^[CDG]/){
	    $object = $collection->find({'Meta.cpd' => "$Query_ID"});
	    
	    while(my $record = $object->next){
		my @latlng;
		push @Mapping_Pathways, $$record{'Pathway'};
		unless (mkdir ("./$Mapping_ID/$$record{'Pathway'}") or $! == Errno::EEXIST){
		    die "failed to create dir:./$Mapping_ID:$!";
		}
		
		if($$record{'Shape'} eq 'Rectangle'){
		    @latlng = ( "$$record{'latlng'}{'sw_lat'}", "$$record{'latlng'}{'sw_lng'}", "$$record{'latlng'}{'ne_lat'}", "$$record{'latlng'}{'ne_lng'}" );
		}elsif($$record{'Shape'} eq 'Circle'){
		    @latlng =  ( "$$record{'latlng'}{'lat'}", "$$record{'latlng'}{'lng'}", "$$record{'latlng'}{'lat'}", "$$record{'latlng'}{'lng'}" );
		}
		#		print qq| "$$record{'Pathway'}" : \n\t{"sw_latlng" : \["$latlng[0]", "$latlng[1]"\], "ne_latlng" : \["$latlng[2]", "$latlng[3]"\]}\n |;
		$JSON{"$$record{'Pathway'}"} .=  qq|  \n\t{"Graph_Path" : "${Mapping_ID}/$$record{'Pathway'}/${Query_ID}.png", "sw_latlng" : ["$latlng[0]", "$latlng[1]"], "ne_latlng" : ["$latlng[2]", "$latlng[3]"]},\n|;#print qq| "$$record{'Pathway'}" : \n\t{"sw_latlng" : ["$latlng[0]", "$latlng[1]"], "ne_latlng" : ["$latlng[2]", "$latlng[3]"]}\n |;
		
	    }

	}elsif($Query_ID =~ m/^R/){
	    $object = $collection->find({'Meta.KEGG_REACTION' => "$Query_ID"});
	    while(my $record = $object->next){
		my @latlng;
		push @Mapping_Pathways, $$record{'Pathway'};
		unless (mkdir ("./$Mapping_ID/$$record{'Pathway'}") or $! == Errno::EEXIST){
		    die "failed to create dir:./$Mapping_ID:$!";
		}
		
		if($$record{'Shape'} eq 'Rectangle'){
		    @latlng = ( "$$record{'latlng'}{'sw_lat'}", "$$record{'latlng'}{'sw_lng'}", "$$record{'latlng'}{'ne_lat'}", "$$record{'latlng'}{'ne_lng'}" );
		}elsif($$record{'Shape'} eq 'Circle'){
		    @latlng =  ( "$$record{'latlng'}{'lat'}", "$$record{'latlng'}{'lng'}", "$$record{'latlng'}{'lat'}", "$$record{'latlng'}{'lng'}" );
		}
		$JSON{"$$record{'Pathway'}"} .=  qq|  \n\t{"Graph_Path" : "${Mapping_ID}/$$record{'Pathway'}/${Query_ID}.png", "sw_latlng" : ["$latlng[0]", "$latlng[1]"], "ne_latlng" : ["$latlng[2]", "$latlng[3]"]},\n|;#print qq| "$$record{'Pathway'}" : \n\t{"sw_latlng" : ["$latlng[0]", "$latlng[1]"], "ne_latlng" : ["$latlng[2]", "$latlng[3]"]}\n |;
	    }
	    
	}
	unless($object){ ## Error Process
	    $R->stopR();
	    printf("%0.3f",Time::HiRes::time - $start_time);
	    die "$_\n$object\n";
	}
	
    }
    
}
close $file;
$R->stopR();
my $insert;
$insert .= qq|{|;
	       $insert .=  qq( "Mapping_ID":"$Mapping_ID", );
	       $insert .=  qq( "Data":{);
	       
	       while(my ($key, $value) = each(%JSON)){
		   $value =~ s/,\n$//g;
		   $insert .= qq|"map$key" : [$value],|;
	       }
			       $insert =~ s/,$//;
			       $insert .= qq(});
	       $insert .= qq|}|;
$insert =~ s/\n//g;

print $insert;

$insert = decode_json($insert);

$collection2->insert($insert);

## Create a Zip file of Mapping Data
my $zip = Archive::Zip->new();
$zip->addTree( "${Mapping_ID}" );
map{$_->desiredCompressionMethod( 'COMPRESSION_LEVEL_BEST_COMPRESSION' )} $zip->members();
$zip->writeToFileNamed( "${Mapping_ID}/${Mapping_ID}.zip" );
##.

##
#system("rm -r ./${Mapping_ID}");

#printf("%0.3f",Time::HiRes::time - $start_time);
#print "\n";
##############
##Subroutine
##############

sub R_Graph{
    my $R_script;
    my ($Query_ID, $Mapping_ID, $Graph_Type, $time, $freq, $Mapping_Pathways) = ($_[0], $_[1], $_[2], $_[3], $_[4], $_[5]);
    my $first_dir = shift @$Mapping_Pathways;
    my $file_from = "./${Mapping_ID}/${first_dir}/${Query_ID}.png";
    
## Data sets
    $R->send(qq`Bar_Chart = data.frame( Time = factor(c(${time}), levels = c(${time})), Frequency = c(${freq}) )`);
##.
    $R->send(qq`png(file="${file_from}", width=400, height=400, bg=rgb(1,1,1), pointsize="20.5");`);
    $R->send(q|par(mai=c(0.3,0.6,0,0));|);
    if($Graph_Type eq 'bar'){ ## Generate bar chart
	$R->send(q`barplot(Bar_Chart$Frequency, col="green")`);
    }elsif($Graph_Type eq 'line'){
	$R->send(q`plot(Bar_Chart$Frequency,ann=FALSE, type="l", col="skyblue", lty=1, lwd=7)`);
    }elsif($Graph_Type eq 'group'){
    }
    my $ret = $R->read;
    $R->send(qq`dev.off();`);

	for my $dir(@$Mapping_Pathways){
	    next if -e "./${Mapping_ID}/${dir}/${Query_ID}.png";
	    my $file_to = "${Mapping_ID}/${dir}/";
	    copy($file_from, $file_to) or die "Cannot copy $file_from to $file_to: $!";
	}
    
    return 1; ## successful!!
}

    
=pod
    uk2007 = data.frame(Commodity = factor(c("Cow milk", "Wheat", "Sugar beet", "Potatoes", "Barley"), levels = c("Cow milk", "Wheat", "Sugar beet", "Potatoes", "Barley")), Production = c(10, 20, 30, 40, 60))
    barplot(uk2007$Production, names = uk2007$Commodity, xlab = "Time", ylab = "Frequence",main = "C00178")
=cut




