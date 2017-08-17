	 

	 $(document).ready(function(){
	     Scroll_arrow();
		$( ".weather-box" ).find( "li" ).addClass("disable-day");     
		$( ".weather-box" ).find( "li" ).eq( 0 ).removeClass("disable-day").addClass( "active-day visible_day" );
	 });


 


	 function Scroll_arrow(){

	 	$('<span id="left-scroll"></span>').prependTo("#scroll");
		$('#scroll > #left-scroll').addClass('caret-w').append('<a><i class="fa fa-reply" aria-hidden="true"></i></a>');

	 	$('<span id="right-scroll"></span>').prependTo("#scroll");
		$('#scroll > #right-scroll').addClass('caret-w').append('<a><i class="fa fa-share" aria-hidden="true"></i></a>');	


		var index = 0; 
		var kol_li = $( ".weather-box > li" ).length;

		var q = $('#scroll > #right-scroll > a')
		q.click(function(){
			if(index ==  6) return;
			if(index > (kol_li-6)){
				$( ".weather-box" ).find( "li" ).eq( index ).removeClass("active-day").addClass("disable-day");
				index++;
		 		$( ".weather-box" ).find( "li" ).eq( index ).removeClass( "disable-day" ).addClass( "active-day visible_day" );
				return;
			}
	 		$( ".weather-box" ).find( "li" ).eq( index ).removeClass("active-day visible_day").addClass( "hidden_day disable-day" );
			index++;
			$( ".weather-box" ).find( "li" ).eq( index ).removeClass("disable-day").addClass( "active-day visible_day" );
	    });

		var o = $('#scroll > #left-scroll > a')
		o.click(function(){
			if(index == 0) return;
			$( ".weather-box" ).find( "li" ).eq( index ).removeClass("active-day visible_day").addClass( "disable-day" );
			index--;		
	 		$( ".weather-box" ).find( "li" ).eq( index ).removeClass( "hidden_day disable-day" ).addClass( "active-day visible_day" );
	    });


	 }
//---------------------------------------------------------------------------------------------------------------












