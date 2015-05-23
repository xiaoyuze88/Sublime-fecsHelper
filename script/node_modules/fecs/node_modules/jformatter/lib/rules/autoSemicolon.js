exports.fix = function (node) {
    var fixType = ['VariableDeclaration', 'ExpressionStatement', 'ReturnStatement'];

    if (fixType.indexOf(node.type) !== -1 && !(node.endToken.type === 'Punctuator' && node.endToken.value === ';')) {
        if (node.type === 'VariableDeclaration' && (node.parent.type === 'ForStatement' || node.parent.type === 'ForInStatement')) {
            return;
        }
        var util = require('../util');
        var token = node.endToken;

        while (util.isLineBreak(token) || util.isWhiteSpace(token)) {
            token = token.prev;
        }
        util.insertAfter(token, {
            type: 'Punctuator',
            value: ';'
        });
    }
};
