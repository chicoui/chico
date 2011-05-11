/**
 *	Viewer
 *	@author
 *	@Contructor
 *	@return An interface object
 */
ch.viewer = function(conf){

/**
 *  Constructor
 */
	var that = this;

	conf.width = conf.width || 320;
	conf.height = conf.height || 320;

	conf = ch.clon(conf);
	that.conf = conf;
	
/**
 *  Inheritance
 */

    that = ch.controllers.call(that);
    that.parent = ch.clon(that);
	
/**
 *  Private Members
 */
 
	/**
	 * 	Viewer
	 */
	var $viewer = that.$element.addClass("ch-viewer").width(conf.width);
		
	var $content = $viewer.children().addClass("ch-viewer-content carousel");

	/**
	 * 	Display
	 */
	var $display = $("<div>")
		.addClass("ch-viewer-display")
		.append( $content )
		.appendTo( $viewer )
		.carousel({
			width: conf.width,
			arrows: false,
			onMove: function(){
				var carousel = this;
				var page = carousel.getPage();
				that.move(page);

				// Resize display
				var currentHeight = $(itemsChildren[page]).height();
				$viewer.find(".ch-mask").eq(0).height(currentHeight);
			}
		})

	var items = $content.children().width(conf.width).height(conf.height);
	var itemsAmount = items.length;
	var itemsAnchor = items.children("a");
	var itemsChildren = items.find("object, embed, video, img");

	if ( itemsAmount > 1 ){
		// Arrows styles
		var prevArrow = $("<p>")
			.addClass("ch-viewer-prev")
			.bind("click", function(){
				var prev = thumbnails.selected - 1;

				nextArrow.addClass("ch-viewer-next-on");

				if (prev == 0) {
					this.removeClass("ch-viewer-prev-on");
				};
				
				that.move(prev);
			})
			.appendTo( $viewer );
		
		var nextArrow = $("<p>")
			.addClass("ch-viewer-next ch-viewer-next-on")
			.bind("click", function(){
				var next = thumbnails.selected + 1;

				prevArrow.addClass("ch-viewer-prev-on");

				if (next == itemsAmount + 1) {
					this.removeClass("ch-viewer-next-on");
				};
				
				that.move(next);
			})
			.appendTo( $viewer );
	};
		
	// Zoom component
	var zoomChildren = [];

	$.each(itemsAnchor, function(i, e){
		var zoom = {};
			zoom.uid = that.uid + "#" + i;
			zoom.type = "zoom";
			zoom.element = e;
			zoom.$element = $(e);
			
	    zoomChildren.push(
	    	ch.zoom.call(zoom, {
	    		context: $viewer,
	    		onShow: function(){
	    			var rest = (ch.utils.body.outerWidth() - $viewer.outerWidth());
	    			var zoomDisplayWidth = (conf.width < rest)? conf.width :	(rest - 65 );
	    			this.width( zoomDisplayWidth );
	    			this.height( $viewer.height() );
	    		}
	    	})
	    );
	});
	
	that.children.push( zoomChildren );
	
	/**
	 * 	Thumbnails
	 */
	var createThumbs = function(){
	
		var structure = $("<ul>").addClass("carousel");
		
		$.each(items, function(i, e){
			
			var thumb = $("<li>").bind("click", function(event){
				that.prevent(event);
				that.move(i + 1);
			});
			
			// Thumbnail
			if( $(e).children("link[rel=thumb]").length > 0 ) {
				$("<img>")
					.attr("src", $(e).children("link[rel=thumb]").attr("href"))
					.appendTo( thumb );
			
			// Google Map
			//} else if( ref.children("iframe").length > 0 ) {
				// Do something...
					
			// Video
			} else if( $(e).children("object").length > 0 || $(e).children("embed").length > 0 ) {
				$("<span>").html("Video").appendTo( thumb.addClass("ch-viewer-video") );
			};
			
			structure.append( thumb );
		});
		
		var self = {};
		
			self.children = structure.children();
			
			self.selected = 1;
		
			self.carousel = that.children[0] = $("<div>")
				.addClass("ch-viewer-triggers")
				.append( structure )
				.appendTo( $viewer )
				.carousel({ width: conf.width });
		
		return self;
	};
	
	var move = function(item){
		// Validation
		if(item > itemsAmount || item < 1 || isNaN(item)) return that;

		var visibles = thumbnails.carousel.getSteps(); // Items per page
		var page = thumbnails.carousel.getPage(); // Current page
		var nextPage = Math.ceil( item / visibles ); // Page of "item"

		// Visual config
		$(thumbnails.children[thumbnails.selected - 1]).removeClass("ch-thumbnail-on"); // Disable thumbnail
		$(thumbnails.children[item - 1]).addClass("ch-thumbnail-on"); // Enable next thumbnail
		
		// Move thumbnails carousel if item selected is on another page
		if(page != nextPage) thumbnails.carousel.moveTo(nextPage);

		// Refresh selected thumb
		thumbnails.selected = item;
		
		$display.moveTo(item);
		
		// Callback
		that.callbacks("onMove");
	
		return that;
	};

/**
 *  Protected Members
 */ 


/**
 *  Public Members
 */	

	that["public"].uid = that.uid;
	that["public"].element = that.element;
	that["public"].type = that.type;
	that["public"].children = that.children;
	
	// Full behavior
	if(itemsAmount > 1) {
		that["public"].moveTo = function(item){ that.move(item); return that["public"]; };
		that["public"].next = function(){ that.move( thumbnails.selected + 1 ); return that["public"]; };
		that["public"].prev = function(){ that.move( thumbnails.selected - 1 ); return that["public"]; };
		that["public"].getSelected = function(){ return thumbnails.selected; }; // Is this necesary???
		// ...

/**
 *  Default event delegation
 */
	
		// ...
		var thumbnails = createThumbs();
		that.move = move;
		that.move(1); // Move to the first item without callback
	};

	$viewer.find(".ch-mask").eq(0).height( $(itemsChildren[0]).height() );
	
	return that;
};
