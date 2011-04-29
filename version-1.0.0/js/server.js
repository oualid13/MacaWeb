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
	clients		= new  hash.Hash(util),
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
	this.requests	= new hash.Hash(util);
}

function Requeste (req,res)
{
	this.req	= req;
	this.res	= res;
}

//creer le serveur
server	= http.createServer(function (req, res) 
{
	//le serveur a recu une requete "req" et va renvoyer le resultat "res"

	//on ajoute le client
	var cli	= new Client (util.inspect(res.socket.remoteAddress, true, null));
	
	clients.setItem (cli.ip,cli);
	clients.getItem (cli.ip).req_number++;

	var file,
	//decomposer la requete en un objet literal
	Request=url.parse(req.url,true);

	console.log('  Client '+cli.ip);
	console.log('  	request number			: '+clients.getItem (cli.ip).req_number);
	
	if(clients.getItem (cli.ip).req_number>2000){
		res.destroy();
		return;
	}
		
	//si la requete est trop longue on la refuse
	if(Request.search.length>130){
		res.writeHead(500, {"Content-Type": "text/plain"});
		res.write("Requete trés longue\n");
		res.end();

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
			
			//ajouter la requete au client
			clients.getItem(cli.ip).requests.setItem(Request.query.T,new Requeste(Request,res));
			console.log(' 	Requests 			: ');
			log_obj(clients.getItem(cli.ip).requests.items);
			sys.puts('');
			filename	= crypto.createHash('md5').update(sentence).digest("hex");
			pathfile	= '/data/' + filename ;

			//tester si le fichier pour cette requete existe deja
			file	= path.join(process.cwd(), url.parse(root+pathfile+'.png').pathname);
			path.exists(file, function(exists){

				if(!exists){
					//s'il n'existe pas on le genére avec le macaon
					maca.macaon(pathfile,root,sentence,res,cli,clients,Request);

				}  else{
					//s'il existe deja on renvoie le nom du fichier
					//console.log('  file"/data/'+filename+'.png" already exists!');
					console.log('  Response to '+cli.ip+' "text"	: /data/'+filename+'.png');
					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.end('/data/'+filename+'.png');
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
		sys.puts('');
		
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


console.log('  Server running at			: http://'+server.address().address+':'+server.address().port+'/');

