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
	var setup = function(item){
		// get appropriate prefix
		config.transform = window.Modernizr.prefixed('transform'); 
		
		// work out angle per panel 
		config.angle = 360 / config.items ; 
		
		// work out width/height of object 
		config.size = calculateSize(item);  
		
		// work out appropriate radius
		config.radius = ( config.size / 2 ) / Math.tan ( ( Math.PI / 180 ) * ( config.angle / 2 ) ); 
		
		// transform main element so that you maintain size 
		item.css(config.transform,'translateZ( ' + ( -config.radius ) + 'px ) '); 
		
		// add items to object ; 
		var s = config.items;
		for( var i = 0; i < s ; i++){
			items.push(i); 
		}
		var p = item.children().size(); 
		for (var i = config.items ; i < p ; i++){
			pot.push(i); 
		}
	}
	var move = function(){
		// get children
		var children = t.children(); 
		// set up angle counter 
		var angleCounter = -180; 
		var XY = config.vertical ? 'X' : 'Y'; 
		
		for(var i in items){
			
			var item = children.eq(items[i]);
			if( angleCounter < - 90 ){
				item.css('display','none');
				angleCounter += config.angle; 
				continue; 
			}
			if( angleCounter > 90 ){
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
			
			angleCounter += config.angle; 
		}
	}
	var appendElement = function(){
		if (config.generator) {
			var newItem = config.generator();
			t.append(newItem); 
			pot.push(items.length + pot.length + previousRightPot.length + previousLeftPot.length); 
		}
	}
	
	setup(t); 
	move(); 
	
	return t.extend({
		isCarousel : true, 
		rotateLeft : function(){
			appendElement(); 

			// remove first element of items 
			var removedItems = items.splice(0,1);
			
			// if there are items in the previous left pot then use those  #
			var s = previousLeftPot.length > 0 ? 1 : ( pot.length > 0 ? 2 : ( previousRightPot.length > 0 ? 3 : 4) ) ;
			
			switch(s){
				case 1: 
					items.push(previousLeftPot[0]); 
					previousLeftPot.splice(0,1); 
					
					// add to front of previousRightPot
					previousRightPot.splice(0,0,removedItems[0]); 
					break; 
				case 2: 
					// if pot has items use this one
					items.push(pot[0]); 
					pot.splice(0,1);
					
					// add to front of previousRightPot
					previousRightPot.splice(0,0,removedItems[0]);
					break; 
				case 3: 
					// use the right pot last item if no pot is available 
					items.push(previousRightPot[previousRightPot.length - 1]); 
					previousRightPot.splice(previousRightPot.length - 1, 1); 
					
					// add to front of previousRightPot
					previousRightPot.splice(0,0,removedItems[0]); 
					break; 
				case 4: 
					items.push(removedItems[0]); 
					break; 
			}
			move(); 
		},
		rotateRight: function(){
			appendElement(); 
			// remove last item from items. 
			var removedItems = items.splice(items.length-1,1); 
			
			var s = previousRightPot.length > 0 ? 1 : ( pot.length > 0 ? 2 : ( previousLeftPot.length > 0 ? 3 : 4) ) ; 
			switch(s){
				case 1: 
					items.splice(0,0,previousRightPot[0]); 
					previousRightPot.splice(0,1); 
					
					// add to front of previousRightPot
					previousLeftPot.splice(0,0,removedItems[0]); 
					break; 
				case 2: 
					// if items in the pot then use these 
					items.splice(0,0,pot[0]); 
					pot.splice(0,1); 
					
					// add to front of previousRightPot
					previousLeftPot.splice(0,0,removedItems[0]);
					break; 
				case 3: 
					// use the left pot last item if no pot is available 
					items.splice(0,0,previousLeftPot[previousLeftPot.length - 1]); 
					previousLeftPot.splice(previousLeftPot.length - 1, 1); 
					
					// add to front of previousLeftPot
					previousLeftPot.splice(0,0,removedItems[0]); 
					break; 
				case 4: 
					// else use the previously removed item in the case where config.items = children.size() 
					items.splice(0,0,removedItems[0]); 
					break; 
			}
			move(); 
		}
	});
}
