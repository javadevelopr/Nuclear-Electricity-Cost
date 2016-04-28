#!/bin/bash

echo "" > nfp.min.js
echo "" > nfpd.min.js

mfiles=( "lib/js/bootstrap.min.js"\
	 "lib/js/d3.v3.min.js"\
	 "js/params.js"\                  
	 "js/utils.js"\
	 "js/common.js"\
	 "js/events.js"\
         "js/update.js"\
         "js/coreUI.js"\
         "js/download.js"\
         "js/scatter.js"\
         "js/spline.js"\
         "js/main.js" );

dfiles=( "lib/js/bootstrap.min.js"\
	 "lib/js/d3.v3.min.js"\
	 "js/params.js"\                  
	 "js/utils.js"\
	 "js/common.js"\
         "js/download.js"\
         "js/lwr.js"\ 
         "js/fr.js"\ 
         "js/mox.js"\ 
         "js/data.js");


for i in "${mfiles[@]}"
do
	echo $i;
	cat ${i} >> nfp.min.js
	echo  >> nfp.min.js
	echo  >> nfp.min.js
	echo  >> nfp.min.js
	#sed "/${i}/d" ./model.html
done

echo "========================"

for i in "${dfiles[@]}"
do
	echo $i;
	cat $i >> nfpd.min.js
	echo  >> nfpd.min.js
	echo  >> nfpd.min.js
	echo  >> nfpd.min.js
	#sed "/${i}/d" ./data.html
done
