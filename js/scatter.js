


function redrawSliders(d){
	for (var i in d){
		var v = d[i];
		if (v > 0)
			fakeParams[i].value = v;
	}
	updateSliders(fakeParams);

}


function updateScatter(queue){
	var d = queue[0];	

	scatterFocus = d.name;
	var margin = xTrans + scatterMargin.left;	

	//redraw axes
	//update scale
	if (d.max)
		sx1 =d3.scale.linear().range([margin, margin + scatterW  ]).domain([0, d.max]);
	else {//discrete parameters
		sx1 = d3.scale.ordinal().rangePoints([margin,margin + scatterW]).domain(d.value);
	}
	sxAxis.scale(sx1);
	var axis = scatterPane.selectAll(".x").data([d]);
	axis.transition().duration(mDuration).call(sxAxis);



	axis.selectAll(".slabel").data([d])
		.text(function(d){ return d.title;});
	
	axis.selectAll("text#sxlabelsub").data([d])
		.text(function(d){ return d.subtitle || "";});



	//redraw circles in new x position 
	scatterPane.selectAll(".circle")
		.transition()
		.ease("quad")
		.duration(mDuration)
		//.style("fill", function(d){
		.attr("cx", function(d){
			return d.x = sx1(d.d[scatterFocus]) ;  
		});
}


//make circle colors diverge the farther that run's value is from mean
function circleFill(d){
//Have to fixe this
	var _v= 0;
	if(d.v > current_mean) _v = 2 *current_mean - d.v;
	else    _v = d.v 
	return scolorscale(_v);
}

		

	
function initScatter(modelData){
	maxrealizations = 5000;	
	nrealizations = Math.min(nrealizations,maxrealizations);
	

	modelData = modelData.filter(function(d){
		return typeof d.std !== "undefined";
	});

	$(".graphPane").hide();
	$(".scatterPane").show();
	realSliderW=250;
	realSliderScale.range([0,realSliderW]);

	var msvg = d3.select("svg.scatterPane");
	//remove old
	msvg.selectAll("g").remove();



		
		//show and hide blurb on top of scatter, add main drawing area
	scatterPane =msvg
		.append("g")
		.attr("class", "scatterMain")
		.attr("transform", "translate(" + scatterMargin.left + "," + scatterMargin.top + ")");
	

	var queue = modelData.slice(0);
	var margin = xTrans + scatterMargin.left;	

	//draw axes
	sxAxis = d3.svg.axis().ticks(nXticks).orient("bottom")
		.tickSize(xTickSz).tickFormat(d3.format(".2f"));

	syAxis = d3.svg.axis().ticks(nYticks).orient("left")
		.tickSize(yTickSz).tickFormat(d3.format(".2f"));


	var yfr =scatterPane.append("g").attr("class", "y axis");	

	var fr =yfr.append("foreignObject")
		.attr("height", 60)
		.attr("width", 135)
		.attr("x", -20)
		.attr("y", -40)
		.append("xhtml:div")
		.attr("class", "slabely");

	fr.append("xhtml:div")
		.attr("class", "sslabely")
		.html(legend);
		
	fr.append("xhtml:div")
		.attr("class", "sslabely small")
		.html("(" + units + ")");
	

	if(detectBrowser() === "msie"){
		yfr.append("text")
		 .attr("class", "slabel")
		 .attr("transform", "rotate(-90)")
		 .attr("x", -150)
		 .attr("y", 20)
		 .text(legend );
	} 

	var axis =scatterPane.append("g").attr("class", "x axis")
		.attr("transform", "translate("  + (0) + "," + (scatterH) +")");
	

	axis.append("text")
		.attr("class", "slabel")
		.attr("data-toggle", "tooltip")
		.attr("data-placement", "top")
		.attr("title", "Click on arrows to change axis")
		.attr("id", "sxlabel")
		.attr("x", margin + scatterW )
		.attr("dy", "2.5em")
		.style("text-anchor", "end");
	
	//enable bootstrap tooltip for above
	$("#sxlabel").tooltip({"title":"Click on arrows to change axis"});

	axis.append("text")
		.attr("class", "gtitle")
		.attr("id", "sxlabelsub")
		.attr("x", margin + scatterW)
		.attr("dy", "4.0em")
		.style("text-anchor", "end");



	axis.append("foreignObject")
		.attr("x", margin + scatterW + 28 )
		.attr("y" , 20)
		.attr("height",20)
		.attr("width",20)
		.on("click", function(){
			queue.push(queue.shift());
			updateScatter(queue);
		})
		.append("xhtml:i")
		.style("font-size","14px")
		.attr("class", "fa fa-chevron-circle-right clickable");
			
	axis.append("foreignObject")
		.attr("x", margin + scatterW + 10 )
		.attr("y" , 20)
		.attr("height",20)
		.attr("width",20)
		.on("click", function(){
			queue.unshift(queue.pop());
			updateScatter(queue);
		})
		.append("xhtml:i")
		.style("font-size","14px")
		.attr("class", "fa fa-chevron-circle-left clickable");

	//IExplorer
	if(detectBrowser() === "msie"){
		axis.append("text")
		 .attr("x", margin + scatterW + 28)
		 .attr("y", 20)
		 .attr("class", "clickable")
		 .style("font-weight", "bold")
		 .text(">>")
		 .on("click", function(){
			queue.unshift(queue.pop());
			updateScatter(queue);
		});
	
		axis.append("text")
		 .attr("x", margin + scatterW + 10)
		 .attr("y", 20)
		 .attr("class", "clickable")
		 .style("font-weight", "bold")
		 .text("<<")
		 .on("click", function(){
			queue.push(queue.shift());
			updateScatter(queue);
		});
	}
		


	updateScatter(queue);


	//add realizations slider
	msvg.append("g")
		.attr("transform", "translate(" + (scatterW-scatterMargin.right * 2.75) +"," + 20 + ")")
		.attr("class", "realSlider")
		.call(doRealSlider);
	


	//add a color legend
	var _cldata = d3.range(5,0,-0.1).concat(d3.range(0,5.1,0.1));
	var clw = 1, clh =12;	
	var cl = msvg.append("g")
		 .attr("transform", "translate(200,5)")
		 .attr("id", "clg")
		 .selectAll(".cl")
		 .data(_cldata);



	cl.enter().append("rect")
		.attr("width", clw)
		.attr("height",clh)
		.attr("x", function(d,i){ return i * clw;})
		.style("stroke", "none")
		.style("fill-opacity", circleOpacity)
		.style("fill", function(d){
			var m = d3.max(_cldata);
			return slcolorscale(d/m);
		});
	
	d3.select("#clg").append("text")
		.attr("id", "colorlegendm")
		.attr("dy", clh + 10)
		.attr("dx", (clw * _cldata.length)/2 -10 )
		.html("0");


	d3.select("#clg").append("text")
		.attr("id", "colorlegendl")
		.attr("dy", clh + 10)
		.attr("dx", -10)
		.html("0");

	d3.select("#clg").append("text")
		.attr("id", "colorlegendh")
		.attr("dy", clh + 10)
		.attr("dx", clw* _cldata.length -10)
		.html("0");

}


function doHover(d){
	redrawSliders(d.d);
	updateLegend(rroundn(d.v,2));
}

function doToolTips(d){
	d3.select("#tooltip").datum(d)
		.style("opacity", 1)
		.style("left", "" + (d3.event.pageX+20) + "px")
		.style("top", "" + d3.event.pageY + "px")
		.html(function(d){ return "" + d.v.toFixed(2) + "<br><span style='font-size:11px;padding:none;'>"+ munits + "<span>";});
}	

function drawCircles(cdata, mean, low, high){


	var s = scatterPane.selectAll(".circle")
		.data(cdata, function(d){ return d.nid; });	

	
	scolorscale.domain([mean,1]);

	//update Y Axis
	scatterYRange[1] = high + 20; 
        sy1.domain(scatterYRange);
	syAxis.scale(sy1);
	var yx =scatterPane.selectAll(".y")
		.data([scatterYRange[1]]);

	yx.transition().duration(mDuration).call(syAxis);

	//and scale for circle size
	rscale.domain(scatterYRange);

	//Enter
	s.enter()
		 .append("circle")
		 .attr("class", "circle clickable-neutral")
		 .style("fill",circleFill)
		 .attr("cx", function(d){
			var _x = sx1(d.d[scatterFocus]);
			var _co = Math.random() * circleOffset;
			return d.x = (Math.random() < .5)?  _x  + _co : _x - _co; 
		 })
	         .on("click", function(d){ 
			doHover(d);
			var _this = d3.select(this);
			if (! _this.classed("circle-click") ){
				d3.selectAll(".circle-click").classed("circle-click", false)
					.style("fill",circleFill).moveToBack()
					.attr("r", function(d){ return rscale(d.v);});
				_this.classed("circle-click", true)
				    .attr("r",bigr).moveToFront(); 
				d3.selectAll(".circle").on("mouseover", doToolTips);

				//set params to be the values from this circle's run
				for (var v in params){
					lastParams[v].value = params[v].value; 
					params[v].value  = fakeParams[v].value;
			}		
			}else{
				_this.style("fill", circleFill)
					.attr("r", function(d){ return rscale(d.v);})
					.classed("circle-click", false).moveToBack();
				d3.selectAll(".circle").on("mouseover", function(d){ doToolTips(d); doHover(d);});
				
				for(var v in params) params[v].value = lastParams[v].value;
				updateSliders();
			}

	
		 })
		 .on("mouseover", function(d){
			doToolTips(d);
			doHover(d);
		})
		.on("mouseout", function(d){
			d3.select("#tooltip")
				.style("opacity", 0);
		})
	         .attr("r", function(d){ return rscale(d.v);})
	         .attr("cy", function(d){ 
			var _y = sy1(d.v);
			var _co = Math.random() * circleOffset;
			return d.y = (Math.random() < .5)?  _y  + _co : _y - _co; 
		});
	circleOffset = 10; //reduce after first visit
		
	s.transition().duration(lDuration)
	.attr("cx", function(d){
		return d.x = sx1(d.d[scatterFocus]) ;  //e.g d.ir
	})
	.attr("cy", function(d){
		return d.y = sy1(d.v);
	});

	
	

	//Exit
	s.exit().remove();
	

	

	d3.select("#colorlegendm").text(mean);
	d3.select("#colorlegendl").text(low);
	d3.select("#colorlegendh").text(high);




}



	
