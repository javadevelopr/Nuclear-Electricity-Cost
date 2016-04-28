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




var FreshMoxTable = { 0 : 
			[ [0.00213,0.00212, 0.00209],
			  [0,0,0],
			  [0.94632,0.93871,0.92667],
			  [0.0007,0.0008,0.00096],
			  [0.03019,0.03465,0.04172],
			  [0.01215,0.01394,0.01679],
			  [0.0055,0.00631,0.0076],
			  [0.00054,0.00062,0.00074],
			  [1.00001,1.000,1.0]     

			],
		 1 : [ [NaN, 0.0021, 0.00207],
		 	 [NaN, 0, 0],
			[NaN, 0.93053,0.91631],
			[NaN, 0.00129, 0.00156],
			[NaN, 0.03678, 0.04457],
			[NaN, 0.01659, 0.0201],
			[NaN, 0.00768, 0.00931],
			[NaN, 0.00428, 0.00519],
			[NaN, 0.00075, 0.00091],
			[NaN, 1.0, 1.00002]
		],

		2: [ [NaN, NaN, NaN],
			[NaN, NaN, NaN],
			[NaN, NaN, NaN],
			[NaN, NaN, NaN],
			[NaN, NaN, NaN],
			[NaN, NaN, NaN],
			[NaN, NaN, NaN],
			[NaN, NaN, NaN],
			[NaN, NaN, NaN],
			[NaN, NaN, NaN]
		
			]
	};

//these don't change
var f239mox = f239sf = mat_flow = energy_gen = null;

function mox(g){
	if (!f239mox){
		var fuelInd = (g.bu1 === 33)? 0: (g.bu1 === 43)?1: 3;
		var moxFuelInd = [33,43,53].indexOf(g.bu3);


		var freshMoxTable = FreshMoxTable[fuelInd];
		var freshMox = freshMoxTable.map(function(v){ return v[moxFuelInd];});
		f239mox = freshMox[4];
	

		var SpentLEU = SpentLEUTable.map(function(v){ return v[fuelInd];});
		f239sf = SpentLEU[4];


	}
	mat_flow = g.cr/g.eff1 * YR * g.cf1/g.bu1;
	energy_gen = g.cr  * THOU * YHR * g.cf1;

	var df1 = -g.cwl/THOU;
	var df2 = f239sf * (1-g.freppu) * (1-g.fmoxpu)/f239mox;
	var df3 = g.cs + g.bu1 * g.cfpcond / THOU + g.rb;
	var _t = g.ir/(1 - Math.pow(1+g.ir, -g.tecons));

	var df4 = g.lwrinv * _t;
	var df5 = 1 - f239mox;
	var df6 = g.bu3 * g.eff1 * THOU * 24;
	var df7 = g.cwl/THOU;
	var df8 = 1/(g.cf1 * THOU *YHR);
	var _u = Math.pow( (1+g.ir), g.tcons) - 1;
	var df9 =  _u/(g.ir*g.tcons)* _t *g.cc1 * THOU;
	var df10 = g.com1 * MILL/g.cr;
	var _z = Math.pow( (1 + g.ir), g.tecons)-1;
	var df11 = (173 + 0.024 *(g.cr/g.eff1 -1200))/g.cr * g.ir/_z* MILL; 

	var leudisp = energy_gen *  df1;
	var reprocmx = mat_flow * df2;
	var leureproc = mat_flow * df3;


	

	
	var ufconv = reprocmx * df5 * g.c2;
	var intstor = reprocmx * g.c5;

	var resmox = leudisp + leureproc + ufconv;

	var firstcore= resmox +  (reprocmx * g.cb1);


	var mxpow = reprocmx * df6 * df8;
	resmox = firstcore * df4/ reprocmx * mxpow;

	resmox += ( reprocmx * df6 * df7 );
	resmox += intstor + firstcore  + (mxpow * df9 );

	
	
	resmox += (mxpow * df10);
	resmox += (mxpow * df11);

	return (resmox / (reprocmx * df6) * 100);
}
