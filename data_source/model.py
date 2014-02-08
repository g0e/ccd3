import configparser
import oursql

CONFIG_FILE = "config.ini"

class DataContainer:
	"""
		hogehoge
	"""
	
	def __init__(self):
		config = configparser.ConfigParser()
		config.read(CONFIG_FILE)
		conn = oursql.connect( \
			host=config.get("mysql","host"), \
			user=config.get("mysql","user"), \
			passwd=config.get("mysql","passwd"), \
			db=config.get("mysql","db"), \
		)
		self.cur = conn.cursor()
	
	def query(self,sql):
		self.cur.execute(sql)
		self.data_meta = self.cur.description
		self.data_body = self.cur.fetchall()
		return self
	
	def to_ar(self):
		ar = [[]]
		for meta in self.data_meta:
			ar[0].append(meta[0])
		for row in self.data_body:
			ar.append(row)
		return ar
	
	def to_assoc_ccd3(self):
		ar = []
		for i in range(1,len(self.data_meta)):
			ar.append({"name": self.data_meta[i][0], "values":[]})
			for row in self.data_body:
				ar[i-1]["values"].append({"x":row[0],"y":row[i]})
		return ar

