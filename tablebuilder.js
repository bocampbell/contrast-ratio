// create input that will later be pulled from textarea or input field 

var aColor = new Array();
aColor[0]="000000";
aColor[1]="CCCCCC";
aColor[2]="FFFFFF";

function buildtable() {

// for loop through the total number of colors 
var x = aColor.length

document.write("<table>");

for (var i=0;i<x;i++) 

	{
	
	document.write(aColor[i] + "<tr>");

	// for loop through each color
	for (var c in aColor)
		{
		// Ratio N = c [ratio] aColor[i];
		
		document.write("<td>" + c + "x" + i + "</td>");
		}
	
		// apply formula to each combination
		
	document.write("</tr>");
	
	// build row
	
	}
	
	document.write("</table>");
	
}

buildtable();
