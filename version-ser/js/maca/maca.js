	var exec	= require('child_process').exec,
	macaoption	= ' | txt2macaon | maca_segmenter | maca_tokenizer | maca_lexer | maca_tagger | maca_anamorph | maca_chunker  -lpcw';

exports.macaon	= function (filename,root,sentence,res)
{
	//executer la commande macaon et generer un document XML
	
	var child = exec('echo '+'\"'+sentence+'\"'+macaoption+ '>'+root+filename+'.xml',
	function (error, stdout, stderr) {

		console.log('  Execution Macaon');//\n						stdout		: '+stdout+'\n						stderr		: '+stderr+'\n						error		: '+error);
				
		//executer macaviz
		exports.macaviz(filename,root,res);
						
	});
	
}

exports.macaviz	= function (filename,root,res)
{
	//generer une image et un fichier dot a partir du document xml
	
	var child = exec('macaviz -i '+root+filename+'.xml -g -twpc  -f '+root+filename+'.png'/*'-o '+root+filename+'.dot'*/  ,
	function (error, stdout, stderr) {

		console.log('  Execution Macaviz');//\n						stdout		: '+stdout+'\n						stderr		: '+stderr+'\n						error		: '+error);
			
		//renvoyer le nom de l'image generée par macaviz
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end(filename+'.png');

		console.log('  Response		: '+filename+'.png');
		
		//effacer les données
		child = exec('rm '+root+filename+'.xml',function (error, stdout, stderr) {

		});
	});
	
}
