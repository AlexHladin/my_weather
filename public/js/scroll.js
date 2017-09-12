
var temp_day;
var check = false;
//---------------------------------------------------------------------------------------------------------------
$(document).ready(function(){
	     Scroll_arrow();
	     Change_day();

		$( "#C-F > li:last" ).click(function(){
			if(check == true) return;
			convert_C_to_F();
			check = true;
			$( "#C-F > li:first" ).removeClass("strong");
			$( "#C-F > li:last" ).addClass("strong");
		});
		$( "#C-F > li:first" ).click(function(){
			if(check == false) return;
			convert_F_to_C();
			check = false;
			$( "#C-F > li:last" ).removeClass("strong");			
			$( "#C-F > li:first" ).addClass("strong");
		});

		$( ".weather-box" ).find( "li" ).addClass("disable-day");     
		$( ".weather-box" ).find( "li" ).eq( 0 ).removeClass("disable-day").addClass( "active-day visible_day" );
		$( ".weather-box > li > a > span:first" ).append("<i class='fa fa-check' aria-hidden='true'></i>");
		temp_day = $( ".weather-box" ).find( "li" ).eq( 0 ).find( "a > .temp-day > p" ).text();
		temp_day = SubStr(temp_day);
		$(".main-temp").html(temp_day + "<span class='sup'>°</span>");
		$( "#C-F > li:first" ).addClass("strong");
});
//---------------------------------------------------------------------------------------------------------------
function Scroll_arrow(){

 	$('<span id="left-scroll"></span>').prependTo("#scroll");
	$('#scroll > #left-scroll').addClass('caret-w').append('<a><i class="fa fa-reply" aria-hidden="true"></i></a>');

 	$('<span id="right-scroll"></span>').prependTo("#scroll");
	$('#scroll > #right-scroll').addClass('caret-w').append('<a><i class="fa fa-share" aria-hidden="true"></i></a>');	

	var index = 0; 
	var kol_li = $( ".weather-box > li" ).length; 
	var q = $('#scroll > #right-scroll > a')
	q.click(function(){ 
		if(index ==  kol_li - 1) return;
		if(index > (kol_li-6)){
			//прячем первый слайд (0) на котором стояли, идет смещение, показываем следующий день 
			$( ".weather-box" ).find( "li" ).eq( index ).removeClass("active-day").addClass("disable-day");
			index++;
	 		$( ".weather-box" ).find( "li" ).eq( index ).removeClass( "disable-day" ).addClass( "active-day visible_day" );
			return;
		}
			//перемещение бордера по елементам по нажатию на стрелку
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
function Change_day(){

	var kol_li = $( ".weather-box > li" ).length;

	var a = $( ".weather-box > li" );
	for (var i = 0; i < kol_li; i++) {
		$( a[i] ).click(function(){
			for (var i = 0; i < kol_li; i++) {
				$(a[i]).find( "a > span:first > i" ).remove( "i" );
//					 $( this ).css( "background-color", "yellow" );
			}
			$( this ).find( "a > .day-name" ).append( "<i class='fa fa-check' aria-hidden='true'></i>" );
	    	temp_day = $( this ).find( "a > .temp-day > p" ).text();
	    	temp_day = temp_day.trim();
	    	temp_day = SubStr(temp_day);
			$(".main-temp").html(temp_day + "<span class='sup'>°</span>");
	    });

	}

}
//---------------------------------------------------------------------------------------------------------------
function SubStr(str){
	str = str.substr(0, str.length - 1);
	return str;
}

//---------------------------------------------------------------------------------------------------------------
function convert_C_to_F(){

	$(".font").each(function( index ) {
		var ob = $( this ).text();
		if((ob != "") && !($( this ).is( ".title" ) || $( this ).is( ".country" ))  ){
			ob = ob.trim();				
			ob =  SubStr(ob);
			ob = Math.round(ob * 1.8000 + 32.00);
			$( this ).find('p').html(ob + "<sup>°</sup>");
		}
	});
	var r = $('#temp-max-value').eq(0).text();
	$(".main-temp").html(r);
}

//---------------------------------------------------------------------------------------------------------------
function convert_F_to_C(){

	$(".font").each(function( index ) {
		var ob = $( this ).text();
		if((ob != "") && !($( this ).is( ".title" ) || $( this ).is( ".country" ))  ){
			ob = ob.trim();				
			ob =  SubStr(ob);
			ob = Math.round((ob - 32)/1.8000);
			$( this ).find('p').html(ob + "<sup>°</sup>");
		}
	});
	var r = $('#temp-max-value').eq(0).text();
	$(".main-temp").html(r);
}



