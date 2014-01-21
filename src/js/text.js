function textCompanion (obj) {
	
	var asideID = 'companion';
	var $obj = $(obj);

	if (!$obj.length) {
		return false;
	}

	var curHover = '';

	var el = 'span';

	var words = $obj.find(el);

	console.log('words', words);

	var wordList = _.groupBy(words, function(el) { return textCompanion.convertCase(el.textContent) });

	console.log('wordList', wordList);
	
	var listPlain = textCompanion.createList(wordList);

	console.log('listPlain', listPlain);

	var maxOcc = _.max(listPlain, function(el) { return el.occ; }).occ;

	var listHTML = textCompanion.createListHTML(listPlain, maxOcc);

	var aside = textCompanion.createAside(listHTML, asideID);

	$obj[0].appendChild(aside);

	textCompanion.drawBars($obj, asideID);

	var canvas = Snap('#lines');

	textCompanion.makeInteractiv($obj, asideID, wordList, canvas);

	textCompanion.makeTextInteractiv($obj, words, wordList, canvas);

	$(window).scroll( function() {
		if(textCompanion.curHover) {
			textCompanion.cleanCanvas();
			textCompanion.hoverWord(textCompanion.curHover.word, wordList, textCompanion.curHover.canvas, $(textCompanion.curHover.listEl).offset().top);
		}
	    
	    return false;
	});
}

textCompanion.createAside = function(listHTML, asideID) {
	var aside = document.createElement("aside");

	aside.id = asideID;

	var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');

	svg.id = 'lines';

	aside.appendChild(listHTML);

	aside.appendChild(svg);

	return aside;
};

textCompanion.createListHTML = function(list, maxOcc) {

	var listUL = document.createElement("ul");

	for (var i = list.length - 1; i >= 0; i--) {

		var el = document.createElement("li");

		var spanWord = document.createElement("span");
		var spanOcc = document.createElement("span");
		
		spanWord.innerHTML = list[i].word;
		spanOcc.innerHTML = list[i].occ;

		var percent = (100/maxOcc*list[i].occ).toFixed(2);

		el.setAttribute('data-percent', percent);
		el.setAttribute('data-word', list[i].word);

		el.appendChild(spanWord);
		el.appendChild(spanOcc)

		listUL.appendChild(el);	
	};

	return listUL;
};

textCompanion.createList = function(obj) {
	var i = 0, list = [], key;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) { list[i] = { word : key, occ : obj[key].length }; i++; };
    }
    list = _.sortBy(list, function(el){ return el.occ; });

    return list;	
};

textCompanion.drawBars = function(obj, asideID) {

	$el = obj.find('#' + asideID).find('ul li');

	for (var i = $el.length - 1; i >= 0; i--) {

		// Creating SVG image

		var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');

		svg.id = 'bar' + i;

		$el[i].appendChild(svg);

		// Create SnapSVG Element

		var s = Snap('#bar' + i);

		var width = ($el[i].getAttribute('data-percent'))/100 * parseFloat(s.attr('width'));

		var height = parseFloat(s.attr('height'));
		
		var bar = s.rect(0, 0, width, height);
	};
};

textCompanion.makeInteractiv = function(obj, asideID, wordList, canvas) {

	$(obj).find('#' + asideID).find('ul li').each(function( index ) {
	  
		$(this).hover(function(event) {
    		textCompanion.hoverWord($(this).data('word'), wordList, canvas, $(this).offset().top);
    		textCompanion.curHover = { word : $(this).data('word'), canvas : canvas, listEl : this };
    		event.preventDefault();

	    }, function(event) {
	    	textCompanion.cleanCanvas();
	    	//console.log('Test', textCompanion.curHover);
	    	textCompanion.curHover = '';
	    	//console.log('Test', textCompanion.curHover);
	    	event.preventDefault();
	    })
	});
};


textCompanion.makeTextInteractiv = function(obj, words, wordList, canvas) {

	words.each(function() {
		$(this).hover(function(event) {
			
			textCompanion.hoverText(obj, textCompanion.convertCase($(this).text()), wordList, canvas);
    		event.preventDefault();

	    }, function(event) {
	    	textCompanion.cleanCanvas();
	    	textCompanion.curHover = '';
	    	event.preventDefault();
	    })
	});
};

textCompanion.hoverWord = function(word, list, canvas, listEl) {

	var breite = parseFloat(canvas.attr('width'));
	var xMitte = breite / 2;

	if(list.hasOwnProperty(word)) {
		for (var i = list[word].length - 1; i >= 0; i--) {
			list[word][i].setAttribute('class','hightlight');
			
			var y1 = listEl - 8 - $(document).scrollTop() + 20;

			var y2 = $(list[word][i]).offset().top - 6 - $(document).scrollTop() + 20;

			canvas.path(' M0,' + y1 + ' C' + xMitte + ',' + y1 + ' ' + xMitte + ',' + y2 + ' ' + breite + ',' + y2)
				.attr( { stroke: '#aaa', fill: 'none', 'stroke-width': 1 } );
		};
	}
	else {
		console.log('Wort nicht gefunden.');
	}	
};

textCompanion.hoverText = function(obj, word, wordList, canvas) {

	$el = obj.find('#companion').find('ul li');

	for (var i = $el.length - 1; i >= 0; i--) {

		if($el[i].getAttribute('data-word') === word) {
			textCompanion.hoverWord(word, wordList, canvas, $($el[i]).offset().top);
		}
	};
};

textCompanion.cleanCanvas = function() {

	var hightlights = document.getElementsByClassName('hightlight');
	for (var i = hightlights.length - 1; i >= 0; i--) {
		hightlights[i].className = '';
	};

	var lines = document.getElementsByTagName('path');
	for (var i = lines.length - 1; i >= 0; i--) {
		lines[i].parentElement.removeChild(lines[i]);
	};
	
};

textCompanion.convertCase = function(word) {
	return word.charAt(0).toUpperCase() + word.slice(1);
};
