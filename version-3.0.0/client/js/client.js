var canviz = new Canviz('graph_container'),
	previous;

Ajax.Responders.register({
	onCreate: function() {
		$('busy').show();
	},
	onComplete: function() {
		if (0 == Ajax.activeRequestCount) {
			$('busy').hide();
		}
	}
});

function replace (sentence,org_char,cib_char){
	
	var tab	= sentence.split(org_char);
	sentence	= '';

	for(var i=0,len=tab.length;i< len-1;i++)
		sentence	+= tab[i] + cib_char ;
	sentence	+= tab [tab.length-1];

	return sentence;
	
} 

var request	= function ()
{
		
	if (input.value == '')
		return;
	var xhr		= getXMLHttpRequest(),
	sentence	= input.value,
	date		= new Date(),
	Time		= date.getTime()
	doc			= document.location.href.split("/");
	sentence	= encodeURIComponent(replace (sentence,"'","\'"));
	
	if ((typeof(previous)=='undefined')||(sentence != previous)){
		xhr.open("GET", doc[0]+"/?app=Maca&sentence="+sentence+"&T="+Time, true);
		previous	= sentence;
	}

	xhr.onreadystatechange = function() 
	{
		if (xhr.readyState == 4 )
		{
			if(xhr.status == 200 || xhr.status == 0)
			{
				if(xhr.responseText != '')
					canviz.load(xhr.responseText);
				
			}else if(xhr.status == 500 )
					alert(xhr.responseText);
		}
	};

	xhr.send(null);	
};

var	input	= $("input");
input.addEventListener('keyup', request , false);
