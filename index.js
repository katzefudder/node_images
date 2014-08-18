fs = require('fs');
path = require('path');
gm = require('gm');

var Indexer = {
	files : Array,
	sourcePath : null,
	targetPath : null,
	resize : function(newWidth) {
		this.files.forEach(function(file) {
			// set new path
			var newPath = file.replace('sources', 'results');
			var newFile = gm(file)
				.resize(newWidth);
			newFile.write(newPath, function (err) {
				if (!err) {
					Indexer.watermark(newPath, './watermark/watermark.png');
					console.log(newPath + ' written');
				}
				else console.log(err);
			});
		});
	},
	watermark : function(file, watermark) {
		// async call via resizing
		var stat = fs.statSync(path.resolve(file));

		if (stat && stat.isDirectory()) {

		} else {
			var exec = require('child_process').exec;
			var command = [
				'gm composite',
				'-dissolve', '50%',
				'-gravity', 'center',
				'-quality', 100,
				watermark,
				path.resolve(file),
				path.resolve(file)
			];
			exec(command.join(' '), function(err, stdout, stderr) {
				// Do stuff with result here
				// console.log('watermark added');
			});
		}
	},
	walkFiles : function(dir) {
		var results = [];
		var list = fs.readdirSync(dir);

		list.forEach(function(file) {
			file = dir + '/' + file;
			var stat = fs.statSync(file);
			if (stat && stat.isDirectory()) {
				results = results.concat(Indexer.walkFiles(file));
			}
			else {
				results.push(path.resolve(file));
			}
		});

		return results
	},
	init : function(sourcePath, targetPath, newWidth) {
		this.sourcePath = sourcePath;
		this.targetPath = targetPath;
		this.files = this.walkFiles(this.sourcePath);
		this.resize(newWidth);
		return this;
	}
}

Indexer.init('./sources', './results', 400);
