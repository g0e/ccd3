
describe("ccd3 basic charts", function(){
	var c; // chart obj
	var d; // dataset obj
	var series_types = ["line","bar","stackedbar","scatter","bubble"];
	
	beforeEach(function(){
	});
	
	afterEach(function(){
		c.destroy();
	});

	describe("don't throw", function(){
		describe("with dataset of", function(){
			var render = function(dataset,series_type){
				if(c!==undefined){ c.destroy(); }
				c = new ccd3.Chart("chart_div",dataset);
				c.default_series_type = series_type;
				c.render();
			};

			it("random_diff", function(){
				series_types.forEach(function(type){
					expect(function(){
						render(ccd3_dataset.random_diff(),type);
					}).not.toThrow();
				}); 
			});
		
			it("random_xyz", function(){
				series_types.forEach(function(type){
					expect(function(){
						render(ccd3_dataset.random_xyz(),type);
					}).not.toThrow();
				}); 
			});
		
			it("random_weekday", function(){
				series_types.forEach(function(type){
					expect(function(){
						render(ccd3_dataset.random_weekday(),type);
					}).not.toThrow();
				}); 
			});
			
			it("swaped_xy random_diff", function(){
				series_types.forEach(function(type){
					expect(function(){
						render(ccd3.Util.swap_dataset_xy(ccd3_dataset.random_diff()),type);
					}).not.toThrow();
				}); 
			});
			
			it("swaped_xy random_xyz", function(){
				series_types.forEach(function(type){
					expect(function(){
						render(ccd3.Util.swap_dataset_xy(ccd3_dataset.random_xyz()),type);
					}).not.toThrow();
				}); 
			});
			
			it("swaped_xy random_weekday", function(){
				series_types.forEach(function(type){
					expect(function(){
						render(ccd3.Util.swap_dataset_xy(ccd3_dataset.random_weekday()),type);
					}).not.toThrow();
				}); 
			});


		});
	});

});

