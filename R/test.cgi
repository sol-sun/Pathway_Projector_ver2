#!/usr/bin/env perl


use strict;
use warnings;
use CGI;
use CGI::Carp qw(fatalsToBrowser);
use JSON;

my $cgi = new CGI;
my $action = $cgi->param('action'); # todo

print "Content-type: text/html; charset=utf-8;\n\n";

if($action eq 'Get_Mapping_Data'){

    open my $file, '<', "test.dat";
    my $data;
    while(<$file>){
	chomp;
	s/ObjectId\(\"([^\"]+)\"\)/\"$1\"/g;#error todo
	s/NumberLong\(([^\)]+)\)/$1/g;#error todo
	$data .= $_;
    }
    $data =~ s/\x0D\x0A|\x0D|\x0A//g;
    $data =~ s/\x0D\x0A|\x0D|\x0A//g;
    $data =~ s/\s*</</g;
    $data =~ s/\s*</</g;
    $data =~ s/ //g;
    close $file;

    print $data;
}
