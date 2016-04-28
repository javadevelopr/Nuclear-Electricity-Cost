
function runModel(model){


	var n =1, ww = 1;

	if(modelState == 'S'){
		//more webworkers
		ww = (nrealizations > 50000)? webWorkers + 2 : (nrealizations > 20000)? webWorkers + 1 : webWorkers;  
		ww = Math.min( ww, nrealizations);
		n =  Math.max(1, parseInt(nrealizations/ww));

		//busy spinner
		(nrealizations > 55000) && $("#spinner").show();
	}

	var gdata = [];
	var ggdata = [];

	var ct = 0;	


	for(var i = 0; i < ww; i++){
		var worker = new Worker(modelfile);
		
		worker.onmessage = function(e){


			//get data
			if (scatter){ //scatter


				e.data.results.forEach(function(d,i){
					

					gdata.push(d.v);
					ggdata.push(d);
				});
		
			} else {   //graph
				gdata.push.apply(gdata, e.data.results);
			}

			ct+=1;
			if (ct === ww){

				var mstd = mean_std(gdata);
				current_mean = rroundn(mstd[0],2);
				current_std = rroundn(mstd[1],2);
				var low = rroundn(d3.min(gdata),2);
				var high = rroundn(d3.max(gdata),2);
				if(isNaN(current_mean)) current_mean = 0; //sanity
				
				if(!scatter){
					renderGraph(gdata, model,current_mean, current_std);
				} else{
					drawCircles(ggdata, current_mean, low, high);
				}
				$("#spinner").hide();
				updateLegend(current_mean);
			}
			this.terminate();
		     
		};
	
		worker.postMessage({
			modelState: modelState,
			model: model.name,
			n : n,
			params: params,
			returnParams: scatter
		});
	}
	

}

function start(metadata){
	var dataFile = metadata.filename;

	d3.select(".toppanel")
		.html("<u>datasource</u>:&nbsp;" + metadata.source);	

	d3.json(dataFile, function(data){
		data = filterByModel(data);


		var _default=true;
		d3.selectAll(".pagination").selectAll(".paginate").remove();


		for(var m in data){
			var model = {
			    name: m,
			    defaultpage:_default,
			    data: data[m],
			    tabname: ""+ m + "t",
			    displayid: "" + m + "d"
			};

			//setup parameter list
			model.data.forEach(function(d){
				var __vl = corsd(d);
				params[d.name] = { value: __vl, std: +d.std, dist: d.distribution};
				fakeParams[d.name] = {value: __vl};
				lastParams[d.name] = {value: __vl};
				names[d.name] = {title: d.title, subtitle: d.subtitle};
			
			});
			origParams = deepCopy(params);
		

			//====build some page components===========
			//tabs
			var pages = d3.select(".pagination").selectAll(".m").data([model.name], function (d){ return d;});

			pages.enter()
			   .append("li")
			   .attr("class", model.name + " paginate clickable-neutral")
			   .append("a").attr("id",model.tabname)
			   .text(modelLongName[model.name]);

			 
			
			
			//Register click handlers
			d3.select("#" + model.tabname).data([model]).on("click", function(mt){
				loadPage({
					name: mt.name,
					tabname:mt.tabname,
					displayid: mt.displayid,
					data: mt.data
				});
				
				if(scatter)
					initScatter(mt.data);
				else initGraph();
				currentModel = mt;
				runModel(mt);
			});


			//tooltips
			d3.select("body").append("div")
				.attr("id", "tooltip")
				.attr("class", "tooltip")
				.style("opacity", 0);




			if (_default){
				currentModel = model;
				loadPage(model);
				if(scatter)
					initScatter(model.data);
				else initGraph();
				runModel({
					name:model.name, 
					displayid: model.displayid
				});
			}

			_default = false;
		}
			

	});
}
