;(function(){

    var methods={
        init:function(options) {
            options=$.extend({
                icon: 'myautoInputIcon',
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
                },
                onSubmit: function(event, value) {

                }
   	        }, options || {});

            return this.each(function() {
                $.data(this, 'myautoInput', options);

                $(this).after('<div class="' + options.className + '-content"><ul></ul></div><i id="' + options.icon + '" class="loading fa ' + options.loadingIcon + ' fa-lg" aria-hidden="true"></i>');

                // if input not empty show icon to delete text in input
                if ($(this).val()) {
                    methods.hideIcon.apply($(this));
                } 

                $(this).parent()
                    .find('.' + options.className + '-content')
                    .css('width', $(this).css('width')) // set width of drop-down list equivalent to input with
                    .css('top', this.getBoundingClientRect().top + 4);
                    //.css('left', this.getBoundingClientRect().left); // fix left position of drop-down list to input

                // add event listener to empty icon
                $(this).parent().find('#' + options.icon).bind('click', function() {
                    console.log('hello');
                    $(this).parent().find('input').val('');
                    $(this).css('visibility', 'hidden');
                });

   	            $(this).bind('click', function() {
                    return false;  
                }).bind('textchange', function() {
                    if (this.value) methods.load.apply($(this));
                });

                $(this).parent().parent().submit(function(event) {
                    methods.hideIcon.apply($(this).find('input')); // hide icon
                    options.onSubmit(event, $(this).find('input').val()); // call delegate function
                    methods.hide.apply($('.' + options.className + '-content').parent()); // hide selection window
                });

                $(document).click(function(){
                    methods.hide.apply($('.' + options.className + '-content').parent());
                });
	          });
	      },
	      showLoadingIcon: function() {
	      	return $(this).each(function() {
	      		var options = $.data(this, 'myautoInput');
	      		var iconElem = $(this).parent().find('#' + options.icon);

	      		if (iconElem.css('visibility') == 'hidden')
                    iconElem.css('visibility', 'visible');

                if (iconElem.hasClass(options.closeIcon))
                    iconElem.removeClass(options.closeIcon);
                
                iconElem.addClass(options.loadingIcon);
	      	});
	      },
	      showCloseIcon: function() {
	      	return $(this).each(function() {
	      		var options = $.data(this, 'myautoInput');
	      		var iconElem = $(this).parent().find('#' + options.icon);

	      		if (iconElem.hasClass(options.loadingIcon))
	      			iconElem.removeClass(options.loadingIcon);

	      		iconElem.addClass(options.closeIcon);
	      	});
	      },
	      hideLoading: function() {
	      	return $(this).each(function() {
	      		var options = $.data(this, 'myautoInput');
	      		var iconElem = $(this).parent().find('#' + options.icon);

	      		if (iconElem.hasClass(options.loadingIcon))
	      			iconElem.removeClass(options.loadingIcon);
                
                iconElem.addClass(options.closeIcon);
	      	});
	      },
	      hideIcon: function() {
	      	return $(this).each(function() {
	      		console.log(this);
	      		var options = $.data(this, 'myautoInput');
	      		
	      		iconElem = $(this)
	      			.parent()
	      			.find('#' + options.icon)
	      			.removeClass(options.loadingIcon)
                    .addClass(options.closeIcon)
                    .css('visibility', 'visible');
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
                methods.showLoadingIcon.apply(this);
                              
                $.ajax({
                    method: 'GET',
                    url: options.url + $(this).val(),
                    dataType: 'json',                
                    success: function(data) {                        
                        $(autoInputElem).next().find('ul').empty();
                        // check if response contain rows
                        if (data.length) {
                            $.each(data, function(index, el) {
                                var formatedElement = options.formatElement(el);
                                
                                if (formatedElement.toLowerCase().indexOf($(autoInputElem).val().toLowerCase()) >= 0)
                                    $(autoInputElem).next().find('ul').append('<li>' + formatedElement + '</li>');
                            });

                            $(autoInputElem).next().find('li').on('click', function() {
                                var ret = options.onItemSelected(this);
                                
                                if (ret && ret != false) {
                                    $(autoInputElem).val(ret);
                                    $(autoInputElem).parent().parent().submit();
                                }
                            });

                            // methods.hideLoading.apply(autoInputElem);
                            methods.show.apply(autoInputElem);
                        } else {
                        	// methods.hideLoading.apply(autoInputElem);
                            methods.hide.apply($('.' + options.className + '-content').parent());
                        }

                        methods.showCloseIcon.apply(autoInputElem);
                    },
          		    error: function(jqXHR, textStatus, errorThrown) {
                        methods.show.apply(autoInputElem);
                        $(autoInputElem).next().find('ul').empty();
                        $(autoInputElem).next().find('ul').append('<div class="text-center">Nothing found</div>');
                        
                        methods.hideLoading.apply(autoInputElem);
                    }
   	            });
	        });
          }
    };

    $.fn.autoInput=function(method) {
    	if (methods[method]) {
     		return methods[method].apply( this, Array.prototype.slice.call(arguments, 1));
    	} else if (typeof method === 'object' || ! method) {
            return methods.init.apply(this, arguments);
    	} else {
            $.error('Method ' +  method + ' does not exist on jQuery.autoInput');
        }    
    }
})();