var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var multer  = require('multer');
var exphbs  = require('express-handlebars');
var mainRouter = require('./routes/main.js');
var adminRouter = require('./routes/admin.js');
var apiRouter = require('./routes/api.js');


app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(session({
	name:'auth', httpOnly: true, secret:'BcwWI4dG6HRsCU8UUcZg',resave:false, saveUninitialized:false, cookie: {maxAge:259200000 }
})); 
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressValidator());
app.use(multer({ dest: './public/images/products/'}));
app.use(express.static(__dirname+'/public'));
app.use('/',mainRouter);
app.use('/admin',adminRouter);
app.use('/admin',apiRouter);

var server = app.listen(process.env.PORT||80, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Running at %s:%s', host ,port);
})

