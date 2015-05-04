var fs=require('fs');
var express = require('express');
var anyDB = require('any-db');
var config = require('../shop49.config.js');
var crypto = require('crypto');
var pool = anyDB.createPool(config.dbURI, {
	min: 2, max: 20
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
var router = express.Router();



router.get('/login', function (req, res) {
	res.render('login', {
			layout: 'admin',
			title: 'IERG4210 Shop49 Admin',
			csrfToken:req.csrfToken() 
			});
});

router.post('/login', function (req, res) {
	req.checkBody('username', 'Invalid user name')
		.isLength(1, 512)
		.matches(inputPattern.name);
	req.checkBody('password', 'Invalid password')
		.isLength(1, 512)

	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).json({'inputError': errors}).end();	
	}
	pool.query('SELECT admin FROM users WHERE username = ? AND saltedPassword = ?',[req.body.username,hmacPassword(req.body.password)],
	function (error, result) {
		if (error) {
			console.error(error);
		return res.status(500).json({'dbError': 'check server log'}).end();
		}
		if (result.rowCount===0)return r
			res.status(400).json({'loginError': 'Invalid Credentials'});
		req.session.regenerate(function(err) {
			req.session.username=req.body.username;
			req.session.admin=result.rows[0].admin;
			res.status(200).json({'loginOK':1}).end();
		});
	}
	); 
});
router.get('/*', function (req, res, next) {
	if (req.session.admin){
		if (req.session.admin==1){
			next();
		} else {
			res.redirect('/admin/login');
		}
	}else{
		res.redirect('/admin/login');
	}
});
router.post('/*', function (req, res, next) {
	if (req.session.admin){
		if (req.session.admin==1){
			next();
		} else {
			res.redirect('/');
		}
	}else{
		res.redirect('/admin/login');
	}
});

module.exports = router;