exports.fix = function (node) {
    if (node.type === 'Literal' && typeof node.value === 'string') {
        var util = require('../util');
        if (node.startToken.value.charAt(0) === '"') {
            var value = node.startToken.value.slice(1, -1);
            value = value.replace(/\\'/g, '\'');
            value = value.replace(/'/g, '\\\'');
            node.startToken.value = '\'' + value + '\'';
        }
    }
};
