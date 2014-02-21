#!/usr/bin/ruby
require "cgi"

cgi = CGI.new

print("Content-Disposition: attachment; filename="+cgi["file_name"]+"\r\n");
print("Content-Type: text/csv;\r\n\r\n");
print(cgi["file_contents"]);

