var express = require('express')
var app = express()

app.use(express.static(__dirname+'/public'));
app.get('/', function (req,res) {
	res.sendFile(__dirname+'/public/main.html');
})

var server = app.listen(process.env.PORT||80, function() {
	var host = server.address().address
	var port = server.address().port
	console.log('Running at %s:%s', host ,port);
})
