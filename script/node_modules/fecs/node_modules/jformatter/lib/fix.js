/**
 * fix code
 * 这部分代码会对源代码进行改变，是有损格式化
 * @author ishowshao
 */

var util = require('./util');
/**
 * fix something
 * @param {string} source
 * @param {Object} fixConfig
 * @returns {string}
 */
exports.fix = function (source, fixConfig) {
    var rocambole = require('rocambole');
    var ast = rocambole.parse(source);

    var alterToken = function (token) {
        if (token.type === 'LineComment') {
            // 行注释双斜杠之后加空白
            if (fixConfig.prefixSpaceToLineComment && token.value && token.value.charAt(0) !== ' ') {
                token.raw = '// ' + token.value;
            }
        } else if (token.type === 'BlockComment') {
            // 多行普通注释转行注释
            if (fixConfig.alterCommonBlockCommentToLineComment) {
                var valueArr = token.value.trim().split('\n');
                // /^\s*(js|css|html|less)[a-z]+
                if (valueArr[0].trim() !== '*' && !(valueArr.length === 1 && /jshint|jscs|eslint|csslint|csshint|csscomb|lesslint|lesshint|htmllint|htmlhint/.test(valueArr[0]))) {
                    var commentArr = [];
                    valueArr.forEach(function (line) {
                        line = line.trim();
                        if (line.charAt(0) === '*') {
                            line = line.substr(1);
                        }
                        commentArr.push((fixConfig.prefixSpaceToLineComment ? '// ' : '//') + line.trim());
                    });
                    token.raw = commentArr.join('\n');
                }
            }
        }
    };

    var token = ast.startToken;
    while (token !== ast.endToken.next) {
        alterToken(token);
        token = token.next;
    }

    rocambole.recursive(ast, function (node) {
        // fix.singleVariableDeclarator
        if (fixConfig.singleVariableDeclarator && node.type === 'VariableDeclaration' && node.parent.type !== 'ForStatement') {
            if (node.declarations.length > 1) {
                node.declarations.forEach(function (dec, i) {
                    if (i < node.declarations.length - 1) {
                        var token = dec.endToken;
                        while (token) {
                            if (token.type === 'Punctuator' && token.value === ',') {
                                token.value = ';';
                                break;
                            }
                            token = token.next;
                        }
                    }
                });

                for (var i = 1; i < node.declarations.length; i++) {
                    var declaration = node.declarations[i];
                    util.insertBefore(declaration.startToken, {type: 'Keyword', value: 'var'});
                    util.insertBefore(declaration.startToken, {type: 'WhiteSpace', value: ' '});
                }
            }
        }

        // fix.fixInvalidTypeof
        if (fixConfig.fixInvalidTypeof && node.type === 'BinaryExpression') {
            if (node.left && node.left.type === 'UnaryExpression' && node.left.operator === 'typeof') {
                if (node.left.argument.type === 'Literal') {
                    node.right.startToken.value = '\'' + typeof node.left.argument.value + '\'';
                } else if (node.left.argument.type === 'ArrayExpression') {
                    node.right.startToken.value = '\'object\'';
                } else if (node.left.argument.type === 'Identifier' && node.left.argument.name === 'undefined') {
                    node.right.startToken.value = '\'undefined\'';
                }
            }
        }

        if (fixConfig.removeEmptyStatement) {
            require('./rules/removeEmptyStatement').fix(node);
        }

        if (fixConfig.autoSemicolon) {
            require('./rules/autoSemicolon').fix(node);
        }

        if (fixConfig.singleQuotes) {
            require('./rules/singleQuotes').fix(node);
        }

        if (fixConfig.eqeqeq) {
            require('./rules/eqeqeq').fix(node);
        }

        if (fixConfig.invalidConstructor) {
            require('./rules/invalidConstructor').fix(node);
        }
    });

    var fixedString = '';
    token = ast.startToken;
    do {
        fixedString += ('raw' in token) ? token.raw : token.value;
        token = token.next;
    } while (token);

    return fixedString;
};
