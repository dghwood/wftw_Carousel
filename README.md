wftw_Carousel
=============

JQuery carousel plugin

Easy to use JQuery plugin carousel, creates a 3D animation carousel similar to spotify and iphone album carousel 
Please be aware this was created and tested in Chrome only. 
However the carousel plugin should be compatible with Firefox, Safari and Chrome latest editions. 
Current index.html is only compatible with Chrome, further CSS additions will be required for FireFox. 

USE: 
-----

	var carousel = $('.selector').carousel({
	  items: int, // no of items to be displayed in your carousel 
	  vertical : boolean, // whether the carousel is horizontal or vertically displayed 
	  generator : function, // function which returns new JQuery DOM element in the case of an ajax carousel 
	  responsive: boolean, // control whether the carousel should calculate its # of items 
	  maxDimension: int, // used with reponsive this control the max width you wish to use for the carousel (pixels)
		viewingAngle: int, // the angle of the carousel which is generated, 180 degrees means that -90deg to 90deg is generated
	});


// note only this object contains these methods -- NOT the selector 
carousel.rotateRight(); 
carousel.rotateLeft(); 

// This will NOT work 
$('.selector').rotateRight(); 
$('.selector').rotateLeft(); 


Author: Duncan Wood 
Date: 04/04/2013
