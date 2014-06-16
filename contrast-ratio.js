function $(expr, con) {
	return typeof expr === 'string'? (con || document).querySelector(expr) : expr;
}

function $$(expr, con) {
	return Array.prototype.slice.call((con || document).querySelectorAll(expr));
}

// Make each ID a global variable
// Many browsers do this anyway (it’s in the HTML5 spec), so it ensures consistency
$$('[id]').forEach(function(element) { window[element.id] = element; });

var messages = {
	'semitransparent': 'The background is semi-transparent, so the contrast ratio cannot be precise. Depending on what’s going to be underneath, it could be any of the following:',
	'fail': 'Fails WCAG 2.0 :-(',
	'aa-large': 'Passes AA for large text (above 18pt or bold above 14pt)',
	'aa': 'Passes AA level for any size text and AAA for large text (above 18pt or bold above 14pt)',
	'aaa': 'Passes AAA level for any size text'
};

var canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');
	
canvas.width = canvas.height = 16;
document.body.appendChild(canvas);

incrementable.onload = function() {
	if (window.Incrementable) {
		new Incrementable(background);
		new Incrementable(foreground);
	}
};

if (window.Incrementable) {
	incrementable.onload();
}

var output = $('output');

var levels = {
	'fail': {
		range: [0, 3],
		color: 'hsl(0, 100%, 40%)'
	},
	'aa-large': {
		range: [3, 4.5],
		color: 'hsl(40, 100%, 45%)'
	},
	'aa': {
		range: [4.5, 7],
		color: 'hsl(80, 60%, 45%)'
	},
	'aaa': {
		range: [7, 22],
		color: 'hsl(95, 60%, 41%)'
	}
};

function rangeIntersect(min, max, upper, lower) {
	return (max < upper? max : upper) - (lower < min? min : lower);
}

function updateLuminance(input) {
	//input.title = 'Relative luminance: ';
	input.title = '';
	var sTitle = input.title;
	
	// this puts ALL colors in RGB by pulling them back from the input
	// color laundering
	var color = input.color;
	//document.write(color);

	//bc find out wtf alpha is here... opacity?
	if (input.color.alpha < 1) {
		input.title += color.overlayOn(Color.BLACK).luminance + ' - ' + color.overlayOn(Color.WHITE).luminance;
		sTitle  += color.overlayOn(Color.BLACK).luminance + ' - ' + color.overlayOn(Color.WHITE).luminance;
	}
	else {
		input.title += color.luminance;
		sTitle += color.luminance;
	}

	input.title = sTitle;
}

function update() {
	if (foreground.color && background.color) {
		if (foreground.value !== foreground.defaultValue || background.value !== background.defaultValue) {
			window.onhashchange = null;

			//bc location.hash = '#' + encodeURIComponent(foreground.value) + '-on-' + encodeURIComponent(background.value);
			//note: #hsla(200.0%,0%,.7)-on-#eee
			
			
			setTimeout(function() {
				window.onhashchange = hashchange;
			}, 10);
		}
		
		var contrast = background.color.contrast(foreground.color);
		
		updateLuminance(background);
		updateLuminance(foreground);

		var min = contrast.min,
		    max = contrast.max,
		    range = max - min,
		    classes = [], percentages = [];
		
		for (var level in levels) {
			var bounds = levels[level].range,
			    lower = bounds[0],
			    upper = bounds[1];
			
			if (min < upper && max >= lower) {
				classes.push(level);
				
				percentages.push({
					level: level,
					percentage: 100 * rangeIntersect(min, max, upper, lower) / range
				});
			}
		}
		
		$('strong', output).textContent = contrast.ratio;

		sTable += '<div style="height:50%;width:100%;float:left;">' + contrast.ratio + '</div>';

		if ((contrast.ratio >= 3.1) & (contrast.ratio < 4.5))
			{
				sTable += '<div style="height:50%;width:100%;float:left;background-color:#cccccc;">A</div>'
			};

		if (contrast.ratio >= 4.5)
		{
			sTable += "</br>Aa"
		};
		
		if (contrast.ratio < 3.1)
			{sTable += "</br>No"}

		var error = $('.error', output);
		
		if (contrast.error) {
			error.textContent = '±' + contrast.error;
			error.title = min + ' - ' + max;
		}
		else {
			error.textContent = '';
			error.title = '';
		}
		
		if (classes.length <= 1) {
			results.textContent = messages[classes[0]];
			output.style.backgroundImage = '';
			output.style.backgroundColor = levels[classes[0]].color;
		}
		else {
			var fragment = document.createDocumentFragment();
			
			var p = document.createElement('p');
			p.textContent = messages.semitransparent;
			fragment.appendChild(p);
			
			var ul = document.createElement('ul');
			
			
			var message = '<p></p><ul>';
			
			for (var i=0; i<classes.length; i++) {
				var li = document.createElement('li');
				
				li.textContent = messages[classes[i]];
				
				ul.appendChild(li);
			}
			
			fragment.appendChild(ul);
			
			results.textContent = '';
			results.appendChild(fragment);
			
			// Create gradient illustrating levels
			var stops = [], previousPercentage = 0;

			for (var i=0; i < 2 * percentages.length; i++) {
				var info = percentages[i % percentages.length];
				
				var level = info.level;
				var color = levels[level].color,
				    percentage = previousPercentage + info.percentage / 2;
				
				stops.push(color + ' ' + previousPercentage + '%', color + ' ' + percentage + '%');
				
				previousPercentage = percentage;
			}
			
			if (PrefixFree.functions.indexOf('linear-gradient') > -1) {
				// Prefixed implementation
				var gradient = 'linear-gradient(-45deg, ' + stops.join(', ') + ')';
				
				output.style.backgroundImage = PrefixFree.prefix + gradient;
			}
			else {
				var gradient = 'linear-gradient(135deg, ' + stops.join(', ') + ')';
				
				output.style.backgroundImage = gradient;
			}
		}
		
		output.className = classes.join(' '); 
		
		ctx.clearRect(0, 0, 16, 16);
		
		ctx.fillStyle = background.color + '';
		ctx.fillRect(0, 0, 8, 16);
		
		ctx.fillStyle = foreground.color + '';
		ctx.fillRect(8, 0, 8, 16);
		
		//bc can't run this offline ---- $('link[rel="shortcut icon"]').setAttribute('href', canvas.toDataURL());
	}
}

function colorChanged(input) {
	input.style.width = input.value.length * .56 + 'em';
	input.style.width = input.value.length + 'ch';
	
	var isForeground = input == foreground;
	
	var display = isForeground? foregroundDisplay : backgroundDisplay;
	
	var previousColor = getComputedStyle(display).backgroundColor;
	
	display.style.background = input.value;
	
	var color = getComputedStyle(display).backgroundColor;

	if (color && input.value && (color !== previousColor || color === 'transparent' || color === 'rgba(0, 0, 0, 0)')) {
		// Valid & different color
		if (isForeground) {
			backgroundDisplay.style.color = input.value;
		}
		
		input.color = new Color(color);
		
		return true;
	}
	
	return false;
}

// function not being called, skipping hashchange unless we need it
function hashchange() {
	
	if (location.hash) {
		var colors = location.hash.slice(1).split('-on-');

		foreground.value = decodeURIComponent(colors[0]);
		background.value = decodeURIComponent(colors[1]);
	}
	else {
		foreground.value = foreground.defaultValue;
		background.value = background.defaultValue;
		foreground.value = "green";
	}
	
	background.oninput();
	foreground.oninput();
};

background.oninput =
foreground.oninput = function() {
	var valid = colorChanged(this);

	if (valid) {
		update();
	}
}

swap.onclick = function() {
	var backgroundColor = background.value;
	background.value = foreground.value;
	foreground.value = backgroundColor;
	
	colorChanged(background);
	colorChanged(foreground);
	
	update();
}

window.encodeURIComponent = (function(){
	var encodeURIComponent = window.encodeURIComponent;

	return function (str) {
		return encodeURIComponent(str).replace(/[()]/g, function ($0) {
			return escape($0);
		});
	};
})();

window.decodeURIComponent = (function(){
	var decodeURIComponent = window.decodeURIComponent;

	return function (str) {
		return str.search(/%[\da-f]/i) > -1? decodeURIComponent(str) : str;
	};
})();


// There has got to be a better way to do this 
function getLuminance(smee) {

		background.value = smee;
		colorChanged(background);
		updateLuminance(background);

		fLum = parseFloat(background.title);

		if (fLum < .2) {var myFontcolor = '#fff'}
		else {var myFontcolor = '#000'};

		return(myFontcolor);
}


var sTable = '';

function buildTable() {
	var aColor = ["#ffffff","#000000"];
	var aWhiteblack = ["#FFFFFF","#000000"];
	var aTestlist = ["#ffe14f","#ffcf01","#fdb813","green","#dd731c","#b8461b"];
	var aBluemixcolors = ["#00a6a0","#00648D","#003f69","#f04e37","#f19027","#ffe14f","#8cc63f","#00b2ef","#ab1a86"];
	var aBluemixgrays = ["#e3e4e6","#b8babe","#929399","#6f7076","#4c4d53","#231f20"];
	var aIbmcolors = ["#ffe14f","#ffcf01","#fdb813","#f19027","#dd731c","#b8461b","#f04e37","#d9182d","#a91024","#f389af","#ee3d96","#ba006e","#ab1a86","#7f1c7d","#3b0256","#82d1f5","#00b2ef","#00648d","#00b0da","#008abf","#003f69","#00a6a0","#007670","#006059","#8cc63f","#17af4b","#008A52","#a5a215","#838329","#594f13"];
	var aIbmgrays = ["#f1f1f2","#e6e7e8","#d0d2d3","#bbbdbf","#a6a8ab","#929497","#808184","#6d6e70","#58595b","#404041","#231f20","#f5f5f5","#e5e5e3","#d0cfce","#bcbbb9","#a8a7a5","#959492","#83827f","#72716e","#605f5c","#4d4c48","#383633","#efeff1","#e3e4e6","#cdced2","#b8babe","#a4a6ab","#929399","#808287","#6f7076","#4c4d53","#393a3f"];
	
	sTable = '<table>';

	if (document.getElementById('allcolors').value > '') {
		// need to also see if checkboxes are checked so we don't return w/o those values
		// regex
		aColor = aColor.concat(document.getElementById('allcolors').value.split(/,(?![^(]*\))/g));
	}
	else {	
		aColor = [];
	}


	if(document.getElementById('whiteblack').checked)
      aColor = aColor.concat(aWhiteblack);

    if(document.getElementById('testcolors').checked)
      aColor = aColor.concat(aTestlist);

    if(document.getElementById('ibmcolors').checked)
      aColor = aColor.concat(aIbmcolors);
 
    if(document.getElementById('ibmgrays').checked)
      aColor = aColor.concat(aIbmgrays);

  	if(document.getElementById('bluemixgrays').checked)
 	  aColor = aColor.concat(aBluemixgrays);

  	if(document.getElementById('bluemixcolors').checked)
      aColor = aColor.concat(aBluemixcolors);

if(aColor.length == 0) {alert('yo');}


	var x = aColor.length

	for (var i=0;i<x;i++) {

		// build header row
		if (i==0) {

			for(var b in aColor) {
				if (b==0) {
					sTable += '<colgroup></colgroup><colgroup class="slim"></colgroup>'
				}
				else {
					sTable += '<colgroup class="slim"></colgroup>'
				}
			}

			sTable += '<tr><th></th>';
			for (var b in aColor) {

				myFontcolor = getLuminance(aColor[b]);

				cellBackground = aColor[b].toUpperCase();

				sTable += '<th class="mySquare rotate"><div><span>'  + cellBackground + '</span></div></th>';
			}
			sTable += '</tr>';

			sTable += '<tr><td></td>';
			for (var b in aColor) {

				myFontcolor = getLuminance(aColor[b]);

				cellBackground = aColor[b].toUpperCase();

				sTable += '<td class="mySquare" style="color:' + myFontcolor + ';background-color:' +  aColor[b] + '">&nbsp;</td>';
			}
			sTable += '</tr>';

		}

		myFontcolor = getLuminance(aColor[i]);

		sBackground = aColor[i].toUpperCase();
		sTable += '<tr><td class="mySquare" style="color:' + myFontcolor + ';background-color:' + aColor[i] + '">' + sBackground + '</td>';

		// for loop through each color
		for (var c in aColor) {
			 
			sTable += '<td>';
			
			// fill input boxes with values since the function wants them this way
			
			background.value = aColor[c];
			foreground.value = aColor[i];

			colorChanged(background);
			colorChanged(foreground);
	
			update();

			sTable += '</td>';

		}

		sTable += '</tr>';
	}
	sTable += '</table>';


	var tableDiv = document.getElementById('myContainer');
	tableDiv.innerHTML = sTable

	sTable = '';
}

document.getElementById('btnColor').onclick = buildTable;





