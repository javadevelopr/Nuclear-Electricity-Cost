
function doCSV(){
	
	var csv="Parameter,Unit,Value,StandardDev\n";
	
	for(var n in params){
		var name = names[n].title;
		var unit = names[n].subtitle ||" ";
		var val = params[n].value;
		var std = params[n].std || 0;
		csv += name + "," + unit +"," + val +"," + std + "\n";
	}

	var blob = new Blob([csv], {type:'text/csv' });


	var browser = detectBrowser();
	if(browser !== "msie" ){
		var nl = document.createElement("a");
		nl.id = "hiddenD";
		document.body.appendChild(nl);
	
		$("#hiddenD").attr({
				"href": URL.createObjectURL(blob),
				"download" : "data.csv"	
		})[0].click();
	}else{
		window.navigator.msSaveOrOpenBlob(blob, 'data.csv');
	}

}
