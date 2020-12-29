module.exports = function (raw, filename) {
	let code = '';
	let cstart = '<?=';
	let cend   = '?>';
	let quotec = ['"', `'`, '`'];
	let lastpos = 0;
	while (true) {
		let begin = raw.indexOf(cstart, lastpos);
		if(begin == -1) break;
		let textblock = raw.substring(lastpos, begin);
		code += 'write(`' + textblock.replace(/\`/g, '\\\`') + '`);';
		let end = -1;
		let quote = null;
		for(let i = begin; i < raw.length; i++) {
			if(!quote && quotec.indexOf(raw[i]) != -1) quote = raw[i];
			else if(quote == raw[i]) quote = null;
			
			if(!quote && raw.substring(i, i + cend.length) == cend) {
				end = i;
				break;
			}
		}
		if(end == -1) throw Error('Code block not closed in ' + (filename || 'anonymous'));
		let codeblock = raw.substring(begin + cstart.length, end);
		code += codeblock + ';';
		lastpos = end + cend.length;
	}
	let textblock = raw.slice(lastpos);
	code += 'write(`' + textblock.replace(/\`/g, '\\\`') + '`);';
	
	let raw_code = '(function (imports) {' +
		'let output = "";' +
		'const write = (...args) => output += args.join(" ");' +
		code +
		'return output;' +
		'})';
	try {
		return eval(raw_code);
	} catch(err) {
		console.log("In " + (filename || 'anonymous') + ':');
		throw err;
	}
}
