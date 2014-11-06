package Config::Pit::RC4;

use strict;
use warnings;
use Crypt::RC4;
use base qw(Config::Pit Exporter);

our @EXPORT     = qw/pit_get pit_set pit_switch/;
our $passphrase = 'password';
our $set_done   = 0;

*pit_get    = \&get;
*pit_set    = \&set;
*pit_switch = \&switch;

sub get {
  my ($name, %opts) = @_;
  my $config;

  # override Config::Pit::set and call original get
  {
    no warnings 'redefine';
    my $org_method    = Config::Pit->can('set');
    *Config::Pit::set = sub {$set_done=1; &$org_method(@_)};
    $config           = Config::Pit::get($name, %opts);
    *Config::Pit::set = $org_method;
}
  # non-crypted
  if($set_done){
      my $profile = Config::Pit::_load();
    $profile->{$name}->{$_} = encrypt($profile->{$name}->{$_}) foreach (keys %{$profile->{$name}});
      YAML::Syck::DumpFile($Config::Pit::profile_file, $profile);
  }
  # crypted
  else{
    $config->{$_} = decrypt($config->{$_}) foreach (keys %$config);
  }
  return $config;
}

sub set {
  my ($name, %opts) = @_;
  my $config = Config::Pit::set($name, %opts);

  my $profile = Config::Pit::_load();
  $profile->{$name}->{$_} = encrypt($profile->{$name}->{$_}) foreach (keys %{$profile->{$name}});
  YAML::Syck::DumpFile($Config::Pit::profile_file, $profile);
  return $config;
}

sub encrypt{
  my $plaintext = shift;
  my $encrypted = RC4($passphrase, $plaintext);
  $encrypted =~ s/(.)/unpack('H2', $1)/eg;
  return $encrypted;
}

sub decrypt{
  my $encrypted = shift;
  $encrypted =~ s/([0-9A-Fa-f]{2})/pack('H2', $1)/eg;
  my $decrypted = RC4($passphrase, $encrypted);
  return $decrypted;
}
