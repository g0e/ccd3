// for JSHint
/* global d3,ccd3 */
import ccd3 from "./ccd3";

const tools = function(){
	"use strict";
	
	var ccd3t = {};
	
	ccd3t.DatasetGenerator = function(cond){
		var default_cond = {
			series_cnt: 3,
			values_cnt: 20,
			x: ccd3t.sequence_date,
			y: ccd3t.random_int,
			z: undefined,
			random_ceil: 100.0,
			random_floor: 0.0,
			seq_start: 1.0,
			seq_step: 1.0,
			date_start: new Date(2014,0,1),
			date_seq_step: 1000*60*60*24, // date
			numeric_str_len: 5,
			random_str_len: 8,
			walk_start_ceil: 100.0,
			walk_start_floor: 50.0,
			walk_step: 1
		};
		if(!cond){ cond={}; }
		ccd3.Util.merge(default_cond, cond);
		ccd3.Util.merge(this,default_cond);
	};
	ccd3t.DatasetGenerator.prototype.generate = function(cond){
		if(cond){ ccd3.Util.merge(this,cond); }
		var axis = ["x","y","z","label"];
		this.dataset = [];
		var series,values,value,cur_axis,pos;
		
		for(var i=0;i<this.series_cnt;i++){
			this.dataset.push({values:[]});
			for(var j=0;j<this.values_cnt;j++){
				value = {};
				for(var k=0;k<axis.length;k++){
					pos = { series_pos:i, value_pos:j, axis:axis[k] };
					cur_axis = axis[k];
					if(this[cur_axis]){
						value[cur_axis] = this[cur_axis].call(this,pos);
					}
				}
				this.dataset[i].values.push(value);
			}
		}
		
		return this.dataset;
	};
	
	/* ------------------------------------------------------------------ */
	/*  value generator functions                                         */
	/* ------------------------------------------------------------------ */
	/* random_basic */
	ccd3t.random_int = function(){
		return parseInt((this.random_ceil - this.random_floor) * Math.random() + this.random_floor);
	};
	ccd3t.random_float = function(){
		return parseFloat((this.random_ceil - this.random_floor) * Math.random() + this.random_floor);
	};
	ccd3t.random_str = function(){
		var list = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		list = list.split('');
		var str = '';
		for (var i=0;i<this.random_str_len;i++) {
			str += list[Math.floor(Math.random() * list.length)];
		}
		return str;
	};
	
	/* sequence_basic */
	ccd3t.sequence_int = function(pos){
		return parseInt(pos.value_pos*this.seq_step + this.seq_start);
	};
	ccd3t.sequence_float = function(pos){
		return parseFloat(pos.value_pos*this.seq_step + this.seq_start);
	};
	ccd3t.sequence_date = function(pos){
		return new Date(pos.value_pos*this.date_seq_step + this.date_start.getTime());
	};
	ccd3t.sequence_str = function(pos){
		return d3.format("0"+this.numeric_str_len+"d")(pos.value_pos);
	};
	
	/* matrix */
	ccd3t.matrix_x_int = function(pos){
		return parseInt((pos.value_pos + 1) % Math.pow(this.values_cnt,0.5)) + 1;
	};
	ccd3t.matrix_y_int = function(pos){
		return parseInt((pos.value_pos) / Math.pow(this.values_cnt,0.5)) + 1;
	};
	ccd3t.matrix_x_str = function(pos){
		return d3.format("0"+this.numeric_str_len+"d")(parseInt((pos.value_pos + 1) % Math.pow(this.values_cnt,0.5)));
	};
	ccd3t.matrix_y_str = function(pos){
		return d3.format("0"+this.numeric_str_len+"d")(parseInt((pos.value_pos) / Math.pow(this.values_cnt,0.5)));
	};

	/* random_walk */
	ccd3t.random_walk_int = function(pos){
		if(this.dataset[pos.series_pos].values[pos.value_pos-1]){
			return parseInt(this.dataset[pos.series_pos].values[pos.value_pos-1][pos.axis] + ((Math.random() < 0.5)? 1:-1)*this.walk_step );
		}else{
			return parseInt((this.walk_start_ceil - this.walk_start_floor) * Math.random() + this.walk_start_floor);
		}
	};

	ccd3t.random_diff = function(options){
		if(options===undefined){ options={}; }
		var series_num = (options.series_num)? options.series_num : 5;
		var scale = (options.scale)? options.scale : 100;
		var cnt = (options.cnt)? options.cnt : 10;
		var dataset = [];
		
		for(var i=0;i<series_num;i++){
			var series = [];
			var tdate = new Date();
			tdate = new Date(tdate.getFullYear(),tdate.getMonth(),tdate.getDate());
			var y = 0.5 + Math.random()*0.5;
			var z = 0.5 + Math.random()*0.5;
			for(var j=0;j<cnt;j++){
				y += (Math.random() - 0.5)/cnt;
				z += (Math.random() - 0.5)/cnt;
				tdate.setDate(tdate.getDate()+1);
				series.push({x:new Date(tdate.getTime()), y:y*scale, z:z*scale});
			}
			dataset.push({values:series});
		}
		
		return dataset;
	};
	
	ccd3t.sin_cos_tan = function(options){
		if(options===undefined){ options={}; }
		var cnt = (options.cnt)? options.cnt : 100;
		var sin = [];
		var cos = [];
		var tan = [];
		var tdate = new Date();
		tdate = new Date(tdate.getFullYear(),tdate.getMonth(),tdate.getDate());
		
		for(var i=0;i<cnt;i++){
			sin.push({x: new Date(tdate.getTime()), y:Math.sin(i/10)});
			cos.push({x: new Date(tdate.getTime()), y:Math.cos(i/10)});
			tan.push({x: new Date(tdate.getTime()), y:Math.tan(i/10)});
			tdate.setDate(tdate.getDate()+1);
		}
		
		return [
			{name: "sin", values: sin},
			{name: "cos", values: cos},
			{name: "tan", values: tan},
		];
	};
	
	ccd3t.random_weekday = function(options){
		if(options===undefined){ options={}; }
		var series_num = (options.series_num)? options.series_num : 5;
		var scale = (options.scale)? options.scale : 100;
		var cnt = 7; // days of week
		var dataset = [];
		var weekday_list = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
		
		for(var i=0;i<series_num;i++){
			var series = [];
			var tdate = new Date();
			for(var j=0;j<cnt;j++){
				var y = Math.random()*scale;
				var z = Math.random()*scale;
				tdate.setDate(tdate.getDate()+1);
				series.push({x:weekday_list[tdate.getDay()], y:y*scale, z:z*scale});
			}
			dataset.push({values:series});
		}
		
		return dataset;

	};
	
	ccd3t.random_xylabel = function(options){
		if(options===undefined){ options={}; }
		var scale = (options.scale)? options.scale : 100;
		var cnt = (options.cnt)? options.cnt : 10;
		var random_drop = (options.random_drop)? options.random_drop : 0;
		var series = [];
		
		for(var i=0;i<cnt;i++){
			for(var j=0;j<cnt;j++){
				if(random_drop){
					if(Math.random()>random_drop){
						series.push({x:"label"+i, y:"label"+j, z:Math.random()*scale});
					}
				}else{
					series.push({x:"label"+i, y:"label"+j, z:Math.random()*scale});
				}
			}
		}
		return [{values:series}];
	};
	ccd3t.random_xyz_grid = function(options){
		if(options===undefined){ options={}; }
		var scale = (options.scale)? options.scale : 100;
		var cnt = (options.cnt)? options.cnt : 10;
		var random_drop = (options.random_drop)? options.random_drop : 0;
		var series = [];
		
		for(var i=0;i<cnt;i++){
			for(var j=0;j<cnt;j++){
				if(random_drop){
					if(Math.random()>random_drop){
						series.push({x:i, y:j, z:Math.random()*scale});
					}
				}else{
					series.push({x:i, y:j, z:Math.random()*scale});
				}
			}
		}
		return [{values:series}];
	};

	ccd3t.random_xyz = function(options){
		if(options===undefined){ options={}; }
		var series_num = (options.series_num)? options.series_num : 5;
		var scale = (options.scale)? options.scale : 100;
		var cnt = (options.cnt)? options.cnt : 10;
		var dataset = [];
		
		for(var i=0;i<series_num;i++){
			var series = [];
			for(var j=0;j<cnt;j++){
				series.push({x:Math.random()*scale, y:Math.random()*scale, z:Math.random()*scale});
			}
			dataset.push({values:series});
		}
		
		return dataset;
	};
	
	ccd3t.correlative_xyz = function(options){
		if(options===undefined){ options={}; }
		var series_num = (options.series_num)? options.series_num : 5;
		var scale = (options.scale)? options.scale : 100;
		var cnt = (options.cnt)? options.cnt : 10;
		var dataset = [];
		
		for(var i=0;i<series_num;i++){
			var series = [];
			for(var j=0;j<cnt;j++){
				var z = Math.random();
				var y = z*(1.0 - 0.3*2*(Math.random()-0.5));
				var x = z*(1.0 - 0.3*2*(Math.random()-0.5));
				series.push({x:x*scale, y:y*scale, z:z*scale});
			}	
			dataset.push({values:series});
		}
		
		return dataset;
	};
	
	return ccd3t;
}();

export default tools;