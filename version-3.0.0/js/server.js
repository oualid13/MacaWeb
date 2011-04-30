//inclure les modules necessaire

	var util	= require ('util'),
	http		= require ('http'),
	sys			= require ('sys'),
	url			= require ('url'),
	path		= require ('path'),
	fs			= require ('fs'),
	crypto		= require ('crypto'),
	maca		= require ('./maca/maca.js'),
	clean		= require ('./clean.js'),
	hash		= require ('./hash.js'),
	port		= '8000',
	host		= '127.0.0.1',
	root		= '..',
	clients		= new hash.Hash(),
	blacklist	= new hash.Hash(),
	server;

//recuperer les exceptions pour que le serveur puisse continuer a tourner
process.on('uncaughtException', function (err) {
	console.log('  Caught exception	: ' + err);
});

//ajouter la date au log
console.log = function(text)
{
    sys.puts(Date() + " " + text);
}

//afficher un objet
function log_obj(obj)
{
	for (var i in obj)
		console.log('		key is: ' + i /*+ ', value is: ' + util.inspect(obj[i], true, null)*/);
}

//classe caché client
function Client (ip)
{
	this.ip			= ip;
	this.req_number	= 0;
	this.requests	= new hash.Hash();
}

function Requeste (req,res)
{
	this.request	= req;
	this.result		= res;
}

//creer le serveur
server	= http.createServer(function (req, res) 
{
	//le serveur a recu une requete "req" et va renvoyer le resultat "res"

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
	
	if(clients.getItem (cli.ip).req_number>40){
		blacklist.setItem (cli.ip,cli);
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.destroy();
		return;
	}
		
	//si la requete est trop longue on la refuse
	if(Request.search.length>130){
		res.writeHead(500, {"Content-Type": "text/plain"});
		//res.write("Requete trés longue\n");
		res.destroy();

		console.log('  Response				: Requete trés longue');
		return;
	}

	//si la requete contient des parametres
	if(Request.search){
		var	filename,pathfile;

		//si la requete est pour macaon
		if( Request.query.app == 'Maca' ){

			var sentence	= clean.clean(Request.query.sentence);
			console.log('  	Request "Macaon"		: '+req.url);
		
			filename	= crypto.createHash('md5').update(sentence).digest("hex");
			pathfile	= '/data/' + filename ;

			//tester si le fichier pour cette requete existe deja
			file	= path.join(process.cwd(), url.parse(root+pathfile+'.gv').pathname);
			path.exists(file, function(exists){

				if(!exists){
					//s'il n'existe pas on le genére avec le macaon
					//maca.macaon(pathfile,root,sentence,res,cli,clients,Request);
					
					//ajouter la requete au client
					clients.getItem(cli.ip).requests.setItem(Request.query.T,new Requeste(Request,res));
					console.log(' 	Requests 			: ');
					log_obj(clients.getItem(cli.ip).requests.items);
					sys.puts('\n');

				}  else{
					//s'il existe deja on renvoie le nom du fichier
					//console.log('  file"/data/'+filename+'.gv" already exists!');
					console.log('  Response to '+cli.ip+' "text"	: /data/'+filename+'.gv');
					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.end('/data/'+filename+'.gv');
					clients.getItem(cli.ip).requests.removeItem(Request.query.T);
					
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
		console.log('  	Request  "file"			: '+Request.pathname);
		sys.puts('\n');
		
		file	= path.join(process.cwd(), uri);
		path.exists(file, function(exists){

			if(!exists){
				//si le fichier demandé n'existe pas sur le serveur on renvoie la page d'erreur
				req.url	= '/error.html';
				uri	= url.parse(root+req.url).pathname;
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

server.listen(parseInt(port),host);

function processQueue ()
{
	
	for(i in clients.items){
		if(clients.items [i].requests.length != 0){
			console.log('  Execution Macaon');
			var req;
			for(j in clients.items [i].requests.items){
				if(typeof(req) =='undefined')
					req	= clients.items [i].requests.removeItem(j);
				else 
					if(Math.max( j,req.request.query.T) == j){
						console.log('  	aborting   "'+req.request.query.T+'" ...');
						res.writeHead(200, {'Content-Type': 'text/plain'});
						req.result.end();
						req	= clients.items [i].requests.removeItem(j);		
					}else{
						console.log('  	aborting "'+j+'" ...');
						res.writeHead(200, {'Content-Type': 'text/plain'});
						clients.items [i].requests.items[j].result.end();
					}
					
			}
			console.log('  	processing "'+req.request.query.T+'" ...');
			
			var sentence	= clean.clean(req.request.query.sentence),
			filename		= crypto.createHash('md5').update(sentence).digest("hex"),
			pathfile		= '/data/' + filename;
			maca.macaon(pathfile,root,sentence,req.result,clients.items [i])		
		}
	}
	
}
function two_h_pass (){
	blacklist.clear();
	for(i in clients.items)
		clients.items [i].req_number = 0;
}
setInterval(processQueue, 100);
setInterval(two_h_pass, 120000);

console.log('  Server running at			: http://'+server.address().address+':'+server.address().port+'/');

