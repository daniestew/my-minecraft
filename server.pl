use HTTP::Daemon;
use HTTP::Response;
use HTTP::Status;
use File::Basename;
use Cwd 'abs_path';

my $root = dirname(abs_path($0));
my $port = 8080;

my %mime = (
    '.html' => 'text/html',
    '.js'   => 'application/javascript',
    '.css'  => 'text/css',
    '.png'  => 'image/png',
    '.jpg'  => 'image/jpeg',
    '.json' => 'application/json',
);

my $d = HTTP::Daemon->new(
    LocalAddr => '127.0.0.1',
    LocalPort => $port,
    ReuseAddr => 1,
) || die "Cannot start server: $!";

print "Server running at http://127.0.0.1:$port/\n";

while (my $c = $d->accept) {
    while (my $r = $c->get_request) {
        my $path = $r->url->path;
        $path = '/index.html' if $path eq '/';
        my $file = $root . $path;
        $file =~ s{/}{\\}g if $^O eq 'MSWin32';

        if (-f $file) {
            open my $fh, '<:raw', $file or do {
                $c->send_error(RC_INTERNAL_SERVER_ERROR);
                next;
            };
            local $/;
            my $content = <$fh>;
            close $fh;

            my ($ext) = $file =~ /(\.\w+)$/;
            my $type = $mime{lc($ext || '')} || 'application/octet-stream';

            my $resp = HTTP::Response->new(200);
            $resp->header('Content-Type' => $type);
            $resp->header('Access-Control-Allow-Origin' => '*');
            $resp->content($content);
            $c->send_response($resp);
        } else {
            $c->send_error(RC_NOT_FOUND);
        }
    }
    $c->close;
    undef $c;
}
