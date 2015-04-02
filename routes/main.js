var express = require('express');
var router = express.Router();
var anyDB = require('any-db');
var config = require('../shop49.config.js');
var pool = anyDB.createPool(config.dbURI, {
	min: 2, max: 20
});
var paypal = require('paypal-rest-sdk');
paypal.configure({
	'mode':'sandbox',
	'client_id':'AU5m36DzxPa4WNIx32-gb7b8Z4ASrzQXKLpoQzHUCmyqd5vp3PSRaxfgVkftTzGWtfEcbCSUUV4YElNt',
	'client_secret':'EO_4oSnB0a1jZRDKarWNTC_REs8dodRTJiaKhWz7oaoJRkE_EHq_LWWcP7mgdu2GWttJKtvrT4DMBs-P'
});
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
router.get('/checkout', function (req,res) {

	if(req.session){
		paypal.payment.create(create_payment_json,
			function(error,payment){
				if (error){

				} else {
					var link=payment.links;
					for (var i=0;i<link.length;i++){
						if(link[i].rel === 'approval_url'){
							res.redirect(link[i].href)
						}
					}
				}
			})
	}
})
router.get('/checkout/error', function (req,res) {
	if(req.session){
		 var token = req.query.token;
	
	}
})
router.get('/checkout/thankyou', function (req,res) {
	if(req.session){
		var paymentId = req.query.paymentId;
		var execute_payment_json = {
		"payer_id" : req.query.PayerID
		}; 
		paypal.payment.execute(paymentId, execute_payment_json,
			function(error,payment){
				if (error){
					console.log(error.response);
					res.redirect('error').end();
				} else {
					console.log('Get Payment Response');
					console.log(JSON.stringify(payment));
					if(payment.state == 'approved'){
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
			prod: products.rows
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

			res.render('product', {
			title: 'IERG4210 Shop49',
			cat: categories.rows,
			prod: product.rows,
			catid:product.rows[0].catid,
			name: categories.rows[0].name,
			prodname: product.rows[0].name
			});
		});
	});
});
router.get('/product', function (req,res) {
	res.render('product');
})

module.exports = router;

