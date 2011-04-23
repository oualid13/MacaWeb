var request	= function ()
{
	if (input.value == '')
		return;	
	var xhr		= getXMLHttpRequest(),	
	sentence	= encodeURIComponent(input.value),
	date		= new Date(),
	Time		= date.getTime()
	doc			= document.location.href.split("/");
	
	xhr.open("GET", doc[0]+"/?app=Maca&sentence="+sentence+"&T="+Time, false);

	xhr.onreadystatechange = function() 
	{
		if (xhr.readyState == 4 )
		{
			if(xhr.status == 200 || xhr.status == 0)
			{
				
				/*var result			= document.getElementById("output");
    			result.innerHTML	= xhr.responseText;*/
				var img		= document.getElementById("image");
				/*if(xhr.responseText=='none')
					$('img').removeAttr('src');
				else*/
					img.src=xhr.responseText;
				
			}else if(xhr.status == 500 )
					alert(xhr.responseText);
		}
	};

	xhr.send(null);	
};

var	input	= document.getElementById("input");
input.addEventListener('keyup', request , false);
