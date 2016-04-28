var gx1 = d3.scale.linear().range([0, scatterW + 40]);
var gy1 = d3.scale.linear().range([scatterH,0]);


function toggleVisibleGraph(elem){
	var e= d3.selectAll("." + elem);
	if (e.attr("visibility") !== "hidden")
		e.attr("visibility", "hidden");
	else e.attr("visibility", "visible");

}
	


function initGraph(){
	maxrealizations = 100000;
	nrealizations = Math.min(nrealizations,maxrealizations);
	$(".scatterPane").hide();
	$(".graphPane").show();
	
	var gpane = d3.select("svg.graphPane");

	//remove old
	gpane.selectAll("g").remove();

	//add realizations bar
	gpane.append("g")
		.attr("transform", "translate(" + (scatterW-scatterMargin.right * 4.5) +"," +  "20)")
		.attr("class", "realSlider")
		.call(doRealSlider);




	//graph legend
	var gl = gpane.append("g")
		.attr("transform", "translate(90,60)");
		
	gl.append("text")
		.attr("class", "gtitle")
		.text(graphLegend);

	gl.append("text")
		.attr("class", "gsubtitle")
		.attr("dy","1.5em");

	gl.append("text")
		.attr("class", "gtitle")
		.attr("id", "ml")
		.attr("dy", "3.0em");




	//path legends
	var gpl = gpane
		.selectAll(".gpl")
		.data([
			{ 
			  "stroke": glinestroke,
			  "gl" : "",
			  "path" : "gline",
			  "wh" : "g"
			},
			{ 
			  "stroke": nlinestroke,
			  "gl" : "Normal distribution",
			  "glsub" : "with same mean & sample size", 
			  "path" : "nline",
			  "wh" : "n"
			}
		])
		.enter()
		.append("g")
		.attr("transform", function(d,i){
			return "translate(" + (scatterW) + "," + (120 + i *15)   +")";
		}); 

	gpl.append("line").attr("class","gpl clickable")
		.style("stroke", function (d){ return d.stroke;})
		.attr("x1", 0)
		.attr("x2", 16)
		.on("click", function(d){
			toggleVisibleGraph(d.path);
		});


	var gpltxt =gpl.append("text")
		.attr("class", "gpl")
		.attr("id", function(d){ return "gpl" + d.wh ;})
		.attr("dx", "2.5em")
		.attr("dy", "0.45em")
	
	gpltxt.append("tspan")	
		.text(function(d){ return d.gl;});

	gpltxt.append("tspan")
		.attr("dx", "-8.8em")
		.attr("dy", "1.0em")
		.text(function(d){ return d.glsub;});

}		


function renderGraph(gdata, model,mean, std){
	

	var bins = d3.layout.histogram().frequency(false)
		.bins(binCount)(gdata);

	var ny = bins.map(function(c){ return gpdf(c.x, mean,std) * c.dx ;});
	var xmax = d3.max(bins, function(c){ return c.x; });
	var ymax = d3.max(ny.concat(bins.map(function(c){ return c.y;})));




	var newData = [], normalData=[];
	gx1.domain([0, xmax]);
	gy1.domain([0, ymax]);

	bins.forEach(function(c,i){
		var _x = gx1(c.x);
		newData.push([_x, gy1(c.y)]);
		normalData.push([ _x, gy1(ny[i])]);
	});



	var gsvg = d3.select("svg.graphPane")
		.selectAll(".ggg")
		.data([newData])
		.enter()
		.append("g")
		.attr("class", "ggg")
		.attr("transform", "translate(" + scatterMargin.left
			+"," +scatterMargin.top +")");


	//axes
	gxAxis = d3.svg.axis().tickFormat(d3.format(".2f")).scale(gx1).orient("bottom");
	gyAxis = d3.svg.axis().tickFormat(d3.format(".2f")).scale(gy1).orient("left");
	
	var xaxist =gsvg.append("g")
		.attr("transform", "translate(0," +(scatterH + scatterMargin.bottom) + ")")
		.attr("class", "x axis")
		.append("text")
		.attr("x", (scatterMargin.left + scatterW))
		.attr("y", "-5")
		.style("text-anchor", "end")
		.html(legend + "(" + units + ")");

	var safarimsie = detectBrowser();
	if(safarimsie === "msie" || safarimsie === "safari")
		xaxist.text(legend + "("+ msie_units +")");

	gsvg.append("g").attr("class", "y axis")
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 20  )
		.attr("x", -(scatterH + scatterMargin.bottom)/2)
		.text("Frequency");






	var line  = d3.svg.line()
		.interpolate("cardinal");
	var nline = d3.svg.line().interpolate("cardinal");
		
	gsvg.append("path").datum(newData)
		.attr("class", "gline");
	

	gsvg.append("path").datum(normalData)
		.attr("class", "nline");

	//Update Axis
	gsvgup = d3.selectAll(".ggg");
	gsvgup.selectAll("g.x").transition().duration(mDuration).call(gxAxis);
	gsvgup.selectAll("g.y").transition().duration(mDuration).call(gyAxis);
	
	//Update lines	
	gsvgup.selectAll(".gline")
		.transition().duration(lDuration)
		.attr("d", line(newData));

	gsvgup.selectAll(".nline")
		.attr("d", nline(normalData));

	//graph legends
	d3.select("svg.graphPane").selectAll(".gsubtitle")
		.text(nrealizations + " realizations");

	d3.selectAll("text#ml").text( "Mean: " + current_mean + "  Std:" + current_std);
	d3.selectAll("text#gplg").text(currentModel.name.toUpperCase() +" distribution");
}
	
