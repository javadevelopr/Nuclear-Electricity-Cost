function colScale(d){
	return d3.scale.linear().domain([0,1]).range([0,d.colwidth]);
}

function coercei(d){
	if(d.value)
		d.value = +d.value;
	else d.value = 0;
	if(d.std)d.std = +d.std;
	if(d.min)d.min = +d.min;
	if(d.max)d.max = +d.max;

	return d;
}


function coerce(data){
	
	data.forEach(function(d){
		coercei(d);
	});
	return data;
}

function handleX(d){
	return d.x   ;
}

function numX(d){
	return d.x + 5;
}
	
var Columns;
	
function initColumns(){
	Columns= (screen.width < 801)? (maxColumns-2) : (screen.width < 1281)? (maxColumns - 1):maxColumns;
	oWidth = barWidth/Columns;
	x1.range([0,oWidth]);

	var colWidthStr = "col-md-" + parseInt(12/Columns) + " column";

	d3.range(Columns).forEach(function(v,i){
		var s = colWidthStr; 
		s += (i < Columns - 1)? " inner-column": "";
		
		d3.select("body").select(".xcontrols")
			.select(".row")
			.selectAll(".dv")
			.data([0]).enter().append("div")
			.attr("class", s)
			.append("div")
			.attr("class", "dvc")
			.attr("id", "C" + i);
	});

}

function doRealSlider(rg){


	realSliderScale.domain([1,maxrealizations]);
	var x = realSliderScale(nrealizations);

	rg =rg.selectAll(".realslider").data([{x:0}]).enter();

	rg.append("rect").attr("class", "realslider")
		.attr("width", realSliderW)
		.attr("height", realSliderH);
	
	rg.append("line").attr("class", "realsliderc clickable-neutral")
		.attr("y1", -6)
		.attr("y2", realSliderH + 6)
		.attr("x1", function(d){ return d.x =realSliderScale(nrealizations);}) 
		.attr("x2", realSliderScale(nrealizations))
		.call( d3.behavior.drag().origin(Object)
			.on("drag", events.dragRealSlider)
			.on("dragend", function(){runModel(currentModel);})
		);


	rg.append("text")
		.attr("class", "num rslabel")
		.attr("y", realSliderH + 6)
		.attr("x", function(d){ return d.x;})
		.attr("dy", "1em")
		.attr("dx", "-1.5em")
		.text(nrealizations);
	
	rg.append("text")
		.attr("class","subtitle")
		.attr("x", 0)
		.attr("y", -9)
		.text(realText); 	

	rg.append("text")
		.attr("class", "subtitle maxrslabel")
		.attr("x",realSliderW)
		.attr("y", -9)
		.style("text-anchor", "end")
		.text(d3.format(",")(maxrealizations) );
		


}


function toggleActive(pname){
	$(".paginate").removeClass("active");
	$("."+pname).addClass("active");
}


function setScatter(){
	if (scatter) return;

	$(".pst").removeClass("active");
	$("#psts").addClass("active");

	scatter=true;
	initScatter(currentModel.data);
	runModel(currentModel);
}

function setGraph(){
	if(!scatter) return;
	$(".pst").removeClass("active");
	$("#pstg").addClass("active");
	scatter=false;
	initGraph();
	runModel(currentModel);
}


function renderModel(model){


	//render columns
	var data_array = arrayEqualSplit(model.data, Columns);
	

	data_array.forEach(function(cdata,i){
		var cl = d3.select("#C" + i);
		renderColumn(model,cdata, cl); 
	});
}


function loadPage(model){
	
	toggleActive(model.name);
	
	//update slider for stochastic nrealizations
	d3.select(".svga").selectAll(".nhandle")
		.call(d3.behavior.drag().origin(Object).on("drag",function(d){
			var ct = d3.select(this.parentNode)
				.selectAll('.controlbar')
				.attr('width', d.x=Math.max(1, Math.min(realizeBarWidth, d3.event.x)));
			
			d3.select(this).attr('x1', d.x - 1).attr('x2', d.x -1);
			nrealizations = parseInt(d.scale.invert(d.x));
		
			d3.select(this.parentNode).selectAll(".num").text(nrealizations);
			
			})
			.on("dragend", function(d){ runModel(model);})
		);		 


	//draw columns
	renderModel(model);
	
}


function toggleDefaults(){
	modelState="S";	
	params = deepCopy(origParams);
	updateSliders();
	updateStdSliders();
	nrealizations = prevrealizations;
	runModel(currentModel);

}


function toggleState(){
	if (modelState ===  "D") return;
	modelState ="D";
	for(var i in params){
		var d = params[i];
		if(d.std)d.std = 0;
	};
	updateStdSliders();
	prevrealizations = nrealizations;
	nrealizations = 1;
	runModel(currentModel);
}




function drawLegend(){

	var p = d3.select("svg#legend")
		.attr("width", pieW)
		.attr("height", pieH + 50)
		.append("g")
		.attr("transform", "translate("	+ pieW/2 + "," + pieH/2 + ")");


	var path = p.selectAll("path").data([0,1])
		.enter().append("path")
		//.style("fill", d3.scale.ordinal().domain([0,1]).range([pieColor, "white"]))
		.each(function(){ this._current = {startAngle:0, endAngle:0};});

	p.append("text")
	  	.attr("transform", "translate(" +(-pieRadius -20) + "," + (pieRadius+55)  + ")")
		.attr("class", "llabel");
	var legendt =p.append("text")
	  	.attr("transform", "translate(" +(-pieRadius-20) + "," + (pieRadius + 55)  + ")")
		.attr("class", "llabel small clickable")
		.attr("dy", "1.5em")
		.attr("dx", ".1em")
		.html(units);
		//.on("click", toggleUnits);
		
	var safarimsie = detectBrowser();
	if(safarimsie === "msie" || safarimsie === "safari")
		legendt.text(msie_units);


}
function toggleUnits(){
	cpkw = !cpkw;
	units = (cpkw)?  cents : dollars ;
}



function updateLegend(mean){

	var pieColor = pcolorscale(mean);

	var ldata = [mean, Math.max(0,pieMaxValue - mean)];
	var p = d3.select("svg#legend").selectAll("path")
		.data(legend_pie.value( function(g){ return g;})(ldata))
		.transition().duration(lDuration)
		.style("fill", function(d,i){ 
			if(i===0) return pieColor;
			else return "transparent";
		})  
		.attrTween("d", function(d){
			var interpolate = d3.interpolate(this._current,d);
			this._current = interpolate(0);
			return function(t){ return legend_arc(interpolate(t));};
		});

	d3.select("svg#legend").select(".llabel")
		.transition().delay(sDuration)
		.text(mean);

}
