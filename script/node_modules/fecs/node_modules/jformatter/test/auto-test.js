/**
 * auto test for `npm test`
 * @author ishowshao
 */
var fs = require('fs');
var jformatter = require('../jformatter.js');
var differ = require('differ-cli/lib/differ');
var ROOT = require('path').dirname(__filename);

var autoTestPass = true;
// test for default code style
console.log('Testing code style cases ...\n');
fs.readdir(ROOT + '/test.style/case', function (err, files) {
    var allPass = true;
    files.forEach(function (path) {
        var pathArr = path.split('.');
        if (pathArr[0] === 'case' && pathArr[pathArr.length - 1] === 'js') {
            pathArr[0] = 'check';
            var checkFile = ROOT + '/test.style/check/' + pathArr.join('.');
            if (fs.existsSync(checkFile)) {
                var formattedString = jformatter.formatFile(ROOT + '/test.style/case/' + path);
                if (formattedString === fs.readFileSync(checkFile, 'utf-8')) {
                    console.log(path + ' ... pass.');
                } else {
                    allPass = false;
                    console.log(path + ' ... fail.');
                    console.log(differ(formattedString, fs.readFileSync(checkFile, 'utf-8')));
                }
            }
        }
    });
    if (allPass) {
        console.log('\nCode style: everything is ok.\n');
    } else {
        autoTestPass = false;
        console.log('\nCode style: something wrong!\n');
    }
});

// test for code style config
var setByNamespace = function (obj, namespace, value) {
    var props = namespace.split('.');
    var pointer = obj;
    try {
        for (var i = 0; i < props.length - 1; i++) {
            pointer = pointer[props[i]];
        }
        pointer[props.pop()] = value;
    } catch (e) {
    }
};
fs.readdir(ROOT + '/test.config/case', function (err, cases) {
    fs.readdir(ROOT + '/test.config/check', function (err, checks) {
        var allPass = true;
        cases.forEach(function (path) {
            var id = path.slice(0, -3);
            var compares = [];

            checks.forEach(function (check) {
                if (check.substr(0, id.length) === id) {
                    compares.push(check);
                }
            });

            compares.forEach(function (compare) {
                var configValue = compare.slice(0, -3).split('.').pop();

                if (configValue === 'true') {
                    configValue = true;
                } else if (configValue === 'false') {
                    configValue = false;
                }

                if (/\d+/.test(configValue)) {
                    configValue = Number(configValue);
                }

                var defaultConfig = jformatter.getDefaultConfig();
                setByNamespace(defaultConfig, path.slice(7, -3), configValue);

                var formattedString = jformatter.formatFile(ROOT + '/test.config/case/' + path, defaultConfig);
                if (formattedString === fs.readFileSync(ROOT + '/test.config/check/' + compare, 'utf-8')) {
                    console.log(path + ' ' + configValue + ' ... pass.');
                } else {
                    allPass = false;
                    console.log(path + ' ' + configValue + ' ... fail.');
                    console.log(differ(formattedString, fs.readFileSync(ROOT + '/test.config/check/' + compare, 'utf-8')));
                }
            });
        });
        if (allPass) {
            console.log('\nConfig: everything is ok.\n');
        } else {
            autoTestPass = false;
            console.log('\nConfig: something wrong!\n');
        }

        console.log(autoTestPass ? 'all pass.' : 'some fail.');
    });

});
