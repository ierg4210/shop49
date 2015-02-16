var express = require('express');
var app = express();
var exphbs  = require('express-handlebars');
var mainRouter = require('./routes/main.js')
var adminRouter = require('./routes/admin.js')
var apiRouter = require('./routes/api.js')


app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static(__dirname+'/public'));
app.use('/',mainRouter);
app.use('/admin',adminRouter);
app.use('/admin/api',apiRouter);

var server = app.listen(process.env.PORT||80, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Running at %s:%s', host ,port);
})

