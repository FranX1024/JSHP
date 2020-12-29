const builder = require('./builder.js');
const compiler = require('./compiler.js');

module.exports = function(root) {
	let self = new TemplateSet();
	builder(root, '', self.map).then(function() {
		if(self.onready) self.onready();
	});
	return self;
}
module.exports.compile = compiler;

class TemplateSet {
	constructor() {
		this.map = {};
		this.onready = null;
	}
	render(path, imports) {
		if(path in this.map) {
			try {
				return this.map[path](imports);
			}
			catch (err) {
				console.error('In JSHP script "' + path + '":');
				throw err;
			}
		} else throw Error('"' + path + '" does not exist.');
	}
	handler(path) {
		let self = this;
		return function(req, res) {
			res.end(self.render(path, [req, res]));
		}
	}
	router() {
		let self = this;
		return function (req, res, next) {
			let path = req.path.replace(/^\/|\/$/g, '');
			if(path in self.map) {
				let sep = path.split('.');
				let ext = sep.length > 1 ? sep[sep.length - 1] : null;
				res.status(200);
				if(ext == 'html') res.header('Content-type', 'text/html');
				res.end(self.render(path, [req, res]));
			} else {
				next();
			}
		}
	}
}
