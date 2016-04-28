
var scenarios = [
	{ name: "ir", values: [0.001, 0.005,0.01, 0.05], title: "At {0}% interest rate", 
		"blurb": "Interest Rate Sensitivity" },
	{ name: "tecons", values: [30, 60, 100], title: "{0} Years", blurb: "Economic Lifetime Sensitivity"},
	{ name: "c1", values: [45, 65, 85, 125], "title": "{0}$ per kg UF6", "blurb": "Cost of Uranium Sensitivity<span class='red'>*</span>", "sub":"*Note that the cost of uranium hardly  matters in fixing the cost of electricity for nuclear power plants, a fact that has long been recognized as a unique feature of this energy technology." },
	{ name: "tcons", values: [0.5, 2, 5, 10, 15], "title": "{0} Years", "blurb": "Reactor Construction Time Sensitivity" }
];

var rms = [ { t: "Once Through", s: "lwr"}, { t: "Full Recycle", s: "fr"}, {t: "MOX Recycle", s:"mox"}]

function drun(modelName, firstRun){

	var fn = (modelName==="lwr")?lwr: ((modelName==="fr")?fr : mox);
	

	for(var s in scenarios){

		var gx={};
		for (var o in params)
			gx[o] = params[o].value;
		

		var scenario = scenarios[s];
		for(var i in scenario.values){         
			var displayid = modelName + scenario.name + i;
			gx[scenario.name] = scenario.values[i];
		

			f239mox=xp=fpusf = null; //hack so I can reuse the model code from model page
			var r= fn(gx).toFixed(2);
						

			var disp = d3.select("#" + displayid);
			var oldr = +disp.select(".result").text();

			if(! firstRun){
				if (r > oldr || r < oldr)
					disp.style("background", "#fffff7");
				disp.select(".arrow").style("opacity", 1e-6);
				var clr = (r>oldr)? "red" : ((r < oldr)? "blue" : "#333");

				var txt= disp.select(".result")
					    .style("opacity", 1e-6);
			
				txt.transition().duration(lDuration)
					.style("opacity", 1)
					.text(r).style("color", clr);
			
				disp.select(".arrow")
					.html(function(){
						if(r > oldr) return "<i class='fa fa-long-arrow-up'></i>";
						else if(r < oldr) return "<i class='fa fa-long-arrow-down'></i>";
						else return "";
					})
					.style("opacity", 1)
					.transition().duration(lDuration);
			}else{
				disp.select(".arrow").html("");
				disp.select(".result").text(r).style("color", "black");
			}
			
			
		} 
		
	}
}

function ddoRun(model,firstrun){
	d3.selectAll(".rtd").style("background", "none");
	d3.selectAll(".result")
		.style("color", "#333")
		.style("font-weight", "normal");


	d3.selectAll("span.arrow").html("");	

	if(_type(model) ==="array")
		for(var i in model){
			drun(model[i]);
			}
	else{
		drun(model,firstrun);
	}
}
function inputChange(d){


		if( ! isNaN(d.value)){
			d3.select(this)
				.html("")
				.append("input")
				.attr("class", "vv")
				.attr("id", d.name)
				.on("keyup", function(d){
					if(d3.event.keyCode === 13){ 
						this.blur();
					}
				})
				.on("blur", function(){
					var v = this.value;
					var p = d3.select(this.parentNode);
					params[d.name].value = Math.min(+v,d.max) || params[d.name].value;
					p.html(params[d.name].value);
					d3.select(this).remove();
					ddoRun(d.model);

				});
			
			$("input#"+d.name).focus();
		}else{
			var p = d3.select(this.parentNode);
			var t = d3.select(this);
			var v = t.html();
			d3.select(this).remove();

			var sel =p.append("select")
				.attr("id", d.name)
				.on("change", function(d){
					this.blur();
				})
				.on("blur", function(d){
					params[d.name].value = +this.value;
					p.append("text").html(this.value).on("click",inputChange);
					d3.select(this).remove();	
					ddoRun(d.model);
				});

				
			var opt = sel.selectAll("option").data(d.value).enter();
			opt.append("option").attr("value",function(d){ return d;}).text(function(d){return d;});
			$("select#" + d.name ).focus();	
			sel.selectAll("option").property("selected", function(d){ return (d==v)? true: false;}); 


		}


}

	
function doResTables(){
	var sc = arrayEqualSplit(scenarios,2);
	


	var rc = d3.select("#resultsContainer");
	
	sc.forEach(function(scen,i){
		var trc = rc.append("div").attr("class", "tableRow");
		var r = trc.selectAll(".resultsTable")
			.data(scen);


		var tbl = r.enter().append("table")
			.attr("class", "resultsTable table table-condensed")
			.attr("id", function(d){ return d.name ;});
			

		r.each(function(d){
			if(d.sub){
			  d3.select(this.parentNode).append("div")
				.attr("class", "sub red")
				.html(function(){ return d.sub || "";});	
			}
		});

		var thead = tbl.append("thead").append("tr").attr("class", "header");
		var tbody = tbl.append("tbody");

		tbl.append("caption").html(function(d){ return d.blurb; });
		
		d3.select(thead.node()).append("th").attr("class","tside");

		thead.each(function(d){
			var thead_ = d3.select(this);
			thead_.selectAll(".th").data( d.values).enter()
				.append("th")
				.text(function(c){ c=(d.name=="ir")? c* 100: c; return d.title.format(c);});
		});

		var tbtr = tbody.selectAll("tr").data(rms).enter()
				.append("tr").attr("class", function(d){ return d.s;});

		
		d3.select(tbody.node()).selectAll("tr").append("td").attr("class", "tside").text(function (d){return d.t;});

		tbtr.each(function(d){
			var _pd = d3.select(this.parentNode).datum();
			var _td = d3.select(this).datum();
			var tbtr_ = d3.select(this);
		
			var rtd =tbtr_.selectAll(".rtd").data(_pd.values).enter()
				.append("td")
				.attr("class", "rtd")
				.style("background", "none")
				.attr("id", function(d,i){ return _td.s+_pd.name + i; });
				
			rtd.append("span").attr("class","result").text(0);
			rtd.append("span").attr("class", "arrow");
				
		});

	});
	
}


function start(metadata){
	var dataFile = metadata.filename;


	d3.json(dataFile, function(data){
		data = filterByModel(data);
	
	

		var rendered = [];

		for(var m in data){
			var model = {
				name:m,
				data: deepCopyArr(data[m]),
				displayid: [ 1, 5, 10]
			};

			model.data.forEach(function(d){
				params[d.name] = { 
					value: corsd(d),
					std: +d.std
				};
				names[d.name] = {title: d.title, subtitle: d.subtitle};
			}); 
		
		

			var table = d3.select("#dtoppane")
				.selectAll(".paramTable")
				.data([model], function(d){ return d.name;})
				.enter()
				//.append("div").attr("class", "tableContainer")
				.append("table")
				.attr("id", model.name + "tbl")
				.attr("class", "paramTable");

			var thead =table.append("thead")
				.append("tr").attr("class", "modelName")
				.append("th")
				.attr("colspan", 3)
				.text(modelLongName[model.name]);

	
			var tbody =table.append("tbody");
				
			var ttr = tbody.append("tr")
				.attr("class", "header");
			ttr.append("td").text("Parameter");
			ttr.append("td").text("Units");
			ttr.append("td").text("Value");
		

			var tm = tbody.selectAll(".ptr")
				.data(model.data.filter(function (d){
					return rendered.indexOf(d.name) === -1;
				}), function (d){ return d.name;});
				

			var tEnter = tm.enter()
				.append("tr").attr("class", "ptr");


			tEnter.append("td")
				.attr("class", "title")
				.text(function(d){ 
					rendered.push(d.name);
					return d.title;
				});

			tEnter.append("td")
				.attr("class", "subtitle")
				.text(function(d){ return d.subtitle;});

			tEnter.append("td")
				.attr("class", "value")
				.append("text")
				.attr("class", "tv")
				.on("click", inputChange);
					

			//Update
			d3.selectAll(".tv")
				.html(function(d){ return params[d.name].value;});
		

			ddoRun(model.name,true);
		}
	});

	

}
