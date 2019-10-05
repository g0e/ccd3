
describe("ccd3.ccd3.Util.", function(){
	it("dataset_from_array work.",function(){
		var ar,dataset;
		
		ar = [
			["a",1,10,"100"],
			["b",2,20,"200"],
			["c",3,30,"300"],
			["d",4,40,"400"],
			["e",5,50,"500"]
		];
		dataset = ccd3.ccd3.Util.dataset_from_array(ar,[{x:0,y:1},{x:0,y:2}]);
		expect(dataset[0].values[0].x).toEqual("a");
		expect(dataset[0].values[0].y).toEqual(1);
		expect(dataset[0].values[4].x).toEqual("e");
		expect(dataset[0].values[4].y).toEqual(5);
		expect(dataset[1].values[2].x).toEqual("c");
		expect(dataset[1].values[2].y).toEqual(30);
		
		ar = [
			["label1","label2","label3","label4"],
			["a",1,10,"100"],
			["b",2,20,"200"],
			["c",3,30,"300"],
			["d",4,40,"400"],
			["e",5,50,"500"]
		];
		dataset = ccd3.ccd3.Util.dataset_from_array(ar,[{x:0,y:1},{x:0,y:2}],{header_row:true});
		expect(dataset[0].values[0].x).toEqual("a");
		expect(dataset[0].values[0].y).toEqual(1);
	
		ar = [
			{label1:"a", label2:1, label3:10, label4:"100"},
			{label1:"b", label2:2, label3:20, label4:"200"},
			{label1:"c", label2:3, label3:30, label4:"300"},
			{label1:"d", label2:4, label3:40, label4:"400"},
			{label1:"e", label2:5, label3:50, label4:"500"}
		];
		dataset = ccd3.ccd3.Util.dataset_from_array(ar,[{x:"label1",y:"label2"},{x:"label1",y:"label3"}]);
		expect(dataset[0].values[0].x).toEqual("a");
		expect(dataset[0].values[0].y).toEqual(1);
		expect(dataset[0].values[4].x).toEqual("e");
		expect(dataset[0].values[4].y).toEqual(5);
		expect(dataset[1].values[2].x).toEqual("c");
		expect(dataset[1].values[2].y).toEqual(30);
		
		dataset = ccd3.ccd3.Util.dataset_from_array(ar,
			{x:"label1",y:"label4", y_format: function(d){ return parseInt(d) } });
		
		/*
		d3.select("#chart_div").append("div").attr("id","chart"+seq).style("margin","20px").style("float","left");
		var chart = new ccd3.ccd3.Chart("chart"+seq,dataset);
		chart.render();
		seq++;
		*/
		
	});

});

