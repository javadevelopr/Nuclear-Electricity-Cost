



function updateSliders(pms){
	var _pms = pms || params;

	d3.selectAll(".ibar")
		.transition()
		.duration(lDuration)
		.attr("width", function(d) { return d.x=x1(_pms[d.name].value/d.max) + 1;});


	d3.selectAll(".ibarc")
		.transition()
		//.delay(elDuration)
		.attr("x1", function(d){ return handleX(d);})
		.attr("x2", function(d){ return handleX(d);});

	//update values
	d3.selectAll(".mu").text(function(d){ 
		if(d)
			return _pms[d.name].value.toFixed(d.precision);
	});
}

function updateStdSliders(){

	d3.selectAll(".sbar")
		.transition()
		.duration(lDuration)
		.attr("width", function(d){ return d.x = (d.std)? x1(params[d.name].std/d.max):0 ;});

	d3.selectAll(".sbarc")
		.attr("x1", function(d){ return d.x; })
		.attr("x2", function(d){ return d.x; });

	d3.selectAll(".std").text(function(d){
		if(d && d.std !== undefined){
			return params[d.name].std.toFixed(d.precision);
		}else
			return "";
	});

}

function doRun(){
	runModel(currentModel);
}



function renderColumn(model,data, Col){
	
	//btns
	var btndata = [];
	

	data = data.filter(function(c){
		if ( ! isNaN(c.value)){
			if(!c.precision) c.precision = numDecimals(c.value);
			c.value = +c.value;
			c.x = x1(c.value/c.max); 

			return c;
		}
		else if(c.value instanceof Array) 
			btndata.push(c);
	});


	var b = Col.selectAll(".bttn").data( btndata, function(d){
		return d.name + d.defaultvalue;
	});

	var bdiv = b.enter().append("div")
		.attr("class", "ctl bttn");

	var bsvg = bdiv.append("svg").attr("class", "svgb")
		 .style("height","50px");

	var bg = bsvg.append("g").attr("transform", "translate(300,15)")
		//.attr("fill-opacity", 1e-6)
		.attr("class", "bttn-grp"); 
	
	b.transition().duration(mDuration).selectAll(".bttn-grp")
		.attr("transform", "translate(20,15)")
		.attr("fill-opacity", 1);

	bg.append("text").attr("class","title")
		.attr("transform", "translate(-9,-4)")
		.text(function(d){ return d.title;});

	bg.append("text").attr("class","subtitle")
		.attr("transform", "translate(0,34)")
		//.attr("y", 24)
		.text(function(d){ return d.subtitle && d.subtitle || "";});	

	bg.each(function(d,i){
		d.value.forEach(function(v,i){
			var _g = bg.append("g").datum(v)
				.attr("id", "btn_" + i + "_"+d.name)
				.attr("transform", "translate(" + i * 32 + ",0)");
			
				var br =_g.append("rect")
				.attr("width",30)
				//.attr("rx",3)
				.attr("height", 18);

				
				var tr =_g.append("text").attr("text-anchor", "middle")
					.attr("class", "value clickable")
					.attr("dy", "1.2em")
					.attr("dx", "1.4em")
					.text(v);

				
				//click event
				_g.on("click",function(e){ 
					//enforce constraint bu3 >= bu1
					if( d.name === "bu1" && currentModel.name ==="mox")
						if (v > params.bu3.value) return;
					if(d.name ==="bu3")
						if (v < params.bu1.value) return;
	

					btn_clk(bg,this,d,v);
					doRun();
				});

				if(d.defaultvalue !== undefined && d.defaultvalue ===v || i===0)
					 btn_clk(bg, _g.node(),d,v);
			

		});
	});


	b.exit().remove();


	//Sliders
	var m = Col.selectAll(".bar").data(data, function(d){return d.name + d.value + d.max;});

	var div = m.enter().append("div")
		.attr("class", "ctl bar");

	var svg = div.append("svg")
		.attr("class", "svgb");

	var g = svg.append("g")
	
	.attr("class", "gbar enter")
		.style("fill-opacity", 1e-6)
		.attr("transform", "translate(1000,35)");


	//Update + Enter
	m.transition().duration(sDuration)
		.selectAll(".gbar")
		.attr("class", "gbar update")
		.attr("transform", "translate(20,35)")
		.style("fill-opacity", 1);


	var oNrect = 10, oMargin=1;
	var obar = g.selectAll(".obar").data(d3.range(0,oNrect));
	var rw = oWidth/oNrect - oMargin;
	obar.enter().append("rect")
		.attr("class", "obar")
		.attr("height", oHeight)
		.attr("width", rw)
		.attr("x", function(d,i){ return i * (rw + oMargin);});


	//ibar & handle
	var ig = g.append("g");
	ig.append("rect")
		.attr("class", "ibar")
		.attr("y", iHeight/2)
		.attr("width", 0)
		.attr("height", iHeight);

	//handle
	ig.append("line")
		.attr("class", "ibarc clickable-neutral")
		.attr("y1", iHeight/2)
		.attr("y2", iHeight* 3/2  )
		.call(d3.behavior.drag().origin(Object)
			.on("drag", events.dragControl)
			.on("dragend", function(d){ doRun();})
		);




	//update ibar and values
	m.selectAll(".ibar")
		.transition()
		.duration(sDuration)
		.attr("width", function(d) { return d.x=x1(params[d.name].value/d.max) + 1;});


	m.selectAll(".ibarc")
		.transition()
		//.delay(elDuration)
		.attr("x1", function(d){ return handleX(d);})
		.attr("x2", function(d){ return handleX(d);});
		


	//stdbar
	var sg = g.append("g")
		  .data( data.map(function(d){
			if (d.std !== undefined){
				return ({
					 name: d.name, 
					 x: x1(params[d.name].std/d.max), 
					 std: params[d.name].std,
					 value: params[d.name].value,
					 max: d.max,
					 precision: numDecimals(d.std)
					});
			}else return ({name:d.name, x:d.x, value:params[d.name].value, max:d.max});
		}))
		.attr("class", "stdg");
		//.attr("visibility", "hidden");

	sg.append("rect")
		.attr("class", "sbar")
		.attr("y", 0)
		.attr("width", 0)
		.attr("height", sHeight);

	sg.append("line")
		.attr("class", "sbarc clickable-neutral")
		.attr("y1", 0)
		.attr("y2", function(d){ return (d.std !== undefined)? sHeight: 0;})
		.call(d3.behavior.drag().origin(Object)
			.on("drag", events.dragStd)
			.on("dragend", function(d){ doRun();})
		);

	m.selectAll(".sbar")
		.attr("width", function(d){ return d.x = (d.std)? x1(params[d.name].std/d.max):0 ;});

	m.selectAll(".sbarc")
		.attr("x1", function(d){ return d.x; })
		.attr("x2", function(d){ return d.x; });






	//title and subtitle
	var titles = g.append("g")
		.attr("class", "titles")
		.attr("transform", "translate(0, -16)");

	titles.append("text")
		.attr("class", "title")
		.style("text-anchor", "start")
		.text( function(d){ return d.title; });

	titles.append("text")
		.attr("class", "subtitle")
		.attr("y", 64) 
		//.attr("dy", ".75em")
		//.attr("x", oWidth)
		.style("text-anchor", "start")
		.text( function(d){ return (d.subtitle && d.subtitle) || "";});



	//scale
	var xs1 = d3.scale.linear().range([0,oWidth]);
	Col.selectAll(".gbar").each(function(d,i){
		xs1.domain([0, d.max]);
		var format = xs1.tickFormat(5);
		var tick  = d3.select(this).selectAll(".tick")
			.data(xs1.ticks(5),function(c){
				return format(c);
			});

		var tickEnter = tick.enter().append("g")
			.attr("class", "tick")
			.attr("transform", function(c){
				return "translate(" + xs1(c) +",0)";
			});
		tickEnter.append("line").attr("y1", oHeight)
			.attr("y1", oHeight)
			.attr("y2", oHeight * 6/5);

		tickEnter.append("text").attr("text-anchor", "middle")
			.attr("dy", "1em")
			.attr("y", oHeight * 6/5 )
			.text(function(d){ return d; });
	});






	//values
	var values = ig.append("g")
		.attr("class", "num")
		.attr("transform", "translate(" + (oWidth/2) + ",-5)")
		.append("text")
		.attr("class", "mu clickable")
		.attr("dx", "-2em")
		.on("click",function(d){ //add user input box on click
			d3.select(this.parentNode)
			.append("foreignObject")
			.attr("height", 30)
			.attr("width", 60)
			.attr("x", 1)
			.append("xhtml:input")
			.attr("id", "_im"+d.name)
			.attr("type", "text")
			.on("keyup", function(d){
				if(d3.event.keyCode === 13){
					this.blur();
				}	
			})
			.on("blur", function(){
				var v = this.value;
				d3.select(this).remove();
				if(isNaN(v)|| v ==="") 
					return;
				var _v = Math.min(+v,d.max);
				if(!isNaN(_v) && _v >=0)
					params[d.name].value = _v;
				updateSliders();
				doRun();
			});		

			$("input#_im"+d.name).focus();
		});
		

	var svalues = sg.append("g")
		.attr("class", "num")
		.attr("transform", "translate(" + (oWidth/2) + ",-5)")
		.append("text")
		.attr("class", "std clickable")
		.attr("dx", "2.5em")
		.on("click",function(d){
			d3.select(this.parentNode)
			.append("foreignObject")
			.attr("height", 30)
			.attr("width", 60)
			.attr("x", 1)
			.append("xhtml:input")
			.attr("id", "_is"+d.name)
			.attr("type", "text")
			.on("keyup", function(d){
				if(d3.event.keyCode === 13){
					this.blur();
				}	
			})
			.on("blur", function(){
				var s = this.value;
				d3.select(this).remove();
				if(isNaN(s)|| s ==="") 
					return;
				var _s = Math.min(+s,d.max);
				if(!isNaN(_s) && _s >=0)
					params[d.name].std = _s;
				updateStdSliders();
				doRun();
			});		
			$("input#_is"+d.name).focus();
		});
	


	//update values
	updateSliders();
	updateStdSliders();
	//m.selectAll(".mu").text(function(d){ return params[d.name].value.toFixed(d.precision);});
	//m.selectAll(".std").text(function(d){ return (d.std !== undefined)? "" + params[d.name].std.toFixed(d.precision) : "";});


				


	//Exit
	var mexit = m.exit().transition().duration(sDuration);
	mexit.selectAll(".gbar")
		.attr("class", "gbar exit")
		.attr("transform", "translate(400,35)")
		.style("fill-opacity", 1e-6);
		
	mexit.remove();












/*=====================================================================*/







}



	




	

