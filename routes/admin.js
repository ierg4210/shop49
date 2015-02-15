var express = require('express');
var router = express.Router();
var config = require('../shop49.config.js');
var anyDB = require('any-db');
var expressValidator = require('express-validator');
var pool = anyDB.createPool("mysql://shop49-admin:01020304@aaa1nzh6y3zqur.cftehalxuulr.ap-southeast-1.rds.amazonaws.com/shop49",{
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

var inputPattern = {
	name: /^[\w- ']+$/,
};

// for parsing application/x-www-form-urlencoded
//app.use(bodyParser.urlencoded({extended:true}));
// this line must be immediately after express.bodyParser()!
// Reference: https://www.npmjs.com/package/express-validator
router.use(expressValidator());


// URL expected: http://hostname/admin/api/cat/add
router.post('/api/cat/add', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('name', 'Invalid Category Name')
		.isLength(1, 512)
		.matches(inputPattern.name);

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}

	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
	pool.query('INSERT INTO categories (name) VALUES (?)', 
		[req.body.name],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}

			res.status(200).json(result).end();
		}
	);

});

// URL expected: http://hostname/admin-api/cat/add
router.post('/api/cat/edit', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('catid', 'Invalid Category ID')
		.notEmpty()
		.isInt();
	req.checkBody('name', 'Invalid Category Name')
		.isLength(1, 512)
		.matches(inputPattern.name);

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}

	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
	pool.query('UPDATE categories SET name = ? WHERE catid = ? LIMIT 1', 
		[req.body.name, req.body.catid],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}
			// construct an error body that conforms to the inputError format
			if (result.affectedRows === 0) {
				return res.status(400).json({'inputError': [{
					param: 'catid', 
					msg: 'Invalid Category ID', 
					value: req.body.catid
				}]}).end();	
			}

			res.status(200).json(result).end();
		}
	);
});



module.exports = router;

