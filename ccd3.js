/**
ccd3

Copyright (c) 2014 Masafumi.OSOGOE

This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php
*/

// for JSHint
/* global d3 */
/* exported ccd3 */

/* ================================================================== */
/*  ccd3 definition                                                   */
/* ================================================================== */
var ccd3 = function(){
	"use strict";
	
	var ccd3 = {
		version: "0.9.6"
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3 globals                                                      */
	/* ------------------------------------------------------------------ */

	ccd3.instances = {};
	ccd3.get_instance = function(t){
		if(typeof t === "string"){
			// by div id
			return ccd3.instances[t];
		}else{
			// by DOM element
			return ccd3.instances[d3.select(t.farthestViewportElement).attr("id").replace(/^svg_/g,"")];
		}
	};
	
	ccd3.env = {};
	ccd3.env.isIE = (function(){
		return (window.navigator.userAgent.toLowerCase().indexOf('msie') != -1)? true:false;
	})();
	
	ccd3.options = {};
	ccd3.options.echo_script = "server/echo_csv.php"; // use .php or .py or .rb
	// get script's own path
	ccd3.options.ccd3_path = (function(){
		var scripts=document.getElementsByTagName('script');
		var src = scripts[scripts.length-1].src;
		var paths = src.split("/");
		if(paths.length==1){ return src; }
		paths[paths.length-1] = "";
		return paths.join("/");
	})();
	// for CSV download function
	ccd3.options.csv_echo_path = function(){
		return ccd3.options.ccd3_path + ccd3.options.echo_script;
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Charts                                                       */
	/* ------------------------------------------------------------------ */

	ccd3.Chart = function(div_id,dataset){
		this.div_id = div_id;
		ccd3.instances[div_id] = this;
		
		// ccd3.Parts holder
		this.series_container = {};
		this.title = {};
		this.xLabel = {};
		this.yLabel = {};
		this.xAxis = {};
		this.yAxis = {};
		this.rAxis = {};
		this.aAxis = {};
		this.legend = { show:true };
		this.tooltip = { show:true };
		this.menu = { show:true };
		this.zoom = { use:true };
		this.event_layer = {};
		this.series = [];
		this.series_options = {};
		for (var key in ccd3.Parts.Series.type_info()) {
			this.series_options[key] = {};
		}
		
		// ccd3.DatasetManager holder
		this.dataset_manager = {};
		
		// ccd3.Chart options
		this.initialized = false;
		this.color_palette = undefined;
		this.height = 320;
		this.width = 480;
		this.auto_resize = false;
		this.chart_pattern = undefined;
		this.direction = undefined;
		this.show_values = "onzoom"; // always, onzoom
		this.zoomed = false;
		this.default_series_type = "scatter";
		this.stack_type = "zero"; // use as args of stack.offset
		
		// ccd3.DatasetLoader
		this.loader = new ccd3.DatasetLoader(this);
		
		if(dataset!==undefined){
			this.dataset = dataset;
		}
		
	};
	
	ccd3.Chart.prototype.setup_options = function(options){
		return ccd3.Util.merge(this,options);
	};
		
	ccd3.Chart.prototype.set_dataset = function(dataset){
		this.dataset = dataset;
		this.initialized = false;
	};
	
	ccd3.Chart.prototype.resize = function(){
		this.width = (d3.select("#"+this.div_id)[0][0].clientWidth || this.width);
		//this.height = (d3.select("#"+this.div_id)[0][0].clientHeight || this.height); tmp
		this.initialized = false;
	};
	
	ccd3.Chart.prototype.render = function(cond){
		if(cond === undefined){ cond = {}; }
		
		if(this.auto_resize){
			this.resize();
			var that = this;
			d3.select(window).on("resize."+this.div_id,function(){
				that.resize();
				that.render({ dont_recalc_dataset:true, dont_reset_domain:true });
			});
		}
		
		if(!this.initialized){
			this.init(cond);
		}
		
		if(!cond.dont_recalc_dataset){
			this.dataset_manager.build_lookup_table("x");
			this.dataset_manager.build_lookup_table("y");
			this.dataset_manager.update_stack_values(this.direction,this.stack_type);
		}
		
		var top_margin,right_margin;
		if(this.chart_pattern === "xy"){
			if(!cond.dont_reset_domain){
				this.xAxis.reset_domain();
				this.yAxis.reset_domain();
			}
			this.xAxis.reset_range(this.inner_width);
			this.yAxis.reset_range(this.inner_height);
			this.xAxis.render();
			this.yAxis.render();
			
			right_margin = 10;
			this.inner_width = this.width - this.yLabel.sizeof("width") - this.yAxis.sizeof("label_width") - right_margin;
			
			top_margin = 23;
			if(this.title.sizeof("height") < top_margin){
				this.title.height = top_margin;
			}
			
			// call after fixed inner_width
			this.legend.render(this.inner_width);
			this.legend.arrange(
				this.yAxis.sizeof("label_width") + this.yLabel.sizeof("width"),
				this.title.sizeof("height")
			);
			
			this.inner_height = this.height - this.title.sizeof("height") - this.legend.sizeof("height") - 
				this.xAxis.sizeof("label_height") - this.xLabel.sizeof("height");
			
			this.xAxis.arrange(
				this.yLabel.sizeof("width") + this.yAxis.sizeof("label_width"), 
				this.height - this.xAxis.sizeof("label_height") - this.xLabel.sizeof("height")
			);
			this.yAxis.arrange(
				this.yLabel.sizeof("width") + this.yAxis.sizeof("label_width"), 
				this.title.sizeof("height") + this.legend.sizeof("height")
			);
			
			this.series_container.render(this.inner_width,this.inner_height);
			this.series_container.arrange(
				this.yLabel.sizeof("width") + this.yAxis.sizeof("label_width"), 
				this.title.sizeof("height") + this.legend.sizeof("height")
			);
			
			// must call after SeriesContainer setup
			this.event_layer = new ccd3.Parts.EventLayer(this,this.event_layer);
			this.event_layer.render();
			
			// must call after EventLayer setup
			if(!(this.zoom instanceof ccd3.Parts)){
				if(this.zoom.use && !(this.xAxis.scale_type === "ordinal" || this.yAxis.scale_type === "ordinal")){
					this.zoom = new ccd3.Parts.Zoom(this,this.zoom);
				}
			}
			
			this.xAxis.reset_range(this.inner_width);
			this.yAxis.reset_range(this.inner_height);
			this.yAxis.render();
			this.xAxis.render();
		
		}else if(this.chart_pattern === "ra"){
			top_margin = 23;
			if(this.title.sizeof("height") < top_margin){
				this.title.height = top_margin;
			}
			
			var legend_width = Math.min(this.height,this.width);
			this.legend.render(legend_width);
			
			this.inner_width = this.width;
			this.inner_height = this.height - this.title.sizeof("height") - this.legend.sizeof("height");
			var radius = Math.min(this.inner_height,this.inner_width)/2;
			this.title.arrange(this.width/2, (this.inner_height-radius*2)/2);
			this.legend.arrange(
				(this.width - legend_width)/2,
				(this.inner_height-radius*2)/2 + this.title.sizeof("height")
			);
			
			if(!cond.dont_reset_domain){
				this.rAxis.reset_domain();
				this.aAxis.reset_domain();
			}
			this.rAxis.reset_range(radius);
			this.aAxis.reset_range(radius);
			this.rAxis.render();
			this.aAxis.render();
			
			this.series_container.render(this.inner_width,this.inner_height);
			this.series_container.arrange(
				0,
				this.title.sizeof("height") + this.legend.sizeof("height")
			);
			this.rAxis.arrange(
				this.inner_width/2,
				this.inner_height/2 + this.title.sizeof("height") + this.legend.sizeof("height")
			);
			this.aAxis.arrange(
				this.inner_width/2,
				this.inner_height/2 + this.title.sizeof("height") + this.legend.sizeof("height")
			);

		}else if(this.chart_pattern === "r"){
			this.inner_width = this.width;
			this.inner_height = this.height - this.title.sizeof("height");
			this.series_container.render(this.inner_width,this.inner_height);
			this.series_container.arrange(
				0,
				this.title.sizeof("height")
			);
		}
		
		// must call after Axis,EventLayer setup
		if(!(this.tooltip instanceof ccd3.Parts)){
			if(this.tooltip.show){
				this.tooltip = new ccd3.Parts.Tooltip(this,this.tooltip);
			}else{
				this.tooltip.add_listener = function(){};
			}
		}
		this.render_series();
		this.menu.render();
		
		if(this.zoom instanceof ccd3.Parts && this.zoomed){
			this.zoom.rearrange_reset_button();
		}
	};
	
	ccd3.Chart.prototype.sort_domain = function(sort_axis, cond_axis, asc){
		var domain = this[sort_axis+"Axis"].scale.domain();
		var weights = this.dataset_manager.get_axis_sum(sort_axis, cond_axis);
		domain.sort(function(a,b){
			return (weights[b] - weights[a]) * ((asc)? -1:1);
		});
		this[sort_axis+"Axis"].scale.domain(domain);
		this.render({dont_reset_domain:true});
	};
	
	ccd3.Chart.prototype.init = function(cond){
		if(!this.color_palette){
			// this.color_palette = d3.scale.category10().range();
			// http://flatuicolors.com/
			this.color_palette = ["#3498db","#e74c3c","#2ecc71","#f1c40f","#e67e22","#1abc9c",
				"#2980b9","#c0392b","#27ae60","#f39c12","#d35400","#16a085"];
		}
		
		if(!cond.dont_recalc_dataset){
			if(!(this.dataset_manager instanceof ccd3.DatasetManager)){
				this.dataset_manager = new ccd3.DatasetManager(this, this.dataset_manager);
			}
			this.dataset = this.dataset_manager.setup(this.dataset);
			// must execute before execute this.init_parts()
			this.setup_options(this.dataset_manager.options_from_dataset());
			this.chart_pattern = this.dataset_manager.detect_chart_pattern();
		}
		
		if(this.svg===undefined){
			this.svg = d3.select("#"+this.div_id)
				.append("svg")
				.attr("id","svg_"+this.div_id)
				.attr("class","ccd3")
				.attr("overflow","hidden") // for IE
				;
		}
		this.svg
			.attr("width",this.width)
			.attr("height",this.height)
			;

		this.inner_width = this.width;
		this.inner_height = this.height;
		
		this.init_parts();
		
		this.title.render();
		this.title.arrange(this.width/2,this.title.margin_top);
		
		if(this.chart_pattern === "xy"){
			this.xLabel.render();
			this.yLabel.render();
			this.xLabel.arrange(this.width/2,this.height - this.xLabel.text_height - this.xLabel.margin_bottom);
			this.yLabel.arrange(this.yLabel.margin_left,this.height/2);
			
			// calc_min_step return undefined if series has only one data.
			this.xAxis.scale_type = this.dataset_manager.detect_scale_type(function(d){return d.x;});
			this.xAxis.min_step = this.dataset_manager.calc_min_step(function(d){return d.x;}) || 2.0;
			this.yAxis.scale_type = this.dataset_manager.detect_scale_type(function(d){return d.y;});
			this.yAxis.min_step = this.dataset_manager.calc_min_step(function(d){return d.y;}) || 2.0;
			
			var series_directive = this.dataset_manager.has_directive_series_type();
			if(!series_directive && this.yAxis.scale_type === "linear" && this.xAxis.scale_type === "linear"){
				this.direction = null;
			}else if(this.yAxis.scale_type === "ordinal" || this.yAxis.scale_type === "date"){
				this.direction = "y";
			}else{
				this.direction = "x";
			}
			
			this.xAxis.init_scale();
			this.yAxis.init_scale();

			var z_scale_type = this.dataset_manager.detect_scale_type(function(d){return d.z;});
			var series_sortable = this.dataset_manager.has_single_series_type("bar") || this.dataset_manager.has_single_series_type("stackedbar") || this.dataset_manager.has_single_series_type("heatmap");
			if(this.xAxis.scale_type == "ordinal" && series_sortable){
				if(this.yAxis.scale_type === "linear"){
					this.menu.add_menu({
						func: function(data){
							this.sort_domain("x","y",data.asc);
							data.asc = !(data.asc);
						},label: "Sort X By Y"},"sort_x_by_y"
					);
				}
				if(z_scale_type === "linear"){
					this.menu.add_menu({
						func: function(data){
							this.sort_domain("x","z",data.asc);
							data.asc = !(data.asc);
						},label: "Sort X By Z"},"sort_x_by_z"
					);
				}
			}
			if(this.yAxis.scale_type == "ordinal" && series_sortable){
				if(this.xAxis.scale_type === "linear"){
					this.menu.add_menu({
						func: function(data){
							this.sort_domain("y","x",data.asc);
							data.asc = !(data.asc);
						},label: "Sort Y By X"},"sort_y_by_x"
					);
				}
				if(z_scale_type === "linear"){
					this.menu.add_menu({
						func: function(data){
							this.sort_domain("y","z",data.asc);
							data.asc = !(data.asc);
						},label: "Sort Y By Z"},"sort_y_by_z"
					);
				}
			}
			
		}else if(this.chart_pattern === "r"){
			this.menu.add_menu({
				func: function(data){
					if(this.series[0].sort === undefined || this.series[0].sort == "asc"){
						this.series[0].sort = "desc";
					}else{
						this.series[0].sort = "asc";
					}
					this.render({dont_reset_domain:true});
				},label: "Sort"},"sort"
			);
		}else if(this.chart_pattern === "ra"){
			this.rAxis.init_scale();
			this.aAxis.init_scale();
		}
		
		// switch false if you want to re-render labels
		this.initialized = true;
	};
	
	ccd3.Chart.prototype.init_parts = function(){
		if(!(this.series_container instanceof ccd3.Parts)){
			this.series_container = new ccd3.Parts.SeriesContainer(this,this.series_container);
		}
		
		if(!(this.title instanceof ccd3.Parts)){
			if(this.title.text===undefined){
				this.title = new ccd3.Parts(this,this.title);
			}else{
				this.title = new ccd3.Parts.Label.Title(this,this.title);
			}
		}
		
		if(!(this.menu instanceof ccd3.Parts)){
			if(this.menu.show){
				this.menu = new ccd3.Parts.Menu(this,this.menu);
			}else{
				this.menu = new ccd3.Parts(this,this.menu);
				this.menu.add_menu = function(){};
			}
		}
	
		if(this.chart_pattern === "xy"){
			if(!(this.xLabel instanceof ccd3.Parts)){
				if(this.xLabel.text===undefined){
					this.xLabel = new ccd3.Parts(this,this.xLabel);
				}else{
					this.xLabel = new ccd3.Parts.Label.xLabel(this,this.xLabel);
				}
			}
			if(!(this.yLabel instanceof ccd3.Parts)){
				if(this.yLabel.text===undefined){
					this.yLabel = new ccd3.Parts(this,this.yLabel);
				}else{
					this.yLabel = new ccd3.Parts.Label.yLabel(this,this.yLabel);
				}
			}
			if(!(this.xAxis instanceof ccd3.Parts)){
				this.xAxis = new ccd3.Parts.Axis.xAxis(this,this.xAxis);
			}
			if(!(this.yAxis instanceof ccd3.Parts)){
				this.yAxis = new ccd3.Parts.Axis.yAxis(this,this.yAxis);
			}
			if(!(this.lgend instanceof ccd3.Parts)){
				if(this.legend.show){
					this.legend = new ccd3.Parts.Legend(this,this.legend);
				}else{
					this.legend = new ccd3.Parts(this,this.legend);
				}
			}
		}else if(this.chart_pattern === "ra"){
			if(!(this.rAxis instanceof ccd3.Parts)){
				this.rAxis = new ccd3.Parts.rAxis(this,this.rAxis);
			}
			if(!(this.aAxis instanceof ccd3.Parts)){
				this.aAxis = new ccd3.Parts.aAxis(this,this.aAxis);
			}
			if(!(this.lgend instanceof ccd3.Parts)){
				if(this.legend.show){
					this.legend = new ccd3.Parts.Legend(this,this.legend);
				}else{
					this.legend = new ccd3.Parts(this,this.legend);
				}
			}
		}
	};
	
	ccd3.Chart.prototype.render_series = function(){
		var dataset = this.dataset;
		var num,i;
		var dataset_num,series_num;
		var type_info = ccd3.Parts.Series.type_info();
		
		dataset_num = this.dataset.length;
		series_num = this.series.length;
		num = Math.max(dataset_num, series_num);
		for(i=0;i<num;i++){
			if(i<dataset_num){
				if(!(this.series[i] instanceof ccd3.Parts.Series)){
					// create ccd3.Parts.Series
					this.series[i] = new (type_info[dataset[i].series_type].obj)(this,this.series_options[dataset[i].series_type]);
				}
				this.series[i].init_svg(this.dataset[i]);
			}else{
				this.series[i].destroy();
			}
		}
		this.series.length = dataset_num; // cut down unnecessary series
		this.series_container.svg.selectAll(".ccd3_series").sort(); // sorting layer
		
		// bar series
		var bar_cnt = 0;
		for(i=0;i<dataset_num;i++){
			if(dataset[i].series_type==="bar" && dataset[i].visible){
				bar_cnt++;
			}
		}
		var bar_pos = 0;
		for(i=0;i<dataset_num;i++){
			if(dataset[i].series_type==="bar"){
				this.series[i].render(bar_cnt,bar_pos);
				if(dataset[i].visible){ bar_pos++;}
			}
		}
		
		// not bar series
		for(i=0;i<dataset_num;i++){
			if(dataset[i].series_type!=="bar"){
				this.series[i].render();
			}
		}
	};
	
	ccd3.Chart.prototype.destroy = function(){
		d3.select("#"+this.div_id)
			.selectAll("*").remove();
		d3.select("#tooltip_"+this.div_id).remove();
	};

	ccd3.Chart.prototype._color = function(i){
		return this.color_palette[i%this.color_palette.length];
	};
	

	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts                                                        */
	/* ------------------------------------------------------------------ */

	ccd3.Parts = function(chart,options){
		this.init(chart,options);
	};
	ccd3.Parts.prototype.get_defaults = function(){
		return {
			arrange_x: null,
			arrange_y: null
		}; 
	};
	ccd3.Parts.prototype.init = function(chart,options){
		var prop;
		var defaults = this.get_defaults();
		
		this.chart = chart;
		// copy properties to this
		for(prop in options){
			if(options.hasOwnProperty(prop)){
				this[prop] = options[prop];
			}
		}
		// copy default-properties
		for(prop in defaults){
			if(!this.hasOwnProperty(prop)){
				this[prop] = defaults[prop];
			}
		}
	};
	ccd3.Parts.prototype.render = function(){};
	ccd3.Parts.prototype.sizeof = function(prop){
		if(isNaN(this[prop])){
			return 0;
		}else{
			return this[prop];
		}
	};
	ccd3.Parts.prototype.arrange = function(x,y){
		if(this.svg){
			this.arrange_x = x;
			this.arrange_y = y;
			this.svg.attr("transform", "translate(" + x + "," + y + ")");
		}
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.SeriesContainer                                        */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.SeriesContainer = function(){ ccd3.Parts.apply(this,arguments); };
	ccd3.Parts.SeriesContainer.prototype = new ccd3.Parts();
	ccd3.Parts.SeriesContainer.prototype.get_defaults = function(){
		return {
			height: 0,
			width: 0
		};
	};
	ccd3.Parts.SeriesContainer.prototype.render = function(width,height){
		this.width = width;
		this.height = height;
		
		if(!this.svg){
			this.svg = this.chart.svg
				.append("g")
				.attr("class","ccd3_series_container")
				.attr("clip-path","url(#"+this.chart.div_id+"_clip)")
				;
			
			// clip path
			this.clip_path = this.chart.svg
				.append("defs")
				.append("clipPath")
				.attr("id", this.chart.div_id+"_clip")
				;
			this.clip_path.append("rect");
		}
		this.svg
			.attr("width",this.width)
			.attr("height",this.height)
			;
		this.clip_path
			.select("rect")
			.attr("width",this.width)
			.attr("height",this.height)
			;
	};


	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Label                                                  */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.Label = function(){ ccd3.Parts.apply(this,arguments); };
	ccd3.Parts.Label.prototype = new ccd3.Parts();
	ccd3.Parts.Label.prototype.get_defaults = function(){
		return {
			class_name: "ccd3_label",
			text: null,
			text_anchor: "middle",
			rotate: 0,
			font_size: 10,
			margin_top: 3,
			margin_bottom: 3,
			margin_right: 3,
			margin_left: 3,
			text_height: 0,
			text_width: 0,
			height: 0,
			width: 0
		};
	};
	ccd3.Parts.Label.prototype.render = function(){
		if(this.svg === undefined){
			this.svg = this.chart.svg.append("g");
			this.svg
				.attr("class",this.class_name)
				.append("text")
				.attr("text-anchor",this.text_anchor);
		}
		this.svg.select("text")
			.text(this.text)
			.attr("font-size",this.font_size)
			.attr("transform","translate(0,"+this.font_size+") rotate("+this.rotate+")");
		
		this.text_height = this.svg[0][0].getBBox().height;
		this.text_width = this.svg[0][0].getBBox().width;
		this.height = this.text_height + this.margin_bottom + this.margin_top;
		this.width = this.text_width + this.margin_right + this.margin_left;
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Label.Title                                            */
	/* ------------------------------------------------------------------ */
	
	ccd3.Parts.Label.Title = function(){ ccd3.Parts.Label.apply(this,arguments); };
	ccd3.Parts.Label.Title.prototype = new ccd3.Parts.Label();
	ccd3.Parts.Label.Title.prototype.get_defaults = function(){
		return {
			class_name: "ccd3_title",
			font_size: 18,
			margin_bottom: 5
		};
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Label.xLabel                                           */
	/* ------------------------------------------------------------------ */
	
	ccd3.Parts.Label.xLabel = function(){ ccd3.Parts.Label.apply(this,arguments); };
	ccd3.Parts.Label.xLabel.prototype = new ccd3.Parts.Label();
	ccd3.Parts.Label.xLabel.prototype.get_defaults = function(){
		return {
			class_name: "ccd3_xLabel",
			margin_bottom: 10,
			font_size: 10
		};
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Label.yLabel                                           */
	/* ------------------------------------------------------------------ */
	
	ccd3.Parts.Label.yLabel = function(){ ccd3.Parts.Label.apply(this,arguments); };
	ccd3.Parts.Label.yLabel.prototype = new ccd3.Parts.Label();
	ccd3.Parts.Label.yLabel.prototype.get_defaults = function(){
		return {
			class_name: "ccd3_yLabel",
			margin_left: 10,
			font_size: 10,
			rotate: 90
		};
	};

	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Legend                                                 */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.Legend = function(){ ccd3.Parts.apply(this,arguments); };
	ccd3.Parts.Legend.prototype = new ccd3.Parts();
	ccd3.Parts.Legend.prototype.get_defaults = function(){
		return {
			show: true,
			font_size: 10,
			margin_top: 1,
			margin_bottom: 1,
			margin_left: 5,
			margin_right: 5,
			legend_height: 0,
			height: 0
		};
	};
	ccd3.Parts.Legend.prototype.render = function(width){
		var dataset = this.chart.dataset;
		var that = this;
		this.width = width;
		
		var data = [];
		for(var i=0,length=dataset.length;i<length;i++){
			data.push(dataset[i].series_num);
		}
		
		if(this.svg===undefined){
			this.svg = this.chart.svg.append("g").attr("class","ccd3_legend");
		}
		
		var items = this.svg.select(".legend_items");
		if(items.empty()){
			items = this.svg.append("g").attr("class","legend_items");
		}
		
		// data join
		var item = items.selectAll("g").data(data);
		
		// enter
		item.enter().append("g")
			.attr("class","legend_item")
			.attr("id",function(d){ return "legend_item_"+d; })
			.attr("cursor","pointer")
			.on("click",function(){
				var series_num = d3.select(this).data();
				that.toggle_series(series_num);
			})
			.on("mouseover",function(){
				var series_num = d3.select(this).data();
				that.chart.series[series_num].highlight_series(true);
			})
			.on("mouseout",function(){
				var series_num = d3.select(this).data();
				that.chart.series[series_num].highlight_series(false);
			})
			.call(function(s){
				s.append("rect")
				.attr("height","0.6em")
				.attr("width","0.6em")
				.attr("fill",function(d){ return that.chart._color(d); })
				.attr("y","0.2em")
				.attr("x","0.0em")
				.attr("font-size",that.font_size)
				;
			})
			.call(function(s){
				s
				.append("text")
				//.text(function(d,i){ return dataset[i].name; })
				.attr("y","0.8em")
				.attr("x","0.8em")
				.attr("font-size",that.font_size)
				;
			})
			;
		// update
		item.select("rect")
			.attr("visibility",function(d,i){
				return (dataset[i].visible)? "visible" : "hidden";
			});
		item.select("text")
			.text(function(d,i){ return dataset[i].name; });
		
		var x_pos = 0;
		var y_pos = 0;
		var x_pos_max = width;
		item.attr("transform",function(){
				var this_height = this.getBBox().height;
				var prev_width = (this.previousSibling)? this.previousSibling.getBBox().width:0;
				if(x_pos + (prev_width + that.margin_right)*2 < x_pos_max){
					x_pos += prev_width + that.margin_right;
				}else{
					x_pos = that.margin_right;
					y_pos += this_height;
				}
				return "translate(" + x_pos + ","+ y_pos + ")";
			});
		
		// exit
		item.exit().remove();
		
		this.legend_height = this.svg[0][0].getBBox().height;
		this.height = this.legend_height + this.margin_top + this.margin_bottom;
		
	};
	ccd3.Parts.Legend.prototype.toggle_series = function(series_num){
		var dataset = this.chart.dataset;
		dataset[series_num].visible = !dataset[series_num].visible;
		
		// reset zoomed
		this.chart.svg.selectAll(".ccd3_zoom_reset_button").remove();
		this.chart.zoomed = false;
		
		//this.chart.render({ dont_reset_domain:true  });
		this.chart.render();
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Tooltip                                                */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.Tooltip = function(){ 
		ccd3.Parts.apply(this,arguments);
		this.render();
	};
	ccd3.Parts.Tooltip.prototype = new ccd3.Parts();
	ccd3.Parts.Tooltip.prototype.get_defaults = function(){
		return {
			show: true,
			axis_scan: true,
			show_scan_line: true,
			scan_line_width: 3,
			font_size: 10,
			xFormat: undefined,
			yFormat: undefined,
			zFormat: undefined
		};
	};
	ccd3.Parts.Tooltip.prototype.render = function(){
		if(this.div!==undefined) return;
		var that = this;
		
		// initialize format	
		this.xFormat = this.xFormat || this.chart.xAxis.format || this.chart.aAxis.format;
		this.yFormat = this.yFormat || this.chart.yAxis.format || this.chart.rAxis.format;
		
		//this.tooltip.div = d3.select("#"+this.div_id)
		this.div = d3.select("body")
			.append("div")
			.attr("id", "tooltip_"+this.chart.div_id)
			.attr("class", "ccd3_tooltip")
			.style("opacity", 0);
		this.svg = this.div;
		
		if(this.font_size){
			this.div.style("font-size",this.font_size+"px");
		}
		
		if(this.chart.event_layer.svg  && this.axis_scan &&
				(this.chart.direction == "x" || this.chart.direction == "y")){
			this.chart.event_layer.svg.call(this.add_axis_tooltip_listener,this);
			if(this.show_scan_line){
				this.chart.event_layer.svg
					.insert("rect",".ccd3_zoom")  // use insert not to prevent zoom
					.attr("visibility","none")
					.attr("class","ccd3_axis_scan_line")
					.attr("fill","gray")
					.attr("opacity", 0.2)
					;
			}
		}
	};
	ccd3.Parts.Tooltip.prototype.add_listener = function(e,that){
		e.on("mouseover.tooltip",function(d){
			var series_num = d3.select(this.parentNode).data()[0] % 1000; // magic number 1000
			that.div
				.html(that.chart.series[series_num].tooltip_html(d))
				.style("display",null)
				//.transition().duration(300)
				.style("opacity", 0.8)
				;
		});
		e.on("mouseout.tooltip",function(){
			ccd3.get_instance(this).tooltip.div
				//.transition().duration(300)
				.style("opacity", 0)
				.style("display","none")
				;
		});
		e.on("mousemove.tooltip",function(){
			ccd3.get_instance(this).tooltip.div
				.style("top", (d3.event.pageY-10)+"px")
				.style("left",(d3.event.pageX+15)+"px")
				;
		});
	};
	ccd3.Parts.Tooltip.prototype.add_axis_tooltip_listener = function(e,that){
		var prev_data_x,prev_data_y;
		e.on("mouseover.axis_tooltip",function(d){
			that.chart.tooltip.div
				.style("display",null)
				.style("opacity", 0.8)
				;
			that.chart.event_layer.svg.select(".ccd3_axis_scan_line").attr("visibility","visible");
			prev_data_x = null;
			prev_data_y = null;
		});
		e.on("mouseout.axis_tooltip",function(){
			ccd3.get_instance(this).tooltip.div
				.style("opacity", 0)
				.style("display","none")
				;
			for(var i=0;i<that.chart.series.length;i++){
				that.chart.series[i].highlight({}); // turn off highlight
			}
			that.chart.event_layer.svg.select(".ccd3_axis_scan_line").attr("visibility","hidden");
			prev_data_x = null;
			prev_data_y = null;
		});
		if(that.chart.direction == "x"){
			e.on("mousemove.axis_tooltip",function(){
				// search nearest data 
				var xAxis = that.chart.xAxis;
				var d3mouse = d3.mouse(that.chart.event_layer.svg[0][0]);
				var mouse_x = d3mouse[0];
				var mouse_y = d3mouse[1];
				if(ccd3.env.isIE){ // IE problem ...
					mouse_x = d3.event.offsetX;
					mouse_y = d3.event.offsetY;
				}
				var data_x,i,band_width;
				if(xAxis.scale_type == "ordinal"){
					var left_edges = xAxis.scale.range();
					band_width = xAxis.scale.rangeBand();
					for(i=0; mouse_x > (left_edges[i] + band_width); i++) {}
					data_x = xAxis.scale.domain()[i];
				}else{
					data_x = xAxis.scale.invert(mouse_x);
				}
				
				that.div.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+15)+"px");
				
				if(prev_data_x == data_x){
					return; // skip rerendering to improve performance
				}
				prev_data_x = data_x;
				
				var values = that.chart.dataset_manager.lookup("x",data_x,true);
				
				// highlight series
				for(i=0;i<values.length;i++){
					that.chart.series[values[i].series_num].highlight(values[i]);
				}
				
				// create & show tooltip
				var html = "";
				html += "<b>" + that.xFormat(values[0].x) + "</b>";
				for(i=0;i<values.length;i++){
					html += "<br/><span style='color:"+that.chart._color(values[i].series_num)+";'>&#8226;</span> ";
					html += values[i].series_name + ": " + that.yFormat(values[i].y);
				}
				that.div.html(html);
			
				// show axis scan line
				if(that.show_scan_line){
					if(that.chart.dataset_manager.has_series_type("bar") || 
							that.chart.dataset_manager.has_series_type("stackedbar")){
						if(xAxis.scale_type=="ordinal"){
							that.scan_line_width = xAxis.scale.rangeBand() * (1.0 + xAxis.band_padding);
						}else{
							that.scan_line_width = xAxis.scale(xAxis.min_step) - xAxis.scale(0);
						}
					}
					var line_x = xAxis.scale(values[0].x) - that.scan_line_width/2 +
						((xAxis.scale_type == "ordinal")? band_width/2 : 0);
					that.chart.event_layer.svg.select(".ccd3_axis_scan_line")
						.attr("x",line_x).attr("width",that.scan_line_width)
						.attr("y",0).attr("height",that.chart.inner_height).attr("visibility","visible");
				}
			});
		}else if(that.chart.direction == "y"){
			e.on("mousemove.axis_tooltip",function(){
				// search nearest data 
				var yAxis = that.chart.yAxis;
				var d3mouse = d3.mouse(that.chart.event_layer.svg[0][0]);
				var mouse_x = d3mouse[0];
				var mouse_y = d3mouse[1];
				if(ccd3.env.isIE){ // IE problem ...
					mouse_x = d3.event.offsetX;
					mouse_y = d3.event.offsetY;
				}
				var data_y,i,band_width;
				if(yAxis.scale_type == "ordinal"){
					var left_edges = yAxis.scale.range();
					band_width = yAxis.scale.rangeBand();
					for(i=0; mouse_y > (left_edges[i] + band_width); i++) {}
					data_y = yAxis.scale.domain()[i];
				}else{
					data_y = yAxis.scale.invert(mouse_y);
				}
				
				that.div.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+15)+"px");
				
				if(prev_data_y == data_y){
					return; // skip rerendering to improve performance
				}
				prev_data_y = data_y;
				
				var values = that.chart.dataset_manager.lookup("y",data_y,true);
				
				// highlight series
				for(i=0;i<values.length;i++){
					that.chart.series[values[i].series_num].highlight(values[i]);
				}
				
				// create & show tooltip
				var html = "";
				html += "<b>" + that.yFormat(values[0].y) + "</b>";
				for(i=0;i<values.length;i++){
					html += "<br/><span style='color:"+that.chart._color(values[i].series_num)+";'>&#8226;</span> ";
					html += values[i].series_name + ": " + that.xFormat(values[i].x);
				}
				that.div.html(html);
			
				// show axis scan line
				if(that.show_scan_line){
					if(that.chart.dataset_manager.has_series_type("bar") || 
							that.chart.dataset_manager.has_series_type("stackedbar")){
						if(yAxis.scale_type=="ordinal"){
							that.scan_line_width = yAxis.scale.rangeBand() * (1.0 + yAxis.band_padding);
						}else{
							that.scan_line_width = yAxis.scale(yAxis.min_step) - yAxis.scale(0);
						}
					}
					var line_y = yAxis.scale(values[0].y) - that.scan_line_width/2 +
						((yAxis.scale_type == "ordinal")? band_width/2 : 0);
					that.chart.event_layer.svg.select(".ccd3_axis_scan_line")
						.attr("y",line_y).attr("height",that.scan_line_width)
						.attr("x",0).attr("width",that.chart.inner_width).attr("visibility","visible");
				}
			});

		}

	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Menu                                                   */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.Menu = function(){ ccd3.Parts.apply(this,arguments); };
	ccd3.Parts.Menu.prototype = new ccd3.Parts();
	ccd3.Parts.Menu.prototype.get_defaults = function(){
		return {
			menus: [ 
				{ key:"csv", label:"CSV Download", func:function(){ 
					this.dataset_manager.download_as_csv(this.dataset_manager.to_csv()); 
				} },
				{ key:"reset", label:"Reset Chart", func:function(){
					for(var i=0,len=this.dataset.length;i<len;i++){
						this.dataset[i].visible = true;
					}
					if(this.dataset[0].series_type === "pie"){
						this.series[0].sort = undefined;
					}
					this.zoomed = false;
					if(this.zoom instanceof ccd3.Parts){
						this.zoom.remove_reset_button();
					}
					this.render(); 
				}},
				{ key:"close", label:"Close Menu", func:function(){ this.menu.toggle_menu(); }}
			],
			opened: false,
			font_size: 10,
			icon_top: 2,
			icon_height: 15,
			icon_width: 24,
			icon_right: 5,
			item_x_margin: 10,
			item_y_margin: 5,
			item_interval: 32,
			item_opacity: 0.8
		};
	};
	ccd3.Parts.Menu.prototype.add_menu = function(obj,key){
		if(!(key)){
			this.menus.splice(this.menus.length-2,0,obj);
		}else{
			obj.key = key;
			for(var i=0;i<this.menus.length;i++){
				if(this.menus[i].key == key){
					this.menus[i] = obj;
					return;
				}
			}
			this.add_menu(obj); // if existing entry is not found, insert it
		}
	};
	ccd3.Parts.Menu.prototype.render = function(){
		var that = this;
		
		if(this.svg===undefined){
			// render menu icon(triple line)
			this.svg = this.chart.svg.append("g").attr("class","ccd3_menu");
			this.svg_icon = this.svg.append("g").attr("class","ccd3_menu_icon");
			this.svg_list = this.svg.append("g").attr("class","ccd3_menu_list");
		
			this.svg_icon.append("rect").attr("class","ccd3_menu_rect")
				.attr("width",this.icon_width).attr("height",this.icon_height).attr("fill","white").attr("opacity",0);
			this.svg_icon.append("rect").attr("class","ccd3_menu_bar").attr("y",1);
			this.svg_icon.append("rect").attr("class","ccd3_menu_bar").attr("y",6);
			this.svg_icon.append("rect").attr("class","ccd3_menu_bar").attr("y",11);
			this.svg_icon.selectAll(".ccd3_menu_bar")
				.attr("width",20).attr("height",2).attr("rx",2).attr("ry",2)
				.attr("x",2)
				.attr("fill","gray");
			
			this.svg_icon.on("click",function(e){
				if(that.opened){
					that.toggle_menu();
				}else{
					that.toggle_menu();
				}
			});
		}
		this.arrange(this.chart.width-this.icon_width-this.icon_right,this.icon_top);
	};
	ccd3.Parts.Menu.prototype.toggle_menu = function(){
		var that = this;
		var data = (this.opened)? [] : this.menus;
		this.opened = !(this.opened);
		
		var closed_xy = function(d,i){
			var x = that.icon_width + 20;
			var y = that.icon_top + that.icon_height + that.font_size + i*that.item_interval + 15;
			return "translate("+x+","+y+")";
		};
		var opened_xy = function(d,i){
			var x = -1 * this.getBBox().width + that.icon_width + that.item_x_margin + 40;
			var y = that.icon_top + that.icon_height + that.font_size + i*that.item_interval + 15;
			return "translate("+x+","+y+")";
		};
		
		var menus = this.svg_list.selectAll(".ccd3_menu_item").data(data);
		
		// enter
		menus.enter()
			.append("g")
			.attr("class","ccd3_menu_item")
			.attr("cursor","pointer")
			.call(function(e){
				e.append("rect").attr("fill","white").attr("stroke","gray").attr("opacity",that.item_opacity)
					.attr("rx",8).attr("ry",8);
			})
			.call(function(e){
				e.append("text").text(function(d){ return d.label; }).attr("font-size",that.font_size);
			})
			.on("mouseover",function(e){
				d3.select(this).select("rect").attr("fill","lightyellow");
			})
			.on("mouseout",function(e){
				d3.select(this).select("rect").attr("fill","white");
			})
			.on("click",function(e){
				var menu_data = d3.select(this).datum();
				menu_data.func.call(that.chart,menu_data);
			})
			.attr("transform",closed_xy)
			;
		// update
		menus.selectAll(".ccd3_menu_item rect")
			.attr("x",function(){ return that.item_x_margin*-1; })
			.attr("y",function(){ return this.nextSibling.getBBox().height/-2 + that.item_y_margin*-2; })
			.attr("width",function(){ return this.nextSibling.getBBox().width + that.item_x_margin*2 + 30; })
			.attr("height",function(){ return this.nextSibling.getBBox().height + that.item_y_margin*2; })
			;
		menus
			.transition().duration(500)
			.attr("transform",opened_xy)
			;
		// exit
		menus.exit()
			.transition().duration(500)
			.attr("transform",closed_xy)
			.remove();
		
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.OverlayLoading                                                */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.OverlayLoading = function(){ ccd3.Parts.apply(this,arguments); };
	ccd3.Parts.OverlayLoading.prototype = new ccd3.Parts();
	ccd3.Parts.OverlayLoading.prototype.get_defaults = function(){
		return {
			font_size: 14
		};
	};
	ccd3.Parts.OverlayLoading.prototype.render = function(onoff){
		var that = this;
		
		if(this.chart.svg === undefined) return; // chart is not ready
		if(this.svg===undefined){
			this.svg = this.chart.svg.append("g").attr("class","ccd3_overlay");
			this.svg.append("rect").attr("class","ccd3_overlay_rect")
				.attr("fill","white").attr("opacity",0.6);
			this.svg.append("text").attr("class","ccd3_overlay_message")
				.attr("font-size",this.font_size);
		}
		this.svg.select(".ccd3_overlay_rect")
			.attr("width",that.chart.width)
			.attr("height",that.chart.height)
			;
		this.svg.select(".ccd3_overlay_message")
			.text("Now Loading ...")
			.attr("x",function(){
				return that.chart.width/2 - this.getBBox().width/2;
			})
			.attr("y",function(){
				return that.chart.height/2 - this.getBBox().height/2;
			})
			;
	
		if(onoff){
			this.svg.attr("visibility","visible");
		}else{
			this.svg.attr("visibility","hidden");
		}
	};

	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Axis                                                   */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.Axis = function(){ ccd3.Parts.apply(this,arguments); };
	ccd3.Parts.Axis.prototype = new ccd3.Parts();
	ccd3.Parts.Axis.prototype.get_defaults = function(){
		return {
			svg: null,
			axis: undefined, // d3.svg.axis instance
			scale: undefined, // d3.scale instance
			scale_type: null,
			min_step: null,
			range_max: 0,
			range_min: 0,
			domain_max: undefined,
			domain_min: undefined,
			domain_margin: 0.1,
			domain_margin_type: undefined, // switch using domain_margin or min_step
			band_padding: 0.2, // also ref from Series.Bar/StackedBar
			format: undefined,
			show_label: true,
			tick_num: undefined,
			tick_padding: 5,
			tick_values: undefined, // use if scale_type == "date"
			font_size: 10,
			label_width: 0,
			label_height: 0,
			margin_top: 3,
			margin_bottom: 3,
			margin_right: 3,
			margin_left: 3
		};
	};
	ccd3.Parts.Axis.prototype.render = function(){};
	ccd3.Parts.Axis.prototype.init_format = function(){
		if(this.format === undefined){
			if(this.scale_type === "date"){
				this.format = ccd3.Util.default_date_format;
			}else if(this.scale_type === "linear"){
				this.format = ccd3.Util.default_numeric_format;
			}else if(this.scale_type === "ordinal"){
				this.format = function(d){ return d; };
			}else{
				throw new Error("Invalid scale_type");
			}
		}
	};
	ccd3.Parts.Axis.prototype.init_scale = function(){
		if(!(this.scale)){
			switch(this.scale_type){
				case "date": this.scale = d3.time.scale(); break;
				case "linear": this.scale = d3.scale.linear(); break;
				case "ordinal": this.scale = d3.scale.ordinal(); break;
				default:break;
			}
		}
		this.init_format();
	};
	ccd3.Parts.Axis.prototype.reset_range = function(range_max){
		this.range_max = range_max;
		if(this.scale_type === "ordinal"){
			this.scale.rangeBands([this.range_min, this.range_max], this.band_padding);
			this.tick_values = undefined;
		}else if(this.scale_type === "date"){
			this.scale.range([this.range_min, this.range_max]);
			
			// not to show same tick_label twice, force tickValues by Axis.format
			var cur_ticks = this.scale.ticks();
			var new_ticks = [];
			if(cur_ticks.length>=2 && this.format(cur_ticks[0]) != this.format(cur_ticks[1])){
				new_ticks.push(cur_ticks[0]);
			}
			var prev=cur_ticks[0];
			for(var i=1,len=cur_ticks.length;i<len;i++){
				if(this.format(prev)!=this.format(cur_ticks[i])){
					new_ticks.push(cur_ticks[i]);
				}
				prev = cur_ticks[i];
			}
			this.tick_values = new_ticks;
		}else{
			this.scale.range([this.range_min, this.range_max]);
			this.tick_values = undefined;
		}
	};
	ccd3.Parts.Axis.prototype.reset_domain = function(){
		var domain = [],min,max,func;
		var direction = this.direction;
		
		if(this.scale_type === "ordinal"){
			func = function(d){ return d[direction]; };
			for(var i=0,len=this.chart.dataset.length;i<len;i++){
				if(this.chart.dataset[i].visible){
					domain = domain.concat(this.chart.dataset[i].values.map(func));
				}
			}
		}else{
			if(direction === "x"){
				if(this.scale_type === "date"){
					func = function(d){ return d.x; };
				}else{
					func = function(d){ return d.x + ((d.x0===undefined)? 0:d.x0); };
				}
			}else if(direction === "y"){
				if(this.scale_type === "date"){
					func = function(d){ return d.y; };
				}else{
					func = function(d){ return d.y + ((d.y0===undefined)? 0:d.y0); };
				}
			}
			min = this.chart.dataset_manager.get_min(func);
			max = this.chart.dataset_manager.get_max(func);
			
			if(min === undefined || max === undefined){
				min = undefined;
				max = undefined;
			}else if(this.direction !== this.chart.direction && this.domain_margin_type !== "grid"){
				if(min >= 0 && min - (max-min)*this.domain_margin < 0){
					min = 0;
				}else{
					min = min - (max-min)*this.domain_margin;
				}
				if(max <= 0 && max + (max-min)*this.domain_margin > 0){
					max = 0;
				}else{
					max = max + (max-min)*this.domain_margin;
				}
			}else{
				if(this.scale_type === "date"){
					min = new Date(min.getTime() - this.min_step/2);
					max = new Date(max.getTime() + this.min_step/2);
				}else if(this.scale_type === "linear"){
					min = min - this.min_step/2;
					max = max + this.min_step/2;
				}
			}
			if(this.domain_min !== undefined){ min = this.domain_min; }
			if(this.domain_max !== undefined){ max = this.domain_max; }
			
			if(direction === "x" || this.chart.direction === "y"){
				domain = [min, max];
			}else{
				domain = [max, min];
			}
		}
		this.scale.domain(domain);
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Axis.xAxis                                             */
	/* ------------------------------------------------------------------ */
	
	ccd3.Parts.Axis.xAxis = function(){ ccd3.Parts.Axis.apply(this,arguments); };
	ccd3.Parts.Axis.xAxis.prototype = new ccd3.Parts.Axis();
	ccd3.Parts.Axis.xAxis.prototype.get_defaults = function(){
		return {
			direction: "x"
		};
	};
	ccd3.Parts.Axis.xAxis.prototype.render = function(){
		var that = this;
		var width = this.chart.inner_width;
		var height = this.chart.inner_height;
		var format;
		
		if(!this.svg){
			this.svg = this.chart.svg.append("g").attr("class","ccd3_xAxis");
		}

		if(this.show_label){
			format = this.format;
		}else{
			format = function(){ return ""; };
		}
		this.axis = d3.svg.axis()
			.scale(this.scale)
			.tickSize(-1*height)
			.orient("bottom")
			.tickFormat(format)
			;
		if(this.tick_values){
			this.axis.tickValues(this.tick_values);
		}else if(this.tick_num){
			this.axis.ticks(this.tick_num);
		}
		this.svg
			//.transition().duration(500)
			.call(this.axis)
			.selectAll(".tick text")
				.style("text-anchor", "end")
				.attr("class","ccd3_x_tick_label")
				.attr("font-size",this.font_size)
				.attr("transform", function(){
					return "translate(" + this.getBBox().height*-0.5 + "," + that.tick_padding+")rotate(-90)";
				})
			;
		
		/*
		this.svg.selectAll(".ccd3_xAxis path, .ccd3_xAxis .tick line")
			.attr("fill","none")
			.attr("stroke","lightgray")
			.attr("stroke-width",1)
			;
		*/
		
		this.text_height = d3.max(this.svg.selectAll(".ccd3_x_tick_label")[0].map(function(e){ 
			return e.getBBox().width;
		}));
		this.label_height = this.text_height + this.margin_top + this.margin_bottom;
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Axis.yAxis                                             */
	/* ------------------------------------------------------------------ */
	
	ccd3.Parts.Axis.yAxis = function(){ ccd3.Parts.Axis.apply(this,arguments); };
	ccd3.Parts.Axis.yAxis.prototype = new ccd3.Parts.Axis();
	ccd3.Parts.Axis.yAxis.prototype.get_defaults = function(){
		return {
			direction: "y"
		};
	};
	ccd3.Parts.Axis.yAxis.prototype.render = function(){
		var width = this.chart.inner_width;
		var height = this.chart.inner_height;
		var format;
		
		if(!this.svg){
			this.svg = this.chart.svg.append("g").attr("class","ccd3_yAxis");
		}
		
		if(this.show_label){
			format = this.format;
		}else{
			format = function(){ return ""; };
		}
		this.axis = d3.svg.axis()
			.scale(this.scale)
			.tickSize(-1*width)
			.tickPadding(this.tick_padding)
			.orient("left")
			.tickFormat(format)
			;
		if(this.tick_values){
			this.axis.tickValues(this.tick_values);
		}else if(this.tick_num){
			this.axis.ticks(this.tick_num);
		}
		this.svg
			//.transition().duration(500)
			.call(this.axis)
			.selectAll(".tick text")
				.attr("class","ccd3_y_tick_label")
				.attr("font-size",this.font_size)
			;
		
		/*
		this.svg.selectAll(".ccd3_yAxis path, .ccd3_yAxis .tick line")
			.attr("fill","none")
			.attr("stroke","lightgray")
			.attr("stroke-width",1)
			;
		*/
		
		this.text_width = d3.max(this.svg.selectAll(".ccd3_y_tick_label")[0].map(function(e){ 
			return e.getBBox().width;
		}));
		this.label_width = this.text_width + this.margin_right + this.margin_left;
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.rAxis r=radius                                         */
	/* ------------------------------------------------------------------ */
	
	ccd3.Parts.rAxis = function(){ ccd3.Parts.apply(this,arguments); };
	ccd3.Parts.rAxis.prototype = new ccd3.Parts();
	ccd3.Parts.rAxis.prototype.get_defaults = function(){
		return {
			radius: undefined,
			scale: undefined,
			format: undefined,
			font_size: 10
		};
	};
	ccd3.Parts.rAxis.prototype.render = function(){
		var that = this;
		
		this.init_scale();
		//this.reset_domain();
		
		if(!this.svg){
			this.svg = this.chart.svg.append("g").attr("class","ccd3_rAxis");
		}
		
		var ticks = this.svg.selectAll(".ccd3_rAxis_ticks").data(that.scale.ticks(3));
		// enter
		ticks.enter()
			.append("g")
			.attr("class","ccd3_rAxis_ticks")
			.call(function(e){
				e.append("circle")
				.attr("fill","none")
				.attr("stroke","lightgray")
				.attr("stroke-width",1)
				;
			})
			.call(function(e){
				e.append("text")
				.attr("text-anchor","middle")
				.attr("font-size",that.font_size)
				;
			})
			;
		// update
		ticks
			.call(function(e){
				e.select("circle")
				.attr("r",function(d){ return that.scale(d); })
				;
			})
			.call(function(e){
				e.select("text")
				.text(function(d){ return that.format(d); })
				.attr("y",function(d){ return -1.0 * that.scale(d); })
				;
			})
			;
		// exit
		ticks.exit().remove();

	};
	ccd3.Parts.rAxis.prototype.init_format = function(){
		if(this.format===undefined){
			this.format = ccd3.Util.default_numeric_format;
		}
	};
	ccd3.Parts.rAxis.prototype.init_scale = function(){
		if(!(this.scale)){
			this.scale = d3.scale.linear();
		}
		this.init_format();
	};
	ccd3.Parts.rAxis.prototype.reset_range = function(radius){
		this.radius = radius;
		this.scale.range([0,this.radius*0.8]); // TODO
	};
	ccd3.Parts.rAxis.prototype.reset_domain = function(){
		var func = function(d){ return d.y; };
		//var min = this.chart.dataset_manager.get_min(func);
		var max = this.chart.dataset_manager.get_max(func);
		this.scale.domain([0,max]);
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.aAxis a=angle                                          */
	/* ------------------------------------------------------------------ */
	
	ccd3.Parts.aAxis = function(){ ccd3.Parts.apply(this,arguments); };
	ccd3.Parts.aAxis.prototype = new ccd3.Parts();
	ccd3.Parts.aAxis.prototype.get_defaults = function(){
		return {
			radius: undefined,
			scale: undefined,
			format: undefined,
			font_size: 10
		};
	};
	ccd3.Parts.aAxis.prototype.render = function(){
		var that = this;
		
		this.init_scale();
		//this.reset_domain();
		
		if(!this.svg){
			this.svg = this.chart.svg.append("g").attr("class","ccd3_aAxis");
		}
		
		var ticks = this.svg.selectAll(".ccd3_aAxis_ticks").data(this.scale.domain());
		// enter
		ticks.enter()
			.append("g")
			.attr("class","ccd3_aAxis_ticks")
			.call(function(e){
				e.append("line")
				.attr("x1",0)
				.attr("y1",0)
				.attr("stroke","lightgray")
				.attr("stroke-width",1)
				;
			})
			.call(function(e){
				e.append("text")
				.attr("text-anchor","middle")
				.attr("font-size",that.font_size)
				;
			})
			;
		// update
		ticks
			.call(function(e){
				e.select("line")
				.attr("x2",function(d){ return that.radius*Math.sin(that.scale(d)); })
				.attr("y2",function(d){ return that.radius*Math.cos(that.scale(d))*-1.0; })
				;
			})
			.call(function(e){
				e.select("text")
				.text(function(d){ return that.format(d); })
				.attr("transform",function(d){
					var x=(that.radius - that.font_size)*Math.sin(that.scale(d));
					var y=(that.radius - that.font_size)*Math.cos(that.scale(d))*-1.0;
					var w=this.getBBox().width;
					if(x+w/2 > that.chart.inner_width/2){ // not to overflow
						x = that.chart.inner_width/2 - w/2;
					}else if(x-w/2 < that.chart.inner_width/2*-1){
						x = that.chart.inner_width/2*-1 + w/2;
					}
					return "translate("+x+","+y+")";
				})
				;
			})
			;
		// exit
		ticks.exit().remove();
		
	};
	ccd3.Parts.aAxis.prototype.init_format = function(){
		if(this.format===undefined){
			this.format = function(d){ return d; };
		}
	};
	ccd3.Parts.aAxis.prototype.init_scale = function(){
		if(!(this.scale)){
			this.scale = d3.scale.ordinal().rangePoints([0,Math.PI*2],1);
		}
		this.init_format();
	};
	ccd3.Parts.aAxis.prototype.reset_range = function(radius){
		this.radius = radius;
	};
	ccd3.Parts.aAxis.prototype.reset_domain = function(){
		var domain = [];
		var func = function(d){ return d.x; };
		for(var i=0,len=this.chart.dataset.length;i<len;i++){
			if(this.chart.dataset[i].visible){
				domain = domain.concat(this.chart.dataset[i].values.map(func));
			}
		}
		this.scale.domain(domain);
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.EventLayer                                             */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.EventLayer = function(){ ccd3.Parts.apply(this,arguments); };
	ccd3.Parts.EventLayer.prototype = new ccd3.Parts();
	ccd3.Parts.EventLayer.prototype.get_defaults = function(){ return {}; };
	ccd3.Parts.EventLayer.prototype.render = function(){
		if(this.svg === undefined){
			this.svg = this.chart.series_container.svg
				.append("g")
				.attr("class","ccd3_event_layer");
			this.svg.append("rect")
				.attr("class","background")
				.attr("opacity",0)
				.attr("x",0).attr("y",0)
				;
		}
		this.svg.select("rect.background")
			.attr("width",this.chart.inner_width)
			.attr("height",this.chart.inner_height)
			;
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Zoom                                                   */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.Zoom = function(){
		ccd3.Parts.apply(this,arguments); 
		this.render();
	};
	ccd3.Parts.Zoom.prototype = new ccd3.Parts();
	ccd3.Parts.Zoom.prototype.get_defaults = function(){
		return {
			use: true,
			font_size: 12,
			margin_left: null,
			margin_top: null,
			button_svg: null
		};
	};
	ccd3.Parts.Zoom.prototype.render = function(){
		if(this.svg!==undefined) return;
		var that = this;
		
		this.brush = d3.svg.brush()
			.x(this.chart.xAxis.scale)
			.y(this.chart.yAxis.scale)
			.on("brushend",function(){
				that.zoom();	
			})
			;
		
		this.svg = this.chart.event_layer.svg
			.append("g")
			.attr("class","ccd3_zoom")
			.attr("cursor","crosshair")
			.attr("fill","gray")
			.attr("opacity",0.3)
			.call(this.brush)
			;
		
	};
	ccd3.Parts.Zoom.prototype.zoom = function(){
		if(this.brush.empty()) return;
		var that = this;
		var c = this.chart;
		var b = this.brush.extent();
		c.zoomed = true;
		
		c.xAxis.scale.domain([b[0][0],b[1][0]]); 
		if(c.direction === "y"){
			c.yAxis.scale.domain([b[0][1],b[1][1]]);
		}else{
			c.yAxis.scale.domain([b[1][1],b[0][1]]);
		}
		c.render({dont_reset_domain:true});
		
		this.brush.clear();
		c.svg.selectAll(".ccd3_event_layer").call(this.brush);
		
		this.button_svg = c.series_container.svg
			.append("g")
			.attr("class","ccd3_zoom_reset_button")
			.attr("cursor","pointer")
			.call(function(e){
				e
				.append("rect")
				.attr("height","1.6em")
				.attr("font-size",that.font_size)
				.attr("fill","lightgray")
				.attr("opacity",0.7)
				.attr("stroke","none")
				.attr("rx",5).attr("ry",5)
				.attr("x",-5)
				;
			})
			.call(function(e){
				e
				.append("text")
				.text("clear zoom")
				.attr("fill","#333333")
				.attr("text-anchor","left")
				.attr("font-size",that.font_size)
				.attr("y","1.2em")
				;
			})
			.on("click",function(){
				that.reset_zoom();
			})
			;
		this.button_svg
			.call(function(e){
				e
				.select("rect")
				.attr("width",function(){ return this.nextSibling.getBBox().width + 10; })
				;
			});
		this.rearrange_reset_button();
	};
	ccd3.Parts.Zoom.prototype.reset_zoom = function(){
		var c = this.chart;
		c.zoomed = false;
		c.render();
		c.zoom.remove_reset_button();
	};
	ccd3.Parts.Zoom.prototype.remove_reset_button = function(){
		if(this.button_svg){
			this.button_svg.remove();
			this.button_svg = null;
		}
	};
	ccd3.Parts.Zoom.prototype.rearrange_reset_button = function(){
		if(this.button_svg){
			var that = this;
			this.button_svg
				.attr("transform",function(){
					return "translate(" + (that.chart.inner_width - this.getBBox().width - 10) + ",5)";
				});
		}
	};

	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Series                                                 */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.Series = function(){ ccd3.Parts.apply(this,arguments); };
	ccd3.Parts.Series.type_info = function(){
		return {
			heatmap:	{ obj:ccd3.Parts.Series.Heatmap,	zindex:1, is_single_series:true },
			bar:		{ obj:ccd3.Parts.Series.Bar,		zindex:2 },
			stackedbar:	{ obj:ccd3.Parts.Series.StackedBar,	zindex:3 },
			bubble:		{ obj:ccd3.Parts.Series.Bubble,		zindex:4 },
			line:		{ obj:ccd3.Parts.Series.Line,		zindex:5 },
			scatter:	{ obj:ccd3.Parts.Series.Scatter,	zindex:6 },
			pie:		{ obj:ccd3.Parts.Series.Pie,		zindex:0, is_single_series:true },
			radar:		{ obj:ccd3.Parts.Series.Radar,		zindex:0 },
		};
	};
	ccd3.Parts.Series.prototype = new ccd3.Parts();
	ccd3.Parts.Series.prototype.get_defaults = function(){
		return {
			class_name: "ccd3_series",
			series: undefined,
			data: undefined,
			show_values: false,
			color: null,
			font_size: 10
		};
	};
	ccd3.Parts.Series.prototype.render = function(){};
	ccd3.Parts.Series.prototype.init_svg = function(series){
		this.series = series;
		if(!(this.svg)){
			var info = ccd3.Parts.Series.type_info();
			this.svg = this.chart.series_container.svg
				.append("g")
				.attr("id","series_"+series.series_num)
				.attr("class","series")
				.attr("series_num",series.series_num)
				.attr("series_name",series.name)
				.attr("class",this.class_name)
				.attr("series_type",series.series_type)
				.datum(info[series.series_type].zindex * 1000 + series.series_num) // magic number 1000
				;
		}
	};
	ccd3.Parts.Series.prototype.destroy = function(){
		this.svg.remove();
	};
	ccd3.Parts.Series.prototype.exit = function(s){
		s
			.exit()
			.transition().duration(500)
			.ease("linear")
			.style("opacity",0)	
			.remove()
			;
	};
	ccd3.Parts.Series.prototype.get_data = function(){
		if(this.series.visible){
			return this.series.values;
		}else{
			return [];
		}
	};
	ccd3.Parts.Series.prototype.text_visibility = function(){
		if(this.show_values || this.chart.show_values === "always" || 
			(this.chart.zoomed && this.chart.show_values === "onzoom") ){
			return true;
		}else{
			return false;
		}
	};
	ccd3.Parts.Series.prototype.highlight_series = function(){};
	ccd3.Parts.Series.prototype.highlight = function(){};
	ccd3.Parts.Series.prototype.tooltip_html = function(d){
		var html = "";
		html += "<b><span style='color:" + this.color + ";'>&#8226;</span> " + this.series.name + "</b>";
		html += "<br>x: " + this.chart.tooltip.xFormat(d.x);
		html += "<br>y: " + this.chart.tooltip.yFormat(d.y);
		return html;
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Series.Scatter                                         */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.Series.Scatter = function(){ ccd3.Parts.Series.apply(this,arguments); };
	ccd3.Parts.Series.Scatter.prototype = new ccd3.Parts.Series();
	ccd3.Parts.Series.Scatter.prototype.get_defaults = function(){
		return {
			point_radius: 3,
			point_radius_highlight: 5
		};
	};
	ccd3.Parts.Series.Scatter.prototype.render = function(){
		var that = this;
		var i = this.series.series_num;
		var text_visibility = this.text_visibility();
		var xScale = this.chart.xAxis.scale;	
		var yScale = this.chart.yAxis.scale;
		var xAxis = this.chart.xAxis;	
		var yAxis = this.chart.yAxis;	
		var yFormat = this.chart.yAxis.format;
		this.color = this.chart._color(i);
		
		// data join
		var circles = this.svg.selectAll(".ccd3_circle_g").data(that.get_data());
		
		// enter
		circles
			.enter()
			.append("g")
			.attr("class","ccd3_circle_g")
			.style("opacity",0)
			.call(function(e){
				e.append("circle").attr("fill",that.color).attr("r",that.point_radius);
			})
			.call(function(e){
				e
				.append("text")
				.attr("text-anchor","middle")
				.attr("y","-0.5em")
				.text(function(d){
					return yFormat(d.y);
				})
				;
			})
			.on("mouseover", function(){
				d3.select(this).select("circle").attr("r",that.point_radius_highlight);
			})
			.on("mouseout", function(){
				d3.select(this).select("circle").attr("r",that.point_radius);
			})
			.call(that.chart.tooltip.add_listener,that.chart.tooltip)
			;
		
		// update
		circles
			.transition().duration(500)
			.attr("transform",function(d){
				var x,y;
				if(xAxis.scale_type==="ordinal"){
					x = xScale(d.x) + xScale.rangeBand()/2;
				}else{
					x = xScale(d.x);
				}
				if(yAxis.scale_type==="ordinal"){
					y = yScale(d.y) + yScale.rangeBand()/2;
				}else{
					y = yScale(d.y);
				}
				return "translate("+x+","+y+")";
			})
			.style("opacity",1)
			.call(function(e){
				e
				.select("text")
				.style("display",function(){ return (text_visibility)? null:"none"; })
				.attr("font-size",that.font_size);
			})
			;

		// exit
		circles.call(this.exit);

	};
	ccd3.Parts.Series.Scatter.prototype.highlight_series = function(onoff){
		if(onoff){
			this.svg.selectAll(".ccd3_circle_g circle")
				.attr("r",this.point_radius_highlight);
		}else{
			this.svg.selectAll(".ccd3_circle_g circle")
				.attr("r",this.point_radius);
		}
	};
	ccd3.Parts.Series.Scatter.prototype.highlight = function(data){
		var that = this;
		this.svg.selectAll(".ccd3_circle_g circle")
			.attr("r",function(d){
				if(""+d.x == ""+data.x && ""+d.y == ""+data.y){ // to compare Date object converting to string
					return that.point_radius_highlight;
				}else{
					return that.point_radius;
				}
			});
	};

	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Series.Bar                                             */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.Series.Bar = function(){ ccd3.Parts.Series.apply(this,arguments); };
	ccd3.Parts.Series.Bar.prototype = new ccd3.Parts.Series();
	ccd3.Parts.Series.Bar.prototype.get_defaults = function(){
		return {
			opacity: 0.7
		};
	};
	ccd3.Parts.Series.Bar.prototype.render = function(bar_cnt,bar_pos){
		var that = this;
		var i = this.series.series_num;
		var text_visibility = this.text_visibility();
		var wScale,hScale,format,hAxis,wAxis,width;
		var xy_func, width_func, height_func, value_func, text_xy_func;
		var band_padding;
		this.color = this.chart._color(i);
		
		if(this.chart.direction === "x"){
			wScale = this.chart.xAxis.scale;	
			hScale = this.chart.yAxis.scale;
			wAxis = this.chart.xAxis;
			hAxis = this.chart.yAxis;
			format = this.chart.yAxis.format;
			band_padding = this.chart.xAxis.band_padding;
		}else{
			wScale = this.chart.yAxis.scale;	
			hScale = this.chart.xAxis.scale;
			wAxis = this.chart.yAxis;
			hAxis = this.chart.xAxis;
			format = this.chart.xAxis.format;
			band_padding = this.chart.yAxis.band_padding;
		}
		
		if(wAxis.scale_type === "ordinal"){
			width = wScale.rangeBand();
		}else{
			width = Math.abs(wScale(wAxis.min_step) - wScale(0));
		}
		var width2 = width*(1.0-band_padding)/bar_cnt;
		
		if(this.chart.direction === "x"){
			value_func = function(d){ return d.y; };
			width_func = function(){ return width2; };
			height_func = function(d){ return Math.abs(hScale(0) - hScale(d.y)); };
			xy_func = function(d){
				var x = wScale(d.x) + width2*bar_pos + width*band_padding/2;
				if(wAxis.scale_type !== "ordinal"){
					x -= width/2;
				}
				var y = Math.min(hScale(0),hScale(d.y));
				return "translate("+x+","+y+")";
			};
			text_xy_func = function(){
				var x = width2/2 - this.getBBox().height/2;
				var y = this.getBBox().height/2;
				return "translate("+x+","+y+") rotate(90)";
			};
		}else{
			value_func = function(d){ return d.x; };
			width_func = function(d){ return Math.abs(hScale(0) - hScale(d.x)); };
			height_func = function(){ return width2; };
			xy_func = function(d){
				var y = wScale(d.y) + width2*bar_pos + width*band_padding/2;
				if(wAxis.scale_type !== "ordinal"){
					y -= width/2;
				}
				var x = Math.min(hScale(0),hScale(d.x));
				return "translate("+x+","+y+")";
			};
			text_xy_func = function(d){
				var y = width2/2 + this.getBBox().height/2;
				var x = hScale(d.x) - this.getBBox().width;
				return "translate("+x+","+y+")";
			};
		}
		
		// data join
		var bars = this.svg.selectAll(".ccd3_bar_g").data(that.get_data());
		
		// enter
		bars
			.enter()
			.append("g")
			.attr("class","ccd3_bar_g")
			.style("opacity",0)
			.call(function(e){
				e.append("rect").attr("fill",that.color);
			})
			.call(function(e){
				e
				.append("text")
				.text(function(d){
					return format(value_func(d));
				})
				;
			})
			.on("mouseover", function(){
				d3.select(this).style("opacity",1);
			})
			.on("mouseout", function(){
				d3.select(this).style("opacity",that.opacity);
			})
			.call(that.chart.tooltip.add_listener,that.chart.tooltip)
			;
		
		// update
		bars
			.transition().duration(500)
			.attr("transform",xy_func)
			.style("opacity",that.opacity)
			.call(function(e){
				e
				.select("rect")
				.attr("width",width_func)
				.attr("height",height_func)
				;
			})
			.call(function(e){
				e
				.select("text")
				.attr("visibility",function(){ return (text_visibility)? "visible":"hidden"; })
				.attr("transform",text_xy_func)
				.attr("font-size",that.font_size);
			})
			;
	
		// exit
		bars.call(this.exit);
	};
	ccd3.Parts.Series.Bar.prototype.highlight_series = function(onoff){
		if(onoff){
			this.svg.selectAll(".ccd3_bar_g")
				.style("opacity",1);
		}else{
			this.svg.selectAll(".ccd3_bar_g")
				.style("opacity",this.opacity);
		}
	};
	ccd3.Parts.Series.Bar.prototype.highlight = function(data){
		var that = this;
		this.svg.selectAll(".ccd3_bar_g")
			.style("opacity",function(d){
				if(""+d.x == ""+data.x && ""+d.y == ""+data.y){ // to compare Date object converting to string
					return 1;
				}else{
					return that.opacity;
				}
			});
	};

	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Series.StackedBar                                      */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.Series.StackedBar = function(){ ccd3.Parts.Series.apply(this,arguments); };
	ccd3.Parts.Series.StackedBar.prototype = new ccd3.Parts.Series();
	ccd3.Parts.Series.StackedBar.prototype.get_defaults = function(){
		return {
			opacity: 0.7
		};
	};
	ccd3.Parts.Series.StackedBar.prototype.render = function(){
		var that = this;
		var i = this.series.series_num;
		var text_visibility = this.text_visibility();
		var wScale,hScale,format,hAxis,wAxis,width;
		var xy_func, width_func, height_func, value_func, text_xy_func;
		var band_padding;
		this.color = this.chart._color(i);
		
		if(this.chart.direction === "x"){
			wScale = this.chart.xAxis.scale;	
			hScale = this.chart.yAxis.scale;
			wAxis = this.chart.xAxis;
			hAxis = this.chart.yAxis;
			format = this.chart.yAxis.format;
			band_padding = this.chart.xAxis.band_padding;
		}else{
			wScale = this.chart.yAxis.scale;	
			hScale = this.chart.xAxis.scale;
			wAxis = this.chart.yAxis;
			hAxis = this.chart.xAxis;
			format = this.chart.xAxis.format;
			band_padding = this.chart.yAxis.band_padding;
		}

		if(wAxis.scale_type === "ordinal"){
			width = wScale.rangeBand();
		}else{
			width = Math.abs(wScale(wAxis.min_step) - wScale(0));
		}
		var width2 = width*(1.0-band_padding);
		
		if(this.chart.direction === "x"){
			value_func = function(d){ return d.y; };
			width_func = function(){ return width2; };
			height_func = function(d){ return Math.abs(hScale(d.y0) - hScale(d.y+d.y0)); };
			xy_func = function(d){
				var x = wScale(d.x) + width*band_padding/2;
				if(wAxis.scale_type !== "ordinal"){
					x -= width/2;
				}
				var y = Math.min(hScale(d.y0),hScale(d.y+d.y0));
				return "translate("+x+","+y+")";
			};
			text_xy_func = function(){
				var x = width2/2 - this.getBBox().height/2;
				var y = this.getBBox().height/2;
				return "translate("+x+","+y+") rotate(90)";
			};
		}else{
			value_func = function(d){ return d.x; };
			width_func = function(d){ return Math.abs(hScale(d.x0) - hScale(d.x+d.x0)); };
			height_func = function(){ return width2; };
			xy_func = function(d){
				var y = wScale(d.y) + width*band_padding/2;
				if(wAxis.scale_type !== "ordinal"){
					y -= width/2;
				}
				var x = Math.min(hScale(d.x0),hScale(d.x+d.x0));
				return "translate("+x+","+y+")";
			};
			text_xy_func = function(d){
				var y = width2/2 + this.getBBox().height/2;
				var x = (hScale(d.x+d.x0) - hScale(d.x0)) - this.getBBox().width - 5;
				return "translate("+x+","+y+")";
			};
		}
		
		// data join
		var bars = this.svg.selectAll(".ccd3_bar_g").data(that.get_data());
		
		// enter
		bars
			.enter()
			.append("g")
			.attr("class","ccd3_bar_g")
			.style("opacity",0)
			.call(function(e){
				e.append("rect").attr("fill",that.color);
			})
			.call(function(e){
				e
				.append("text")
				.text(function(d){
					return format(value_func(d));
				})
				.attr("transform","rotate(90)")
				;
			})
			.on("mouseover", function(){
				d3.select(this).style("opacity",1);
			})
			.on("mouseout", function(){
				d3.select(this).style("opacity",that.opacity);
			})
			.call(that.chart.tooltip.add_listener,that.chart.tooltip)
			;
		
		// update
		bars
			.transition().duration(500)
			//.delay(function(d, i) { return i * 10; })
			.attr("transform",xy_func)
			.style("opacity",that.opacity)
			.call(function(e){
				e
				.select("rect")
				.attr("width",width_func)
				.attr("height",height_func)
				;
			})
			.call(function(e){
				e
				.select("text")
				.attr("visibility",function(){ return (text_visibility)? "visible":"hidden"; })
				.attr("transform",text_xy_func)
				.attr("font-size",that.font_size)
				;
			})
			;

		// exit
		bars.call(this.exit);

	};
	ccd3.Parts.Series.StackedBar.prototype.highlight_series = function(onoff){
		if(onoff){
			this.svg.selectAll(".ccd3_bar_g")
				.style("opacity",1);
		}else{
			this.svg.selectAll(".ccd3_bar_g")
				.style("opacity",this.opacity);
		}
	};
	ccd3.Parts.Series.StackedBar.prototype.highlight = function(data){
		var that = this;
		this.svg.selectAll(".ccd3_bar_g")
			.style("opacity",function(d){
				if(""+d.x == ""+data.x && ""+d.y == ""+data.y){ // to compare Date object converting to string
					return 1;
				}else{
					return that.opacity;
				}
			});
	};

	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Series.Line                                            */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.Series.Line = function(){ ccd3.Parts.Series.apply(this,arguments); };
	ccd3.Parts.Series.Line.prototype = new ccd3.Parts.Series();
	ccd3.Parts.Series.Line.prototype.get_defaults = function(){
		return {
			opacity: 0.7,
			line_width: 1,
			line_width_highlight: 3,
			point_radius: 3,
			point_radius_highlight: 5
		};
	};
	ccd3.Parts.Series.Line.prototype.render = function(){
		var that = this;
		var i = this.series.series_num;
		var text_visibility = this.text_visibility();
		var xScale = this.chart.xAxis.scale;	
		var yScale = this.chart.yAxis.scale;
		var xAxis = this.chart.xAxis;
		var yAxis = this.chart.yAxis;
		var yFormat = this.chart.yAxis.format;
		this.color = this.chart._color(i);
		
		var calc_x = function(d){
			if(xAxis.scale_type==="ordinal"){
				return xScale(d.x) + xScale.rangeBand()/2;
			}else{
				return xScale(d.x);
			}
		};
		var calc_y = function(d){
			if(yAxis.scale_type==="ordinal"){
				return yScale(d.y) + yScale.rangeBand()/2;
			}else{
				return yScale(d.y);
			}
		};
		
		/* line path */
		// render line first not to prevent tooltip mouseover
		// data join
		var data = (this.series.visible)? [0] : [];
		var path_def = d3.svg.line()
			.x(calc_x)
			.y(calc_y)
			.interpolate("linear")
			;
		var path = this.svg.selectAll("path").data(data);
		// enter
		path
			.enter()
			.append("path")
			.attr("class","series_path")
			.attr("stroke",that.color)
			.attr("stroke-width",that.line_width)
			.attr("fill","none")
			.style("opacity",0)	
			;
		// update
		path
			.transition().duration(500)
			.attr("d",path_def(that.get_data()))
			.style("opacity",that.opacity)
			;
		// exit
		path.call(this.exit);
		
		/* point */
		// data join
		var circles = this.svg.selectAll(".ccd3_circle_g").data(that.get_data());
		
		// enter
		circles
			.enter()
			.append("g")
			.attr("class","ccd3_circle_g")
			.style("opacity",0)
			.call(function(e){
				e.append("circle").attr("fill",that.color).attr("r",that.point_radius);
			})
			.call(function(e){
				e
				.append("text")
				.attr("text-anchor","middle")
				.attr("y","-0.5em")
				.text(function(d){
					return yFormat(d.y);
				})
				;
			})
			.on("mouseover", function(){
				d3.select(this).select("circle").attr("r",that.point_radius_highlight);
				d3.select(this.parentNode).select(".series_path")
					.attr("stroke-width",that.line_width_highlight)
					;
			})
			.on("mouseout", function(){
				d3.select(this).select("circle").attr("r",that.point_radius);
				d3.select(this.parentNode).select(".series_path")
					.attr("stroke-width",that.line_width)
					;
			})
			.call(that.chart.tooltip.add_listener,that.chart.tooltip)
			;
		
		// update
		circles
			.transition().duration(500)
			.attr("transform",function(d){
				return "translate("+calc_x(d)+","+calc_y(d)+")";
			})
			.style("opacity",1)
			.call(function(e){
				e
				.select("text")
				.style("display",function(){ return (text_visibility)? null:"none"; })
				.attr("font-size",that.font_size)
				;
			})
			;

		
		// exit
		circles.call(this.exit);
	};
	ccd3.Parts.Series.Line.prototype.highlight_series = function(onoff){
		if(onoff){
			this.svg.selectAll(".ccd3_circle_g circle")
				.attr("r",this.point_radius_highlight);
			this.svg.selectAll(".series_path")
				.attr("stroke-width",this.line_width_highlight);
		}else{
			this.svg.selectAll(".ccd3_circle_g circle")
				.attr("r",this.point_radius);
			this.svg.selectAll(".series_path")
				.attr("stroke-width",this.line_width);
		}
	};
	ccd3.Parts.Series.Line.prototype.highlight = function(data){
		var that = this;
		this.svg.selectAll(".ccd3_circle_g circle")
			.attr("r",function(d){
				if(""+d.x == ""+data.x && ""+d.y == ""+data.y){ // to compare Date object converting to string
					return that.point_radius_highlight;
				}else{
					return that.point_radius;
				}
			});
	};

	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Series.Bubble                                          */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.Series.Bubble = function(){ ccd3.Parts.Series.apply(this,arguments); };
	ccd3.Parts.Series.Bubble.prototype = new ccd3.Parts.Series();
	ccd3.Parts.Series.Bubble.prototype.get_defaults = function(){
		return {
			opacity: 0.7,
			max_radius: 10,
			min_radius: 3,
			zFormat: ccd3.Util.default_numeric_format
		};
	};
	ccd3.Parts.Series.Bubble.prototype.render = function(){
		var that = this;
		var i = this.series.series_num;
		var text_visibility = this.text_visibility();
		var xScale = this.chart.xAxis.scale;	
		var yScale = this.chart.yAxis.scale;
		var xAxis = this.chart.xAxis;	
		var yAxis = this.chart.yAxis;	
		this.color = this.chart._color(i);
		
		if(this.zScale===undefined){
			var zMax = this.chart.dataset_manager.get_max(function(d){return d.z;});
			var zMin = this.chart.dataset_manager.get_min(function(d){return d.z;});
			this.zScale = d3.scale.linear()
				.range([this.min_radius,this.max_radius]).domain([zMin,zMax]);
		}
		var zScale = this.zScale;
		
		if(!(this.chart.tooltip.zFormat)){
			this.chart.tooltip.zFormat = this.zFormat;
		}
		
		// data join
		// http://bl.ocks.org/mbostock/3808218
		var circles = this.svg.selectAll(".ccd3_bubble_g").data(that.get_data());
		
		// enter
		circles
			.enter()
			.append("g")
			.attr("class","ccd3_bubble_g")
			.style("opacity",0)
			.call(function(e){
				e.append("circle").attr("fill",that.color).attr("r",0);
			})
			.call(function(e){
				e
				.append("text")
				.attr("text-anchor","middle")
				.attr("y","0.4em")
				.text(function(d){
					return that.zFormat(d.z);
				})
				;
			})
			.on("mouseover", function(){
				d3.select(this).style("opacity",1);
			})
			.on("mouseout", function(){
				d3.select(this).style("opacity",that.opacity);
			})
			.call(that.chart.tooltip.add_listener,that.chart.tooltip)
			;
		
		// update
		circles
			.transition().duration(500)
			.attr("transform",function(d){
				var x,y;
				if(xAxis.scale_type==="ordinal"){
					x = xScale(d.x) + xScale.rangeBand()/2;
				}else{
					x = xScale(d.x);
				}
				if(yAxis.scale_type==="ordinal"){
					y = yScale(d.y) + yScale.rangeBand()/2;
				}else{
					y = yScale(d.y);
				}
				return "translate("+x+","+y+")";
			})
			.style("opacity",that.opacity)
			.call(function(e){
				e
				.select("circle")
				.attr("r",function(d){ return zScale(d.z); })
				;
			})
			.call(function(e){
				e
				.select("text")
				.attr("visibility",function(){ return (text_visibility)? "visible":"hidden"; })
				.attr("font-size",that.font_size)
				;
			})
			;
	
		// exit
		circles.call(this.exit);
	};
	ccd3.Parts.Series.Bubble.prototype.highlight_series = function(onoff){
		if(onoff){
			this.svg.selectAll(".ccd3_bubble_g")
				.style("opacity",1);
		}else{
			this.svg.selectAll(".ccd3_bubble_g")
				.style("opacity",this.opacity);
		}
	};
	ccd3.Parts.Series.Bubble.prototype.highlight = function(data){
		var that = this;
		this.svg.selectAll(".ccd3_bubble_g")
			.style("opacity",function(d){
				if(""+d.x == ""+data.x && ""+d.y == ""+data.y){ // to compare Date object converting to string
					return 1.0;
				}else{
					return that.opacity;
				}
			});
	};
	ccd3.Parts.Series.Bubble.prototype.tooltip_html = function(d){
		var html = "";
		html += "<b><span style='color:" + this.color + ";'>&#8226;</span> " + this.series.name + "</b>";
		html += "<br>x: " + this.chart.tooltip.xFormat(d.x);
		html += "<br>y: " + this.chart.tooltip.yFormat(d.y);
		html += "<br>z: " + this.chart.tooltip.zFormat(d.z);
		return html;
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Series.Heatmap                                         */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.Series.Heatmap = function(){ ccd3.Parts.Series.apply(this,arguments); };
	ccd3.Parts.Series.Heatmap.prototype = new ccd3.Parts.Series();
	ccd3.Parts.Series.Heatmap.prototype.get_defaults = function(){
		return {
			low_color: "red",
			high_color: "green",
			zFormat: ccd3.Util.default_numeric_format
		};
	};
	ccd3.Parts.Series.Heatmap.prototype.render = function(){
		var that = this;
		var i = this.series.series_num;
		var text_visibility = this.text_visibility();
		var xScale = this.chart.xAxis.scale;
		var yScale = this.chart.yAxis.scale;
		var xAxis = this.chart.xAxis;
		var yAxis = this.chart.yAxis;
		var width,height;
		this.color = this.chart._color(i);
		var xy_func, text_xy_func;
		
		if(!(this.chart.tooltip.zFormat)){
			this.chart.tooltip.zFormat = this.zFormat;
		}
		
		if(xAxis.scale_type === "ordinal"){
			width = xScale.rangeBand();
		}else{
			width = Math.abs(xScale(xAxis.min_step) - xScale(0));
		}
		if(yAxis.scale_type === "ordinal"){
			height = yScale.rangeBand();
		}else{
			height = Math.abs(yScale(yAxis.min_step) - yScale(0));
		}
		// overloap rect not to make gap
		width += 1;
		height += 1;
		
		// cScale = color Scale
		var zMax = this.chart.dataset_manager.get_max(function(d){return d.z;});
		var zMin = this.chart.dataset_manager.get_min(function(d){return d.z;});
		// interpolate pattern http://bl.ocks.org/mbostock/3014589
		this.cScale = d3.scale.linear()
			.range([this.low_color, this.high_color]).domain([zMin,zMax])
			.interpolate(d3.interpolateHsl);
		var cScale = this.cScale;
		
		xy_func = function(d){
			var x = xScale(d.x);
			if(xAxis.scale_type !== "ordinal"){
				x -= width/2;
			}
			var y = yScale(d.y);
			if(yAxis.scale_type !== "ordinal"){
				y -= height/2;
			}
			return "translate("+x+","+y+")";
		};
		text_xy_func = function(d){
			var x=width/2;
			var y=height/2 + this.getBBox().height/2;
			return "translate("+x+","+y+")";
		};
		
		// data join
		var rects = this.svg.selectAll(".ccd3_rect_g").data(that.get_data());
		
		// enter
		rects
			.enter()
			.append("g")
			.attr("class","ccd3_rect_g")
			.style("opacity",0)
			.call(function(e){
				e
				.append("text")
				.attr("font-size",that.font_size)
				.attr("text-anchor","middle")
				;
			})
			.call(that.chart.tooltip.add_listener,that.chart.tooltip)
			;
		
		// update
		rects
			.transition().duration(500)
			.style("opacity",that.opacity)
			.attr("transform",xy_func)
			.call(function(e){
				e
				.select("rect")
				.attr("width",width)
				.attr("height",height)
				.attr("fill",function(d){ return that.cScale(d.z); })
				;
			})
			.call(function(e){
				e
				.select("text")
				.attr("visibility",function(){ return (text_visibility)? "visible":"hidden"; })
				.attr("transform",text_xy_func)
				.text(function(d){
					return that.zFormat(d.z);
				})
				;
			})
			;
	
		// exit
		rects.call(this.exit);

	};
	ccd3.Parts.Series.Heatmap.prototype.tooltip_html = function(d){
		var html = "";
		html += "x: " + this.chart.tooltip.xFormat(d.x);
		html += "<br>y: " + this.chart.tooltip.yFormat(d.y);
		html += "<br>z: " + this.chart.tooltip.zFormat(d.z);
		return html;
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Series.Pie                                             */
	/* ------------------------------------------------------------------ */

	ccd3.Parts.Series.Pie = function(){ ccd3.Parts.Series.apply(this,arguments); };
	ccd3.Parts.Series.Pie.prototype = new ccd3.Parts.Series();
	ccd3.Parts.Series.Pie.prototype.get_defaults = function(){
		return {
			inner_radius: 0.0,
			radius_nofocus: 0.95,
			opacity: 0.7,
			yFormat: ccd3.Util.default_numeric_format,
			sort: undefined,
			pFormat: ccd3.Util.default_percent_format
		};
	};
	ccd3.Parts.Series.Pie.prototype.render = function(){
		var that = this;
		
		if(!(this.chart.tooltip.yFormat)){
			this.chart.tooltip.yFormat = this.yFormat;
		}
		
		this.radius = Math.min(this.chart.inner_height,this.chart.inner_width)/2;
		var arc = d3.svg.arc().outerRadius(this.radius*this.radius_nofocus).innerRadius(this.radius*this.inner_radius);
		
		var pie = d3.layout.pie()
			.value(function(d) { return d.y; });
		if(this.sort == "desc"){
			pie.sort(function(a,b){ return b.y - a.y; });
		}else if(this.sort === "asc"){
			pie.sort(function(a,b){ return a.y - b.y; });
		}else{
			pie.sort(null);
		}
		
		this.svg.attr("transform", function(){
			return "translate("+(that.chart.inner_width/2)+","+(that.chart.inner_height/2)+")"; 
		});
		
		// data join
		var pie_data = pie(this.get_data());
		var arcs = this.svg.selectAll(".ccd3_arc_g").data(pie_data);
		
		// enter
		arcs.enter()
			.append("g")
			.attr("class","ccd3_arc_g")
			.style("opacity",this.opacity)
			.call(that.chart.tooltip.add_listener,that.chart.tooltip)
			.on("mouseover", function(){
				d3.select(this)
					.style("opacity",1)
					.select("path")
					.attr("d",function(d,i){
						arc.outerRadius(that.radius);
						return arc(d);
					});
			})
			.on("mouseout", function(){
				d3.select(this)
					.style("opacity",that.opacity)
					.select("path")
					.attr("d",function(d,i){
						arc.outerRadius(that.radius*that.radius_nofocus);
						return arc(d);
					});
			})
			.call(function(e){
				e.append("path")
				.style("fill",function(d,i){ return that.chart._color(i); });
			})
			.call(function(e){
				e.append("text")
				.attr("dy", ".35em")
				.style("text-anchor", "middle")
				.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
				.call(function(e){
					e.append("tspan")
					.attr("class","label_x")
					.attr("y","-1em")
					.text(function(d){ return d.data.x; })
					;
				})
				.call(function(e){
					e.append("tspan")
					.attr("class","label_p")
					.attr("dy","1em")
					.attr("x",0)
					.text(function(d){ return that.pFormat(that.calc_percent(d)); })
					;
				})
				.call(function(e){
					e.append("tspan")
					.attr("class","label_y")
					.attr("dy","1em")
					.attr("x",0)
					.text(function(d){ return that.yFormat(d.data.y); })
					;
				})
				;
			});
		
		// update
		arcs
			.transition().duration(500)
			.call(function(e){
				e.select("path")
				.attr("d",arc);
			})
			.call(function(e){
				e.select("text")
				.attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
				.call(function(e){
					e.select("tspan.label_x")
					.text(function(d){ return d.data.x; })
					;
				})
				.call(function(e){
					e.select("tspan.label_p")
					.text(function(d){ return that.pFormat(that.calc_percent(d)); })
					;
				})
				.call(function(e){
					e.select("tspan.label_y")
					.text(function(d){ return that.yFormat(d.data.y); })
					;
				})
				.style("visibility",function(d){
					var text_width = this.getBBox().width;
					var text_height = this.getBBox().height;
					var arc_width = Math.abs(Math.cos(d.startAngle) - Math.cos(d.endAngle))*that.radius/2;
					var arc_height = Math.abs(Math.sin(d.startAngle) - Math.sin(d.endAngle))*that.radius/2;
					if(arc_width>=text_width || arc_height>=text_height){
						return "visible";
					}else{
						return "hidden";
					}
				})
				;
			});
		
		// exit
		arcs.call(this.exit);
	};
	ccd3.Parts.Series.Pie.prototype.calc_percent = function(d){
		return (d.endAngle - d.startAngle) / (Math.PI * 2.0);
	};
	ccd3.Parts.Series.Pie.prototype.tooltip_html = function(d){
		var html = "";
		html += "<b>" + d.data.x + "</b>";
		html += "<br>%: " + this.pFormat(this.calc_percent(d));
		html += "<br>value: " + this.chart.tooltip.yFormat(d.data.y);
		return html;
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.Parts.Series.Radar                                           */
	/* ------------------------------------------------------------------ */
	
	ccd3.Parts.Series.Radar = function(){ ccd3.Parts.Series.apply(this,arguments); };
	ccd3.Parts.Series.Radar.prototype = new ccd3.Parts.Series();
	ccd3.Parts.Series.Radar.prototype.get_defaults = function(){
		return {
			point_radius: 5,
			point_radius_highlight: 8
		};
	};
	ccd3.Parts.Series.Radar.prototype.render = function(){
		var that = this;
		var data = this.get_data();
		var rScale = this.chart.rAxis.scale;
		var aScale = this.chart.aAxis.scale;
		var i = this.series.series_num;
		this.color = this.chart._color(i);
		
		var trans_xy = function(d){
			return [
				Math.sin(aScale(d.x))*rScale(d.y),
				Math.cos(aScale(d.x))*rScale(d.y) * -1.0];
		};
		
		this.svg.attr("transform", function(){
			return "translate("+(that.chart.inner_width/2)+","+(that.chart.inner_height/2)+")"; 
		});
		
		/* polygon */
		var poly_data = (this.series.visible)? [0] : [];
		var poly = this.svg.selectAll(".ccd3_poly").data(poly_data);
		// enter
		poly.enter()
			.append("polygon")
			.attr("class","ccd3_poly")
			.attr("stroke",that.color)
			.attr("stroke-width",2)
			.attr("fill",that.color)
			.attr("fill-opacity",0.1)
			.on("mouseover", function(){
				d3.select(this).style("fill-opacity",0.5);
			})
			.on("mouseout", function(){
				d3.select(this).style("fill-opacity",0.1);
			})
			;
		// update
		poly
			.transition().duration(500)
			.attr("points",function(d){
				var str="",xy;
				for(var i=0,len=data.length;i<len;i++){
					xy = trans_xy(data[i]);
					str += xy[0] + "," + xy[1] + " ";
				}
				return str;
			})
			;
		// exit
		poly.call(this.exit);
		
		/* points */
		// data join
		var points = this.svg.selectAll(".ccd3_points_g").data(data);
		// enter
		points.enter()
			.append("g")
			.call(that.chart.tooltip.add_listener,that.chart.tooltip)
			.attr("class","ccd3_points_g")
			.call(function(e){
				e.append("circle").attr("fill",that.color).attr("r",that.point_radius);
			})
			.on("mouseover", function(){
				d3.select(this).select("circle").attr("r",that.point_radius_highlight);
			})
			.on("mouseout", function(){
				d3.select(this).select("circle").attr("r",that.point_radius);
			})
			;
		// update
		points
			.transition().duration(500)
			.attr("transform",function(d){
				var xy = trans_xy(d);
				return "translate("+xy[0]+","+xy[1]+")";
			})
			;
		
		// exit
		points.call(this.exit);
		
	};
	ccd3.Parts.Series.Radar.prototype.highlight_series = function(onoff){
		if(onoff){
			this.svg.selectAll(".ccd3_poly")
				.style("fill-opacity",0.5);
		}else{
			this.svg.selectAll(".ccd3_poly")
				.style("fill-opacity",0.1);
		}
	};
	ccd3.Parts.Series.Radar.prototype.tooltip_html = function(d){
		var html = "";
		html += "<b><span style='color:" + this.color + ";'>&#8226;</span> " + this.series.name + "</b>";
		html += "<br>x: " + this.chart.tooltip.xFormat(d.x);
		html += "<br>y: " + this.chart.tooltip.yFormat(d.y);
		return html;
	};
	
	/* ------------------------------------------------------------------ */
	/*  ccd3.DatasetManager                                               */
	/* ------------------------------------------------------------------ */

	ccd3.DatasetManager = function(chart,options){
		this.chart = chart;
		this.csv_auto_format = false;
		ccd3.Util.merge(this,options);
	};
	ccd3.DatasetManager.prototype.setup = function(dataset){
		var i,len;
		var type_info = ccd3.Parts.Series.type_info();
		
		// deep copy dataset
		this.dataset = ccd3.Util.copy(dataset);
		this.dataset_original = ccd3.Util.copy(dataset);
		dataset = this.dataset;
		
		// set default properties
		for(i=0,len=dataset.length;i<len;i++){
			dataset[i].series_num = i;
			if(dataset[i].series_type === undefined){
				dataset[i].series_type = this.chart.default_series_type;
			}
			if(dataset[i].name === undefined){
				dataset[i].name = "series"+(i+1);
			}
			if(dataset[i].visible === undefined){
				dataset[i].visible = true;
			}
			if(dataset[i].color !== undefined){
				this.chart.color_palette[i] = dataset[i].color;
			}
		}
		
		// check dataset
		var st_ar = []; // st = series_type
		for(i=0,len=dataset.length;i<len;i++){
			if(dataset[i].series_type !== undefined && !(type_info.hasOwnProperty(dataset[i].series_type))){
				throw new Error("invalid series_type");
			}
			st_ar.push(dataset[i].series_type);
		}
		for (var key in type_info) {
			if(type_info.hasOwnProperty(key)){
				if(type_info[key].is_single_series && st_ar.indexOf(key)>=0 && st_ar.length>1){
					throw new Error("If you use '"+key+"' series_type, you must set only one series in dataset.");
				}
			}
		}
		
		if(st_ar.indexOf("bar")>=0 && st_ar.indexOf("stackedbar")>=0){
			throw new Error("You can't use 'bar' and 'stackedbar' series_type at the same time.");
		}
		
		return dataset;
	};
	ccd3.DatasetManager.prototype.detect_chart_pattern = function(){
		if(this.dataset[0].series_type === "pie"){
			return "r";
		}else if(this.dataset[0].series_type === "radar"){
			return "ra";
		}
		return "xy";
	};
	ccd3.DatasetManager.prototype.options_from_dataset = function(){
		var options = {};
		
		if(this.dataset[0].series_type === "heatmap"){
			options = {
				legend: { show: false },
				xAxis: { band_padding: 0, domain_margin_type: "grid" },
				yAxis: { band_padding: 0, domain_margin_type: "grid" }
			};
		}
		
		return options;
	};
	ccd3.DatasetManager.prototype.has_directive_series_type = function(){
		var directives = ["bar","stackedbar","line"];
		for(var i=0,len=this.dataset.length;i<len;i++){
			if(directives.indexOf(this.dataset[i].series_type) >= 0){
				return true;
			}
		}
		return false;
	};
	ccd3.DatasetManager.prototype.has_series_type = function(series_type){
		for(var i=0,len=this.dataset.length;i<len;i++){
			if(this.dataset[i].series_type == series_type){
				return true;
			}
		}
		return false;
	};
	ccd3.DatasetManager.prototype.has_single_series_type = function(series_type){
		for(var i=0,len=this.dataset.length;i<len;i++){
			if(this.dataset[i].series_type != series_type){
				return false;
			}
		}
		return true;
	};
	ccd3.DatasetManager.prototype.detect_scale_type = function(func){
		var sample = func.call(this,this.dataset[0].values[0]);
		if(sample instanceof Date){
			return "date";
		}else if(typeof sample === "number"){
			return "linear";
		}else if(typeof sample === "string"){
			return "ordinal";
		}else{
			return null;
		}
	};
	ccd3.DatasetManager.prototype.calc_min_step = function(func){
		var dataset = this.dataset;
		var min,step;
		var sort_func = function(a,b){ return b-a; };
		for(var i=0;i<dataset.length;i++){
			var ar = [];
			for(var j=0;j<dataset[i].values.length;j++){
				ar.push(func.call(this,dataset[i].values[j]));
			}
			ar.sort(sort_func);
			for(var k=1;k<ar.length;k++){
				if(ar[k]===ar[k-1]){ continue; }
				step = Math.abs(ar[k] - ar[k-1]);
				if(min===undefined){
					min = step;
				}else{
					min = (min > step)? step : min;
				}
			}
		}
		return min; // return undefined if series has only one data
	};
	ccd3.DatasetManager.prototype.update_stack_values = function(direction,stack_type){
		var dataset = this.dataset;
		var dataset_stackedbar = [];
		if(!stack_type){ stack_type = "zero"; }
		
		for(var i=0;i<dataset.length;i++){
			if(dataset[i].series_type==="stackedbar" && dataset[i].visible){
				dataset_stackedbar.push(dataset[i]);
			}
		}
		if(dataset_stackedbar.length>0){
			var stack;
			
			if(direction === "x"){
				stack = d3.layout.stack()
					.offset(stack_type)
					.values(function(d){ return d.values; })
					;
				stack(dataset_stackedbar);
			}
			if(direction === "y"){
				stack = d3.layout.stack()
					.offset(stack_type)
					.values(function(d){ return d.values; })
					.x(function(d){ return d.y; })
					.y(function(d){ return d.x; })
					.out(function(d,x0,x){ d.x0=x0; d.x=x; })
					;
				stack(dataset_stackedbar);
			}
		}
	};
	ccd3.DatasetManager.prototype.build_lookup_table = function(axis){
		var dataset = this.dataset;
		var obj = {},t;
		for(var i=0;i<dataset.length;i++){
			if(dataset[i].visible){
				for(var j=0;j<dataset[i].values.length;j++){
					t = dataset[i].values[j][axis];
					if(!(obj.hasOwnProperty(t))){
						obj[t] = [];
					}
					dataset[i].values[j].series_name = dataset[i].name;
					dataset[i].values[j].series_num = i;
					obj[t].push(dataset[i].values[j]);
				}
			}
		}
		this["lookup_table_"+axis] = obj;
	};
	ccd3.DatasetManager.prototype.lookup = function(axis,value,nearest_search){
		var lookup_table = this["lookup_table_"+axis];
		var ret = lookup_table[value];
		
		if(!(ret) && nearest_search){
			var min_diff=null,min_value=null;
			for(var key in lookup_table){
				if(lookup_table.hasOwnProperty(key)){
					if(value instanceof Date){
						key = new Date(key);
					}
					if(min_diff===null || Math.abs(key-value) < min_diff){
						min_diff = Math.abs(key-value);
						min_value = key;
					}
				}
			}
			ret = lookup_table[min_value];
		}
		return (ret)? ret:[];
	};
	ccd3.DatasetManager.prototype.get_axis_sum = function(base_axis,sum_axis){
		var lookup_table = this["lookup_table_"+base_axis];
		var ar,sum,ret = {};
		for(var key in lookup_table){
			if(lookup_table.hasOwnProperty(key)){
				sum = 0;
				ar = lookup_table[key];
				for(var i=0;i<ar.length;i++){
					sum += lookup_table[key][i][sum_axis];
				}
				ret[key] = sum;
			}
		}
		return ret;
	};
	ccd3.DatasetManager.prototype.get_max = function(func){
		return d3.max(this.dataset.map(function(d){ 
			if(d.visible){
				return d3.max(d.values,function(d2){ return func(d2); });
			}else{
				return null;
			}
		}));
	};
	ccd3.DatasetManager.prototype.get_min = function(func){
		return d3.min(this.dataset.map(function(d){ 
			if(d.visible){
				return d3.min(d.values,function(d2){ return func(d2); });
			}else{
				return null;
			}
		}));
	};
	ccd3.DatasetManager.prototype.to_csv = function(dataset){
		if(dataset === undefined){ dataset = this.dataset; }
		var ar=[["label","x","y","z"]],csv="",row,d,i,j;
		
		var voidFormat = function(d){ return d; };
		var xFormat,yFormat,zFormat;
		if(this.csv_auto_format){
			xFormat = this.chart.tooltip.xFormat || this.chart.xAxis.format || this.chart.aAxis.format || voidFormat;
			yFormat = this.chart.tooltip.yFormat || this.chart.yAxis.format || this.chart.rAxis.format || voidFormat;
			zFormat = this.chart.tooltip.zFormat || voidFormat;
		}else{
			xFormat = voidFormat;
			yFormat = voidFormat;
			zFormat = voidFormat;
		}
		
		for(i=0;i<dataset.length;i++){
			for(j=0;j<dataset[i].values.length;j++){
				row = [dataset[i].name];
				d = dataset[i].values[j];
				if(d.x!==undefined){ row.push(xFormat(d.x)); }else{ row.push(""); }
				if(d.y!==undefined){ row.push(yFormat(d.y)); }else{ row.push(""); }
				if(d.z!==undefined){ row.push(zFormat(d.z)); }else{ row.push(""); }
				ar.push(row);
			}
		}
		for(i=0;i<ar.length;i++){
			csv += '"' + ar[i].join('","') + '"\n';
		}
		return csv;
	};
	ccd3.DatasetManager.prototype.download_as_csv = function(file_contents,file_name){
		if(file_name===undefined){ file_name = "data.csv"; }
		
		var f = d3.select("body").append("form").attr("method","POST").attr("action",ccd3.options.csv_echo_path());
		f.append("input").attr("name","file_name").attr("value",file_name).attr("type","hidden");
		f.append("input").attr("name","file_contents").attr("value",file_contents).attr("type","hidden");
		f[0][0].submit();
		f.remove();
	};

	
	/* ------------------------------------------------------------------ */
	/*  ccd3.DatasetLoader                                                */
	/* ------------------------------------------------------------------ */

	ccd3.DatasetLoader = function(chart){
		this.chart = chart;
		this.base_url = undefined;
		this.url_params = {};
		this.dataset_filter = undefined;
	};
	ccd3.DatasetLoader.prototype.xhr_load = function(params){
		if(!(this.chart.overlay_loading instanceof ccd3.Parts.OverlayLoading)){
			this.chart.overlay_loading = new ccd3.Parts.OverlayLoading(this.chart,{});
		}
		this.chart.overlay_loading.render(true);
		
		var url = this.setup_url(params,this.base_url);
		d3.json(url,function(dataset){
			if(this.dataset_filter){
				dataset = this.dataset_filter.apply(this,[dataset]);
			}
			this.chart.set_dataset(dataset);
			this.chart.render();
			this.chart.overlay_loading.render(false);
		}.bind(this));
	};
	ccd3.DatasetLoader.prototype.setup_url = function(params,url){
		if(!url){ url = this.base_url; }
		params = ccd3.Util.merge(this.url_params, params);
		var params_str = "";
		var urls = url.split("?");
		var base_params_ar,base_params = {},param;
		if(urls[1]){
			base_params_ar = urls[1].split("&");
			for(var i=0;i<base_params_ar.length;i++){
				param = base_params_ar[i].split("=");
				base_params[param[0]] = param[1];
			}
		}
		ccd3.Util.merge(base_params,params);
		for(var key in base_params){
			if(base_params.hasOwnProperty(key) && base_params[key] !== null){
				if(params_str!==""){ params_str += "&"; }
				params_str += key + "=" + base_params[key];
			}
		}
		return urls[0] + "?" + params_str;
	};

	/* ------------------------------------------------------------------ */
	/*  ccd3.Util                                                         */
	/* ------------------------------------------------------------------ */
	ccd3.Util = {};
	/**
	* merge object(overwrite properties)
	* thanks to https://gist.github.com/ww24/2181560
	*/
	ccd3.Util.merge = function(a,b){
		for (var key in b) {
			if (b.hasOwnProperty(key)) {
				a[key] = (key in a) ? 
					((typeof a[key] === "object" && typeof b[key] === "object") ?
						ccd3.Util.merge(a[key], b[key]) : b[key]) : b[key];
			}
		}
		return a;
	};
	ccd3.Util.copy = function(obj){
		// deep copy dataset and so on.
		if (null === obj || undefined === obj || "object" != typeof obj) return obj;
		var copy;
		
		if (obj instanceof Date) {
			copy = new Date();
			copy.setTime(obj.getTime());
			return copy;
		}
		if (obj instanceof Array) {
			copy = [];
			for (var i = 0, len = obj.length; i < len; i++) {
				copy[i] = ccd3.Util.copy(obj[i]);
			}
			return copy;
		}
		if (obj instanceof Object) {
			copy = {};
			for (var attr in obj) {
				if (obj.hasOwnProperty(attr)) copy[attr] = ccd3.Util.copy(obj[attr]);
			}
			return copy;
		}
		
		throw new Error("Unable to copy obj! Its type isn't supported.");
	};
	ccd3.Util.default_numeric_format = function(d){
		// ref https://github.com/mbostock/d3/wiki/Formatting 
		return d3.format(",.2s")(d); // 120k
		// return d3.format(",.0f")(d); // 123,456
		// return d3.format(",.2f")(d); // 123,456.78
		// return d3.format(",.3r")(d); // 123,000 or 0.0123
	};
	ccd3.Util.default_date_format = function(d){
		// ref https://github.com/mbostock/d3/wiki/Time-Formatting
		return d3.time.format("%m/%d")(d);
	};
	ccd3.Util.default_percent_format = function(d){
		return d3.format(",.1%")(d);
	};
	ccd3.Util.each_data = function(dataset,func){
		for(var i=0,len=dataset.length;i<len;i++){
			for(var j=0,len2=dataset[i].values.length;j<len2;j++){
				func(dataset[i].values[j]);
			}
		}
		return dataset;
	};
	ccd3.Util.swap_dataset_xy = function(dataset){
		ccd3.Util.each_data(dataset,function(d){
			var tmp = d.x;
			d.x = d.y;
			d.y = tmp;
		});
		return dataset;
	};
	ccd3.Util.dataset_from_array = function(ar,rules,options){
		if(!options){ options = {}; }
		var dataset = [],values,value,v;
		var rule,header;
		
		if(!(rules instanceof Array)){ rules = [rules]; }
		
		if(options.header_row){
			header = ar.shift();
		}
		
		for(var i=0;i<rules.length;i++){
			rule = rules[i];
			values = [];
			for(var j=0;j<ar.length;j++){
				value = {};
				if(rule.x !== undefined){
					v = ar[j][rule.x];
					value.x = (rule.x_format)? rule.x_format(v) : v;
				}
				if(rule.y !== undefined){
					v = ar[j][rule.y];
					value.y = (rule.y_format)? rule.y_format(v) : v;
				}
				if(rule.z !== undefined){
					v = ar[j][rule.z];
					value.z = (rule.z_format)? rule.z_format(v) : v;
				}
				values.push(value);
			}
			dataset.push({values:values});
		}
		
		return dataset;
	};
	
	return ccd3;
}();
