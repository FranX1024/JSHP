const fs = require('fs');
const path = require('path');
const compiler = require('./compiler.js');

const syncfs = {
	readFile: Promisify(fs.readFile),
	readdir: Promisify(fs.readdir),
	lstat: Promisify(fs.lstat)
};

async function compile_all (root, dir, map) {
	let [err, items] = await syncfs.readdir(path.join(root, dir));
	if(err) throw err;
	for(let i = 0; i < items.length; i++) {
		let itemname = items[i];
		let [err, stat] = await syncfs.lstat(path.join(root, dir, itemname));
		if(err) throw err;
		if(stat.isFile()) {
			let [err, content] = await syncfs.readFile(path.join(root, dir, itemname));
			if(err) throw err;
			map[path.join(dir, itemname)] = compiler(content.toString(), path.join(dir, itemname));
		} else {
			await compile_all(root, path.join(dir, itemname), map);
		}
	}
}

function Promisify(func) {
	return async function (...args) {
		return await new Promise(function (resolve) {
			func(...args, function(...resp) {
				resolve(resp);
			});
		});
	}
}

module.exports = compile_all;
