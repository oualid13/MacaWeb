	var exec	= require('child_process').exec,
	macaoption	= ' | txt2macaon | maca_segmenter | maca_tokenizer | maca_lexer | maca_tagger | maca_anamorph | maca_chunker ';

exports.macaon	= function (text,filename,root,sentence,res,cli)
{
	//executer la commande macaon et generer un document XML
	if(text == 'release:')
		var child = exec('echo '+'\"'+sentence+'\"'+macaoption+' -lpcw'+ '>'+root+'/client/'+filename+'.xml',
			function (error, stdout, stderr) {

				//console.log('  Execution Macaon');//\n						stdout		: '+stdout+'\n						stderr		: '+stderr+'\n						error		: '+error);
				
				//executer macaviz
				exports.macaviz(text,filename,root,res,cli);
						
			}
		);
	else
		var child = exec('echo '+'\"'+sentence+'\"'+macaoption+'| maca2txt -lpcw',
			function (error, stdout, stderr) {

				res.end(text+stdout);
			}
		);
	
	
}

exports.macaviz	= function (text,filename,root,res,cli)
{
	//generer une image et un fichier dot a partir du document xml
	
	var child = exec('macaviz -i '+root+'/client/'+filename+'.xml -g -twpc -o '+root+'/client/'+filename+'.dot'  ,
	function (error, stdout, stderr) {

		console.log('  Execution Macaviz');//\n						stdout		: '+stdout+'\n						stderr		: '+stderr+'\n						error		: '+error);
		var child2 = exec('dot -Txdot -o'+root+'/client/'+filename+'.gv '+root+'/client/'+filename+'.dot',function (error, stdout, stderr) {
			//renvoyer le nom de l'image generée par macaviz
			console.log('  Response to '+cli.ip+' "text"	: '+filename+'.gv');
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end(text+filename+'.gv');
		
			//effacer les données			
			var child3 = exec('rm '+root+'/client/'+filename+'.dot '+root+'/client/'+filename+'.xml',function (error, stdout, stderr) {

			});
		});		
	});
	
}
