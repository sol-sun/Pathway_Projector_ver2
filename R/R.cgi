#!/usr/bin/env perl

$\ = "\n";
use strict;
use warnings;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use Time::HiRes;
use Data::Dumper;
use Statistics::R;
use lib "../Scripts/pm";
use MapGen;
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

## mapping.data parsing(/R/mapping.data)
##

open my $file, '<', "mapping.data";
my ($Query_ID, $Graph_Type);
my ($Time, $Frequency);
my $Mapping_ID = ((time % 1296000) * 10 + int(rand(10)) + 1048576);
my @Mapping_Pathways;

## create Mapping DATA Directory(Graphs)
unless (mkdir ("./$Mapping_ID", 0755) or $! == Errno::EEXIST){
  die "failed to create dir:./$Mapping_ID:$!";
}
##.

my %JSON;
while (<$file>) {
  chomp;

  if (defined($Query_ID) && $_ =~ m|\d+,\d+|) {  # Occurs when $Query_ID defined

    my @datas = split(/,/);
    $Time .= qq("$datas[0]",);
    $Frequency .= qq($datas[1],);
    next;

    
  }elsif ($_ =~ m|//|) { # Occurs when $_ equal '//' (end of Data) 
    chop($Time);
    chop($Frequency);

    ## Generate Graphs with R
    my $return_num =  &R_Graph($Query_ID, $Mapping_ID, $Graph_Type, $Time, $Frequency, \@Mapping_Pathways);
    ##.
    
    if ($return_num == 0) { ## Occurs when &R_Graph failed
      $R->stopR();
      printf("%0.3f",Time::HiRes::time - $start_time);
      die "$Query_ID: Generate Graph failed\n";
    }
    ($Query_ID, $Graph_Type, $Time, $Frequency) = undef;
    @Mapping_Pathways = ();
  }

  ##.

  if (/^>([A-Za-z]\d{5}),([line|bar]+)/) { ## First parsing
    my $object;
    ($Query_ID, $Graph_Type) = ($1, $2);

    ## Divide in "Compound, Glycan, Drug" and "Reaction"; The formars mapping in BarGraph.The another mapping in LineGraph

    if ($Query_ID =~ m/^[CDG]/) {

      ## MongoDB search Get information of $Query_ID
      ##
      ## Variable list
      ## .@Mapping_Pathway => KEGG-Pathway ID
      ## .latlng
      
      $object = $collection->find({'Meta.cpd' => "$Query_ID"});


      unless($object->next){ ## Error Process. Occurs when the MongoDB search failed.
	$R->stopR();
	die "Not found $Query_ID in Database";
      }

      while (my $record = $object->next) {
	my @coords;

	##created directory( e.g. /[ID]/00010/ ) for mapping datas
	push @Mapping_Pathways, $$record{'Pathway'};
	unless (mkdir ("./$Mapping_ID/$$record{'Pathway'}") or $! == Errno::EEXIST){
	  die "failed to create dir:./$Mapping_ID:$!";
	}
	#.

	## Get latlng data
	if ($$record{'Shape'} eq 'Rectangle') { ## Shape that applies to this condition is very ""LOW""
	  @coords = ( "$$record{'latlng'}{'sw_lat'}", "$$record{'latlng'}{'sw_lng'}", "$$record{'latlng'}{'ne_lat'}", "$$record{'latlng'}{'ne_lng'}");

  
	} elsif ($$record{'Shape'} eq 'Circle') { ## Shape that applies to this condition is very ""OFTEN""

	  @coords =  ( "$$record{'latlng'}{'lat'}", "$$record{'latlng'}{'lng'}" , "$$record{'latlng'}{'lat'}", "$$record{'latlng'}{'lng'}" );
	  
	}
	#.

	$JSON{"$$record{'Pathway'}"} .=  qq|  \n\t{"Graph_Path" : "${Mapping_ID}/$$record{'Pathway'}/${Query_ID}.png", "sw_latlng" : ["$coords[0]", "$coords[1]"], "ne_latlng" : ["$coords[2]", "$coords[3]"]},\n|;

	
	### Example of JSON data
=pod
  
  { "Mapping_ID":"0000000",
    
    "Data":{
      #      ..
      "map04910" : [
		    {
	"sw_xy"     <=    "sw_latlng" : [
				    "-66.3815962885395",
				    "-2.83817427385912"
				   ],
	"ne_xy"	  <=   "ne_latlng" : [
				    "-68.3355742069462",
				    "-16.5809128630707"
				   ],
		     "Graph_Path" : "7432847/04910/R02584.png"
		    },
		    {
		     "sw_latlng" : [
				    "-4.52057567282767",
				    "-132.796680497925"
				   ],
		     "ne_latlng" : [
				    "-9.55944925669965",
				    "-146.539419087137"
				   ],
		     "Graph_Path" : "7432847/04910/R02584.png"
		    }
		   ]#,
	#		       ..
    }
  }

=cut
      }

    }elsif ($Query_ID =~ m/^([RK])/) { ## similar...
      my $id = $1;

      if($id eq 'K' ){
	$object = $collection->find({'Meta.KEGG_ORTHOLOGY' => "$Query_ID"});
      }else if($id eq 'R'){
	$object = $collection->find({'Meta.KEGG_ORTHOLOGY' => "$Query_iD"});
      }
      
      #KEGG_REACTION
      
      ## change => latlng じゃなくて xy値を持ってくる．
      while (my $record = $object->next){
	my @coords;
	push @Mapping_Pathways, $$record{'Pathway'};

	##created directory( e.g. /[ID]/00010/ ) for mapping datas
	unless (mkdir ("./$Mapping_ID/$$record{'Pathway'}") or $! == Errno::EEXIST) {
	  die "failed to create dir:./$Mapping_ID:$!";
	}
	##.

	my ($sw_x, $sw_y, $ne_x, $ne_y);
	my ($sw_lat, $sw_lng, $ne_lat, $ne_lng);

	if ($$record{'Shape'} eq 'Rectangle') {

	  
	  ($sw_x, $sw_y, $ne_x, $ne_y) = ("$$record{'xy'}{'sw_x'}", "$$record{'xy'}{'sw_y'}" , "$$record{'xy'}{'ne_x'}", "$$record{'xy'}{'ne_y'}" );

          ##これを足がかりとする．他の変更は一斉に．
	  ##latlngをxyに変換し画像サイズに設定の上またlatlng値に戻す．
	  ## swを固定する．つまり右上にはみ出た画像を貼ることになる．

	  my $rect_width = $ne_x - $sw_x;
	  $ne_y = $sw_y -  $rect_width;

=pod
	    if($$record{'Pathway'} eq '03020'){

	      print "width: $rect_width", "\t";
	      print "height: $rect_height", "\n";

	    }

=cut

	  ($sw_lat, $sw_lng) = (&Generator::xy2latlng($sw_x, $sw_y));
	  ($ne_lat, $ne_lng) = (&Generator::xy2latlng($ne_x, $ne_y) );

	            ##.
	} elsif ($$record{'Shape'} eq 'Circle') {
	  
	  ($sw_lat, $sw_lng, $ne_lat, $ne_lng) =  ( (&Generator::xy2latlng("$$record{'xy'}{'x'}", "$$record{'xy'}{'y'}")), (&Generator::xy2latlng("$$record{'xy'}{'x'}", "$$record{'xy'}{'y'}")) );
	  
	  
	}

	$JSON{"$$record{'Pathway'}"} .=  qq|  \n\t{"Graph_Path" : "${Mapping_ID}/$$record{'Pathway'}/${Query_ID}.png", "sw_latlng" : ["$sw_lat", "$sw_lng"], "ne_latlng" : ["$ne_lat", "$ne_lng"]},\n|;


      }
      
    }
    
  }
}
close $file;

$R->stopR();

my $insert;
$insert .= qq|{|;
$insert .=  qq( "Mapping_ID":"$Mapping_ID", );
$insert .=  qq( "Data":{);
	       
while (my ($key, $value) = each(%JSON)) {
  $value =~ s/,\n$//g;
  $insert .= qq|"map$key" : [$value],|;
}
$insert =~ s/,$//;
$insert .= qq(});
$insert .= qq|}|;
$insert =~ s/\n//g;

# result for mapping(test)
 print $insert;
#.

$insert = decode_json($insert);

## Insert in MongoDB "Mapping_Data" collection
#$collection2->insert($insert);
##

=pod

## Create a Zip file of Mapping Data
my $zip = Archive::Zip->new();
$zip->addTree( "${Mapping_ID}" );
map{$_->desiredCompressionMethod( 'COMPRESSION_LEVEL_BEST_COMPRESSION' )} $zip->members();
$zip->writeToFileNamed( "${Mapping_ID}/${Mapping_ID}.zip" );
##.

=cut



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
#  $R->send(qq`Time = c(${time})`);
  $R->send(qq`Data = data.frame( Time = c(${time}), Frequency = c(${freq}) )`);
  ##.
  $R->send(qq`png(file="${file_from}", width=200, height=200, bg="transparent", pointsize="10.5");`);
  $R->send(q`par(mar=c(1.4,2.0,0.5,0),  family="Times New Roman")`); ##mar[1]=below, mar[2]=left, mar[3]=above, mar[4]=right


  
  if ($Graph_Type eq 'bar') {	## Bar plot
    $R->send(q`barplot(Data$Frequency, col="#0000ff95",border="white", ylim=c(0,100), yaxp=c(0,100,5), yaxt="n", mgp=c(0,0,0), names.arg=Data$Time)`);
    $R->send(q`axis(2, mgp=c(0,0.6,0), las=1, cex.axis=1.2)`); # y axis options
#    $R->send(qq`title(main="${Query_ID}", line=0.4, cex.main=1)`);
    
  }elsif ($Graph_Type eq 'line') { ## Line plot

    $R->send(q`plot(Data$Frequency,  type="l", col="black", lty=1, lwd=14, pch=20, bty="n", ylim=c(0,100), yaxp=c(0,100,5), yaxt="n",xaxt="n", ann=F )`);
    $R->send(q`axis(2, mgp=c(0,0.6,0), las=1, cex.axis=1.2)`); # y axis options
    $R->send(q`axis(1, mgp=c(0,0.4,0), Data$Time, cex.axis=0.9)`); # x axis options
#    $R->send(qq`title(main="${Query_ID}", line=0.4, cex.main=1.2)`);

  } elsif ($Graph_Type eq 'group') {
  }
  my $ret = $R->read;
  $R->send(qq`dev.off();`);

  for my $dir (@$Mapping_Pathways) {
    next if -e "./${Mapping_ID}/${dir}/${Query_ID}.png";
    my $file_to = "${Mapping_ID}/${dir}/";
    copy($file_from, $file_to) or die "Cannot copy $file_from to $file_to: $!";
  }
    
  return 1;			## successful!!
}



    
=pod
  
  uk2007 = data.frame(Commodity = factor(c("Cow milk", "Wheat", "Sugar beet", "Potatoes", "Barley"), levels = c("Cow milk", "Wheat", "Sugar beet", "Potatoes", "Barley")), Production = c(10, 20, 30, 40, 60))
  barplot(uk2007$Production, names = uk2007$Commodity, xlab = "Time", ylab = "Frequence",main = "C00178")

=cut




