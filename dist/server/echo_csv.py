#!/usr/bin/python3
# coding:utf-8

import cgi

params = cgi.FieldStorage()
print("Content-Disposition: attachment; filename=" + params.getfirst("file_name","data.csv"))
print("Content-Type: text/csv;\n")
print(params.getfirst("file_contents",""))

