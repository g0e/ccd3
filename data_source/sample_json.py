#!/usr/bin/python3
# coding:utf-8

import cgi
import json
from datetime import datetime
import time
import random

def date_handler(obj):
	if hasattr(obj,'isoformat'):
		return int(time.mktime(obj.timetuple())*1000)
	else:
		return obj

def random_series(params):
	ar = []
	series_num = int(params.getfirst("series_num",3))
	cnt = int(params.getfirst("cnt",20))
	scale = float(params.getfirst("scale",100))
	for i in range(0,series_num):
		ar.append({"name":"series"+str(i+1), "values":[]})
		v = random.random()*scale
		for j in range(0,cnt):
			v += (random.random() -0.5)*scale/cnt
			ar[i]["values"].append({"x":j,"y":v})
	return ar
	
#time.sleep(1.5)
dataset = random_series(cgi.FieldStorage())

print("Content-Type: application/json; charset=utf-8\n")
print(json.dumps(dataset,default=date_handler,sort_keys=True,indent=4))

