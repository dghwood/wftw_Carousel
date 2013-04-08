jQuery.fn.carousel = function(config){
	window.Modernizr ? null : function(){ console.log('please include Modernizr') ; return false;}; 
	var t = $(this); 
	var calculateSize = function(it){
		var item = it.children().first(); 
		var css = config.vertical ? ['height','padding-top','padding-bottom','margin-top','margin-bottom'] : ['width','padding-right','padding-left','margin-right','margin-left'];
		var size = 0; 
		for (var i = 0 ; i < css.length ; i++){
			size += parseFloat(item.css(css[i])); 
		}
		return size; 
	}
	var items = []; 
	var pot = []; 
	var previousRightPot = []; 
	var previousLeftPot = []; 
	var focus = null; 
	
	var setup = function(item){
			
		// work out angle per panel 
		config.angle = 360 / config.items ; 
		
		// work out appropriate radius
		config.radius = ( config.size / 2 ) / Math.tan ( ( Math.PI / 180 ) * ( config.angle / 2 ) ); 
		
		//console.log('radius',config.radius); 
		
		// transform main element so that you maintain size 
		item.css(config.transform,'translateZ( ' + ( -config.radius ) + 'px ) '); 
		
	}
	var Perspective = 1100; 
	var calulateItemsToShow = function(){
		var maximum = config.maxDimension; 
		var noOfItems = 3; 
		var totalWidth = 0; 
		var totalItems = 0 ; 
		for( var j = 0 ; j < 50 ; j ++){
			noOfItems ++; 
			var angle = 360/noOfItems; 
			var radius = ( config.size / 2 ) / Math.tan ( ( Math.PI / 180 ) * ( angle / 2 ) ); 
			var noOfItemsShown = 0; 
			
			for(var i = -180 ; i < 180 ; i+=angle){
				if(i > -180 + (180 - (config.viewingAngle/2)) && i < 0 ){
					noOfItemsShown ++;
					var theta = ( Math.PI / 180 ) * i; 
					var X = radius * Math.abs( Math.sin ( theta ) ) ; 
					var Y = radius * Math.abs( Math.cos ( theta ) ) ; 
					var XX = X * ( Perspective / ( Perspective + ( radius - Y ) ) )  ;  
					var W =  config.size * ( Perspective / ( Perspective + ( radius - Y ) ) ) ; 
					
					//console.log('W,X,Y',W,XX,Y);
					var w = XX + W/2; 
					
					if (w * 2 > totalWidth) {
						totalWidth = w * 2; 
						totalItems = noOfItems; 
					}
					
				}
			}
			if(totalWidth >= maximum) break;
		}
		
		// ensure that it is a even number 
		noOfItems --; 
		if ( noOfItems % 2 == 0 ) return noOfItems ; 
		return noOfItems - 1; 
	}
	var move = function(){
		// get children
		var children = t.children(); 
		// set up angle counter 
		var angleCounter = -180; 
		var XY = config.vertical ? 'X' : 'Y'; 
		
		for(var i in items){
			
			var item = children.eq(items[i]);
			if( angleCounter < (-180 + (180 - (config.viewingAngle/2))) ){
				item.css('display','none');
				angleCounter += config.angle; 
				continue; 
			}
			if( angleCounter > ( 180 - (180 - (config.viewingAngle/2))) ){
				item.css('display','none');
				angleCounter += config.angle; 
				continue; 
			}
			item.css('display','block'); 
			//item.addClass('shown'); 
		
			// set up rotate and z for main item 
			item.css(config.transform,'rotate' + XY + '( ' + parseFloat(angleCounter.toFixed(2)) + 'deg ) translateZ( ' + config.radius + 'px )'); 
			
			// set up rotation of face to face forward. 
			var face = item.children(); 
			face.css(config.transform,'rotate' + XY + '( ' + ( -parseFloat(angleCounter.toFixed(2)) ) + 'deg )'); 
			
			if(parseFloat(angleCounter.toFixed(0)) == 0 ) focus = items[i]; 
			angleCounter += config.angle; 
			
		}
	}
	var appendElement = function(direction){
		if (config.generator) {
			/*
				generate only when pots are empty 
			*/
			switch(direction){
				case 'left' : if (previousLeftPot.length > 0) return false; else break; 
				case 'right' : if (previousRightPot.length > 0) return false; else break; 
			}
			
			var newItem = config.generator();
			if(newItem){
				t.append(newItem); 
				pot.push(items.length + pot.length + previousRightPot.length + previousLeftPot.length); 
			}
		}
	}
	var switchCase = function(direction){
		switch(direction){
			case 'left': 
				return previousLeftPot.length > 0 ? 1 : ( pot.length > 0 ? 2 : ( previousRightPot.length > 0 ? 3 : 4) ) ;
			case 'right': 
				return previousRightPot.length > 0 ? 1 : ( pot.length > 0 ? 2 : ( previousLeftPot.length > 0 ? 3 : 4) ) ; 
		}
	}
	var switcherLeft = function(removedItem){
		switch(switchCase('left')){
			case 1: 
				// if there are items in the previous left pot then use those  #
				items.push(previousLeftPot[0]); 
				previousLeftPot.splice(0,1); 
				
				// add to front of previousRightPot
				if (removedItem) previousRightPot.splice(0,0,removedItem); 
				break; 
			case 2: 
				// if pot has items use this one
				items.push(pot[0]); 
				pot.splice(0,1);
				
				// add to front of previousRightPot
				if (removedItem) previousRightPot.splice(0,0,removedItem);
				break; 
			case 3: 
				// use the right pot last item if no pot is available 
				items.push(previousRightPot[previousRightPot.length - 1]); 
				previousRightPot.splice(previousRightPot.length - 1, 1); 
				
				// add to front of previousRightPot
				if (removedItem) previousRightPot.splice(0,0,removedItem); 
				break; 
			case 4: 
				if (removedItem) items.push(removedItem); 
				break; 
		}
	}
	var switcherRight = function(removedItem){
		switch(switchCase('right')){
				case 1: 
					items.splice(0,0,previousRightPot[0]); 
					previousRightPot.splice(0,1); 
					
					// add to front of previousRightPot
					if (removedItem) previousLeftPot.splice(0,0,removedItem); 
					break; 
				case 2: 
					// if items in the pot then use these 
					items.splice(0,0,pot[0]); 
					pot.splice(0,1); 
					
					// add to front of previousRightPot
					if (removedItem) previousLeftPot.splice(0,0,removedItem);
					break; 
				case 3: 
					// use the left pot last item if no pot is available 
					items.splice(0,0,previousLeftPot[previousLeftPot.length - 1]); 
					previousLeftPot.splice(previousLeftPot.length - 1, 1); 
					
					// add to front of previousLeftPot
					if (removedItem)
					previousLeftPot.splice(0,0,removedItem); 
					break; 
				case 4: 
					// else use the previously removed item in the case where config.items = children.size() 
					if (removedItem) items.splice(0,0,removedItem); 
					break; 
			}
	}
	var setupItems = function(){	
		// add items to object ; 
		var s = config.items;
		for( var i = 0; i < s ; i++){
			items.push(i); 
		}
		var p = t.children().size(); 
		for (var i = config.items ; i < p ; i++){
			pot.push(i); 
		}
	}
	var setItemsOnFly = function(newItemSize){
		if ( newItemSize < config.items ){
				
				var diff = (config.items - newItemSize) / 2 ; 
				
				var children = t.children(); 
					
				for (var i = 0 ; i < diff ; i ++){
					var removedLeft = items.splice(0,1); 
					previousRightPot.splice(0,0,removedLeft[0]); 
					children.eq(removedLeft[0]).css('display','none'); 
					
					var removedRight = items.splice(items.length - 1,1); 
					previousLeftPot.splice(0,0,removedRight[0]);
					children.eq(removedRight[0]).css('display','none'); 					
					 
				}
				
				config.items = newItemSize; 
					
				setup(t); 
				move();
			}
			if ( newItemSize > config.items ){
				
				var diff = ( newItemSize - config.items ) / 2; 
				for (var i = 0 ; i < diff ; i ++){
					switcherLeft(); 
					switcherRight(); 
				}
				
				config.items = newItemSize; 
				setup(t); 
				move(); 
			}
	}
	var changeDimensionsOnFly = function(newMaximum){
		config.maxDimension = newMaximum; 
		config.responsive = false; 
		setItemsOnFly(calulateItemsToShow());  
	}
	
	// set view 
	config.viewingAngle ? null : config.viewingAngle = 180; 
	// get appropriate prefix
	config.transform = window.Modernizr.prefixed('transform'); 
	// work out width/height of object 
	config.size = calculateSize(t);
	// check if responsive 
	config.responsive && config.maxDimension ? config.items = calulateItemsToShow() : null;  
	
	setup(t);
	setupItems();  
	move(); 
	
	return t.extend({
		isCarousel : true, 
		rotateLeft : function(){
			appendElement('left'); 
			
			// remove first element of items 
			var removedItems = items.splice(0,1);
			switcherLeft(removedItems[0]); 
			move(); 
		},
		rotateRight: function(){
			appendElement('right'); 
			// remove last item from items. 
			var removedItems = items.splice(items.length-1,1); 
			switcherRight(removedItems[0]); 
			move(); 
		},
		focused: function(){	
			return t.children().eq(focus); 
		},
		setItems : function(newItemSize){
			return setItemsOnFly(newItemSize);
		},
		updateMaxDimension : function(newMaximum){
			return changeDimensionsOnFly(newMaximum); 
		}	
		
	});
}
jQuery.fn.carousel = function(config){
	window.Modernizr ? null : function(){ console.log('please include Modernizr') ; return false;}; 
	var t = $(this); 
	var calculateSize = function(it){
		var item = it.children().first(); 
		var css = config.vertical ? ['height','padding-top','padding-bottom','margin-top','margin-bottom'] : ['width','padding-right','padding-left','margin-right','margin-left'];
		var size = 0; 
		for (var i = 0 ; i < css.length ; i++){
			size += parseFloat(item.css(css[i])); 
		}
		return size; 
	}
	var items = []; 
	var pot = []; 
	var previousRightPot = []; 
	var previousLeftPot = []; 
	var focus = null; 
	
	var setup = function(item){
			
		// work out angle per panel 
		config.angle = 360 / config.items ; 
		
		// work out appropriate radius
		config.radius = ( config.size / 2 ) / Math.tan ( ( Math.PI / 180 ) * ( config.angle / 2 ) ); 
		
		//console.log('radius',config.radius); 
		
		// transform main element so that you maintain size 
		item.css(config.transform,'translateZ( ' + ( -config.radius ) + 'px ) '); 
		
	}
	var Perspective = 1100; 
	var calulateItemsToShow = function(){
		var maximum = config.maxDimension; 
		var noOfItems = 3; 
		var totalWidth = 0; 
		var totalItems = 0 ; 
		for( var j = 0 ; j < 50 ; j ++){
			noOfItems ++; 
			var angle = 360/noOfItems; 
			var radius = ( config.size / 2 ) / Math.tan ( ( Math.PI / 180 ) * ( angle / 2 ) ); 
			var noOfItemsShown = 0; 
			
			for(var i = -180 ; i < 180 ; i+=angle){
				if(i > -180 + (180 - (config.viewingAngle/2)) && i < 0 ){
					noOfItemsShown ++;
					var theta = ( Math.PI / 180 ) * i; 
					var X = radius * Math.abs( Math.sin ( theta ) ) ; 
					var Y = radius * Math.abs( Math.cos ( theta ) ) ; 
					var XX = X * ( Perspective / ( Perspective + ( radius - Y ) ) )  ;  
					var W =  config.size * ( Perspective / ( Perspective + ( radius - Y ) ) ) ; 
					
					//console.log('W,X,Y',W,XX,Y);
					var w = XX + W/2; 
					
					if (w * 2 > totalWidth) {
						totalWidth = w * 2; 
						totalItems = noOfItems; 
					}
					
				}
			}
			if(totalWidth >= maximum) break;
		}
		
		// ensure that it is a even number 
		noOfItems --; 
		if ( noOfItems % 2 == 0 ) return noOfItems ; 
		return noOfItems - 1; 
	}
	var move = function(){
		// get children
		var children = t.children(); 
		// set up angle counter 
		var angleCounter = -180; 
		var XY = config.vertical ? 'X' : 'Y'; 
		
		for(var i in items){
			
			var item = children.eq(items[i]);
			if( angleCounter < (-180 + (180 - (config.viewingAngle/2))) ){
				item.css('display','none');
				angleCounter += config.angle; 
				continue; 
			}
			if( angleCounter > ( 180 - (180 - (config.viewingAngle/2))) ){
				item.css('display','none');
				angleCounter += config.angle; 
				continue; 
			}
			item.css('display','block'); 
			//item.addClass('shown'); 
		
			// set up rotate and z for main item 
			item.css(config.transform,'rotate' + XY + '( ' + parseFloat(angleCounter.toFixed(2)) + 'deg ) translateZ( ' + config.radius + 'px )'); 
			
			// set up rotation of face to face forward. 
			var face = item.children(); 
			face.css(config.transform,'rotate' + XY + '( ' + ( -parseFloat(angleCounter.toFixed(2)) ) + 'deg )'); 
			
			if(parseFloat(angleCounter.toFixed(0)) == 0 ) focus = items[i]; 
			angleCounter += config.angle; 
			
		}
	}
	var appendElement = function(direction){
		if (config.generator) {
			/*
				generate only when pots are empty 
			*/
			switch(direction){
				case 'left' : if (previousLeftPot.length > 0) return false; else break; 
				case 'right' : if (previousRightPot.length > 0) return false; else break; 
			}
			
			var newItem = config.generator();
			if(newItem){
				t.append(newItem); 
				pot.push(items.length + pot.length + previousRightPot.length + previousLeftPot.length); 
			}
		}
	}
	var switchCase = function(direction){
		switch(direction){
			case 'left': 
				return previousLeftPot.length > 0 ? 1 : ( pot.length > 0 ? 2 : ( previousRightPot.length > 0 ? 3 : 4) ) ;
			case 'right': 
				return previousRightPot.length > 0 ? 1 : ( pot.length > 0 ? 2 : ( previousLeftPot.length > 0 ? 3 : 4) ) ; 
		}
	}
	var switcherLeft = function(removedItem){
		switch(switchCase('left')){
			case 1: 
				// if there are items in the previous left pot then use those  #
				items.push(previousLeftPot[0]); 
				previousLeftPot.splice(0,1); 
				
				// add to front of previousRightPot
				if (removedItem) previousRightPot.splice(0,0,removedItem); 
				break; 
			case 2: 
				// if pot has items use this one
				items.push(pot[0]); 
				pot.splice(0,1);
				
				// add to front of previousRightPot
				if (removedItem) previousRightPot.splice(0,0,removedItem);
				break; 
			case 3: 
				// use the right pot last item if no pot is available 
				items.push(previousRightPot[previousRightPot.length - 1]); 
				previousRightPot.splice(previousRightPot.length - 1, 1); 
				
				// add to front of previousRightPot
				if (removedItem) previousRightPot.splice(0,0,removedItem); 
				break; 
			case 4: 
				if (removedItem) items.push(removedItem); 
				break; 
		}
	}
	var switcherRight = function(removedItem){
		switch(switchCase('right')){
				case 1: 
					items.splice(0,0,previousRightPot[0]); 
					previousRightPot.splice(0,1); 
					
					// add to front of previousRightPot
					if (removedItem) previousLeftPot.splice(0,0,removedItem); 
					break; 
				case 2: 
					// if items in the pot then use these 
					items.splice(0,0,pot[0]); 
					pot.splice(0,1); 
					
					// add to front of previousRightPot
					if (removedItem) previousLeftPot.splice(0,0,removedItem);
					break; 
				case 3: 
					// use the left pot last item if no pot is available 
					items.splice(0,0,previousLeftPot[previousLeftPot.length - 1]); 
					previousLeftPot.splice(previousLeftPot.length - 1, 1); 
					
					// add to front of previousLeftPot
					if (removedItem)
					previousLeftPot.splice(0,0,removedItem); 
					break; 
				case 4: 
					// else use the previously removed item in the case where config.items = children.size() 
					if (removedItem) items.splice(0,0,removedItem); 
					break; 
			}
	}
	var setupItems = function(){	
		// add items to object ; 
		var s = config.items;
		for( var i = 0; i < s ; i++){
			items.push(i); 
		}
		var p = t.children().size(); 
		for (var i = config.items ; i < p ; i++){
			pot.push(i); 
		}
	}
	var setItemsOnFly = function(newItemSize){
		if ( newItemSize < config.items ){
				
				var diff = (config.items - newItemSize) / 2 ; 
				
				var children = t.children(); 
					
				for (var i = 0 ; i < diff ; i ++){
					var removedLeft = items.splice(0,1); 
					previousRightPot.splice(0,0,removedLeft[0]); 
					children.eq(removedLeft[0]).css('display','none'); 
					
					var removedRight = items.splice(items.length - 1,1); 
					previousLeftPot.splice(0,0,removedRight[0]);
					children.eq(removedRight[0]).css('display','none'); 					
					 
				}
				
				config.items = newItemSize; 
					
				setup(t); 
				move();
			}
			if ( newItemSize > config.items ){
				
				var diff = ( newItemSize - config.items ) / 2; 
				for (var i = 0 ; i < diff ; i ++){
					switcherLeft(); 
					switcherRight(); 
				}
				
				config.items = newItemSize; 
				setup(t); 
				move(); 
			}
	}
	var changeDimensionsOnFly = function(newMaximum){
		config.maxDimension = newMaximum; 
		config.responsive = false; 
		setItemsOnFly(calulateItemsToShow());  
	}
	
	// set view 
	config.viewingAngle ? null : config.viewingAngle = 180; 
	// get appropriate prefix
	config.transform = window.Modernizr.prefixed('transform'); 
	// work out width/height of object 
	config.size = calculateSize(t);
	// check if responsive 
	config.responsive && config.maxDimension ? config.items = calulateItemsToShow() : null;  
	
	setup(t);
	setupItems();  
	move(); 
	
	return t.extend({
		isCarousel : true, 
		rotateLeft : function(){
			appendElement('left'); 
			
			// remove first element of items 
			var removedItems = items.splice(0,1);
			switcherLeft(removedItems[0]); 
			move(); 
		},
		rotateRight: function(){
			appendElement('right'); 
			// remove last item from items. 
			var removedItems = items.splice(items.length-1,1); 
			switcherRight(removedItems[0]); 
			move(); 
		},
		focused: function(){	
			return t.children().eq(focus); 
		},
		setItems : function(newItemSize){
			return setItemsOnFly(newItemSize);
		},
		updateMaxDimension : function(newMaximum){
			return changeDimensionsOnFly(newMaximum); 
		}	
		
	});
}
