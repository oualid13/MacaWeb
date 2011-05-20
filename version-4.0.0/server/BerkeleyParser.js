var exec	= require('child_process').exec,
	Queue	= new Array (),
	child;
	

child	= exec('java -jar ./BerkeleyParser/berkeleyParser-sync.jar -gr ./BerkeleyParser/fra_sm5.gr -tokenize',function (error,stdout,stderr){
		
	});

//classe caché requete
function request (result,client){

	this.result	= result;
	this.client	= client;
	
}

child.stdout.on('data', function (data) {
		//renvoyer le texte généré par berkley-parser
		var req	= Queue.shift();
		console.log('  Response to '+req.client.ip+' "text"	: '+data);
		req.result.writeHead(200, {'Content-Type': 'text/plain'});
		req.result.end(data);

	});

exports.in = function (sentence,res,cli){

	Queue.push(new request(res,cli));
	child.stdin.write(sentence+'\n');

}
