var express = require('express');
var router = express.Router();
var anyDB = require('any-db');
var config = require('../shop49.config.js');
var pool = anyDB.createPool(config.dbURI, {
	min: 2, max: 20
});
router.get('/', function (req,res) {
	res.render('home');
})
router.get('/main', function (req,res) {
	res.render('home');
})
router.get('/cat/:catid', function (req, res) {
	var catid = req.params.catid;
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
			res.render('home', {
			title: 'IERG4210 Shop49 Admin',
			cat: categories.rows,
			catid: catid,
			name:categories.rows[0].name,
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
			prod: product.rows
			});
		});
	});
});
router.get('/product', function (req,res) {
	res.render('product');
})

module.exports = router;

