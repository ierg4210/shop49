$('.payment').bind('click', function(e) {
		
		 var id = $(this).attr('id');
         cart.addItem(id, 1);
})
