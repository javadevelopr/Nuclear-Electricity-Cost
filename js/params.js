var params = {}, origParams = {}, fakeParams= {}, lastParams = {};	
var names ={};
var modelState= 'S';
var modelfile ="js/models.min.js";
var currentModel;
var maxColumns = 3;
var barWidth = 530;
var realizeBarWidth = 200;
var webWorkers = 5;
var mDuration = 750, sDuration=500, lDuration=1000, elDuration=1500;
var binCount = 20; //for graph
var x1 = d3.scale.linear().domain([0,1]);
var scatter = true;

var current_mean = current_std = 0;


var cpkw=false;
var cents = "U.S &#xA2; per kW-hr";
var dollars = "U.S $ per MW-hr";
var units = cents;
var munits = "&#xA2;/kW-hr";
var msie_units = "U.S cents per kW-hr";



modelLongName={
	'lwr': 'Once-Through',
	'fr': 'Full Recycle',
	'mox': 'MOX Recycle'
};



//==== ui ===//
//legend
var pieW = pieH = 160;
var pieRadius = 40;
var pieColors = ["yellow", "black"];
var pieMaxValue = 30.0;
var pcolorscale = d3.scale.linear().domain([0,pieMaxValue]).range(pieColors);
var legend_pie = d3.layout.pie().sort(null);
var legend_arc = d3.svg.arc().outerRadius(pieRadius).innerRadius(0);	

//sliders
var barMargin =25, barHeight = 68;
var oHeight = 18;
var iHeight = oHeight/2;
var sHeight = iHeight * 3/4;

//realizations slider
var realText="Sample Size";
var prevrealizations = nrealizations = 2000;
var maxrealizations = 5000;
var realSliderW = 300;
var realSliderH = 5;
var realSliderScale = d3.scale.linear().range([0,realSliderW]);




//======scatter ===//
var legend ="Electricity cost";
var colors = d3.scale.category20().domain(d3.range(5));
var circleOpacity=0.6;
var nYticks = 4, nXticks=10;
var rmin = 1, rmax = 8;
var bigr = rmax;
var scatterYRange =[0.0,20.0];
var scatterColors = pieColors;
var scolorscale = d3.scale.linear().domain(scatterYRange).range(scatterColors);
var slcolorscale = d3.scale.linear().domain([0,1]).range(scatterColors);
var rscale = d3.scale.linear()
	.clamp(true)
	.range([rmin, rmax]);
var xTrans = 24;
var scatterMargin = {top:40, right: 30, bottom:40, left:50};
var scatterW =650 - scatterMargin.left - scatterMargin.right, 
    scatterH = 305 - scatterMargin.top - scatterMargin.bottom; 
var circleOffset = 155;
var sxAxis, syAxis;
var sx1 = null;
var sy1 = d3.scale.linear().clamp(true).range([scatterH ,0]); 

var xTickSz = 2, yTickSz =5;
var scatterPane;
var scatterFocus;
var tooltip;




//==== graph ===//
var colorOptions = ['fg','blue','red', 'color'];
var graphLegend = "Probability Density Function";
var glinestroke = "blue";
var nlinestroke = "black"; 

