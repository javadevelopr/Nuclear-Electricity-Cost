function getValueFromWidth(w, max, scale){
	return Math.max( 0, Math.min( max  * scale.invert(w) , max)); 
}



var events = {




	dragControl: function(d){

		var parent = d3.select(this.parentNode);
		var ct = parent.selectAll(".ibar")
			.attr("width", d.x = Math.max(1, Math.min(oWidth, d3.event.x)));
		
		d3.select(this)
			.attr("x1", handleX(d))
			.attr("x2", handleX(d));

		//var v = decimalFormat(getValueFromWidth(d.x, d.max), d.value);
		var v = parseFloat(getValueFromWidth(d.x, d.max,x1).toFixed(d.precision));


		parent.select(".mu").text(v);
		params[d.name].value = v;         


	},


	dragStd: function(d){

		var parent = d3.select(this.parentNode);
		var ct = parent.selectAll(".sbar")
			.attr("width", d.x = Math.max(1, Math.min(oWidth, d3.event.x)));

		d3.select(this)
			.attr('x1', function(d){  return d.x;})
			.attr('x2', function(d){ return d.x;});

		//var v = decimalFormat(getValueFromWidth(d.x, d.max), d.std);
		var v = parseFloat(getValueFromWidth(d.x, d.max,x1).toFixed(d.precision));


		parent.select(".std").text(v);
		params[d.name].std = v;
	
	},


	dragRealSlider: function(d){
		var parent = d3.select(this.parentNode);
		
		d3.select(this)
			.attr("x1", function(d){ 
				return d.x = Math.max(0, Math.min(realSliderW, d3.event.x));
			})
			.attr("x2", function(d){return d.x;});

	
		nrealizations = parseInt(realSliderScale.invert(d.x));

		parent.selectAll(".rslabel")
			.attr("x", function(d){ return d.x;})
			.text(nrealizations);

		modelState= "S";

	}

};
function btn_clk(btngrp, obj, data, value,model){

	btngrp.selectAll("rect").style("fill", "transparent")
		.style("stroke", "steelblue")
		.style("stroke-width", ".3px");
	d3.select(obj).select("rect").style("fill", "rgba(60,130,221,0.5")
		.style("stroke", "black")
		.style("stroke-width", "2px");

	//update params
	params[data.name] = {value:value};

}
