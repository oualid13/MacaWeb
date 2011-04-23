//inclure les modules necessaire

	var util	= require('util'),
	http		= require('http'),
	sys			= require('sys'),  
	url			= require('url'),
	path		= require('path'),  
	fs			= require('fs'),
	crypto		= require('crypto'),
	maca		= require('./maca/maca.js'),
	clean		= require ('./clean.js'),
	port		= '8132',
	root		= '..';

//recuperer les exceptions pour que le serveur puisse continuer a executer
process.on('uncaughtException', function (err) {
	console.log('  Caught exception	: ' + err);
});

//ajouter la date au log
console.log = function(text){
    sys.puts(Date() + " " + text);
}

//creer le serveur 
http.createServer(function (req, res) {
	//le serveur a recu une requete "req" et va renvoyer le resultat "res"

	var file,
	//decomposer la requete en un objet literal
	Request=url.parse(req.url,true);

	//si la requete est trop longue on la refuse
	if(Request.search.length>130){
		res.writeHead(500, {"Content-Type": "text/plain"});  
		res.write("Requete trés longue\n");  
		res.end();  

		console.log('  Response : Requete trés longue');
		return;
	}
	
	//si la requete contient des parametres
	if(Request.search){
		var	filename,pathfile;	
		
		//si la requete est pour macaon	
		if( Request.query.app == 'Maca' ){
			
			var sentence	= clean.clean(Request.query.sentence) ;
			console.log('  Request "Macaon"	: '+req.url);
			filename	= crypto.createHash('md5').update(sentence).digest("hex");
			pathfile	= '/data/' + filename ;

			//tester si le fichier pour cette requete existe deja
			file	= path.join(process.cwd(), url.parse(root+pathfile+'.gv').pathname);  
			path.exists(file, function(exists) {  

				if(!exists) {  
					//s'il n'existe pas on le genére avec le macaon
					maca.macaon(pathfile,root,sentence,res);
			
				}  else {
					//s'il existe deja on renvoie le nom du fichier 
					console.log('  file"/data/'+filename+'.gv" already exists!');
					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.end('/data/'+filename+'.gv');

					console.log('  Response		: /data/'+filename+'.gv');
				}
		  		 
			});
					
			
		} else{

		}
	
	}else{ //si la requete ne contient pas des parametres alors elle sera traiter comme un nom de fichier

		var	uri;
			
		//si la requete est vide on renvoi la page d'accueil sinon on renvoi le fichier demandé
		if(Request.href=='/')
			Request.pathname='/MacaWeb.html';
		
		uri	= url.parse(root+Request.pathname).pathname;
		console.log('  Request  "file"	: '+Request.pathname);
		
		file	= path.join(process.cwd(), uri);  
		path.exists(file, function(exists) {  

			if(!exists) {  
		
				//si le fichier demandé n'existe pas sur le serveur on renvoie la page d'erreur
				uri		= url.parse(root+'/error.html').pathname;
				file	= path.join(process.cwd(), uri);  
			
			}  
	  
			fs.readFile(file, "binary", function(err, file2) {  
				if(err) {  
					res.writeHead(500, {"Content-Type": "text/plain"});  
					res.write(err + "\n");  
					res.end();  
					return;  
				}  
	  			//envoyer le fichier demandé
				res.writeHead(200);  
				res.write(file2, "binary");  
				res.end();  

				console.log('  Response "file"	: ' + Request.pathname);
			});  
		});  


	}
	
}).listen(parseInt(port));



console.log('  Server running at	: http://127.0.0.1:'+port+'/');
