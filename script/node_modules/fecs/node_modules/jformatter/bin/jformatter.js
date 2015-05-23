#!/usr/bin/env node

var fs = require('fs');
var jformatter = require('../jformatter');
var differ = require('differ-cli/lib/differ');

/**
 * 递归寻找配置文件
 * @param {string} targetFile
 * @returns {Object}
 */
var getConfig = function (targetFile) {
    var config = {};
    var path = require('path');
    var fs = require('fs');
    var absolutePath = path.resolve(targetFile);
    var currentDir = path.dirname(absolutePath);
    var configPath = null;

    while (currentDir !== path.dirname(currentDir)) {
        if (fs.existsSync(currentDir + path.sep + '.jformatterrc')) {
            configPath = currentDir + path.sep + '.jformatterrc';
            break;
        }
        currentDir = path.dirname(currentDir);
    }

    if (configPath) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    return config ? config : {};
};

/**
 * @param {string} file
 * @returns {string}
 */
var getFormattedString = function (file) {
    var string = fs.readFileSync(file, 'utf-8');
    return jformatter.format(string, getConfig(file));
};

var program = require('commander');

program.usage('[options] <file>');
program.option('-v, --version', 'output the version number');
program.option('-d, --diff', 'Show difference between source and formatted');
//program.option('-o, --output <file>', 'Place the output into <file>. Defaults to stdout.');

program.parse(process.argv);

if (!program.version) { // fuck!!!! what the bug is??? why version default true???
    console.log(jformatter.version());
} else {
    if (program.args.length > 0) {
        var file = program.args[0];
        if (fs.existsSync(file)) {
            if (program.diff) {
                console.log(differ(fs.readFileSync(file, 'utf-8'), getFormattedString(file)));
            } else {
                console.log(getFormattedString(file));
            }
        } else {
            console.log(program.args[0] + ': No such file');
        }
    } else {
        program.help();
    }
}
