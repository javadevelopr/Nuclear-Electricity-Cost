var FRTable = [
	[0, 0.25, 0.5, 0.75, 0.999],
	[0.986, 0.56, 0.333, 0.212, 0.139],
	[0, 0.28, 0.56, 0.82, 0.999]
	];

var SpentLEUTable = [
[0.00884, 0.0076,0.0076],
   [0.00391, 0.00481, 0.00594],
   [0.94372, 0.9325, 0.91983],
   [0.00012,0.00021, 0.00033 ],
   [0.0054,0.00572,0.00607],
   [0.00221,0.00262,0.00291],
   [0.00132,0.00160,0.00182],
  [0.00045,0.00068,0.00085],
   [0.00003,0.00005, 0.00006],
   [0.966, 0.95579, 0.9455]
];

//these don't change
var fpusf= frenr = frcreff = mat_flow = f239sf = energy_gen = null;
function fr(g){
	if(!fpusf){
		var fuelInd = (g.bu1 === 33)? 0: (g.bu1 === 43)?1: 3;
		var frfuelInd = [0.0, 0.25, 0.5, 0.75, 0.99].indexOf(g.frcr);
		var frvect = FRTable.map(function(v) { return v[frfuelInd];});
		var SpentLEU = SpentLEUTable.map(function(v){ return v[fuelInd];});
		
		fpusf = SpentLEU.slice(3,9).reduce(function(p,c){ return p + c;});
		frenr = frvect[1];
		frcreff = frvect[2];
	}
	mat_flow = g.cr/g.eff1 * YR * g.cf1/g.bu1;
	energy_gen = g.cr  * THOU * YHR * g.cf1;

	var  df1 = g.cs + g.bu1 * g.cfpcond/THOU + g.rb;
	var df2 = fpusf * (1 - g.freppu) * 1.1;
	var df3 = (1 - g.fdrvpu) / (g.cf2 * YR/g.eff2 * (frenr/g.bu2 - (frenr/g.bu2 - (1 - frcreff)/THOU) * (1 - g.frdrvpu) * (1 - g.fdrvpu)));

	var _t = g.ir/(1 - Math.pow(1+g.ir, (0-g.tecons)));
	var df4 = g.frtruinv * (g.ff1/frenr + g.c2 * (1/frenr-1)) * _t;	
	var df5 = g.cf2 * THOU * YHR;

	var df6 = g.frtruinv /(1-g.fdrvpu) * _t;
	var df7 = g.cf2 * YR/g.eff2  * ( frcreff/THOU + ((1-frenr)/g.bu2 - frcreff/THOU)*(g.frdrvpu + (1 - g.frdrvpu) * g.fdrvpu));

	var _u = Math.pow(1+g.ir, g.tcons) -1;
	var _z = Math.pow( (1 + g.ir), g.tecons)-1;
	var df8 = (_u/(g.ir * g.tcons)) * _t * g.cc2 * THOU;
	var df9 = (197 + 0.024 * (g.cr/g.eff2 -1200)) * g.eff1/g.eff2/g.cr * g.ir/_z * MILL;
	var df0 = g.com2  * MILL/g.cr;
	var df11 = g.cf2 * YR/g.eff2/g.bu2;
	var df12 = (g.fr1 + g.bu2 * g.cfpcond/THOU + g.rb);
	var df13 = -g.cwl/THOU;


	var reproc = mat_flow * df2;
	var frpow = reproc * df3;
	var first_core = frpow * df4;
	var r = mat_flow * df1; 

	var t= (df7 * g.c2 ) + (df8 + df9 + df0) + (df11 * df12) + (df11 * g.ff1);
	var leu_dispos = df13 * energy_gen;	


	r+= (frpow * t) + leu_dispos;
	r+= frpow/reproc * ((mat_flow * df1) + leu_dispos) * df6 + frpow * df4;
	


	return ( r * 100/(frpow * df5));
}
