var express = require('express');
var router = express.Router();
var anyDB = require('any-db');
var config = require('../shop49.config.js');
var crypto = require('crypto');
var pool = anyDB.createPool(config.dbURI, {
	min: 2, max: 20
});
var paypal = require('paypal-rest-sdk');
paypal.configure({
	'mode':'sandbox',
	'client_id':'AU5m36DzxPa4WNIx32-gb7b8Z4ASrzQXKLpoQzHUCmyqd5vp3PSRaxfgVkftTzGWtfEcbCSUUV4YElNt',
	'client_secret':'EO_4oSnB0a1jZRDKarWNTC_REs8dodRTJiaKhWz7oaoJRkE_EHq_LWWcP7mgdu2GWttJKtvrT4DMBs-P'
});
var inputPattern = {
	name: /^[\w- ']+$/,
};
function hmacPassword(password)
{
	var salt = 'CtbX5BQFGPR6NccN';
	var hmac=crypto.createHmac('sha256', salt);
	hmac.update(password);
	return hmac.digest('base64');
}
function create_payment_json(data){
	var paymentJson = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      //"return_url": "http://localhost/checkout/thankyou",
      //"cancel_url": "http://localhost/checkout/error"
   // change the URLs
      "return_url": "http://store49.ierg4210.org/checkout/thankyou",
      "cancel_url": "http://store49.ierg4210.org/checkout/error"
    },
    "transactions": [{
      "item_list": {
       	"items": []
      },
      "amount": {
        "currency": "USD",
        "total": "3.01"
      },
      "description": "IERG4210 Shop49"
    }]
  };
  
  return paymentJson;
}
router.get('/', function (req,res) {
	pool.query('SELECT * FROM categories LIMIT 1', function (error, categories) {
		if (error) {
			console.error(error);
			res.status(500).end();
			return;
		}
		var catid = categories.rows[0].catid;
		res.redirect('/cat/'+catid);
	});
})
router.get('/api/cat/:catid', function (req, res) {

		req.checkParams('catid', 'Invalid Category ID')
		.notEmpty()
		.isInt();
		var catid = req.params.catid;
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end()
;	}

	pool.query('SELECT name FROM categories WHERE (catid)=(?) LIMIT 1', 
		[catid],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}

			res.status(200).json(result.rows[0]).end();
		}
	);

});
router.get('/api/prod/:pid', function (req, res) {

		req.checkParams('pid', 'Invalid Category ID')
		.notEmpty()
		.isInt();
		var pid = req.params.pid;
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end()
;	}

	pool.query('SELECT * FROM products WHERE (pid)=(?) LIMIT 1', 
		[pid],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}

			res.status(200).json(result.rows[0]).end();
		}
	);

});


router.get('/cat/:catid', function (req, res) {
	var catid = req.params.catid;
	var name="";
	pool.query('SELECT * FROM categories', function (error, categories) {
		if (error) {
			console.error(error);
			res.status(500).end();
			return;
		}

		pool.query('SELECT * FROM products WHERE (catid)=(?)', [catid], function (error, products) {
			if (error) {
				console.error(error);
				res.status(500).end();
				return;
			}
			for (var i =0; i<categories.rows.length; i++){
				if (categories.rows[i].catid==catid){
					name=categories.rows[i].name;
					break;
				}
			}
			res.render('home', {
			title: 'IERG4210 Shop49 Admin',
			cat: categories.rows,
			catid: catid,
			name: name,
			prod: products.rows,
			csrfToken: req.csrfToken() 
			});
		});
	});
});

router.get('/product/:pid', function (req, res) {
	var pid = req.params.pid;
	pool.query('SELECT * FROM categories', function (error, categories) {
		if (error) {
			console.error(error);
			res.status(500).end();
			return;
		}
		pool.query('SELECT * FROM products WHERE (pid)=(?)', [pid], function (error, product) {
			if (error) {
				console.error(error);
				res.status(500).end();
				return;
			}
			var catid="";
			var catName="";
			var prodName="";
			if (product.rows[0]){
				catid=product.rows[0].catid;
				prodName=product.rows[0].name;
			}

			if (categories.rows[0]){
				catName=categories.rows[0].name;
			}
			res.render('product', {
			title: 'IERG4210 Shop49',
			cat: categories.rows,
			prod: product.rows,
			catid:catid,
			name: catName,
			prodname: prodName,
			csrfToken: req.csrfToken() 
			});
		});
	});
});
router.get('/product', function (req,res) {
	res.render('product');
})



router.post('/checkout', function (req,res) {
	
	if(req.session.username){
		req.checkBody('pid', 'Invalid PID')
			.notEmpty();
		req.checkBody('quantity', 'Invalid quantity')
			.notEmpty();
		var	paymentJson=create_payment_json();
		// quit processing if encountered an input validation error
		var errors = req.validationErrors();
		if (errors) {
			return res.status(400).json({'inputError': errors}).end();
		}
		
		var quantityList=[];
		req.body.quantity.forEach(function(item,i){
			quantityList[req.body.pid[i]]=item;
		})
		var total=0;
	  		pool.query('SELECT * FROM products WHERE pid in (?) ', 
			[req.body.pid],
			function (error, result) {
				if (error) {
					console.log(error)
					return {'error':error};
				}			
				if (result.rows){
					result.rows.forEach(function(row,i){
						var item={};
						item.name=row.name;
						item.sku=row.pid;
						item.price=row.price;
						item.quantity=quantityList[row.pid];
						item.currency='USD';
						total+=row.price*quantityList[row.pid];

				  		paymentJson.transactions[0].item_list.items.push(item);
	
					})
				  paymentJson.transactions[0].amount.total=total;
				   paypal.payment.create(paymentJson,
					function(error,payment){
						if (error){state
							console.log(error.response.details)

						} else {
							pool.query('INSERT INTO payment (userid, paymentId, state, dateCreated) SELECT uid, ?, ?, ? FROM users WHERE username=?',[payment.id,payment.state,payment.update_time,req.session.username],
							function (error, result) {
								if (error) {
									console.error(error);
								}
															
							});
							var link=payment.links;
							for (var i=0;i<link.length;i++){
								if(link[i].rel === 'approval_url'){
									res.redirect(link[i].href)
								}
							}
						}
					})
				}

				
			}
			);

		
	}else{
		res.redirect('/account/login/checkout')
	}
})
router.get('/checkout/error', function (req,res) {
	if(req.session.username){
		 var token = req.query.token;
		 res.render('checkouterror',{layout:'plain',token:token});
	
	}
})
router.get('/checkout/thankyou', function (req,res) {
	if(req.session.username){
		var paymentId = req.query.paymentId;
		var execute_payment_json = {
		"payer_id" : req.query.PayerID
		}; 
		var token = req.query.token;
		paypal.payment.execute(paymentId, execute_payment_json,
			function(error,payment){
				if (error){
					console.log(error.response);
					res.redirect('error').end();
				} else {
					console.log('Get Payment Response');
					console.log(JSON.stringify(payment));
					if(payment.state == 'approved'){
						pool.query('UPDATE payment SET state=(?) WHERE paymentId=(?)',[payment.state,payment.id],
							function (error, result) {
								if (error) {
									console.error(error);
								}
															
							});
						console.log('state = '+ payment.state);
						res.redirect('../finish?paymentId='+paymentId);
						res.end();
					}else{
						console.log("state = "+payment.state);
						res.redirect('../error?token='+token);
					}	
				}
		})
	}
})

router.get('/finish', function (req,res) {
	if(req.session.username){
		res.render('finish',{layout:'plain'})
	} else {
		res.redirect('/account/login');
	}
})
router.get('/account', function (req,res) {
	if(req.session.username){
		pool.query('SELECT * FROM payment WHERE userid=(?) ORDER BY dateCreated asc',[req.session.uid], function (error, result) {
			if (error) {
				console.error(error);
				res.status(500).end();
				return;
			}
			res.render('account', {
				layout:'plain',
				username:req.session.username,
				payment:result.rows
			});
		});

	}else{
		res.redirect('/account/login');
	}
});
router.get('/account/login', function (req,res) {
	if(!req.session.username){
			res.render('login', {
			layout: 'admin',
			title: 'IERG4210 Shop49 Admin',
			csrfToken:req.csrfToken() 
			});
	}else{
		res.redirect('/account');
	}
});
router.get('/account/login/:action', function (req,res) {
	if(!req.session.username){
			res.render('login', {
			layout: 'admin',
			title: 'IERG4210 Shop49',
			csrfToken:req.csrfToken() 
			});
	}else{
		if(req.params.action=='checkout'){
			res.redirect('/account/checkout');
		}else {
			res.redirect('/account');
		}
	}
});

router.get('/account/payment/:pid', function (req,res) {
	if(req.session.username){
		req.checkParams('pid', 'Invalid payment ID')
		.notEmpty()
		.isInt();
		var pid = req.params.pid;
		
	        pool.query('SELECT paymentId FROM payment WHERE payid=? and userid=?',[pid,req.session.uid],
				function (error, result) {
					if (error) {
						console.error(error);
					}else if (result.rows[0]){
						paypal.payment.get(result.rows[0].paymentId, function (error, payment) {
						    if (error) {
						        console.log(error);
								return res.status(400).json({'Error': "EXPIRED"});
						    } else {
						    	res.render('payment', {
								title: 'IERG4210 Shop49',
								layout: 'plain',
								item: payment.transactions[0].item_list.items,
								});
						    }
						});
					}else{
						return res.status(400).end();
					}
												
				});
				
	    


	}else{
		res.redirect('/account/login');
	}
});

router.post('/account/login', function (req, res) {
	req.checkBody('username', 'Invalid user name')
		.isLength(1, 512)
		.matches(inputPattern.name);
	req.checkBody('password', 'Invalid password')
		.isLength(1, 512)

	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();	
	}
	pool.query('SELECT admin,uid FROM users WHERE username = ? AND saltedPassword = ?',[req.body.username,hmacPassword(req.body.password)],
	function (error, result) {
		if (error) {
			console.error(error);
			return res.status(500).json({'dbError': 'check server log'}).end();
		}
		if (result.rowCount===0)
			return res.status(400).json({'loginError': 'Invalid Credentials'});
		req.session.regenerate(function(err) {
			req.session.username=req.body.username;
			req.session.admin=result.rows[0].admin;
			req.session.uid=result.rows[0].uid;
			if(req.params.action=='checkout'){
				res.redirect('/account/checkout');
			}else {
				res.redirect('/account');
			}
		});
	}); 
});

router.post('/account/login/:action', function (req, res) {
	req.checkBody('username', 'Invalid user name')
		.isLength(1, 512)
		.matches(inputPattern.name);
	req.checkBody('password', 'Invalid password')
		.isLength(1, 512)

	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();	
	}
	pool.query('SELECT admin,uid FROM users WHERE username = ? AND saltedPassword = ?',[req.body.username,hmacPassword(req.body.password)],
	function (error, result) {
		if (error) {
			console.error(error);
			return res.status(500).json({'dbError': 'check server log'}).end();
		}
		if (result.rowCount===0)
			return res.status(400).json({'loginError': 'Invalid Credentials'});
		req.session.regenerate(function(err) {
			req.session.username=req.body.username;
			req.session.admin=result.rows[0].admin;
			req.session.uid=result.rows[0].uid;
			if(req.params.action=='checkout'){
				res.redirect('/account/checkout');
			}else {
				res.redirect('/account');
			}
		});
	}); 
});

router.get('/account/checkout', function (req,res) {
	if(req.session.username){
		res.render('autocheckout');
	}else{
		res.redirect('/account/login');
	}
});
module.exports = router;

