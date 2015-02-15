var express = require('express');
var router = express.Router();
var config = require('../shop49.config.js');

var pool = anyDB.createPool("mysql://shop49-admin:01020304@aaa1nzh6y3zqur.cftehalxuulr.ap-southeast-1.rds.amazonaws.com/shop49",{
	min:2, max:20
});

app.get('/', function (req, res) {
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
		res.render('admin-panel', {
			layout: 'admin',
			title: 'IERG4210 Shop49 Admin',
			cat: categories.rows,
			prod: products.rows
			});
		});
	});
});

module.exports = router;

