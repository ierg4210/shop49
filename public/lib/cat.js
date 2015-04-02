
	var shopCart = function(){
		var items=[];
		var total=0;
		var update = function(){
			if(localStorage.getItem('items')){
		        items = JSON.parse(localStorage.getItem('items'));
		    }
		    $('#cart_index > ul').html('');
		    content="";
		    total=0;
		    items.forEach(function(item){
		    	content+="<li><span class=\cart_name\>"+item.name+"</span> <input class=\"cart_qualtity\" id=\""+ item.pid +"\" value=\""+item.quantity+"\" type=\"number\"> <span class=\"cart_price\">@$"+item.price+"</span></li>"
		    	total+=item.price*item.quantity;
		    })
			content="<ul><span class=\"cart_title\">Shopping List Total:$"+total+"</span>"+content+"<button value='submit'>Submit</button>";
		    $('#cart_index > ul').html(content);
		    $('#cart_summary').html("Shopping List $"+total);
	   	};
	   	update();
	    var addItem = function(pid,quantity){
	    	quantity=parseInt(quantity);
	    	var exist=false;
	    	items.forEach(function(item){
	    		if(item.pid==pid){
	    			exist=true;
	    			item.quantity+=quantity;
	    		}
	    	})
	    	if (exist==false){
	    		$.get('/api/prod/'+pid, function(data){
	    			console.log("add")
	    			items.push({pid:pid, quantity:quantity, name:data.name, price:data.price});
	    			localStorage.setItem('items', JSON.stringify(items));
		   			update();
	    		})
	    	}
	    	else{
	    	localStorage.setItem('items', JSON.stringify(items));
		    update();
			}
	    }
	    var editItem = function(pid, quantity){
	    	quantity=parseInt(quantity);
	    	items.forEach(function(item,i){
	    		if(item.pid==pid){
	    			if (quantity<1){
	    				items.splice(i,1);
	    			} else {
	    				item.quantity=quantity;
	    			}
	    		}	    		
	    	});
	    	localStorage.setItem('items', JSON.stringify(items));
		    update();
		}
	    


	    return{
	    	addItem:addItem,
	    	editItem:editItem
	    }
	    	
	}
	var cart = new shopCart();
	$('.addCart').bind('click', function(e) {
		console.log("wow")
		
		 var id = $(this).attr('id');
         cart.addItem(id, 1);
	})
	$('.addCart').bind('click', function(e) {
		console.log("wow")
		
		 var id = $(this).attr('id');
         cart.addItem(id, 1);
	})
	$('body').on('change keyup', '.cart_qualtity', function(){
         var id = $(this).attr('id');
         cart.editItem(id, $(this).val());
     });
	
