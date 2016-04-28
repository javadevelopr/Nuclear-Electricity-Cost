function corsd(d){
	return (d.value instanceof Array)? (+d.defaultvalue||+d.value[0]): +d.value;
}






function loadDatasets(dsfile){
	



	//load datasets
	d3.json(dsfile, function(data){
		var startfile = null;
		var dr =d3.select("#ddropdown").selectAll(".dataset")
			.data(data);
			

		dr.enter().append("li")
		  .attr("role", "presentation")
		  .attr("class", function(d){
			var active = (d.defaultfile)? "active": "";
			if (d.defaultfile) startfile = d;
			return d.name + " " + active + " dataset clickable-neutral";
		  })
		 .append("a")	
		 .attr("role", "menuitem")
		 .attr("tabindex", "-1")
		 .text( function(d){ return d.title; })
		 .on("click", function(d){
			//make active
			$(".dataset").removeClass("active");
			$("." + d.name).addClass("active");
			
			start(d);
		  });

		dr.append("li")
		  .attr("role", "presentation")
		  .attr("class", "divider");


		start(startfile);

	});

}





function filterByModel(data){
	var md = {}, d={}, model="";
	for(var i in data){
		d = data[i];
		model = d.model;
		if( Object.prototype.toString.call(model) === "[object Array]")
			for(var t in model)
				md[model[t]] = arrayGet(d, md[model[t]]);
		else
			md[model] = arrayGet(d, md[model]);
	}
	return md;
}
