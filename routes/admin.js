var express = require('express');
var router = express.Router();
var config = require('../shop49.config.js');
var anyDB = require('any-db');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var pool = anyDB.createPool(config.dbURI,{
	min:2, max:20
});

router.get('/', function (req, res) {
	pool.query('SELECT * FROM categories', function (error, categories) {
		if (error) {
			console.error(error);
			res.status(500).end();
			return;
		}
		pool.query('SELECT * FROM products', function (error, products) {
			if (error) {
				console.error(error);
				res.status(500).end();
				return;
			}
		res.render('admin', {
			layout: 'admin',
			title: 'IERG4210 Shop49 Admin',
			cat: categories.rows,
			prod: products.rows
			});
		});
	});
});

module.exports = router;

