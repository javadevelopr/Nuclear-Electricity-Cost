var FreshLEUTable= [
		[0.0325,0.037,0.044],
		[0,0,0],
		[0.9675,0.963,0.956]
	];

//These don't vary with stochastic parameters
var xp=null, swu=null, mat_flow = null, energy_gen = null;

function lwr(g){
	if(! xp){
		var fuelInd = (g.bu1 === 33)? 0: (g.bu1 === 43)?1: 3;
		var FreshLEU = FreshLEUTable.map(function(v){ return v[fuelInd];});
		xp =  FreshLEU[0];
	}	

	swu = swu  || (2*xp -1) * Math.log(xp/(1-xp)) - (2* g.xw -1) * Math.log(g.xw/(1-g.xw))
		- (xp -g.xw)/(g.xf - g.xw) * ((2*g.xf -1) * Math.log(g.xf/(1-g.xf)) 
		-(2*g.xw-1) * Math.log(g.xw/(1-g.xw))) 
	

	mat_flow =  (g.cr/g.eff1 * YR * g.cf1/g.bu1);
	energy_gen = (g.cr  * THOU * YHR * g.cf1);


	var capital_cost = g.cc1 * g.cr * THOU;
	var om_cost = g.com1 * MILL;
	var _t = g.ir/ (Math.pow((1 + g.ir), g.tecons  ) -1);
	var dandd_cost =  g.cr * ( 173 + 0.024 * (g.cr/g.eff1 -1200))/g.cr * _t * MILL ;

	_t = g.ir/ (1 - Math.pow((1+g.ir),-g.tecons));
	var df1	= (Math.pow((1+g.ir),g.tcons )-1)/(g.ir * g.tcons) * _t;
	var df2 = g.cwl/THOU;

	var df3 = 1/(1-g.fff);
	var df5 = (xp - g.xw) / (g.xf - g.xw)/(1-g.fswu);

	var df6 =  1/(1-g.fcon);

	_t = 1 - Math.pow( (1+ g.ir), -g.tecons);
	var df7 =  g.lwrinv * g.cr  * g.ir/_t;

	var r =  capital_cost * df1 + om_cost;
	r += (mat_flow  * g.c5) + (energy_gen * df2);

	var t = g.c4 + (df3 * swu * g.c3) + (df3 * df5 * g.c2) + (df3 * df5 *df6 * g.c1);
	r += t * df7 + (t * mat_flow) + dandd_cost;



	return (r * 100/energy_gen);
}
