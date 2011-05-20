var phrases =['oualid mange une pomme de terre .\n',
'wahab mange une pomme de terre .\n',
'amine mange une pomme de terre .\n',
'khalil mange une pomme de terre .\n',
'mounir mange une pomme de terre .\n',
'hocine mange une pomme de terre .\n',
],i=0;



var exec	= require('child_process').exec,
	child	= exec('java -jar berkeleyParser-sync.jar -gr fra_sm5.gr -tokenize',function (error,stdout,stderr){
	//console.log('stdout : '+stdout);
	
});

child.stdout.on('data', function (data) {
  console.log(data);
});

function flush(){
	
	if(i<6){
		//var p = ;
		child.stdin.write(phrases[i]);
		//console.log(phrases[i].length);
		i++;
	}
	
}
//setTimeout(5000);
setInterval(flush, 1000);
