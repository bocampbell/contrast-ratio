var aColor = document.getElementById('allcolors').value.split(',');

var x = aColor.length

for (var i=0;i<x;i++) 

	{
	
	document.write('in the top loop ' + aColor[i] + '<br>');

	// for loop through each color
	for (var c in aColor)
		{
		// Ratio = aColor[c] [ratio function] aColor[i];
		
		// fill input boxes with values since the function wants them this way
		// change this shit
		
		background.value = aColor[c];
		foreground.value = aColor[i];
	
		//colorChanged(background);
		//colorChanged(foreground);
	
		update();
	
	
		document.write(background.value + 'x' + foreground.value + '<br>');
		}
	
	
	}
	
	



