var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var multer  = require('multer');
var exphbs  = require('express-secure-handlebars');
var csrf = require('csurf');
var cookieParser = require('cookie-parser');
var mainRouter = require('./routes/main.js');
var adminRouter = require('./routes/admin.js');
var apiRouter = require('./routes/api.js');

var xFrameOptions = require('x-frame-options')
var helmet = require('helmet');
 
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(session({
	name:'auth', httpOnly: true, secret:'BcwWI4dG6HRsCU8UUcZg',resave:false, saveUninitialized:false, cookie: {maxAge:259200000 }
})); 
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressValidator());
app.use(cookieParser());
app.use(multer({ dest: './public/images/products/'}));
app.use(csrf({ cookie: true }));
app.use(xFrameOptions());
app.use(helmet());
app.use(helmet.hsts({ maxAge: 7776000000 }));
app.use(function(req, res, next){
    res.header("Content-Security-Policy", "default-src 'self';script-src 'self';object-src 'none';img-src 'self';media-src 'self';frame-src 'none';font-src 'self' data:;connect-src 'self';style-src 'self'");
    next();
});
app.use(express.static(__dirname+'/public'));
app.use('/',mainRouter);
app.use('/admin', function(req, res, next) {
	var schema = req.headers['x-forwarded-proto'];
	if (schema === 'https') {
		next();
	}
	else {
		res.redirect('https://' + req.headers.host + '/admin' + req.url );
	}
});
app.use('/admin',adminRouter);
app.use('/admin',apiRouter);

var server = app.listen(process.env.PORT||80, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Running at %s:%s', host ,port);
})

