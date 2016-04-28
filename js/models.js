


var YR = 365.25, 
    YHR = 365.25 * 24,
    THOU = 1000,
    MILL = 1000000;



importScripts('lwr.js', 'fr.js', 'mox.js');


function boxmuller(m,s, logn){
	var x, y, w, z;
	do{
		x = Math.random() * 2.0  - 1.0;
		y = Math.random() * 2.0 - 1.0;
		w = x * x + y * y;
	} while( w >= 1.0);

	w = Math.sqrt( (-2.0 * Math.log(w))/w);
	z = x * w;

	if (logn) return Math.pow( Math.E, m + z * s);

	return (m + z * s);
}

function __djb2(str){
	var hash = 5381;
	for (var i=0; i < str.length; i++){
		var c = str.charCodeAt(i);
		hash = ((hash << 5 ) + hash) + c;
	}
	return hash;
}
	

self.onmessage = function(e){
	var model = e.data.model;
	var nrealizations = parseInt(e.data.n);
	var params = e.data.params;
	var modelState = e.data.modelState;	
	var returnParams = e.data.returnParams;

	if (model === "lwr") run = lwr;
	else if (model ==="fr") run = fr;
	else if (model ==="mox") run  = mox;
	else return;
	

	var arrayres = [];
	

	for(var i=0; i < nrealizations; i++){
		var g = {}, s={};
		for(var p in params){
			var _p = params[p];
			if ( modelState === 'D' || (!_p.std))
				g[p] = +_p.value;
			else if (_p.dist && _p.dist === 'log'){
				s[p] = g[p] = boxmuller( Math.log(+_p.value),+_p.std,true);
			}
			else
				s[p]=g[p] = boxmuller( +_p.value, +_p.std);  
		}
		if (returnParams){
			arrayres.push({
				v: run(g),
				d: g,	
				nid: __djb2(JSON.stringify(s))
			     });
		}else arrayres.push(run(g));
	}

	self.postMessage({
			'results': arrayres 
		});
}
