exports.fix = function (node) {
    if (node.type === 'EmptyStatement') {
        var util = require('../util');
        util.removeToken(node.endToken);
    }
};
