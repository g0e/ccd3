var seq = 1;
var render_test = function(cond,options){
	d3.select("#chart_div").append("div").attr("id","chart"+seq).style("margin","20px").style("float","left");
	var data = (new ccd3t.DatasetGenerator(cond)).generate();
	var chart = new ccd3.Chart("chart"+seq,data);
	chart.setup_options(options);
	chart.render();
	seq++;
	return chart;
};
var create_chart = function(){
	d3.select("#chart_div").append("div").attr("id","chart"+seq).style("margin","20px").style("float","left");
	var chart = new ccd3.Chart("chart"+seq);
	seq++;
	return chart;
};

var create_section = function(label){
	d3.select("#chart_div").append("div")
		.style("margin","5px")
		.style("margin-top","20px")
		.style("font-weight","bold")
		.style("clear","both")
		.text(label);
};

describe("Scatter charts", function(){
	var cond;
	var options = {
		width:360,height:360,
		default_series_type: "scatter"
	};
	it("don't throw with various axis.",function(){
		create_section("Scatter Chart Tests");
		expect(function(){
			render_test({ x:ccd3t.random_int, y:ccd3t.random_int }, options);
			render_test({ x:ccd3t.sequence_str, y:ccd3t.random_int }, options);
			render_test({ x:ccd3t.sequence_date, y:ccd3t.random_int }, options);
		}).not.toThrow();
	});
});

describe("Bar charts", function(){
	var cond;
	var options = {
		width:360,height:360,
		default_series_type: "bar"
	};
	it("don't throw with int,date,str xAxis.",function(){
		create_section("Bar Chart Tests");
		expect(function(){
			render_test({ series_cnt:1, values_cnt:5, x:ccd3t.sequence_int, y:ccd3t.random_int }, options);
			render_test({ series_cnt:3, values_cnt:5, x:ccd3t.sequence_date, y:ccd3t.random_int }, options);
			render_test({ series_cnt:3, values_cnt:1, x:ccd3t.sequence_str, y:ccd3t.random_int }, options);
		}).not.toThrow();
	});
	
	it("don't throw with int,date,str yAxis.",function(){
		expect(function(){
			render_test({ series_cnt:1, values_cnt:5, y:ccd3t.sequence_int, x:ccd3t.random_int }, options);
			render_test({ series_cnt:3, values_cnt:5, y:ccd3t.sequence_date, x:ccd3t.random_int }, options);
			render_test({ series_cnt:3, values_cnt:1, y:ccd3t.sequence_str, x:ccd3t.random_int }, options);

		}).not.toThrow();
	});
});

describe("StackedBar charts", function(){
	var cond;
	var options = {
		width:360,height:360,
		default_series_type: "stackedbar"
	};
	it("don't throw with int,date,str xAxis.",function(){
		create_section("StackedBar Chart Tests");
		expect(function(){
			render_test({ series_cnt:1, values_cnt:5, x:ccd3t.sequence_int, y:ccd3t.random_int }, options);
			render_test({ series_cnt:3, values_cnt:5, x:ccd3t.sequence_date, y:ccd3t.random_int }, options);
			render_test({ series_cnt:3, values_cnt:10, x:ccd3t.sequence_str, y:ccd3t.random_int }, options);
			}).not.toThrow();
	});
	it("don't throw with int,date,str yAxis.",function(){
		expect(function(){
			render_test({ series_cnt:1, values_cnt:5, y:ccd3t.sequence_int, x:ccd3t.random_int }, options);
			render_test({ series_cnt:3, values_cnt:5, y:ccd3t.sequence_date, x:ccd3t.random_int }, options);
			render_test({ series_cnt:3, values_cnt:10, y:ccd3t.sequence_str, x:ccd3t.random_int }, options);
			}).not.toThrow();
	});
	it("don't throw with stack_type='expand'.",function(){
		expect(function(){
			options.stack_type = "expand";
			render_test({ series_cnt:3, values_cnt:5, x:ccd3t.sequence_date, y:ccd3t.random_int }, options);
			render_test({ series_cnt:3, values_cnt:5, y:ccd3t.sequence_date, x:ccd3t.random_int }, options);
		}).not.toThrow();
	});
});

describe("Line charts", function(){
	var cond;
	var options = {
		width:360,height:360,
		default_series_type: "line"
	};
	it("don't throw with int,date,str xAxis.",function(){
		create_section("Line Chart Tests");
		expect(function(){
			render_test({ series_cnt:1, values_cnt:30, x:ccd3t.sequence_int, y:ccd3t.random_walk_int }, options);
			render_test({ series_cnt:3, values_cnt:30, x:ccd3t.sequence_date, y:ccd3t.random_walk_int }, options);
			render_test({ series_cnt:3, values_cnt:10, x:ccd3t.sequence_str, y:ccd3t.random_walk_int }, options);
			}).not.toThrow();
	});
	it("don't throw with int,date,str yAxis.",function(){
		expect(function(){
			render_test({ series_cnt:1, values_cnt:30, y:ccd3t.sequence_int, x:ccd3t.random_walk_int }, options);
			render_test({ series_cnt:3, values_cnt:30, y:ccd3t.sequence_date, x:ccd3t.random_walk_int }, options);
			render_test({ series_cnt:3, values_cnt:10, y:ccd3t.sequence_str, x:ccd3t.random_walk_int }, options);
			}).not.toThrow();
	});
});

describe("Bubble charts", function(){
	var cond;
	var options = {
		width:360,height:360,
		default_series_type: "bubble"
	};
	it("don't throw with various Axis",function(){
		create_section("Bubble Chart Tests");
		expect(function(){
			render_test({ series_cnt:1, values_cnt:30, x:ccd3t.sequence_int, y:ccd3t.random_walk_int, z:ccd3t.random_int }, options);
			render_test({ series_cnt:3, values_cnt:10, x:ccd3t.sequence_date, y:ccd3t.random_walk_int, z:ccd3t.random_int }, options);
			render_test({ series_cnt:1, values_cnt:25, x:ccd3t.matrix_x_int, y:ccd3t.matrix_y_int, z:ccd3t.random_int }, options);
			render_test({ series_cnt:1, values_cnt:36, x:ccd3t.matrix_x_str, y:ccd3t.matrix_y_str, z:ccd3t.random_int }, options);
			}).not.toThrow();
	});
});

describe("Heatmap charts", function(){
	var cond;
	var options = {
		width:360,height:360,
		series_options: { heatmap: { high_color:"green", low_color:"white" } },
		default_series_type: "heatmap"
	};
	it("don't throw with various Axis",function(){
		create_section("Heatmap Chart Tests");
		expect(function(){
			render_test({ series_cnt:1, values_cnt:25, x:ccd3t.matrix_x_int, y:ccd3t.matrix_y_int, z:ccd3t.random_int }, options);
			render_test({ series_cnt:1, values_cnt:100, x:ccd3t.matrix_x_str, y:ccd3t.matrix_y_str, z:ccd3t.random_int }, options);
			}).not.toThrow();
	});
});

describe("Pie charts", function(){
	var cond;
	var options = {
		width:360,height:360,
		default_series_type: "pie"
	};
	it("don't throw with int,str xAxis.",function(){
		create_section("Pie Chart Tests");
		expect(function(){
			render_test({ series_cnt:1, values_cnt:5, x:ccd3t.sequence_int, y:ccd3t.random_int }, options);
			options.title = { text:"Title Test" };
			render_test({ series_cnt:1, values_cnt:10, x:ccd3t.sequence_str, y:ccd3t.random_int }, options);
			}).not.toThrow();
	});
});

describe("Radar charts", function(){
	var cond;
	var options = {
		width:360,height:360,
		default_series_type: "radar"
	};
	it("don't throw with int,str xAxis.",function(){
		create_section("Radar Chart Tests");
		expect(function(){
			render_test({ series_cnt:1, values_cnt:5, x:ccd3t.sequence_int, y:ccd3t.random_int }, options);
			options.title = { text:"Title Test" };
			render_test({ series_cnt:3, values_cnt:10, x:ccd3t.sequence_str, y:ccd3t.random_int }, options);
			}).not.toThrow();
	});
});

describe("Labels", function(){
	var cond = {
		series_cnt:6,
		values_cnt:10,
		x:ccd3t.sequence_str,
		y:ccd3t.random_int 
	};
	var options = {
		width:360,height:360,
		default_series_type: "line"
	};
	it("don't throw.",function(){
		create_section("Label Tests");
		expect(function(){
			render_test( cond, options);
			options.title = { text:"Title Test" };
			render_test( cond, options);
			options.xLabel = { text:"xLabel Test" };
			options.yLabel = { text:"yLabel Test" };
			render_test( cond, options);
			}).not.toThrow();
	});
});


describe("When updating dataset, ", function(){
	var cond,chart,generator;
	var options = {
		width:360,height:360
	};
	it("Scatter chart don't throw.",function(){
		create_section("Chart Updating Tests");
		expect(function(){
			options.default_series_type = "scatter";
			cond = { series_cnt:3, values_cnt:5, x:ccd3t.sequence_str, y:ccd3t.random_int };
			chart = render_test(cond, options);
			generator = new ccd3t.DatasetGenerator(cond);
			cond.series_cnt = 5;
			chart.set_dataset(generator.generate(cond)); 
			cond.series_cnt = 2;
			chart.set_dataset(generator.generate(cond));
		}).not.toThrow();
	});
	it("Bar chart don't throw.",function(){
		create_section("Chart Updating Tests");
		expect(function(){
			options.default_series_type = "bar";
			cond = { series_cnt:3, values_cnt:5, x:ccd3t.sequence_str, y:ccd3t.random_int };
			chart = render_test(cond, options);
			generator = new ccd3t.DatasetGenerator(cond);
			cond.series_cnt = 5;
			chart.set_dataset(generator.generate(cond)); 
			chart.render();
			cond.series_cnt = 2;
			chart.set_dataset(generator.generate(cond));
			chart.render();
		}).not.toThrow();
	});
	it("StackedBar chart don't throw.",function(){
		expect(function(){
			options.default_series_type = "stackedbar";
			cond = { series_cnt:3, values_cnt:5, x:ccd3t.sequence_str, y:ccd3t.random_int };
			chart = render_test(cond, options);
			generator = new ccd3t.DatasetGenerator(cond);
			cond.series_cnt = 5;
			chart.set_dataset(generator.generate(cond)); 
			chart.render();
			cond.series_cnt = 2;
			chart.set_dataset(generator.generate(cond));
			chart.render();
		}).not.toThrow();
	});
	it("Line chart don't throw.",function(){
		expect(function(){
			options.default_series_type = "line";
			cond = { series_cnt:3, values_cnt:5, x:ccd3t.sequence_str, y:ccd3t.random_int };
			chart = render_test(cond, options);
			generator = new ccd3t.DatasetGenerator(cond);
			cond.series_cnt = 5;
			chart.set_dataset(generator.generate(cond)); 
			chart.render();
			cond.series_cnt = 2;
			chart.set_dataset(generator.generate(cond));
			chart.render();
		}).not.toThrow();
	});
	it("Bubble chart don't throw.",function(){
		expect(function(){
			options.default_series_type = "bubble";
			cond = { series_cnt:3, values_cnt:5, x:ccd3t.sequence_str, y:ccd3t.random_int, z:ccd3t.random_int };
			chart = render_test(cond, options);
			generator = new ccd3t.DatasetGenerator(cond);
			cond.series_cnt = 5;
			chart.set_dataset(generator.generate(cond)); 
			chart.render();
			cond.series_cnt = 2;
			chart.set_dataset(generator.generate(cond));
			chart.render();
		}).not.toThrow();
	});
	it("Heatmap chart don't throw.",function(){
		expect(function(){
			options.default_series_type = "heatmap";
			cond = { series_cnt:1, values_cnt:25, x:ccd3t.matrix_x_int, y:ccd3t.matrix_y_int, z:ccd3t.random_int };
			chart = render_test(cond, options);
			cond.values_cnt = 36;
			generator = new ccd3t.DatasetGenerator(cond);
			chart.set_dataset(generator.generate(cond)); 
			chart.render();
		}).not.toThrow();
	});
	it("Pie chart don't throw.",function(){
		expect(function(){
			options.default_series_type = "pie";
			cond = { series_cnt:1, values_cnt:5, x:ccd3t.random_str, y:ccd3t.random_int };
			chart = render_test(cond, options);
			cond.values_cnt = 3;
			generator = new ccd3t.DatasetGenerator(cond);
			chart.set_dataset(generator.generate(cond)); 
			chart.render();
		}).not.toThrow();
	});
	it("Radar chart don't throw",function(){
		expect(function(){
			options.default_series_type = "radar";
			cond = { series_cnt:3, values_cnt:5, x:ccd3t.sequence_str, y:ccd3t.random_int };
			chart = render_test(cond, options);
			generator = new ccd3t.DatasetGenerator(cond);
			cond.series_cnt = 5;
			chart.set_dataset(generator.generate(cond)); 
			chart.render();
			cond.series_cnt = 2;
			chart.set_dataset(generator.generate(cond)); 
			chart.render();
		}).not.toThrow();
	});
});

describe("When use xhr_load,", function(){
	var cond;
	var options = {
		width:360,height:360,
		default_series_type: "radar"
	};
	it("chart don't throw.",function(){
		create_section("XHR Loading Tests");
		expect(function(){
			var chart = create_chart();
			chart.loader.base_url = "./data_source/static/sample.json";
			chart.default_series_type = "line";
			chart.loader.xhr_load();
			chart.loader.base_url = "./data_source/static/sample2.json";
			chart.loader.xhr_load();
			chart.loader.base_url = "./data_source/static/sample3.json";
			chart.loader.xhr_load();
		}).not.toThrow();
	});
	it("chart can setup_url.",function(){
		var chart = create_chart();
		chart.loader.base_url = "./test_url";
		chart.loader.url_params = {a:1,b:2};
		expect(chart.loader.setup_url()).toBe("./test_url?a=1&b=2");
		expect(chart.loader.setup_url({c:3,d:4})).toBe("./test_url?a=1&b=2&c=3&d=4");
		expect(chart.loader.setup_url({a:5,c:6})).toBe("./test_url?a=5&b=2&c=6&d=4");
		expect(chart.loader.setup_url({a:null,d:null})).toBe("./test_url?b=2&c=6");
		expect(chart.loader.setup_url({a:7})).toBe("./test_url?a=7&b=2&c=6");
	});
});


