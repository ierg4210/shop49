var fs=require('fs');
var express = require('express');
var session = require('express-session')
var anyDB = require('any-db');
var config = require('../shop49.config.js');
var pool = anyDB.createPool(config.dbURI, {
	min: 2, max: 20
});
var inputPattern = {
	name: /^[\w- ']+$/,
};

var router = express.Router();

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
			prod: products.rows,
			csrfToken: req.csrfToken() 
			});
		});
	});
});
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
		return res.status(400).json({'inputError': errors}).end()
;	}

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

router.post('/api/cat/delete', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('catid', 'Invalid Category ID')
		.notEmpty()
		.isInt();

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}

	// manipulate the DB accordingly using prepared catidstatement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
	pool.query(' DELETE FROM categories WHERE catid=(?)', 
		[req.body.catid],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}

			res.status(200).json(result).end();
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

router.post('/api/prod/add', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('name', 'Invalid Product Name')
		.isLength(1, 512)
		.matches(inputPattern.name);
	req.checkBody('catid', 'Invalid Category id')
		.notEmpty()
		.isInt();
	req.checkBody('price', 'Invalid Price')
		.notEmpty()
		.isFloat();

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();	
	}

	if (!req.files.file){
		return res.status(400).json({'inputError': 'Invalid image'}).end();	
	}
	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
	pool.query('INSERT INTO products (catid, name, price, description) VALUES (?,?,?,?) ', 
		[req.body.catid,req.body.name,req.body.price,req.body.description],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}	
				oldPath=req.files.file.path;
				var pid=result.lastInsertId;
	   			var newPath=oldPath.replace(/^(.*\/).*(\..*)$/, function(a,b,c) {
	   				return b + pid;
	   			});
				//var newPath = oldPath.replace(/^\/(.*)\.$/\/1234\./);
				 if (fs.exists(newPath)) {
				    fs.unlink('newPath', function (err) {
					      if (err) {
					      }
					  
				      console.log('successfully deleted : '+ newPath );
				    })
				}
				   
				fs.rename(req.files.file.path,newPath,function(){			
					res.status(200).json(result).end();
				})
			
		})
});
		


// URL expected: http://hostname/admin-api/cat/add
router.post('/api/prod/edit', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('pid', 'Invalid Product id')
		.notEmpty()
		.isInt();
	req.checkBody('name', 'Invalid Product Name')
		.isLength(1, 512)
		.matches(inputPattern.name);
	req.checkBody('catid', 'Invalid Category id')
		.notEmpty()
		.isInt();
	req.checkBody('price', 'Invalid Price')
		.notEmpty()
		.isFloat();

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}
	

	// manipulate the DB accordingly using prepared statement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
	pool.query('UPDATE products SET catid=?, name = ?, price = ? , description = ? WHERE pid = ? LIMIT 1', 
		[req.body.catid, req.body.name, req.body.price, req.body.description, req.body.pid],
		function (error, result)
		 {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}
			// construct an error body that conforms to the inputError format
			if (result.affectedRows === 0) {
				return res.status(400).json({'inputError': [{
					param: 'pid', 
					msg: 'Invalid Product ID', 
					value: req.body.pid
				}]}).end();	
			}
			if (req.files){
				oldPath=req.files.file.path;
				var pid= req.body.pid;
	   			var newPath=oldPath.replace(/^(.*\/).*(\..*)$/, function(a,b,c) {
	   				return b + pid;
	   			});
				//var newPath = oldPath.replace(/^\/(.*)\.$/\/1234\./);
				 if (fs.exists(newPath)) {
				    fs.unlink('newPath', function (err) {
					      if (err) {
					      }
					  
				      console.log('successfully deleted : '+ newPath );
				    })
				}
				   
				fs.rename(req.files.file.path,newPath,function(){			
					
				})
			}
			res.status(200).json(result).end();
		}
	);
});

router.post('/api/prod/remove', function (req, res) {

	// put your input validations and/or sanitizations here
	// Reference: https://www.npmjs.com/package/express-validator
	// Reference: https://github.com/chriso/validator.js
	req.checkBody('pid', 'Invalid Product ID')
		.notEmpty()
		.isInt();

	// quit processing if encountered an input validation error
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();
	}

	// manipulate the DB accordingly using prepared catidstatement 
	// (Prepared Statement := use ? as placeholder for values in sql statement; 
	//   They'll automatically be replaced by the elements in next array)
	pool.query(' DELETE FROM products WHERE pid=(?)', 
		[req.body.pid],
		function (error, result) {
			if (error) {
				console.error(error);
				return res.status(500).json({'dbError': 'check server log'}).end();
			}

			res.status(200).json(result).end();
		}
	);

});


module.exports = router;