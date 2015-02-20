var express = require('express');
var router = express.Router();
var anyDB = require('any-db');
var config = require('../shop49.config.js');
var pool = anyDB.createPool(config.dbURI, {
	min: 2, max: 20
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

