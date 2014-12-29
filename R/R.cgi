#!/Users/sol-sun/.anyenv/envs/plenv/versions/Pathway_Projector_ver2/bin/perl
##!/usr/bin/env perl

# 変更点
# Graph Mapping と Node mapping を結合する。
# Process
# データがゼロの場合は、Next

# データひとつでも、グラフはつくる。
# Color スイッチ入ってたら、背景いれる。
# colorの計算方法を取得する。 (平均値、中央値)

## 多群比較(Compare Mapping)
# Options
# Organism  Select the organisms...

# サンプル名のセット
# Visualize mode
# - ratio  - SD  - medan
## Base Samples (Combo Box)

# Color mode (Same as Graph Mapping)

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
use Statistics::Descriptive;

## R start set
my $R = Statistics::R->new();
$R->startR;
my $start_time = Time::HiRes::time;
##.

## Statistics::Descriptive set
my $stat = Statistics::Descriptive::Full->new();
##

## CGI start set
my $cgi = new CGI;
my $InputData = decode_json( $cgi->param("data") );
my $Option = decode_json( $cgi->param("option") );
my $comparisonData = decode_json( $cgi->param("c_data") );

print "Content-type: text/html;charset=utf-8;\n\n";
##.

## Mongo DB start set
my $client = MongoDB::MongoClient->new();
$client->authenticate('Carpesys', 't11881tm', 'taiyo1102');
my $database = $client->get_database('Carpesys');
my $collection = $database->get_collection('Element');
my $Pathway_Maps = $database->get_collection('Pathway_Maps');
my $Subcategory = $database->get_collection('Subcategory');
my $Category = $database->get_collection('Category');
my $collection2 = $database->get_collection('Mapping_Data');
##.

## mapping.data parsing(/R/mapping.data)
##

my $Mapping_ID = ((time % 1296000) * 10 + int(rand(10)) + 1048576);
my @Mapping_Pathways;

## create Mapping DATA Directory(Graphs)
unless (mkdir ("./$Mapping_ID", 0755) or $! == Errno::EEXIST){
  die "failed to create dir:./$Mapping_ID:$!";
}
##.

my %JSON;
my $mapping_tile = {};

foreach my $hash (@$InputData){

  my %GraphMapping_Switch = (
			     Mapping => 0,
			     Fill_Color => 0
			    );

  my $query_id = $$hash{'name'};
  $query_id = &Generator::trim($query_id);

  next if $query_id eq ''; # <- TASK: Error log

  ### Graph Mapping System
  my $graph_type = lc $$hash{'type'};
  
  ## retrieve time series data
  
  my @frequency = 
    map { $$hash{ $_->[0] } } ## TASK: Checker subroutine
    sort { $a->[1] <=> $b->[1] }
    map{ [$_, /^t(\d+)$/] }
    map{$$hash{$_}=~ s/^$/NA/;$_}
    ( grep /^t\d+$/, keys %$hash );

  my $time = '1:'.scalar(grep /^t\d+$/, keys %$hash);

  if(  grep { $_ =~ /^\d+$/ } @frequency ){
    $GraphMapping_Switch{'Mapping'} = 1;
  }

  my $element_color;
  ## mapping_tile init
  my ( $up, $down ) = (0, 0);
  my ( $up_limit, $down_limit) = (1.5, 0.5); ## TASK: receive from Mapping form
  ##.
  
  my $backgroundColor;

  if(exists($$Option{'color'})){

      my @from_color = (255, 0, 0);
      my @to_color = (0, 255, 0);
      ## analysis input time series data
      $stat->clear();
      $stat->add_data(@frequency);
      my $method = $$Option{'method'};
      my $representative_value;
      if($method eq 'median'){
          $representative_value = $stat->median();
          if( ($representative_value/50) >= $up_limit ){
              $up = 1;
          }
          if( ($representative_value/50) <= $down_limit ){
              $down = 1;
          }
              
      }elsif($method eq 'mean'){

          $representative_value = $stat->mean();
          if( ($representative_value/50) >= $up_limit ){
              $up = 1;
          }
          if( ($representative_value/50) <= $down_limit ){
              $down = 1;
          }

      }elsif($method eq 'gradient'){
          $representative_value = $stat->median(); ## TASK: Setting gradient subroutine
          if( ($representative_value/50) >= $up_limit ){
              $up = 1;
          }
          if( ($representative_value/50) <= $down_limit ){
              $down = 1;
          }
      }
    
      ##
    
      if($$Option{'fillto'} eq 'element'){
          $element_color = unpack("H6", pack("C3", map{ (($to_color[$_] - $from_color[$_]) * $representative_value/100) + $from_color[$_]} (0..2) ) );
          $element_color = '#'.$element_color;

          $backgroundColor = "\'transparent\'";
          $GraphMapping_Switch{'Fill_Color'} = 1; ## fill element

      }elsif($$Option{'fillto'} eq 'graph'){
          my @rgb = map{ (($to_color[$_] - $from_color[$_]) * $representative_value/100) + $from_color[$_]} (0..2);
          $backgroundColor = "rgb($rgb[0], $rgb[1], $rgb[2], max=255, alpha=170)";
          $GraphMapping_Switch{'Fill_Color'} = 2; ## fill Graph
      }

  }else{
      $backgroundColor = "\'transparent\'";
  }
  ##.

  
  if(  grep { $_ =~ /^\d+$/ } @frequency ){
      $GraphMapping_Switch{'Mapping'} = 1;
  }

  ## Occurs when all mapping switches are zero
  if( $GraphMapping_Switch{'Mapping'} == 1  ){
    unless (mkdir ("./$Mapping_ID/Graph", 0755) or $! == Errno::EEXIST){
      die "failed to create dir:./$Mapping_ID/Graph:$!";
    }
  }


  if($GraphMapping_Switch{'Mapping'} == 0){
    next;
  }

  ##.

  my $object;
  if($query_id =~ m/^[CDG]/){

    ##MongoDB search Get information of $query_id
    ##
    ## Variable list
    ## .@Mapping_Pathway => KEGG-Pathway ID
    ## .latlng

    $object = $collection->find({'Meta.cpd' => "$query_id"});


    #    unless($object->next){ ##Error Process. Occurs when the MongoDB search failed.
    #      $R->stopR();
    #      die "Not found $query_id in Database"; #<- TASK: Error log
    #    }

    while (my $record = $object->next){

      my $push2JSON = {};
      my @coords;


      ## mapping tile set
      my $map_id = $$record{'Pathway'};
      my $category = $Pathway_Maps->find({'Map_ID' => "$map_id"});
      while(my $recordOfPathway_Maps = $category->next){
          my $latlng = $$recordOfPathway_Maps{'LatLng'};
          
          my $tile_type = $$recordOfPathway_Maps{'Category'};
          if($tile_type eq 'Metabolism'){
              my $subcat = $$recordOfPathway_Maps{'SubCategory'};
              if(exists $mapping_tile->{$tile_type}->{$subcat}->{$map_id}){
                  $mapping_tile->{$tile_type}->{$subcat}->{$map_id}->{'total'}++;
                  $mapping_tile->{$tile_type}->{$subcat}->{$map_id}->{'up'} += $up;
                  $mapping_tile->{$tile_type}->{$subcat}->{$map_id}->{'down'} += $down;
              }else{
                  $mapping_tile->{$tile_type}->{$subcat}->{$map_id}->{'latlng'} = $latlng;
                  $mapping_tile->{$tile_type}->{$subcat}->{$map_id}->{'total'}++;
                  $mapping_tile->{$tile_type}->{$subcat}->{$map_id}->{'up'} += $up;
                  $mapping_tile->{$tile_type}->{$subcat}->{$map_id}->{'down'} += $down;
              }
              
          }else{
              if(exists $mapping_tile->{$tile_type}->{$map_id}){
                  $mapping_tile->{$tile_type}->{$map_id}->{'total'}++;
                  $mapping_tile->{$tile_type}->{$map_id}->{'up'} += $up;
                  $mapping_tile->{$tile_type}->{$map_id}->{'down'} += $down;
              }else{
                  $mapping_tile->{$tile_type}->{$map_id}->{'latlng'} = $latlng;
                  $mapping_tile->{$tile_type}->{$map_id}->{'total'}++;
                  $mapping_tile->{$tile_type}->{$map_id}->{'up'} += $up;
                  $mapping_tile->{$tile_type}->{$map_id}->{'down'} += $down;
              }
          }

      }
      ##.

      
      ##created directory( e.g. /[ID]/00010/ ) for mapping datas
      push @Mapping_Pathways, $$record{'Pathway'};
      unless (mkdir ("./$Mapping_ID/Graph/$$record{'Pathway'}") or $! == Errno::EEXIST){
	die "failed to create dir:./$Mapping_ID/Graph/$$record{'Pathway'}:$!";
      }
      #.
      
      my ($sw_x, $sw_y, $ne_x, $ne_y);
      my ($sw_lat, $sw_lng, $ne_lat, $ne_lng);

      ## Get latlng data
      if ($$record{'Shape'} eq 'Rectangle') { ## Shape that applies to this condition is very ""LOW""
          #	@coords = ( "$$record{'latlng'}{'sw_lat'}", "$$record{'latlng'}{'sw_lng'}", "$$record{'latlng'}{'ne_lat'}", "$$record{'latlng'}{'ne_lng'}");
          ($sw_x, $sw_y, $ne_x, $ne_y) = ("$$record{'xy'}{'sw_x'}", "$$record{'xy'}{'sw_y'}" , "$$record{'xy'}{'ne_x'}", "$$record{'xy'}{'ne_y'}" );

          if($GraphMapping_Switch{'Fill_Color'} == 1){
              $push2JSON->{'i_LatLng'}->{'sw_latlng'} = [&Generator::xy2latlng($sw_x, $sw_y)];
              $push2JSON->{'i_LatLng'}->{'ne_latlng'} = [&Generator::xy2latlng($ne_x, $ne_y)];
          }
	
          my $rect_width = $ne_x - $sw_x;
          my $rect_height = $sw_y - $ne_y;
          if($rect_width < $rect_height){
              $sw_x = $ne_x - $rect_width;
              $sw_x += ($rect_height/2) - ($rect_width/2);
              $ne_x =  $sw_x + ($rect_width);
              $ne_y = $sw_y - ($rect_width);
          }else{
              $sw_x = $ne_x - $rect_width;
              $sw_x += ($rect_width/2) - ($rect_height/2);
              $ne_x =  $sw_x + ($rect_height);
              $ne_y = $sw_y - ($rect_height);
          }

          ($sw_lat, $sw_lng) = (&Generator::xy2latlng($sw_x, $sw_y));
          ($ne_lat, $ne_lng) = (&Generator::xy2latlng($ne_x, $ne_y) );

	
	
      } elsif ($$record{'Shape'} eq 'Circle') { ## Shape that applies to this condition is very ""OFTEN""

          my ($x, $y) = ($$record{'xy'}{'x'}, $$record{'xy'}{'y'});

          if($GraphMapping_Switch{'Fill_Color'} == 1){
              $push2JSON->{'i_LatLng'}->{'center_latlng'} = [&Generator::xy2latlng($x, $y)];
              $push2JSON->{'i_LatLng'}->{'perimeter_latlng'} = [&Generator::xy2latlng($x+28, $y+28)];
          }
          

          ($sw_x, $sw_y) = ($x - 180, $y + 180); ## 地図全体の大きさが必要になるかも。今のところは、system関数でサイズを図る。
          ($ne_x, $ne_y) = ($x + 180, $y - 180); ## 
          my $rect_width = $ne_x - $sw_x;
          $ne_y = $sw_y -  $rect_width;

          ($sw_lat, $sw_lng) = (&Generator::xy2latlng($sw_x, $sw_y));
          ($ne_lat, $ne_lng) = (&Generator::xy2latlng($ne_x, $ne_y) );

      }
      #.
      ## Graph Mapping
      $push2JSON->{'sw_latlng'} = ["$sw_lat", "$sw_lng"];
      $push2JSON->{'ne_latlng'} = ["$ne_lat", "$ne_lng"];

      
      if($GraphMapping_Switch{'Fill_Color'} == 1){
          $push2JSON->{'i_color'} = $element_color;
      }

      if($GraphMapping_Switch{'Mapping'} == 1){
          $push2JSON->{'Graph_Path'} = "${Mapping_ID}/Graph/$$record{'Pathway'}/${query_id}.png";
      }
      ##.
      
      
      push @{ $JSON{"Graph"}{'map'.$$record{'Pathway'}} }, $push2JSON;
    }

  }elsif ($query_id =~ m/^([RK])/){
    my $id = $1;

    if($id eq 'K'){
      $object = $collection->find({'Meta.KEGG_ORTHOLOGY' => "$query_id"});
    }elsif( $id eq 'R'){
      $object = $collection->find({'Meta.KEGG_REACTION' => "$query_id"});
    }

    ## change => latlng じゃなくて xy値を持ってくる．
    while(my $record = $object->next){
      my $push2JSON = {};
      
      my @coords;

      ## mapping tile set
      my $map_id = $$record{'Pathway'};
      my $category = $Pathway_Maps->find({'Map_ID' => "$map_id"});
      while(my $recordOfPathway_Maps = $category->next){
          my $latlng = $$recordOfPathway_Maps{'LatLng'};
          my $tile_type = $$recordOfPathway_Maps{'Category'};

          if($tile_type eq 'Metabolism'){
              my $subcat = $$recordOfPathway_Maps{'SubCategory'};
              if(exists $mapping_tile->{$tile_type}->{$subcat}->{$map_id}){
                  $mapping_tile->{$tile_type}->{$subcat}->{$map_id}->{'total'}++;
                  $mapping_tile->{$tile_type}->{$subcat}->{$map_id}->{'up'} += $up;
                  $mapping_tile->{$tile_type}->{$subcat}->{$map_id}->{'down'} += $down;
              }else{
                  $mapping_tile->{$tile_type}->{$subcat}->{$map_id}->{'latlng'} = $latlng;
                  $mapping_tile->{$tile_type}->{$subcat}->{$map_id}->{'total'}++;
                  $mapping_tile->{$tile_type}->{$subcat}->{$map_id}->{'up'} += $up;
                  $mapping_tile->{$tile_type}->{$subcat}->{$map_id}->{'down'} += $down;
              }
              
          }else{
              if(exists $mapping_tile->{$tile_type}->{$map_id}){
                  $mapping_tile->{$tile_type}->{$map_id}->{'total'}++;
                  $mapping_tile->{$tile_type}->{$map_id}->{'up'} += $up;
                  $mapping_tile->{$tile_type}->{$map_id}->{'down'} += $down;
              }else{
                  $mapping_tile->{$tile_type}->{$map_id}->{'latlng'} = $latlng;
                  $mapping_tile->{$tile_type}->{$map_id}->{'total'}++;
                  $mapping_tile->{$tile_type}->{$map_id}->{'up'} += $up;
                  $mapping_tile->{$tile_type}->{$map_id}->{'down'} += $down;
              }
          }
      }
      ##.

      
      push @Mapping_Pathways, $$record{'Pathway'};
      ##created directory( e.g. /[ID]/Graph/00010/ ) for mapping datas
      unless (mkdir ("./$Mapping_ID/Graph/$$record{'Pathway'}") or $! == Errno::EEXIST) {
          die "failed to create dir:./$Mapping_ID/Graph/$$record{'Pathway'}:$!";
      }
      ##.

      my ($sw_x, $sw_y, $ne_x, $ne_y);
      my ($sw_lat, $sw_lng, $ne_lat, $ne_lng);

      if ($$record{'Shape'} eq 'Rectangle') {
          ($sw_x, $sw_y, $ne_x, $ne_y) = ("$$record{'xy'}{'sw_x'}", "$$record{'xy'}{'sw_y'}" , "$$record{'xy'}{'ne_x'}", "$$record{'xy'}{'ne_y'}" );


          if($GraphMapping_Switch{'Fill_Color'} == 1){ # fill in circle
              $push2JSON->{'i_LatLng'}->{'sw_latlng'} = [&Generator::xy2latlng($sw_x, $sw_y)];
              $push2JSON->{'i_LatLng'}->{'ne_latlng'} = [&Generator::xy2latlng($ne_x, $ne_y)];
          }
	##これを足がかりとする．他の変更は一斉に．
	##latlngをxyに変換し画像サイズに設定の上またlatlng値に戻す．
	## swを固定する．つまり右上にはみ出た画像を貼ることになる．

	my $rect_width = $ne_x - $sw_x;
	$ne_y = $sw_y -  $rect_width;

	($sw_lat, $sw_lng) = (&Generator::xy2latlng($sw_x, $sw_y));
	($ne_lat, $ne_lng) = (&Generator::xy2latlng($ne_x, $ne_y) );

	##.
      } elsif ($$record{'Shape'} eq 'Circle') {

	if($GraphMapping_Switch{'Fill_Color'} == 1){ # fill in circle
	  $push2JSON->{'i_LatLng'}->{'sw_latlng'} = ["$$record{'latlng'}{'lat'}", "$$record{'latlng'}{'lng'}"];
	}

	($sw_lat, $sw_lng, $ne_lat, $ne_lng) =  ( (&Generator::xy2latlng("$$record{'xy'}{'x'}", "$$record{'xy'}{'y'}")), (&Generator::xy2latlng("$$record{'xy'}{'x'}", "$$record{'xy'}{'y'}")) );

      }

      $push2JSON->{'sw_latlng'} =  ["$sw_lat", "$sw_lng"];
      $push2JSON->{'ne_latlng'} =  ["$ne_lat", "$ne_lng"];

      if($GraphMapping_Switch{'Fill_Color'} == 1){
	$push2JSON->{'i_color'} = $element_color;
      }

      if($GraphMapping_Switch{'Mapping'} == 1){
	$push2JSON->{'Graph_Path'} = "${Mapping_ID}/Graph/$$record{'Pathway'}/${query_id}.png";
      }

      push @{ $JSON{"Graph"}{'map'.$$record{'Pathway'}} }, $push2JSON;
    }
  }

  my $frequency = join ', ', @frequency;

  my $return_num = &R_Graph($query_id, $Mapping_ID, $graph_type, $time, $frequency, \@Mapping_Pathways, $backgroundColor);

  if ($return_num == 0){ ## Occurs when &R_Graph failed
    $R->stopR();
    printf("0.3f", Time::HiRes::time - $start_time);
    die "$query_id: Generate Graph failed\n";
  }
  ( $query_id, $graph_type ) = undef;
  @frequency = ();
  @Mapping_Pathways = ();
  
  
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

}


my @black = (0, 0, 0);
my @red = (255, 0, 0);
my @green = (0, 255, 0);

## tile mapping(Intensity Mapping)
for my$cat(keys %{$mapping_tile}){
    if($cat eq 'Metabolism'){
        for my$subcat(keys %{$mapping_tile->{$cat}}){
            my @push2mapping_tile = ();
            for my $map(keys %{$mapping_tile->{$cat}->{$subcat}}){
                $mapping_tile->{$cat}->{$subcat}->{$map}->{'upcolor'} = '#'. unpack("H6", pack("C3", map{ (($green[$_] - $black[$_]) * ($mapping_tile->{$cat}->{$subcat}->{$map}->{'up'}/$mapping_tile->{$cat}->{$subcat}->{$map}->{'total'} * 100)/100) + $black[$_]} (0..2) ) );
                $mapping_tile->{$cat}->{$subcat}->{$map}->{'downcolor'} = '#'. unpack("H6", pack("C3", map{ (($red[$_] - $black[$_]) * ($mapping_tile->{$cat}->{$subcat}->{$map}->{'down'}/$mapping_tile->{$cat}->{$subcat}->{$map}->{'total'} * 100)/100) + $black[$_]} (0..2) ) );
                
                push @push2mapping_tile,  $mapping_tile->{$cat}->{$subcat}->{$map};
                delete $mapping_tile->{$cat}->{$subcat}->{$map};
            }
            $mapping_tile->{$cat}->{$subcat} = \@push2mapping_tile;
           
        }
        
    }else{
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

$JSON{"Graph"}{'Tile'} = $mapping_tile;
##.

## Subcategory Mapping
my $mapping_subcategory = {};
if(exists $mapping_tile->{'Metabolism'}){

    for my$subcat(keys %{$mapping_tile->{'Metabolism'}}){
        for (@{$mapping_tile->{'Metabolism'}->{$subcat}}){
            $mapping_subcategory->{'Metabolism'}->{$subcat}->{'total'} += $_->{'total'};
            $mapping_subcategory->{'Metabolism'}->{$subcat}->{'up'} += $_->{'up'};
            $mapping_subcategory->{'Metabolism'}->{$subcat}->{'down'} += $_->{'down'};
        }
        my $subcategory = $Subcategory->find({'Subcategory' => "$subcat"});
        while(my $recordOfSubcategory = $subcategory->next){
            $mapping_subcategory->{'Metabolism'}->{$subcat}->{'latlng'} = $$recordOfSubcategory{'latlng'};
            my $cn_x =  $$recordOfSubcategory{'xy'}->{'sw_x'} + (($$recordOfSubcategory{'xy'}->{'ne_x'} - $$recordOfSubcategory{'xy'}->{'sw_x'})/2);
            my $cn_y = $$recordOfSubcategory{'xy'}->{'ne_y'} + (($$recordOfSubcategory{'xy'}->{'sw_y'} - $$recordOfSubcategory{'xy'}->{'ne_y'})/2);
            my @cn_latlng = &Generator::xy2latlng($cn_x, $cn_y);
            
            $mapping_subcategory->{'Metabolism'}->{$subcat}->{'latlng'}->{'cn_lat'} = $cn_latlng[0];
            $mapping_subcategory->{'Metabolism'}->{$subcat}->{'latlng'}->{'cn_lng'} = $cn_latlng[1];
                
        }
    }

    my @push2mapping_subcategory = ();
    for my $subcat(keys %{$mapping_subcategory->{'Metabolism'}}){
        my $cat = 'Metabolism';
        $mapping_subcategory->{$cat}->{$subcat}->{'upcolor'} = '#'. unpack("H6", pack("C3", map{ (($green[$_] - $black[$_]) * ($mapping_subcategory->{$cat}->{$subcat}->{'up'}/$mapping_subcategory->{$cat}->{$subcat}->{'total'} * 100)/100) + $black[$_]} (0..2) ) );
        $mapping_subcategory->{$cat}->{$subcat}->{'downcolor'} = '#'. unpack("H6", pack("C3", map{ (($red[$_] - $black[$_]) * ($mapping_subcategory->{$cat}->{$subcat}->{'down'}/$mapping_subcategory->{$cat}->{$subcat}->{'total'} * 100)/100) + $black[$_]} (0..2) ) );
            
        push @push2mapping_subcategory,  $mapping_subcategory->{$cat}->{$subcat};
        delete $mapping_subcategory->{$cat}->{$subcat};
    }
    $mapping_subcategory->{'Metabolism'} = \@push2mapping_subcategory;

    $JSON{'Graph'}{'Subcategory'} = $mapping_subcategory;
}
##.

## Category Mapping
my $mapping_category = {};
for my$cat(keys %{$mapping_tile}){

        if($cat eq 'Metabolism' && exists $mapping_subcategory->{$cat}){
            for(@{$mapping_subcategory->{$cat}}){
                $mapping_category->{$cat}->{'total'} += $_->{'total'};
                $mapping_category->{$cat}->{'up'} += $_->{'up'};
                $mapping_category->{$cat}->{'down'} += $_->{'down'};
            }

        }else{
            for(@{$mapping_tile->{$cat}}){
                $mapping_category->{$cat}->{'total'} += $_->{'total'};
                $mapping_category->{$cat}->{'up'} += $_->{'up'};
                $mapping_category->{$cat}->{'down'} += $_->{'down'};
            }
        }
                    my $category = $Category->find({'Category' => "$cat"});
            while(my $recordOfCategory = $category->next){
                $mapping_category->{$cat}->{'latlng'} = $$recordOfCategory{'latlng'};
                my $cn_x =  $$recordOfCategory{'xy'}->{'sw_x'} + (($$recordOfCategory{'xy'}->{'ne_x'} - $$recordOfCategory{'xy'}->{'sw_x'})/2);
                my $cn_y = $$recordOfCategory{'xy'}->{'ne_y'} + (($$recordOfCategory{'xy'}->{'sw_y'} - $$recordOfCategory{'xy'}->{'ne_y'})/2);
                my @cn_latlng = &Generator::xy2latlng($cn_x, $cn_y);
                
                $mapping_category->{$cat}->{'latlng'}->{'cn_lat'} = $cn_latlng[0];
                $mapping_category->{$cat}->{'latlng'}->{'cn_lng'} = $cn_latlng[1];
            
            }
        
}
my @push2mapping_category = ();
for my $cat(keys %{$mapping_category}){
            $mapping_category->{$cat}->{'upcolor'} = '#'. unpack("H6", pack("C3", map{ (($green[$_] - $black[$_]) * ($mapping_category->{$cat}->{'up'}/$mapping_category->{$cat}->{'total'} * 100)/100) + $black[$_]} (0..2) ) );
        $mapping_category->{$cat}->{'downcolor'} = '#'. unpack("H6", pack("C3", map{ (($red[$_] - $black[$_]) * ($mapping_category->{$cat}->{'down'}/$mapping_category->{$cat}->{'total'} * 100)/100) + $black[$_]} (0..2) ) );
            
            push @push2mapping_category,  $mapping_category->{$cat};
            delete $mapping_category->{$cat};
            
}
$mapping_category = \@push2mapping_category;
$JSON{'Graph'}{'Category'} = $mapping_category;

##.

## Comparison Mapping
foreach my $hash (@$comparisonData){

  my %ComparisonMapping_Switch = (
				  Mapping => 0,
				  Fill_Color => 0
				 );
  
  my $query_id = $$hash{'name'};
  
  next if $query_id eq ''; # <- TASK: Error log

  
  ## retrieve time series data

  my @frequency = 
    map { $$hash{ $_->[0] } } ## TASK: Checker subroutine
    sort { $a->[1] <=> $b->[1] }
    map{ [$_, /^d(\d+)$/] }
    map{$$hash{$_}=~ s/^$//;$_}
    ( grep /^d\d+$/, keys %$hash );
  @frequency = grep { !/^\s*$/ } @frequency;

  my $c_label = '"rasH2","non-Tg"';

  my $element_color;
  my $backgroundColor;

=pod

  if(exists($$Option{'color'})){

    my @from_color = (255, 0, 0);
    my @to_color = (0, 255, 0);
    ## analysis input time series data
    $stat->clear();
    $stat->add_data(@frequency);
    ##

    if($$Option{'fillto'} eq 'element'){
      $element_color = unpack("H6", pack("C3", map{ (($to_color[$_] - $from_color[$_]) * $stat->median()/100) + $from_color[$_]} (0..2) ) );
      $element_color = '#'.$element_color;

      $backgroundColor = "\'transparent\'";
      $ComparisonMapping_Switch{'Fill_Color'} = 1; ## fill element

    }elsif($$Option{'fillto'} eq 'graph'){
      my @rgb = map{ (($to_color[$_] - $from_color[$_]) * $stat->median()/100) + $from_color[$_]} (0..2);
      $backgroundColor = "rgb($rgb[0], $rgb[1], $rgb[2], max=255, alpha=170)";
      $ComparisonMapping_Switch{'Fill_Color'} = 2; ## fill Graph
    }

  }else{
    $backgroundColor = "\'transparent\'";
  }
  ##.

=cut
  $backgroundColor = "\'transparent\'";

  if(  grep { $_ =~ /^([1-9]\d*|0)(\.\d+)?$/ } @frequency ){
    $ComparisonMapping_Switch{'Mapping'} = 1;
  }

  ## Occurs when all mapping switches are zero

  if( $ComparisonMapping_Switch{'Mapping'} == 1  ){
    unless (mkdir ("./$Mapping_ID/Comparison", 0755) or $! == Errno::EEXIST){
      die "failed to create dir:./$Mapping_ID/Comparison:$!";
    }
  }

  if($ComparisonMapping_Switch{'Mapping'} == 0){
    next;
  }

  ##.

  my $object;
  if($query_id =~ m/^[CDG]/){

    ##MongoDB search Get information of $query_id
    ##
    ## Variable list
    ## .@Mapping_Pathway => KEGG-Pathway ID
    ## .latlng

    $object = $collection->find({'Meta.cpd' => "$query_id"});


    #    unless($object->next){ ##Error Process. Occurs when the MongoDB search failed.
    #      $R->stopR();
    #      die "Not found $query_id in Database"; #<- TASK: Error log
    #    }

    while (my $record = $object->next){

      my $push2JSON = {};
      my @coords;

      ##created directory( e.g. /[ID]/00010/ ) for mapping datas
      push @Mapping_Pathways, $$record{'Pathway'};
      unless (mkdir ("./$Mapping_ID/Comparison/$$record{'Pathway'}") or $! == Errno::EEXIST){
	die "failed to create dir:./$Mapping_ID/Comparison/$$record{'Pathway'}:$!";
      }
      #.
      my ($sw_x, $sw_y, $ne_x, $ne_y);
      my ($sw_lat, $sw_lng, $ne_lat, $ne_lng);

      ## Get latlng data
      if ($$record{'Shape'} eq 'Rectangle') { ## Shape that applies to this condition is very ""LOW""
#	@coords = ( "$$record{'latlng'}{'sw_lat'}", "$$record{'latlng'}{'sw_lng'}", "$$record{'latlng'}{'ne_lat'}", "$$record{'latlng'}{'ne_lng'}");
	($sw_x, $sw_y, $ne_x, $ne_y) = ("$$record{'xy'}{'sw_x'}", "$$record{'xy'}{'sw_y'}" , "$$record{'xy'}{'ne_x'}", "$$record{'xy'}{'ne_y'}" );

	if($ComparisonMapping_Switch{'Fill_Color'} == 1){
	  $push2JSON->{'i_LatLng'}->{'sw_latlng'} = [&Generator::xy2latlng($sw_x, $sw_y)];
	  $push2JSON->{'i_LatLng'}->{'ne_latlng'} = [&Generator::xy2latlng($ne_x, $ne_y)];
	}
	
	my $rect_width = $ne_x - $sw_x;
	my $rect_height = $sw_y - $ne_y;
	if($rect_width < $rect_height){
	  $sw_x = $ne_x - $rect_width;
	  $sw_x += ($rect_height/2) - ($rect_width/2);
	  $ne_x =  $sw_x + ($rect_width);
	  $ne_y = $sw_y - ($rect_width);
	}else{
	  $sw_x = $ne_x - $rect_width;
	  $sw_x += ($rect_width/2) - ($rect_height/2);
	  $ne_x =  $sw_x + ($rect_height);
	  $ne_y = $sw_y - ($rect_height);
	}

	($sw_lat, $sw_lng) = (&Generator::xy2latlng($sw_x, $sw_y));
	 ($ne_lat, $ne_lng) = (&Generator::xy2latlng($ne_x, $ne_y) );

	
	
      } elsif ($$record{'Shape'} eq 'Circle') { ## Shape that applies to this condition is very ""OFTEN""

	my ($x, $y) = ($$record{'xy'}{'x'}, $$record{'xy'}{'y'});

	if($ComparisonMapping_Switch{'Fill_Color'} == 1){
	  $push2JSON->{'i_LatLng'}->{'center_latlng'} = [&Generator::xy2latlng($x, $y)];
	  $push2JSON->{'i_LatLng'}->{'perimeter_latlng'} = [&Generator::xy2latlng($x+28, $y+28)];
	}


	($sw_x, $sw_y) = ($x - 180, $y + 180); ## 地図全体の大きさが必要になるかも。今のところは、system関数でサイズを図る。
	($ne_x, $ne_y) = ($x + 180, $y - 180); ## 
	my $rect_width = $ne_x - $sw_x;
	$ne_y = $sw_y -  $rect_width;

	 ($sw_lat, $sw_lng) = (&Generator::xy2latlng($sw_x, $sw_y));
	 ($ne_lat, $ne_lng) = (&Generator::xy2latlng($ne_x, $ne_y) );

      }
      #.
      ## Graph Mapping
      $push2JSON->{'sw_latlng'} = ["$sw_lat", "$sw_lng"];
      $push2JSON->{'ne_latlng'} = ["$ne_lat", "$ne_lng"];

      
      if($ComparisonMapping_Switch{'Fill_Color'} == 1){
	$push2JSON->{'i_color'} = $element_color;
      }

      if($ComparisonMapping_Switch{'Mapping'} == 1){
	$push2JSON->{'Graph_Path'} = "${Mapping_ID}/Comparison/$$record{'Pathway'}/${query_id}.png";
      }
      ##.
      
      push @{ $JSON{"Comparison"}{'map'.$$record{'Pathway'}} }, $push2JSON;
    }

  }elsif ($query_id =~ m/^([RK])/){
    my $id = $1;

    if($id eq 'K'){
      $object = $collection->find({'Meta.KEGG_ORTHOLOGY' => "$query_id"});
    }elsif( $id eq 'R'){
      $object = $collection->find({'Meta.KEGG_REACTION' => "$query_id"});
    }

    ## change => latlng じゃなくて xy値を持ってくる．
    while(my $record = $object->next){
      my $push2JSON = {};

      my @coords;
      push @Mapping_Pathways, $$record{'Pathway'};
      ##created directory( e.g. /[ID]/Graph/00010/ ) for mapping datas
      unless (mkdir ("./$Mapping_ID/Comparison/$$record{'Pathway'}") or $! == Errno::EEXIST) {
	die "failed to create dir:./$Mapping_ID/Comparison/$$record{'Pathway'}:$!";
      }
      ##.

      my ($sw_x, $sw_y, $ne_x, $ne_y);
      my ($sw_lat, $sw_lng, $ne_lat, $ne_lng);

      if ($$record{'Shape'} eq 'Rectangle') {
	($sw_x, $sw_y, $ne_x, $ne_y) = ("$$record{'xy'}{'sw_x'}", "$$record{'xy'}{'sw_y'}" , "$$record{'xy'}{'ne_x'}", "$$record{'xy'}{'ne_y'}" );


	if($ComparisonMapping_Switch{'Fill_Color'} == 1){ # fill in circle
	  $push2JSON->{'i_LatLng'}->{'sw_latlng'} = [&Generator::xy2latlng($sw_x, $sw_y)];
	  $push2JSON->{'i_LatLng'}->{'ne_latlng'} = [&Generator::xy2latlng($ne_x, $ne_y)];
	}
	##これを足がかりとする．他の変更は一斉に．
	##latlngをxyに変換し画像サイズに設定の上またlatlng値に戻す．
	## swを固定する．つまり右上にはみ出た画像を貼ることになる．

	my $rect_width = $ne_x - $sw_x;
	$ne_y = $sw_y -  $rect_width;

	($sw_lat, $sw_lng) = (&Generator::xy2latlng($sw_x, $sw_y));
	($ne_lat, $ne_lng) = (&Generator::xy2latlng($ne_x, $ne_y) );

	##.
      } elsif ($$record{'Shape'} eq 'Circle') {

	if($ComparisonMapping_Switch{'Fill_Color'} == 1){ # fill in circle
	  $push2JSON->{'i_LatLng'}->{'sw_latlng'} = ["$$record{'latlng'}{'lat'}", "$$record{'latlng'}{'lng'}"];
	}

	($sw_lat, $sw_lng, $ne_lat, $ne_lng) =  ( (&Generator::xy2latlng("$$record{'xy'}{'x'}", "$$record{'xy'}{'y'}")), (&Generator::xy2latlng("$$record{'xy'}{'x'}", "$$record{'xy'}{'y'}")) );

      }

      $push2JSON->{'sw_latlng'} =  ["$sw_lat", "$sw_lng"];
      $push2JSON->{'ne_latlng'} =  ["$ne_lat", "$ne_lng"];

      if($ComparisonMapping_Switch{'Fill_Color'} == 1){
	$push2JSON->{'i_color'} = $element_color;
      }

      if($ComparisonMapping_Switch{'Mapping'} == 1){
	$push2JSON->{'Graph_Path'} = "${Mapping_ID}/Comparison/$$record{'Pathway'}/${query_id}.png";
      }

      push @{ $JSON{"Comparison"}{'map'.$$record{'Pathway'}} }, $push2JSON;
    }
  }

  my $frequency = join ', ', @frequency;

  my $return_num = &R_Comparison($query_id, $Mapping_ID, $c_label, $frequency, \@Mapping_Pathways, $backgroundColor);

  if ($return_num == 0){ ## Occurs when &R_Graph failed
    $R->stopR();
    printf("0.3f", Time::HiRes::time - $start_time);
    die "$query_id: Generate Graph failed\n";
  }
  $query_id = undef;
  @frequency = ();
  @Mapping_Pathways = ();
  
  
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

}


$R->stopR();

$JSON{'Mapping_ID'} = "$Mapping_ID";
print encode_json(\%JSON);

sub R_Graph{
  my $R_script;
  my ($Query_ID, $Mapping_ID, $Graph_Type, $time, $freq, $Mapping_Pathways, $backgroundColor) = @_;
  my $first_dir = shift @$Mapping_Pathways;
  my $file_from = "./${Mapping_ID}/Graph/${first_dir}/${Query_ID}.png";

  ## Data sets
  $R->send(qq`Data = data.frame( Time = c(${time}), Frequency = c(${freq}) )`);
  ##.

  $R->send(qq`png(file="${file_from}", width=200, height=200, bg=${backgroundColor}, pointsize="10.5");`);
  $R->send(q`par(mar=c(1.4,2.0,0.5,0),  family="Times New Roman")`); ##mar[1]=below, mar[2]=left, mar[3]=above, mar[4]=right

  if ($Graph_Type eq 'bar') {	## Bar plot
    $R->send(q`barplot(Data$Frequency, col="black", ylim=c(0,100), yaxp=c(0,100,5), yaxt="n", mgp=c(0,0,0), names.arg=Data$Time)`);
    $R->send(q`axis(2, mgp=c(0,0.6,0), las=1, cex.axis=1.2)`); # y axis options
#    $R->send(qq`title(main="${Query_ID}", line=0.4, cex.main=1)`);
    
  }elsif ($Graph_Type eq 'line') { ## Line plot

    $R->send(q`plot(Data$Frequency,  type="l", col="black", lty=1, lwd=9, pch=20, bty="n", ylim=c(0,100), yaxp=c(0,100,5), yaxt="n",xaxt="n", ann=F )`);
    $R->send(q`axis(2, mgp=c(0,0.6,0), las=1, cex.axis=1.2)`); # y axis options
    $R->send(q`axis(1, mgp=c(0,0.4,0), Data$Time, cex.axis=0.9)`); # x axis options
#    $R->send(qq`title(main="${Query_ID}", line=0.4, cex.main=1.2)`);

  } elsif ($Graph_Type eq 'group') {
  }

  $R->send(qq`dev.off();`);

  ## Copy graph in other pathway
  for my $dir (@$Mapping_Pathways) {
    next if -e "./${Mapping_ID}/Graph/${dir}/${Query_ID}.png";
    my $file_to = "./${Mapping_ID}/Graph/${dir}/";
    copy($file_from, $file_to) or die "Cannot copy $file_from to $file_to: $!";
  }
  ##
  
  return 1;			## successful!!
  
}
sub R_Comparison{
  my $R_script;
  my ($Query_ID, $Mapping_ID, $label, $freq, $Mapping_Pathways, $backgroundColor) = @_;

  my $first_dir = shift@$Mapping_Pathways;
  my $file_from = "./${Mapping_ID}/Comparison/${first_dir}/${Query_ID}.png";
  
  ## Data sets
  $R->send(qq`Data = data.frame( Label = c(${label}), Intensity = c(${freq}))`);
  $R->send(qq`png(file="${file_from}", width=200, height=200, bg=${backgroundColor}, pointsize="10.5");`);
  $R->send(q`par(mar=c(3.0,2.7,0.5,0),  family="Times New Roman")`);

  $R->send(q`barplot(Data$Intensity, names.arg=Data$Label,  col=grey.colors(length(Data$Label), start = 0.1, end = 0.6, gamma = 2.2),space=2, yaxp=c(0,100,5),yaxt="n",mgp=c(0,0.5,0.1),font=4, axis.lty=1)`);
#    $R->send(q`barplot(Data$Intensity, names.arg=Data$Label,  col='black',space=2, yaxp=c(0,100,5),yaxt="n",mgp=c(0,0.5,0.1),font=4, axis.lty=1)`);
  $R->send(q`axis(2, mgp=c(0,0.6,0), las=1, cex.axis=1.2)`);

  $R->send(qq`dev.off();`);

    ## Copy graph in other pathway
  for my $dir (@$Mapping_Pathways) {
    next if -e "./${Mapping_ID}/Comparison/${dir}/${Query_ID}.png";
    my $file_to = "./${Mapping_ID}/Comparison/${dir}/";
    copy($file_from, $file_to) or die "Cannot copy $file_from to $file_to: $!";
  }
  ##

  return 1;
  ##.
}
