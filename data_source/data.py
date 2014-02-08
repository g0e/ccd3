#!/usr/bin/python3
# coding:utf-8

import cgi
import model
import json
from datetime import datetime
import time

def date_handler(obj):
	if hasattr(obj,'isoformat'):
		return int(time.mktime(obj.timetuple())*1000)
	else:
		return obj

params = cgi.FieldStorage()
cid = params.getfirst("cid",None)

if(cid=="1"):
	sql = "select date,low_price,closing_price,high_price,opening_price from stock_price where stock_code=3632 LIMIT 10;"
else:
	sql = "select date,high_price,low_price from stock_price where stock_code=3632 LIMIT 30;"

m = model.DataContainer()
assoc = m.query(sql).to_assoc_ccd3()

print("Content-Type: application/json; charset=utf-8\n")
#print("Content-Type: text/html\n")
print(json.dumps(assoc,default=date_handler,sort_keys=True,indent=4))

