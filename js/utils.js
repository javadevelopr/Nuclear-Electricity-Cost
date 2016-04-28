var YR = 365.25, 
    YHR = 365.25 * 24,
    THOU = 1000,
    MILL = 1000000;


d3.selection.prototype.moveToFront = function(){
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};

d3.selection.prototype.moveToBack = function(){
	return this.each(function(){
		var firstChild = this.parentNode.firstChild;
		if(firstChild)
			this.parentNode.insertBefore(this,firstChild);
	});
};


function detectBrowser(){
	var ua = window.navigator.userAgent;
	var msie = ua.indexOf("MSIE") > -1;
	var msie11 = ua.indexOf("Trident/") > -1;
	var sfr  = ua.indexOf("Safari") > -1 && ua.indexOf("Chrome") == -1;

	
	if (msie || msie11) return "msie";
	if (sfr)  return "safari";
	return "";	

}


//Thanks to fearphage (http://stackoverflow.com/a/4673436)
if (!String.prototype.format){
	String.prototype.format = function(){
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number){
			return typeof args[number] != 'undefined'? args[number] : match;
		});
	};
}


function sleep(ms){
	var start= new Date().getTime();
	for(var i = 0; i < 1e7; i++)
		if ( (new Date().getTime() - start) > ms) 
			break;
}	


function getRandomSubarray(arr, size){
	var shuffled = arr.slice(0), i = arr.length, temp, index;
	var min = i - size;
	while(i-- > min){
		index= Math.floor((i+1) * Math.random());
		temp = shuffled[index];
		shuffled[index] = shuffled[i];
		shuffled[i] = temp;
	}
	return shuffled.slice(min);
}


function _setInterval(fn, t ,repeat){
	var _x = 0;
	var iid = window.setInterval(function(){
		fn();
		++_x;
		if( _x === repeat)
			window.clearInterval(iid);
	},t);
}





if (Function.prototype.repeat === undefined)
	Function.prototype.repeat = function(n){
		var _ar = []
		for(var i=0; i < n; i++) _ar.push(this.apply( this, Array.prototype.slice.call(arguments,1)));
		return _ar;
	};


function arrayGet(x, arr){
	if( arr === undefined) return arr = [x];
	else arr.push(x);
	return arr;
}	

function _type(obj){
	if(typeof obj === "undefined"|| obj === null) return "None";

	if(Object.prototype.toString.call(obj) === "[object Object]")
		return "object";
	if(Object.prototype.toString.call(obj) === "[object Array]")
		return "array";

	if(typeof obj === "function") return "callable";

	return "primitive";
}


function deepCopy(obj){
	var nobj = {};

	for(var o in obj)
		if(obj.hasOwnProperty(o)){
			var _obj = obj[o];
			if( _type(_obj) === "object")
				nobj[o] = deepCopy(_obj);
			else if (_type(_obj) === "array")
				//nobj[o] = _obj.slice(0);
				nobj[o] = deepCopyArr(_obj);
			else
				nobj[o] = _obj;
		}

	return nobj;
}


function deepCopyArr(arr){
	var narr = [];

	for(var i in arr){
		var _arr = arr[i];
		if(_type(_arr) ==="object")
			narr[i] = deepCopy(_arr);
		else if (_type(_arr) === "array")
			//narr[i] = _arr.slice(0);
			narr[i] = oneLevCopy(_arr);
		else
			narr[i] = _arr;
	}
	return narr;
}
		

function mean_std(data){

	var m = d3.mean(data);
	var n = data.length;
	if(n < 1) return [NaN, NaN];
	if(n === 1) return [data[0],0];
	var i=0, s = 0;

	while (i < n){
		var v = data[i] - m;
		s += v* v;
		i++;
	}
	return [m, Math.sqrt(s/(n-1))];
}

function gpdf(x,m,s){
	var _d = Math.sqrt( 2 * Math.PI )*s;
	var _e = Math.pow(x-m, 2) / (2 * Math.pow(s,2));
	return Math.pow(Math.E,(-_e))/_d;
}

function gpdft(x,m,s,t){ return t * gpdf(x,m,s); }


function __djb2(str){
	var hash = 5381;
	for (var i=0; i < str.length; i++){
		var c = str.charCodeAt(i);
		hash = ((hash << 5 ) + hash) + c;
	}
	return hash;
}


function __stringify(paramlist, pmap){
	return __djb2(paramlist.reduce(function(p,c){ return p + window[c].call()+"%";},""));
}


function __dep(p,pmap,ar){

	for (var i=0; i < p.length; i++){
		var _c = pmap[p[i]];
		if (typeof _c.value === 'undefined')
			__dep(_c,pmap,ar)
		else{
			var _d = p[i];
			if(ar.indexOf(_d) < 0)
				ar.push(p[i]);
		}
	}

}
function arrayEqualSplit(arr, n){
	var _out = [], len = arr.length, x = 0;
	while( x  < len){ 
		var sz = Math.ceil((len - x) / n--);
		_out.push(arr.slice(x, x += sz));
	}
	return _out;
}


function isInt(num){
	return (num % 1 === 0);
}

function numDecimals(numstr){
	return (numstr.toString().split('.')[1]||'').length;
}

function numStr(numstr){
	return numstr.toString().length;
}


function rroundn(c, n){
	return c.toFixed(n);
}

function arroundn(arr, n){
	return arr.map(function(c){ return c.toFixed(n);});
}


function randRange(min,max){
	return Math.random() * (max-min) + min;
}
	
function randArrValue(arr){
	return arr[ parseInt(randRange(0,arr.length))];
}

function decimalFormat(v,d){
	if(isInt(d)){
		return v|0;
	}else{
		return  parseFloat(v.toFixed(numDecimals(d) ));
	}
}



