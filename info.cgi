#!/Users/sol-sun/.anyenv/envs/plenv/versions/Pathway_Projector_ver2/bin/perl
###!/usr/bin/env perl

use strict;
use warnings;
use File::Basename;
use Image::Size;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use lib "Scripts/pm";
use Config::Pit::RC4;
use MapGen;
use JSON;
use Data::Dumper;

my $cgi = new CGI;

my $lat =  $cgi->param("lat"); # click Latitude
my $lng = $cgi->param("lng");  # click Longitude
my $action = $cgi->param("action"); # what to do
my $organism = $cgi->param("organism") || "map"; # Organism name
my $cpd = $cgi->param("data"); # CID
my $path;
my $hierarchy = $cgi->param("hie");
my $tile = $cgi->param("tile"); # Tile_Type
my $subcategory = $cgi->param("subcat"); # Subcategory
$subcategory =~ s/^\///g;

my $map_id = $cgi->param("mapID");
my $mapping_id = $cgi->param("mapping");

my %return_HTMLs = ();
my $mainHTMLs = '';
my $outpid;
my $grep_id;

print "Content-type: text/html; charset=utf-8;\n\n";

my $user = ${pit_get("MongoDB")}{'username'} or die 'username not found';
my $pass = ${pit_get("MongoDB")}{'password'} or die 'password not found';

##  Show InfoWindow Mode
if($action eq 'initialize'){

    my $find = qq(
		  db.Category.find({"Information.Zoom_Level":{\$exists:"true"}}).forEach(function(record){printjson(record);});
		 );
    my $result = `/usr/local/bin/mongo Carpesys -u $user -p $pass --quiet --eval '$find'`;

    $result =~ s/ObjectId\(\"([^\"]+)\"\)/\"$1\"/g;#error todo -> node.js
    $result =~ s/NumberLong\(([^\)]+)\)/$1/g;#error todo -> node.js
    print $result;

    exit;
}elsif($action eq 'Zoom_UP'){

    my $find;
    if($hierarchy eq 'Category'){ #Category => Tile
      $find = qq(
		      db.Category.find({\$and:[{"latlng.sw_lat":{\$lte:$lat}},{"latlng.ne_lat":{\$gte:$lat}},{"latlng.sw_lng":{\$lte:$lng}},{"latlng.ne_lng":{\$gte:$lng}}]}).limit(1).forEach(function(record){printjson(record);});
		     );
    }elsif($hierarchy eq 'Subcategory'){
      $find = qq(
		      db.Subcategory.find({\$and:[{"latlng.sw_lat":{\$lte:$lat}},{"latlng.ne_lat":{\$gte:$lat}},{"latlng.sw_lng":{\$lte:$lng}},{"latlng.ne_lng":{\$gte:$lng}}]}).limit(1).forEach(function(record){printjson(record);});
                );

    }elsif($hierarchy eq 'Tile'){ #Tile => Pathway
      if($tile eq 'Metabolism'){

	$find = qq(
		      db.Pathway_Maps.find({\$and:[{"LatLng.sw_lat":{\$lte:$lat}},{"LatLng.ne_lat":{\$gte:$lat}},{"LatLng.sw_lng":{\$lte:$lng}},{"LatLng.ne_lng":{\$gte:$lng}},{"SubCategory":"$subcategory"}]}).limit(1).forEach(function(record){printjson(record);});
		     );

      }else{

	$find = qq(
		      db.Pathway_Maps.find({\$and:[{"LatLng.sw_lat":{\$lte:$lat}},{"LatLng.ne_lat":{\$gte:$lat}},{"LatLng.sw_lng":{\$lte:$lng}},{"LatLng.ne_lng":{\$gte:$lng}},{"Category":"$tile"}]}).limit(1).forEach(function(record){printjson(record);});
		     );
      }

    }
    my $result = `/usr/local/bin/mongo Carpesys -u $user -p $pass --quiet --eval '$find'`;    
    $result =~ s/ObjectId\(\"([^\"]+)\"\)/\"$1\"/g;#error todo 
    $result =~ s/NumberLong\(([^\)]+)\)/$1/g;#error todo
    print $result;
    
  }elsif($action eq 'Zoom_OUT'){
    my $find;
    if($hierarchy eq 'Pathway'){
      ## if $tile eq Metabolism => find
      $find = qq(
		   db.Category.find({"Category":"$tile"}).limit(1).forEach(function(record){printjson(record);});
		  );
    }elsif($hierarchy eq 'Tile'){
      $find = qq(
		   db.Category.find({"Information.Zoom_Level":{\$exists:true}}).limit(1).forEach(function(record){printjson(record);});
		  );
    }elsif($hierarchy eq 'Subcategory'){
      $find = qq(
		   db.Category.find({"Information.Zoom_Level":{\$exists:true}}).limit(1).forEach(function(record){printjson(record);});
		  );
    }
    
    my $result = `/usr/local/bin/mongo Carpesys -u $user -p $pass --quiet --eval '$find'`;
    $result =~ s/ObjectId\(\"([^\"]+)\"\)/\"$1\"/g;#error todo 
    $result =~ s/NumberLong\(([^\)]+)\)/$1/g;#error todo
    print $result;
    
}elsif($action eq 'Click_Search'){
    
    my ($x, $y) = Generator::latlng2xy($lat, $lng);
    my ($rx, $ry) = Generator::latlng2xy($lat, $lng); # for rect
    
    my ($cx1, $cx2, $cy1, $cy2) = ($rx-1,$rx+52.5,$ry-1,$ry+25); # for circle
    my ($x1, $x2, $y1, $y2) =  ($x -25, $x +25, $y -25, $y + 25);
    ## Query
    my $find = qq(
		  db.Element.find({\$or:[{\$and:[{"xy.x":{\$gte:$x1}},{"xy.x":{\$lte:$x2}},{"xy.y":{\$gte:$y1}},{"xy.y":{\$lte:$y2}},{"Pathway":"$map_id"}]},{\$and:[{"xy.sw_x":{\$lte:$rx}},{"xy.ne_x":{\$gte:$rx}},{"xy.sw_y":{\$gte:$ry}},{"xy.ne_y":{\$lte:$ry}},{"Pathway":"$map_id"}]}]}).limit(1).forEach(function(record){printjson(record);});
		 );
    
    ## Search (MongoDB)
    my $result = `/usr/local/bin/mongo Carpesys -u $user -p $pass --quiet --eval '$find'`;
#    print Dumper $result;
    $result =~ s/ObjectId\(\"([^\"]+)\"\)/\"$1\"/g;#error todo 
    $result =~ s/NumberLong\(([^\)]+)\)/$1/g;#error todo
    my $json = decode_json($result);
    my $info_HTMLs;
    
    if($$json{'Type'} eq 'Gene' && $$json{'Shape'} eq 'Rectangle'){
	my $KEGG_ORTHOLOGY = join(', ', @{$$json{'Meta'}{'KEGG_ORTHOLOGY'}});
	my $NAME = join(', ', @{$$json{'Meta'}{'Name'}});
	my $DEFINITION = $$json{'Meta'}{'Definition'};


	$info_HTMLs .= qq(<div style='margin:5px'><b>Name</b>:&nbsp&nbsp$NAME<br>);
	$info_HTMLs .= qq(<b>Definition</b>:&nbsp&nbsp$DEFINITION<br>);
	$info_HTMLs .= qq(<b>ID</b>:&nbsp&nbsp);
	
	for(my$i=0;$i<=($#{$$json{'Meta'}{'KEGG_ORTHOLOGY'}});$i++){
	    if($i < 5){
		$info_HTMLs .= qq(<a href='http://www.genome.jp/dbget-bin/www_bget?ko+$$json{'Meta'}{'KEGG_ORTHOLOGY'}[$i]' target='_blank'>$$json{'Meta'}{'KEGG_ORTHOLOGY'}[$i]</a>);
	    }else{
		last;
	    }
	}
	
	if($$json{'Meta'}{'KEGG_REACTION'}){
	    for my $rct(@{$$json{'Meta'}{'KEGG_REACTION'}}){
		$info_HTMLs .= qq(<a href='http://www.genome.jp/dbget-bin/www_bget?rn+$rct' target='_blank'>$rct</a>);
	    }
	    $info_HTMLs .= qq(<a href='http://www.genome.jp/dbget-bin/www_bget?ec:$$json{'Meta'}{'EC_number'}' target='_blank'>$$json{'Meta'}{'EC_number'}</a><br></br>);
	}
	
	$info_HTMLs .= qq(<br>);
	my ($Reaction_Img, $imgw, $imgh);	
	if($$json{'Meta'}{'KEGG_REACTION'}){
	    
	    $Reaction_Img = $$json{'Meta'}{'KEGG_REACTION'}[0];

	    my $src;
=pod	    
	    if($mapping_id){
#		$src = "./R/$mapping_id/$map_id/".".png";
#		($imgw, $imgh) = imgsize("./R/$mapping_id/$map_id/$Reaction_Img".".png");
	    }else{
		$src = "./Data/Img/Reaction/$Reaction_Img".".gif";
		($imgw, $imgh) = imgsize("./Data/Img/Reaction/$Reaction_Img".".gif");
	    }
=cut
        	$src = "./Data/Img/Reaction/$Reaction_Img".".gif";
		($imgw, $imgh) = imgsize("./Data/Img/Reaction/$Reaction_Img".".gif");
	    
	    if($imgw > 400){ # resize reaction image
                my $power = $imgw/400;
                $imgw = 400;
                $imgh = $imgh/$power;
                if($imgh > 400){
                    my $power = $imgh/500;
                    $imgh = 400;
                    $imgw = $imgw/$power;
                }
            }elsif($imgh > 400){
                my $power = $imgh/500;
                $imgh = 400;
                $imgw = $imgw/$power;
            }
	    
	    $info_HTMLs .= qq(<br><img width='$imgw' height='$imgh' src=$src /><br>);
	}
	my $Pathway_Links;
	my %category_links;
=pod	
	for my$hash(@{$$json{'Meta'}{'Pathway_Links'}}){
	    

	    my $Pathway_Links = qq(
				   db.Pathway_Maps.find({"Map_ID":"$$hash{'id'}"},{"Category":true}).limit(1).forEach(function(record){printjson(record);});
				  );
	    my $result = `/usr/local/bin/mongo Carpesys -u $user -p $pass --quiet --eval '$Pathway_Links'`;
	    $result =~ s/ObjectId\(\"([^\"]+)\"\)/\"$1\"/g;#error todo 
	    $result =~ s/NumberLong\(([^\)]+)\)/$1/g;#error todo
	    my $links = decode_json($result);#`/usr/local/bin/mongo Carpesys -u $user -p $pass --quiet --eval '$Pathway_Links'`);
	    $category_links{"$$links{'Category'}"}++;
	}


## add square if exists in other category
	my $square;
	if(%category_links){
	    if(exists $category_links{'Metabolism'}){
		$square .= qq(<div id='square' style='background:#E51400;'></div>);
	    }
	    if(exists $category_links{'Genetic_Information_Processing'}){
		$square .= qq(<div id='square' style='background:#0050EF;'></div>);
	    }
	    if(exists $category_links{'Environmental_Information_Processing'}){
		$square .= qq(<div id='square' style='background:#E3C800;'></div>);
	    }
	    if(exists $category_links{'Cellular_Processes'}){
		$square .= qq(<div id='square' style='background:#A4C400;'></div>);
	    }
	    if(exists $category_links{'Organismal_Systems'}){
		$square .= qq(<div id='square' style='background:#234794;'></div>);
	    }
	    if(exists $category_links{'Human_Diseases'}){
		$square .= qq(<div id='square' style='background:#76608A;'></div>);
	    }
	    if(exists $category_links{'Drug_Development'}){
		$square .= qq(<div id='square' style='background:#F0A30A;'></div>);
	    }
	    $info_HTMLs .= qq(<b>Other&nbspPathways</b>:<br>$square);
	}
##.	
=cut	
	$info_HTMLs .= qq(</div>);

	##get center latlng
	my $show_x = ((($$json{'xy'}{'ne_x'} - $$json{'xy'}{'sw_x'})/2) + $$json{'xy'}{'sw_x'});
	my $show_y = ((($$json{'xy'}{'sw_y'} - $$json{'xy'}{'ne_y'})/2) + $$json{'xy'}{'ne_y'});
	my ($show_lat, $show_lng) = Generator::xy2latlng($show_x, $show_y);
	##.
	
	print qq({
		  "html":"$info_HTMLs",
		  "latlng": [$show_lat, $show_lng]
		 });
	
    }elsif($$json{'Type'} eq "Compound"){
	my $Name = $$json{'Meta'}{'Name'};
	my $cpd = $$json{'Meta'}{'cpd'};
	my $formula = $$json{'Meta'}{'formula'};
#	my $OtherDBs = join('&nbsp&nbsp', @{$$json{'Meta'}{'OtherDB'}});
	my $mass = $$json{'Meta'}{'mass'};
	my $dmet = $$json{'Meta'}{'OtherDB'}{'3DMET'};
	my $chebi = $$json{'Meta'}{'OtherDB'}{'ChEBI'};
	my $knap = $$json{'Meta'}{'OtherDB'}{'KNApSAcK'};
	my $lipidbank = $$json{'Meta'}{'OtherDB'}{'LipidBank'};
	my $pdb_ccd = $$json{'Meta'}{'OtherDB'}{'PDB-CCD'};
	my $pubchem = $$json{'Meta'}{'OtherDB'}{'PubChem'};
	my $nikkaji = $$json{'Meta'}{'OtherDB'}{'NIKKAJI'};

	# Databases
	 my $PubChem_link = qq(<a href='http://pubchem.ncbi.nlm.nih.gov/summary/summary.cgi?sid=$pubchem' target='_blank'>PubChem</a> |) if $pubchem;
        my $ChEBI_link = qq(<a href='http://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:$chebi' target='_blank'>ChEBI</a> |) if $chebi;
        my $DMET_link = qq(<a href='http://www.3dmet.dna.affrc.go.jp/bin2/show_data.e?acc=$dmet' target='_blank'>3DMET</a> |) if $dmet;
        my $KNAP_link = qq(<a href='http://kanaya.naist.jp/knapsack_jsp/information.jsp?sname=C_ID&word=$knap' target='_blank'>KNApSAcK</a> |) if $knap;


	#.
	
	$info_HTMLs .= qq(<b>Name</b>:&nbsp&nbsp$Name<br>);
	
	if(defined($cpd)){
	  if($cpd =~ /^C/){ # Compound
                $info_HTMLs .= qq(<b>ID</b>:&nbsp&nbsp<a href='http://www.genome.jp/dbget-bin/www_bget?cpd+${cpd}' target='_blank'>$cpd</a><br>);
            }elsif($cpd =~ /^G/){ # Glycan
                $info_HTMLs .= qq(<b>ID</b>:&nbsp&nbsp<a href='http://www.genome.jp/dbget-bin/www_bget?gl+${cpd}' target='_blank'>$cpd</a><br>);
            }elsif($cpd =~ /^D/){ # Drug
                $info_HTMLs .= qq(<b>ID</b>:&nbsp&nbsp<a href='http://www.genome.jp/dbget-bin/www_bget?dr:${cpd}' target='_blank'>$cpd</a><br>);
            }   
	}

	
	$info_HTMLs .= qq(<b>Formula</b>:&nbsp&nbsp$formula<br>) if defined($formula);
	$info_HTMLs .= qq(<b>Mass</b>:&nbsp&nbsp$mass<br>) if defined($mass);


	my ($imgw, $imgh) = imgsize("./Data/Img/Compound/$cpd".".gif");
	
	if($imgw > 200 || $imgh > 200){
	    $imgw = $imgw * 0.75;
	    $imgh = $imgh * 0.75;
            }

            $info_HTMLs .= qq(<img height='$imgh' width='$imgw' src='./Data/Img/Compound/${cpd}.gif'><br>);

	##get center latlng
	my ($show_lat, $show_lng);
	if($$json{'Shape'} eq 'Rectangle'){
	    my $show_x = ((($$json{'xy'}{'ne_x'} - $$json{'xy'}{'sw_x'})/2) + $$json{'xy'}{'sw_x'});
	    my $show_y = ((($$json{'xy'}{'sw_y'} - $$json{'xy'}{'ne_y'})/2) + $$json{'xy'}{'ne_y'});
	    ($show_lat, $show_lng) = Generator::xy2latlng($show_x, $show_y);
	}else{
	    ($show_lat, $show_lng) = ($$json{'latlng'}{'lat'}, $$json{'latlng'}{'lng'});
	}
        ##.

	$info_HTMLs .= qq($ChEBI_link $PubChem_link $DMET_link $KNAP_link); 
	
	
	print qq({
		  "html":"$info_HTMLs",
		  "latlng": [$show_lat, $show_lng]
		 });
	
    }
    
    exit;
    #    my $formula = $json{};
    

=pod
      my $data = qq/{
                       "lat":"$lat",
                       "lng":"$lng",
                       "main":"$main"
		                   }/;
=cut
    

}elsif($action eq 'show_info' || $action eq 'get_json'){ 
$path = dirname( $cgi->param("path") or exit ); # current directory name
    open my $cfile,'<', "${path}"."/${map_id}.coord";
    while(<$cfile>){
	chomp();
	my $line = $_;
	my ($xcoord, $ycoord) = Generator::latlng2xy($lat, $lng);
	if($line =~ /RID/){ # if Reaction 
	    my ($pid, $x1, $y1, $x2, $y2);
	    if( (int(my @tabnum = split(/\t/, $_)) ) == 3){ # if Reaction is circle
		my ($pid, $x1, $y1) = split(/\t/, $_, 3);
		if($xcoord >= $x1 - 1 && $xcoord <= $x1 + 52.5 && $ycoord >= $y1 -1 && $ycoord <= $y1 + 25){
		    $outpid = $pid;
		    last;
		}
	    
	    }elsif(int(my @tabnum = split(/\t/, $_)) == 5){ # if Reation is Rectangle
		my ($pid, $x1, $y1, $x2, $y2) = split(/\t/, $_);
		if($xcoord >= $x1 && $xcoord <= $x2 && $ycoord >= $y1 && $ycoord <= $y2){
		    $outpid = $pid;
		    %return_HTMLs = &get_html($pid);
		    $grep_id = `grep $pid ${path}."/${map_id}.meta"`; 
		    chomp($grep_id);
		    last;
		}
	    }
	}elsif($line =~ /CID/){
	    
	    my ($pid, $x1, $y1, $x2, $y2);
	    
	    if( (int(my @tabnum = split(/\t/, $_)) ) == 3 ){ # if Compound is circle
		($pid, $x1, $y1) = split(/\t/, $_);
		if($xcoord >= $x1 - 25 && $xcoord <= $x1 + 25 && $ycoord >= $y1 - 25 && $ycoord <= $y1 + 25){
		    $outpid = $pid;
		    %return_HTMLs = &get_html($pid);
		    #  $grep_id = `grep $pid ${path}."/${map_id}.meta"`;
		    #  chomp($grep_id);
		    last;
		}
		
	    }elsif(int(my @tabnum = split(/\t/, $_)) == 5){
		($pid, $x1, $y1, $x2, $y2) = split(/\t/, $_);
		if($xcoord >= $x1 && $xcoord <= $x2 && $ycoord >= $y1 && $ycoord <= $y2){
		    $outpid = $pid;
		    %return_HTMLs = &get_html($pid);
		    last;
		}
	    }
	}

    }
    close $cfile;
    
    my $main1 = '';my $main2 = '';
    
    if( $return_HTMLs{'Type'} eq 'Gene' ){
    
	if( $return_HTMLs{Orthology} ne "" ){ $main2 .= qq|$return_HTMLs{'Orthology'}|; }

	$main1 =~ s/\x0D\x0A|\x0D|\x0A//g;
	$main2 =~ s/\x0D\x0A|\x0D|\x0A//g;
	$main1 =~ s/\s*</</g;
	$main2 =~ s/\s*</</g;
	
    }elsif( $return_HTMLs{'Type'} eq 'Compound' ){

	if( $return_HTMLs{Compound} ne "" ){ $main2 .= qq|$return_HTMLs{'Compound'}|; }

	$main1 =~ s/\x0D\x0A|\x0D|\x0A//g;
	$main2 =~ s/\x0D\x0A|\x0D|\x0A//g;
	$main1 =~ s/\s*</</g;
	$main2 =~ s/\s*</</g;
    }
	
    if( $action eq 'show_info' ){ # Show Infowindow of Gene or Compound!
	
	my $main = $main1.$return_HTMLs{'Jquery'}.$main2;
	print $main;

    }elsif($action eq 'get_json' ){  # generate JSON style data of Gene or Compound!
	my $main = $main1.$return_HTMLs{'Jquery'}.$main2;
	my $data = qq/{
		       "lat":"$lat",
		       "lng":"$lng",
		       "main":"$main"
		      }/;
	print $data;
    }
}

## Search Mode (show results in East component)
if($action eq 'query_search'){
    my $Gene_HTML;
    my $Comp_HTML;
    my @Comp_IDs;
    my @Gene_IDs;
    my $query = $cgi->param("query");
    my @HitMaps;
    my $Markers_JSON;
    my %Pathwaynum;
    
    if(length($query) > 1){
	my $grep_id = `grep -i "$query" "./Data/Info/Other/all.meta"`;
	if($grep_id){
	    for my $line(split /\n/, $grep_id){
		my $uniq_id = $1 if $line =~ /(^[CR]ID\d+)/;
		my $current = $1 if $line =~ /\{currentMap:\s(.*?)\}/;

		my $grep_latlng = `grep -i "$uniq_id" "./Data/Info/Other/all.coord"`;
		my @latlng;
		if( (int(my @tabnum = split(/\t/,$grep_latlng)) ) == 3){
		    my ($pid, $x1, $y1) = split(/\t/, $grep_latlng, 3);
		    @latlng = Generator::xy2latlng($x1,$y1);
		}elsif( (int(my @tabnum = split(/\t/,$grep_latlng)) ) == 5 ){
		    my ($pid, $x1, $y1, $x2, $y2) = split(/\t/, $grep_latlng, 5);
		    $x1 = $x1 + (($x2 - $x1)/2);
		    $y1 = $y1 + (($y2 - $y1)/2);
		    @latlng =  Generator::xy2latlng($x1,$y1);
		}
#		my @latlng = split (/\t/, $grep_latlng);
		if($uniq_id =~ /^CID/){
		    my $name = $1 if $line =~ /\{name:\s(.*?)\}/;
		    push @{$Pathwaynum{"${current}"}}, \@latlng;
		    push @Comp_IDs, $name;
		    push @HitMaps, "${current}";
		}elsif($uniq_id =~ /^RID/){
		    my $k_def = $1 if $line =~ /\{K-Def:\s(.*?)\}/;
#		    @latlng =  Generator::xy2latlng("$latlng[1]","$latlng[2]");
		    push @{$Pathwaynum{"${current}"}}, \@latlng;
		    push @HitMaps, "${current}";
		    push @Gene_IDs, "$k_def<br>$current";
		}
	    }
		
	    ## get Marker json for marker (Pathway)
	    for my $map_id( keys %Pathwaynum ){
		$Markers_JSON .= qq(\n\n"map${map_id}": [\n);	
		for(@{$Pathwaynum{"$map_id"}}){
		    $Markers_JSON .= qq(\t\t\t["${$_}[0]","${$_}[1]"],\n);
#		    $Markers_JSON .= qq(${${_}}[1]);
		}
				    $Markers_JSON .= qq(\t\t\t\t],\n\n);    
	    }

	    
	    ## get Category and Tile include num
	    my $jsonHTML;
	    my %Tile_num;
	    my %Category_num;
#	    $Markers_JSON = ${$Pathwaynum{'03020'}}[0][1];
	    
	    for my $id(@HitMaps){
		my $grep_category = `grep -i ${id} ./Data/Info/Other/Map.path`;  # Get Category type (including in Map_ID)
		my $Category = $1 if $grep_category =~ /\{Tile:\s(.*?)\}/; #Get Tile type (including in Map_ID)
		$Category_num{"$Category"}++;
		
		my $grep_latlng = `grep -i \'Map_ID\":\"${id}\"\' ./Data/Info/${Category}/Tile/Tile.location`;
		
		my $center_lat = $1 if $grep_latlng =~ /Center_lat\":\"([^\"]+)/;
		my $center_lng = $1 if $grep_latlng =~ /Center_lng\":\"([^\"]+)/;
		
		$Tile_num{"$Category"}->{"$id"}->{"num"}++;
		$Tile_num{"$Category"}->{"$id"}->{"lat"} = $center_lat;# mapping in center of pathway-17
		$Tile_num{"$Category"}->{"$id"}->{"lng"} = $center_lng;# mapping in center of pathway+29

	    }
	
	    for my $Category(keys %Tile_num){
		$jsonHTML .= qq(\n\n"$Category": [\n);
				for my $id(keys %{$Tile_num{"$Category"}}){
				    
				    $jsonHTML .= qq(\t\t\t["$Tile_num{$Category}->{$id}->{"lat"}","$Tile_num{"$Category"}->{$id}->{"lng"}","$Tile_num{$Category}->{$id}->{"num"}"],\n);
				}
				$jsonHTML .= qq(\t\t\t\t],\n\n);
	    }
	   
##.
	    $Gene_HTML .= qq(<div style='font-size:9px'>);
	    for my $id(@Gene_IDs){
		chomp($id);
		$Gene_HTML .= qq(<b>$id</b><br><br>);
	    }
	    $Gene_HTML .= qq(</div>);
	    $Comp_HTML .= qq(<div style='font-size:9px'>);
	    for my $id(@Comp_IDs){
		chomp($id);
		$Comp_HTML .= qq(<b>$id</b><br>);
	    }
	    $Comp_HTML .= qq(</div>);
	    $Gene_HTML =~ s/<br>$//;
	    $Comp_HTML =~ s/<br>$//;
	    my $count = ($#Gene_IDs + 1) + ($#Comp_IDs + 1);
#center latlng (75, 4, -77,), (-120, 0, 118.5)
	    my $data = qq/{
			   "count": "$count",

			   "gene": "$Gene_HTML",

			   "comp": "$Comp_HTML",

			   "category": [
					["2.1088986592431382","-35.5078125","$Category_num{'Metabolism'}","Metabolism"],
					["-49.936455137010644","-164.8828125","$Category_num{'Cellular_Processess'}","Cellular_Processess"],
					["-75.49715731893083","-35.5078125","$Category_num{'Drug_Development'}","Drug_Development"],
					["78.9039293885709","-35.5078125","$Category_num{'Genetic_Information_Processing'}","Genetic_Information_Processing"],
					["52.802761415419674","86.1328125","$Category_num{'Environmental_Information_Processing'}","Environmental_Information_Processing"],
					["-49.936455137010644","86.1328125","$Category_num{'Human_Diseases'}","Human_Diseases"],
					["52.802761415419674","-164.8828125","$Category_num{'Organismal_Systems'}","Organismal_Systems"]
				       ],
			   
			       "tile": {$jsonHTML},
			   "pathway": {$Markers_JSON}
			   
			  }/;
	    print $data;
	}
    }


    
    if($Gene_HTML || $Comp_HTML){

    }else{
	my $data = qq/{
		       "gene": "",
		       "comp": ""
		      }/;
	print $data;
    }
}


################
## Subroutine ##
################

# get_html(){}: Parse Information from "${map_id}.meta" file and return Info_Window(HTML)

sub get_html{
    my $pid = shift;
        
    if($pid =~ /RID/){ # if clicked ID is Reaction

	my $Reaction_HTMLs = '';   # Reaction tab data (HTML)
	my $Orthology_HTMLs = '';  # Orthology tab data (HTML)
	my $Pathway_HTMLs;         # Pathway tab data (HTML)
	my $jquery_script = '';    # tabmenu.js and slider.js script (Javascript)
	my @grep = `grep $pid "${path}/${map_id}.meta"`;
	my $enz = $1 if $grep[0] =~ /\{enz:\s(.*?)\}/;
	my $oth = $1 if $grep[0] =~ /\{oth:\s(.*?)\}/;
	my $rct = $1 if $grep[0] =~ /\{rct:\s(.*?)\}/;
	my $k_def = $1 if $grep[0] =~ /\{K-Def:\s(.*?)\}/;
	my $pathI_list = $1 if $grep[0] =~ /\{pathwayID:\s(.*?)\}/;
	my $pathN_list = $1 if $grep[0] =~ /\{pathway:\s(.*?)\}/;
	my $diseaseI = $1 if $grep[0] =~ /\{DiseaseID:\s(.*?)\}/;
	my $diseaseN = $1 if $grep[0] =~ /\{DiseaseN:\s(.*?)\}/;
	my $moduleI = $1 if $grep[0] =~ /\{ModuleID:\s(.*?)\}/;
	my $moduleN = $1 if $grep[0] =~ /\{ModuleN:\s(.*?)\}/;
	my $dbinks;
	my $Reaction_Img;

	$Orthology_HTMLs .= qq(<b>Definition</b>:&nbsp&nbsp$k_def<br>);
	$Orthology_HTMLs .= qq(<b>ID</b>:&nbsp&nbsp);
	if($oth ne ""){
	    my $othi;
	    for my $or (split(/, /, $oth)){
		$othi ++;
		if($othi < 5){
		    $Orthology_HTMLs .= qq(<a href='http://www.genome.jp/dbget-bin/www_bget?ko+$or' target='_blank'>$or</a>,);
		}else{
		    last;
		}
	    }
	}
	
	if($rct ne ''){
	    for my $r (split(/,/, $rct)){
		$r =~ s/ //;
		$Orthology_HTMLs .= qq(<a href='http://www.genome.jp/dbget-bin/www_bget?rn+$r' target='_blank'>$r</a>, );
		next;
	    }
	    chop($Orthology_HTMLs);
	    $Orthology_HTMLs .= qq(<a href='http://www.genome.jp/dbget-bin/www_bget?ec:${enz}' target='_blank'>$enz</a><br><br>) if $enz ne "";
	}
	
	chop($Orthology_HTMLs);

	$Orthology_HTMLs .= qq(<br>);

	$Orthology_HTMLs .= qq(<b>Module</b>:&nbsp&nbsp<a href='http://www.genome.jp/kegg-bin/show_module?$moduleI' target='_blank'>$moduleN</a><br>) if $moduleN ne "";
	$Orthology_HTMLs .= qq(<b>Disease</b>:<a href='http://www.genome.jp/dbget-bin/www_bget?ds:$diseaseI' target='_blank'>$diseaseN</a><br>) if $diseaseN ne "";	    

	my ($imgw, $imgh);
	if($rct ne ''){
	    $Reaction_Img = (split(/,/, $rct))[0];
	    ($imgw, $imgh) = imgsize("./Data/Img/Reaction/$Reaction_Img".".gif");
	    if($imgw > 400){ # resize reaction image
		my $power = $imgw/500;
		$imgw = 500;
		$imgh = $imgh/$power;
		if($imgh > 300){
		    my $power = $imgh/500;
		    $imgh = 500;
		    $imgw = $imgw/$power;
		}
	    }elsif($imgh > 400){
		my $power = $imgh/500;
		$imgh = 500;
		$imgw = $imgw/$power;
	    }
	
	    $Orthology_HTMLs .= qq(<br><img width='$imgw' height='$imgh' src='./Data/Img/Reaction/$Reaction_Img.gif'/><br>);
	    
	}

	    if($pathN_list ne ""){ # Other exists pathway map list (HTML)
		my @pathN = split(/,/, $pathN_list);
		my @pathI = split(/,/, $pathI_list);
		$Orthology_HTMLs .= qq(<b>Other Pathways</b>:<br><div style='height:37px;width:${imgw}px;'>);
		
		for(my $i=0;$i<$#pathN+1;$i++){
		    $pathI[$i] =~ s/ //g;
		    $pathN[$i] =~ s/ /&nbsp/g;
		    $Orthology_HTMLs .= qq(<a href='http://www.genome.jp/dbget-bin/show_pathway?map${pathI[$i]}' target='_blank'>${pathN[$i]}</a>,);
		    
		}
		
	    }

	    chop($Orthology_HTMLs);
	    $Orthology_HTMLs .= qq(</div>);
	return ('Type','Gene','Orthology',$Orthology_HTMLs,'Reaction',$Reaction_HTMLs,'Pathway',$Pathway_HTMLs,'Jquery',$jquery_script);	

    }elsif($pid =~ /CID/){
	
	my $Compound_HTMLs; # Compound tab data (HTML)
	my $jquery_script = '';    # tabmenu.js and slider.js script (Javascript)
	
	my @grep = `grep $pid "${path}/${map_id}.meta"`;
	my $name =  $1 if $grep[0] =~ /\{name:\s(.*?)\}/;
	my $cid = $1 if $grep[0] =~ /\{cpd:\s(.*?)\}/;
	my $formula = $1 if $grep[0] =~ /\{formula:\s(.*?)\}/;
	my $mass = $1 if $grep[0] =~ /\{mass:\s(.*?)\}/;
	my $dmet = $1 if $grep[0] =~ /\{3DMET:\s(.*?)\}/;
	my $chebi = $1 if $grep[0] =~ /\{ChEBI:\s(.*?)\}/;
	my $knap = $1 if $grep[0] =~ /\{KNApSAcK:\s(.*?)\}/;
	my $lipidmaps = $1 if $grep[0] =~ /\{LIPIDMAPS:\s(.*?)\}/;
	my $lipidbank = $1 if $grep[0] =~ /\{LipidBank:\s(.*?)\}/;
	my $pdb_ccd = $1 if $grep[0] =~ /\{PDB-CCD:\s(.*?)\}/;
	my $pubchem = $1 if $grep[0] =~ /\{PubChem:\s(.*?)\}/;
	my $nikkaji = $1 if $grep[0] =~ /\{NIKKAJI:\s(.*?)\}/;
	
	#Databases
        my $PubChem_link = qq(<a href='http://pubchem.ncbi.nlm.nih.gov/summary/summary.cgi?sid=$pubchem' target='_blank'>PubChem</a> |) if $pubchem;
        my $ChEBI_link = qq(<a href='http://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:$chebi' target='_blank'>ChEBI</a> |) if $chebi;
        my $DMET_link = qq(<a href='http://www.3dmet.dna.affrc.go.jp/bin2/show_data.e?acc=$dmet' target='_blank'>3DMET</a> |) if $dmet;
        my $KNAP_link = qq(<a href='http://kanaya.naist.jp/knapsack_jsp/information.jsp?sname=C_ID&word=$knap' target='_blank'>KNApSAcK</a> |) if $knap;


	
	if($cid ne ""){
	    chop($name) if $name =~ /;$/;
	    $Compound_HTMLs .= qq(<b>Name</b>:&nbsp&nbsp$name<br>);
	    if($cid =~ /^C/){ # Compound
		$Compound_HTMLs .= qq(<b>ID</b>:&nbsp&nbsp<a href='http://www.genome.jp/dbget-bin/www_bget?cpd+${cid}' target='_blank'>$cid</a><br>);
	    }elsif($cid =~ /^G/){ # Glycan
		$Compound_HTMLs .= qq(<b>ID</b>:&nbsp&nbsp<a href='http://www.genome.jp/dbget-bin/www_bget?gl+${cid}' target='_blank'>$cid</a><br>);
	    }elsif($cid =~ /D/){ # Drug
		$Compound_HTMLs .= qq(<b>ID</b>:&nbsp&nbsp<a href='http://www.genome.jp/dbget-bin/www_bget?dr:${cid}' target='_blank'>$cid</a><br>);
	    }

	    $Compound_HTMLs .= qq(<b>Formula</b>:&nbsp&nbsp$formula<br>) if $formula ne "";
	    $Compound_HTMLs .= qq(<b>Mass</b>:&nbsp&nbsp$mass<br>) if $mass ne "";

	    my ($imgw, $imgh) = imgsize("./Data/Img/Compound/$cid".".gif");

	    if($imgw > 200 || $imgh > 200){
		$imgw = $imgw * 0.75;
		$imgh = $imgh * 0.75;
	    }
	    
	    $Compound_HTMLs .= qq(<img height='$imgh' width='$imgw' src='./Data/Img/Compound/${cid}.gif'><br>);
	    
	    $Compound_HTMLs .= qq($ChEBI_link $PubChem_link $DMET_link $KNAP_link );
	    
	}
	
	return ('Type','Compound','Compound',$Compound_HTMLs,'Jquery',$jquery_script);
	
    }
}
