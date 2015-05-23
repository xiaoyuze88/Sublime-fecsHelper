exports.fix = function (node) {
    var constructors = ['Number', 'String', 'Boolean'];
    if (node.type === 'NewExpression' && constructors.indexOf(node.callee.name) !== -1) {
        var util = require('../util');
        util.removeToken(node.startToken);
    }
};
