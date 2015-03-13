var crypto = require('crypto');
function hmacPassword(password)
{
	var salt = 'CtbX5BQFGPR6NccN';
	var hmac=crypto.createHmac('sha256', salt);
	console.log(salt); // zhu
	hmac.update(password);
	return hmac.digest('base64');
}
console.log(hmacPassword('#&@!#&@&'))
