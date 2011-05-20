var exec	= require('child_process').exec,
	child,
	result,
	client;

child	= exec('java -jar ./BerkeleyParser/berkeleyParser-sync.jar -gr ./BerkeleyParser/fra_sm5.gr -tokenize',function (error,stdout,stderr){
		
	});

child.stdout.on('data', function (data) {
		//renvoyer le texte généré par berkley-parser
		console.log('  Response to '+client.ip+' "text"	: '+data);
		result.writeHead(200, {'Content-Type': 'text/plain'});
		result.end(data);

	});

exports.in =function (sentence,res,cli){
	result=res;
	client=cli;
	child.stdin.write(sentence+'\n');

}
