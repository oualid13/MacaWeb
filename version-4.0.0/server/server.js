//inclure les modules necessaire

	var root		= '..',
	util			= require ('util'),
	exec			= require('child_process').exec,
	http			= require ('http'),
	sys			= require ('sys'),
	url			= require ('url'),
	path			= require ('path'),
	fs			= require ('fs'),
	crypto			= require ('crypto'),
	maca			= require (root+'/server/maca.js'),
	berkeleyParser	= require (root+'/server/BerkeleyParser.js'),
	clean			= require (root+'/server/clean.js'),
	hash			= require (root+'/server/hash.js'),
	port			= '8000',
	host			= '127.0.0.1',
	clients			= new hash.Hash(),
	blacklist		= new hash.Hash(),
	text		= 'release:',
	server;

//recuperer les exceptions pour que le serveur ne crache pas
process.on('uncaughtException', function (err) {
	console.log('  Caught exception	: ' + err);
});


//ajouter la date au log
console.log = function(text){
    sys.puts(Date() + " " + text);
}

//afficher un objet Json
function log_obj(obj){

	for (var i in obj)
		console.log('		key is: ' + i /*+ ', value is: ' + util.inspect(obj[i], true, null)*/);
}

//classe caché client
function Client (ip){

	this.ip			= ip;
	this.req_number	= 0;
	this.requests	= new hash.Hash();
}

//classe caché Request
function Requeste (req,res){

	this.request	= req;
	this.result		= res;
}



//creer le serveur
server	= http.createServer(function (req, res) {
	//le serveur a recu une requete "req" et va renvoyer le resultat "res"

	//si le client est dans la liste noir on l'ignore
	if(blacklist.hasItem(res.socket.remoteAddress)){
		res.destroy();
		return;	
	}
	
	//on ajoute le client
	var cli	= new Client (util.inspect(res.socket.remoteAddress, true, null));
	clients.setItem (cli.ip,cli);
	clients.getItem (cli.ip).req_number++;

	var file,
	//decomposer la requete en un objet literal
	Request=url.parse(req.url,true);
	sys.puts('\n');
	console.log('  Client '+cli.ip);
	console.log('  	request number			: '+clients.getItem (cli.ip).req_number);
	
	/*pénaliser les client qui ont effectué 400 requetes par 15 minutes
	  en les ajoutant dans une liste noir
	*/
	if(clients.getItem (cli.ip).req_number>400){
		blacklist.setItem (cli.ip,cli);
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end('text:vous avez effectué un grand nombre de requêtes, veuillez attendre quelques minutes');
		return;
	}
		
	//si la requete est trop longue on la refuse
	if(Request.search.length>130){
		res.writeHead(200, {"Content-Type": "text/plain"});
		res.end("text:Requete trés longue\n");
		console.log('  Response				: Requete trés longue');
		return;
	}

	//si la requete contient des parametres
	if(Request.search){
		var	filename,pathfile;

		//si la requete est pour macaon
		if( Request.query.app == 'Maca' ){

			var sentence	= clean.clean(Request.query.sentence);
			//console.log('  	Request "Macaon"		: '+Request.query.sentence);
			console.log('  	Request "Macaon"		: '+req.url);
		
			filename	= crypto.createHash('md5').update(sentence).digest("hex");
			pathfile	= '/client/data/' + filename ;

			//tester si le fichier pour cette requete existe deja
			file	= path.join(process.cwd(), url.parse(root+pathfile+'.gv').pathname);
			path.exists(file, function(exists){

				if(!exists){
					//si le fichier n'existe pas on ajoute la requete dans une file d'attente
					
					clients.getItem(cli.ip).requests.setItem(Request.query.T,new Requeste(Request,res));
					console.log(' 	Requests 			: ');
					log_obj(clients.getItem(cli.ip).requests.items);
					sys.puts('\n');

				}  else{
					//s'il existe deja on renvoie le nom du fichier
					//console.log('  file"/data/'+filename+'.gv" already exists!');
					console.log('  Response to '+cli.ip+' "text"	: /data/'+filename+'.gv');
					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.end(text+'/data/'+filename+'.gv');
					clients.getItem(cli.ip).requests.removeItem(Request.query.T);
					
				}
				
			});
			
		} else if( Request.query.app == 'BrklyPrsr'){
				//si la requete est pour berkeleyParser
			
				var sentence	= clean.clean(Request.query.sentence);
				console.log('  	Request "BrklyPrsr"		: '+sentence);
				berkeleyParser.in(sentence,res,cli);
				
		}

		
	}else{ //si la requete ne contient pas des parametres alors elle sera traiter comme un nom de fichier

		var	uri;

		//si la requete est vide on renvoi la page d'accueil sinon on renvoi le fichier demandé
		if(Request.href =='/')
			Request.pathname='/MacaWeb.html';
		else if(Request.href == '/BrklyPrsr')
				Request.pathname='/draw-parse-tree.html';

		uri	= url.parse(root+'/client'+Request.pathname).pathname;
		console.log('  	Request  "file"			: '+Request.pathname);
		sys.puts('\n');
		
		file	= path.join(process.cwd(), uri);
		path.exists(file, function(exists){

			if(!exists){
				//si le fichier demandé n'existe pas sur le serveur on renvoie la page d'erreur
				req.url	= '/error.html';
				uri	= url.parse(root+'/client'+req.url).pathname;
				file	= path.join(process.cwd(), uri);
			}

			fs.readFile(file, "binary", function(err, file2){
				if(err){
					res.writeHead(500, {"Content-Type": "text/plain"});
					res.write(err + "\n");
					res.end();
					return;
				}
				//envoyer le fichier demandé
				console.log('  Response to '+cli.ip+' "file"	: ' + Request.pathname);
				res.writeHead(200);
				res.write(file2, "binary");
				res.end();
				
			});
		});
	}

});

//executer pour chaque client la derniére requête effectué
function processQueue ()
{
	
	for(i in clients.items){
		//console.log('  Client :'+i);
		if(clients.items [i].requests.length != 0){
			console.log('  Execution Macaon ');
			var req;
			for(j in clients.items [i].requests.items){
				if(typeof(req) =='undefined'){
					req	= clients.items [i].requests.removeItem(j);
				}else
					if(Math.max( j,req.request.query.T) == j){
						console.log('  	aborting	"'+req.request.query.T+'" ...');
						req.result.writeHead(200);
						req.result.end('');
						req	= clients.items [i].requests.removeItem(j);
					}else{
						console.log('  	aborting	"'+j+'" ...');
						clients.items [i].requests.items[j].result.writeHead(200);
						clients.items [i].requests.items[j].result.end('');
						clients.items [i].requests.removeItem(j);
					}
					
			}
			console.log('  	processing	"'+req.request.query.T+'" ...');
			
			var sentence	= clean.clean(req.request.query.sentence),
			filename		= crypto.createHash('md5').update(sentence).digest("hex"),
			pathfile		= '/data/' + filename;
			console.log("  phrase :"+sentence);
			maca.macaon(text,pathfile,root,sentence,req.result,clients.items [i]);
		}
	}
}


function cleanBlacklist (){
	blacklist.clear();
	for(i in clients.items){
		clients.items [i].req_number = 0;
		if(clients.items [i].requests.length == 0){
			clients.removeItem(i);
		}
	}
}
//traiter les requetes chaque 300 milscds
setInterval(processQueue, 300);

//reinitialiser la liste noir chaque 15 minutes
setInterval(cleanBlacklist, 15*60*1000);

//lancer le serveur
server.listen(parseInt(port),host);

console.log('  Server running at			: http://'+server.address().address+':'+server.address().port+'/');
var child = exec('export PATH=~/local/bin/:$PATH',
			function (error, stdout, stderr) {
			}
		);
