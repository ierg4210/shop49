var express = require('express');
var app = express();
var exphbs  = require('express-handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static(__dirname+'/public'));
app.get('/', function (req,res) {
	res.render('home');
})
app.get('/main', function (req,res) {
	res.render('home');
})
app.get('/product', function (req,res) {
	res.render('product');
})


var server = app.listen(process.env.PORT||80, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Running at %s:%s', host ,port);
})

