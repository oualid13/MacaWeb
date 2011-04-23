exports.clean	= function (sentence)
{
	sentence	= cleanbychar(sentence,'|');
	sentence	= replace(sentence,';',',');
	sentence	= cleanbychar(sentence,'{');
	sentence	= cleanbychar(sentence,'}');

	return (sentence);
}

function cleanbychar (sentence,character)
{
	var tab	= sentence.split(character);
	sentence	= '';

	for(var i=0,len=tab.length;i< len;i++)
		sentence	+= tab[i];

	return sentence;
}

function replace (sentence,org_char,cib_char){
	
	var tab	= sentence.split(org_char);
	sentence	= '';

	for(var i=0,len=tab.length;i< len-1;i++)
		sentence	+= tab[i] + cib_char ;
	sentence	+= tab [tab.length-1];

	return sentence;
	
} 
