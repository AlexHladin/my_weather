;(function(){

    var methods={
        init:function(options) {
            options=$.extend({
      	        className: 'autoInput',
                closeIcon: 'fa-times-circle',
                loadingIcon: 'fa-spinner fa-pulse',
                formatElement: function(el) {
                    return JSON.stringify(el).substring(20);
                },
                onItemSelected: function(el) {
                    return $(el).html();
                },
                slideDownComplete: function() {
                }
   	        }, options || {});

            return this.each(function(){
                $.data(this, 'myautoInput', options);

                $(this).after('<div class="' + options.className + '-content"><ul></ul></div><i class="loading fa ' + options.loadingIcon + ' fa-lg" aria-hidden="true"></i>');

                // if input not empty show icon to delete text in input
                if ($(this).val()) {
                    $(this).parent().find('i')
                        .removeClass(options.loadingIcon)
                        .addClass(options.closeIcon)
                        .css('visibility', 'visible');
                } 

                $(this).parent()
                    .find('.' + options.className + '-content')
                    .css('width', $(this).css('width')) // set width of drop-down list equivalent to input with
                    .css('left', this.getBoundingClientRect().left); // fix left position of drop-down list to input

                // add event listener to empty icon
                $(this).parent().find('i').bind('click', function() {
                    $(this).parent().find('input').val('');
                    $(this).css('visibility', 'hidden');
                });

   	            $(this).bind('click', function() {
                    return false;  
                }).bind('textchange', function() {
                    methods.load.apply($(this));
                });

                $(document).click(function(){
                    methods.hide.apply($('.' + options.className + '-content').parent());
                });
	          });
	      },
	      show: function() {
   	        return $(this).each(function() {
                var options = $.data(this, 'myautoInput');

                $(this).next().stop().slideDown({
                    complete: options.slideDownComplete
                });        	 
            });
	      },
	      hide:function(){
     	      return this.each(function() {
                $(this).find(">div").stop().slideUp();
            });
	      },
	      load: function() {
   	        return this.each(function() {
                var options = $.data(this, 'myautoInput');
                var autoInputElem = this;

                if ($(this).parent().find('i').css('visibility') == 'hidden')
                    $(this).parent().find('i').css('visibility', 'visible');

                if ($(this).parent().find('i').hasClass(options.closeIcon)) {
                    $(this).parent().find('i').removeClass(options.closeIcon);
                    $(this).parent().find('i').addClass(options.loadingIcon);
                }
              
                $.ajax({
                    method: 'GET',
                    url: options.url + $(this).val(),
                    dataType: 'json',                
                    success: function(data) {                        
                        $(autoInputElem).next().find('ul').empty();
                        $.each(data, function(index, el) {
                            var formatedElement = options.formatElement(el);
                            
                            if (formatedElement.toLowerCase().indexOf($(autoInputElem).val().toLowerCase()) >= 0)
                                $(autoInputElem).next().find('ul').append('<li>' + formatedElement + '</li>');
                        });

                        $(autoInputElem).next().find('li').on('click', function() {
                            var ret = options.onItemSelected(this);
                            // console.log($(autoInputElem).attr('class'));
                            $(autoInputElem).val(ret);
                            if (ret) {
                                $(autoInputElem).parent().parent().submit();
                            }
                        });

                        $(autoInputElem).parent().find('i').removeClass(options.loadingIcon);
                        $(autoInputElem).parent().find('i').addClass(options.closeIcon);

                        methods.show.apply(autoInputElem);
		                },
          		      error: function(jqXHR, textStatus, errorThrown) {
                        methods.show.apply(autoInputElem);
                        $(autoInputElem).next().find('ul').empty();
                        $(autoInputElem).next().find('ul').append('<div class="text-center">Nothing found</div>');
                        
                        $(autoInputElem).parent().find('i').removeClass(options.loadingIcon);
                        $(autoInputElem).parent().find('i').addClass(options.closeIcon);
          		      }
   	            });
	        });
          }
    };

	  $.fn.autoInput=function(method){
       	if ( methods[method] ) {
         		return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
       	} else if ( typeof method === 'object' || ! method ) {
            
         		return methods.init.apply( this, arguments );
     		} else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.autoInput' );
        }    
	  }
})();