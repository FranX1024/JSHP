const express = require('express');
const jshp = require('./lib/application.js')('./test');

const port = process.env.PORT || 8000;
const app = express();

app.use(jshp.router());

app.listen(port, function() {
	console.log('Listening to port ' + port);
});

jshp.onready = function() {
	console.log('Templates ready');
};
