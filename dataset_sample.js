// for JSHint
/* global d3 */

// sample dataset generator for ccd3 examples
var ccd3_dataset = function(){
	"use strict";
	ccd3_dataset = {};
	
	ccd3_dataset.random_diff = function(options){
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
	
	ccd3_dataset.sin_cos_tan = function(options){
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
	
	ccd3_dataset.random_weekday = function(options){
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
	
	ccd3_dataset.random_xylabel = function(options){
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
	ccd3_dataset.random_xyz_grid = function(options){
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

	ccd3_dataset.random_xyz = function(options){
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
	
	ccd3_dataset.correlative_xyz = function(options){
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
	
	return ccd3_dataset;
}();
