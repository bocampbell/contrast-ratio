
// put textarea values into array aColor
var aColor = document.getElementById('allcolors').value.split(',');

// find out how many colors in the list
var x = aColor.length


// go color by color to compare each
for (var i=0;i<x;i++) 

	{
	
	document.write('in the top loop ' + aColor[i] + '<br>');

	// for loop through each color
	for (var c in aColor)
		{
		
		// fill input boxes with values since the function wants them this way
		
		background.value = aColor[c];
		foreground.value = aColor[i];
		
		doIt();
		
		//var cr = update(aColor[c],aColor[i]);		
	
		document.write(foreground.value + 'x' + background.value + '<br>');
		}
	
	
	}
	
	



