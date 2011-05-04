//inclure les modules necessaire

	var util	= require('util'),
	exec		= require('child_process').exec,
	http		= require('http'),
	sys			= require("sys"),  
	url			= require("url"),  
	path		= require("path"),  
	fs			= require("fs"),
	crypto		= require("crypto");

//recuperer les exceptions pour que le serveur puisse continuer a executer
process.on('uncaughtException', function (err) {
	console.log('  Caught exception: ' + err);
});

//ajouter la date au log
console.log = function(text) {
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
		return;
	}
	
	//si la requete contient des parametres
	if(Request.search){
		
					
	}else //si la requete ne contient pas des parametres alors elle sera traiter comme un nom de fichier
	{

		var	uri;
			
		//si la requete est vide on renvoi la page d'accueil sinon on renvoi le fichier demandé
		if(Request.href=='/')
			uri	= url.parse('index.html').pathname;
		else
			uri	= url.parse(req.url).pathname;

		console.log("  uri:"+uri);
			
		file	= path.join(process.cwd(), uri);  
		path.exists(file, function(exists) {  

			if(!exists) {  
		
				//si le fichier demandé n'existe pas sur le serveur on renvoie la page d'erreur
				//uri		= url.parse('../error.html').pathname;
				//file	= path.join(process.cwd(), uri);  
			
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
			});  
		});  


	}
	
}).listen(8126);



console.log('  Server running at http://127.0.0.1:8134/');
