/**
 * jformatter main
 * @author ishowshao
 */
(function () {
    /**
     * returns default config
     *
     * @returns {Object}
     */
    var getDefaultConfig = function () {
        return {
            lineSeparator: '\n', // done
            maxLength: 120, // TODO
            wrapIfLong: false, // TODO
            indent: 4, // done
            useTabIndent: false, // done
            spaces: {
                around: {
                    unaryOperators: false, // TODO
                    binaryOperators: true, // done
                    ternaryOperators: true // done
                },
                before: {
                    functionDeclarationParentheses: false, // done function foo() {
                    functionExpressionParentheses: true, // done var foo = function () {
                    parentheses: true, // done if (), for (), while (), ...
                    leftBrace: true, // done function () {, if () {, do {, try { ...
                    keywords: true // done if {} else {}, do {} while (), try {} catch () {} finally
                },
                within: {
                    // function call, function declaration, if, for, while, switch, catch
                    parentheses: false // done
                },
                other: {
                    beforePropertyNameValueSeparator: false, // done {key: value} {key : value} {key:value}
                    afterPropertyNameValueSeparator: true // done
                }
            },
            bracesPlacement: { // 1. same line 2. next line
                functionDeclaration: 1, // TODO
                other: 1 // TODO
            },
            blankLines: {
                keepMaxBlankLines: 1, // done
                atEndOfFile: true // done
            },
            other: {
                keepArraySingleLine: false // TODO default formatted array multi line
            },
            fix: {
                prefixSpaceToLineComment: false, // done
                alterCommonBlockCommentToLineComment: false, // done
                singleVariableDeclarator: false, // done
                fixInvalidTypeof: false, // done
                removeEmptyStatement: false, // done
                autoSemicolon: false, // done
                singleQuotes: false, // done
                eqeqeq: false, // done
                invalidConstructor: false // done
            }
        };
    };

    var _config = getDefaultConfig();

    // defaults the config
    var overwriteConfig = function (defaults, configure) {
        for (var key in defaults) {
            if (defaults.hasOwnProperty(key)) {
                if (typeof defaults[key] === 'object') {
                    // recursive
                    if (typeof configure[key] === 'object') {
                        overwriteConfig(defaults[key], configure[key]);
                    }
                } else {
                    // copy directly
                    if (typeof configure[key] !== 'undefined') {
                        defaults[key] = configure[key];
                    }
                }
            }
        }
    };

    /**
     * format given string and return formatted string
     *
     * @param {string} string - code string
     * @param {Object} [userConfig] - config object
     * @returns {string}
     */
    var format = function (string, userConfig) {
        userConfig = userConfig || {};

        overwriteConfig(_config, userConfig); // overwrite codeStyle with user config

        // deal with indent (new Array(indent + 1)).join(' ')
        var INDENT = (function () {
            var indentStr = '';
            var space = _config.useTabIndent ? '\t' : ' ';
            var indent = _config.indent ? Number(_config.indent) : 4;
            while (indent--) {
                indentStr += space;
            }
            return indentStr;
        })();

        /**
         * create a LineBreak token
         *
         * @returns {{type: string, value: string, formatter: boolean}}
         */
        var nextLineFactory = function () {
            return {
                type: 'LineBreak',
                value: _config.lineSeparator,
                formatter: true
            };
        };

        /**
         * create a indent token with indent level
         *
         * @returns {Object}
         */
        var indentFactory = function () {
            var indentStr = '';
            for (var i = 0; i < indentLevel; i++) {
                indentStr += INDENT;
            }
            return {
                type: 'WhiteSpace',
                value: indentStr
            };
        };

        /**
         * create a indent token with only one indent
         *
         * @returns {Object}
         */
        var singleIndentFactory = function () {
            return {
                type: 'WhiteSpace',
                value: INDENT
            };
        };

        /**
         * create a single space token
         *
         * @returns {Object}
         */
        var whiteSpaceFactory = function () {
            return {
                type: 'WhiteSpace',
                value: ' '
            };
        };

        /**
         * check if a token is comment
         *
         * @param {Object} token - the token to check
         * @returns {boolean}
         */
        var isComment = function (token) {
            return token.type === 'LineComment' || token.type === 'BlockComment';
        };

        /**
         * check if a token is comment LineComment
         *
         * @param {Object} token - the token to check
         * @returns {boolean}
         */
        var isLineComment = function (token) {
            return token.type === 'LineComment';
        };

        /**
         * check if a token is white space
         *
         * @param {Object} token - the token to check
         * @returns {boolean}
         */
        var isWhiteSpace = function (token) {
            return token.type === 'WhiteSpace';
        };

        /**
         * check if a token is line break
         *
         * @param {Object} token - the token to check
         * @returns {boolean}
         */
        var isLineBreak = function (token) {
            return token.type === 'LineBreak';
        };

        /**
         * check if a token is comment in one line
         *
         * @param {Object} token - the token to check
         * @returns {boolean}
         */
        var isInlineComment = function (token) {
            var inline = false;
            if (token) {
                if (token.type === 'LineComment') {
                    inline = true;
                } else if (token.type === 'BlockComment') {
                    inline = (token.value.indexOf('\n') === -1);
                }
            }
            return inline;
        };

        /**
         * check if only types between startToken and endToken
         *
         * @param {Object} startToken - the token to start check
         * @param {Object} endToken - the token to end check
         * @param {Array} types - allow types array
         * @returns {boolean}
         */
        var isTypeBetween = function (startToken, endToken, types) {
            var is = true;
            var token = startToken;
            while (token.next && token.next !== endToken) {
                token = token.next;
                if (types.indexOf(token.type) === -1) {
                    is = false;
                    break;
                }
            }
            return is;
        };

        /**
         * 保证一个语句节点是在新起一行
         *
         * @param {Object} node - target node
         */
        var guaranteeNewLine = function (node) {
            if (node.startToken.prev && node.startToken.prev.type !== 'LineBreak') {
                insertBefore(node.startToken, nextLineFactory());
            }
        };

        /**
         * 保证一个token两侧是空白符
         *
         * @param {Object} token - target token
         */
        var guaranteeWhiteSpaceAround = function (token) {
            if (token.prev.type !== 'WhiteSpace') {
                insertBefore(token, whiteSpaceFactory());
            }
            if (token.next.type !== 'WhiteSpace' && token.next.type !== 'LineBreak') {
                insertAfter(token, whiteSpaceFactory());
            }
        };

        /**
         * insert token before a token
         *
         * @param {Object} token - target token
         * @param {Object} insertion - a token to insert
         */
        var insertBefore = function (token, insertion) {
            if (!token.prev) { // insert at first
                token.prev = insertion;
                insertion.next = token;
            } else {
                token.prev.next = insertion;
                insertion.prev = token.prev;
                insertion.next = token;
                token.prev = insertion;
            }
        };

        /**
         * insert token after a token
         *
         * @param {Object} token - target token
         * @param {Object} insertion - a token to insert
         */
        var insertAfter = function (token, insertion) {
            if (!token.next) { // insert at last
                token.next = insertion;
                insertion.prev = token;
            } else {
                token.next.prev = insertion;
                insertion.next = token.next;
                insertion.prev = token;
                token.next = insertion;
            }
        };

        /**
         * remove token in tokens
         *
         * @param {Object} token - target token
         */
        var removeToken = function (token) {
            if (token.prev && token.next) {
                token.prev.next = token.next;
                token.next.prev = token.prev;
            } else if (token.prev) {
                token.prev.next = undefined;
            } else if (token.next) {
                token.next.prev = undefined;
            }
        };

        /**
         * 这堆操作符前后是要有空白的
         *
         * @type {string[]}
         */
        var SPACE_AROUND_PUNCTUATOR = [
            '=', '+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '>>>=', '&=', '^=', '|=',
            '==', '!=', '===', '!==', '>', '>=', '<', '<=',
            '+', '-', '*', '/', '%',
            '&', '|', '^', '~', '<<', '>>', '>>>',
            '&&', '||'
        ];

        var _rocambole = require('rocambole');

        // 先fix再format
        string = require('./lib/fix').fix(string, _config.fix);

        var _ast = _rocambole.parse(string);

        // start clear
        // 先去除空白
        var clearWhiteSpace = function (token) {
            if (isWhiteSpace(token)) {
                // 默认都要删除空白
                var remove = true;

                // 空白前面是换行 && 后面是注释的不删除
                if (token.prev && token.next && isLineBreak(token.prev) && isComment(token.next)) {
                    remove = false;
                }

                if (remove) {
                    removeToken(token);
                }
            }
        };
        var token = _ast.startToken;
        while (token !== _ast.endToken.next) {
            clearWhiteSpace(token);
            token = token.next;
        }

        if (_config.blankLines.keepMaxBlankLines > 0) {
            _rocambole.recursive(_ast, function (node) {
                var keep = 0;
                var t;
                if (/Declaration|Statement/.test(node.type) && node.type !== 'BlockStatement' && !(node.type === 'VariableDeclaration' && node.parent.type === 'ForStatement')) {
                    keep = Number(_config.blankLines.keepMaxBlankLines);
                    if (node.endToken.next && isLineBreak(node.endToken.next)) {
                        t = node.endToken.next;
                        t.removeAble = false;
                        while (keep--) {
                            if (t.next && isLineBreak(t.next)) {
                                t.next.removeAble = false;
                                t = t.next;
                            }
                        }
                    }
                }
                if (node.type === 'Property') {
                    keep = Number(_config.blankLines.keepMaxBlankLines);
                    if (node.startToken.prev && isLineBreak(node.startToken.prev)) {
                        t = node.startToken.prev;
                        t.removeAble = false;
                        while (keep--) {
                            if (t.prev && isLineBreak(t.prev)) {
                                t.prev.removeAble = false;
                                t = t.prev;
                            }
                        }
                    }
                }
            });
        }
        var clearLineBreak = function (token) {
            // 注释前后的换行一律保留，其他一律删除
            if (isLineBreak(token)) {
                // 默认都要删除换行
                var remove = true;

                // 注释前面的
                if (token.next && isComment(token.next)) {
                    remove = false;
                }
                // 注释后面的
                if (token.prev && isComment(token.prev)) {
                    remove = false;
                }
                // 注释前面空白再前面的，这种是有缩进且占整行的注释
                if (token.next && token.next.next && isWhiteSpace(token.next) && isComment(token.next.next)) {
                    remove = false;
                }

                if (token.prev && !token.prev.prev && Number(_config.blankLines.keepMaxBlankLines) > 0 && isComment(token.prev) && token.prev.value.charAt(0) === '*') {
                    if (token.next && isLineBreak(token.next)) {
                        token.next.removeAble = false;
                        token.next.next.removeAble = false;
                    }
                }
                if (token.removeAble === false) {
                    remove = false;
                }

                if (remove) {
                    removeToken(token);
                }
            }
        };
        token = _ast.startToken;
        while (token !== _ast.endToken.next) {
            clearLineBreak(token);
            token = token.next;
        }
        // end clear

        // start process
        // 这些关键词之后，必须无脑保证空白，其实return,delete等并不是必须要空白，但是应该没有傻逼这么写吧return(a);忽略这种情况
        // 如果这些关键词后面都不加空白，那就傻逼鉴定完毕 shit 所以不提供这种配置
        var INSERT_SPACE_AFTER_KEYWORD = ['throw', 'return', 'delete', 'new', 'in', 'typeof', 'instanceof', 'case', 'void'];
        // 这几个关键词属于同一类型，在它们后边可以加空白也可以不加，都不会出先语法错误
        var INSERT_SPACE_AFTER_KEYWORD_WITH_CONFIG = ['if', 'for', 'while', 'switch', 'catch'];
        var processToken = function (token) {
            // 必须加空白的地方
            if (token.type === 'Keyword' && INSERT_SPACE_AFTER_KEYWORD.indexOf(token.value) !== -1) {
                insertAfter(token, whiteSpaceFactory());
            }
            // 坑：var后面可以是换行，这时候就不需要空白
            if (token.type === 'Keyword' && token.value === 'var' && !isLineBreak(token.next)) {
                insertAfter(token, whiteSpaceFactory());
            }

            if (_config.spaces.before.parentheses && token.type === 'Keyword' && INSERT_SPACE_AFTER_KEYWORD_WITH_CONFIG.indexOf(token.value) !== -1) {
                insertAfter(token, whiteSpaceFactory());
            }

            // check around = WhiteSpace
            if (_config.spaces.around.binaryOperators && token.type === 'Punctuator' && SPACE_AROUND_PUNCTUATOR.indexOf(token.value) !== -1) {
                guaranteeWhiteSpaceAround(token);
            }
            // 特殊处理in/instanceof，这货两边必须保证空白
            if (token.type === 'Keyword' && ['in', 'instanceof'].indexOf(token.value) !== -1) {
                guaranteeWhiteSpaceAround(token);
            }

            // 特殊处理finally，这货在ast里不是一个独立type节点
            if (token.type === 'Keyword' && token.value === 'finally') {
                if (_config.spaces.before.keywords && !isWhiteSpace(token.prev)) {
                    insertBefore(token, whiteSpaceFactory());
                }
            }
        };
        token = _ast.startToken;
        while (token !== _ast.endToken.next) {
            processToken(token);
            token = token.next;
        }
        // end process

        // loop node
        _rocambole.recursive(_ast, function (node) {
            switch (node.type) {
                case 'ArrayExpression':
                    node.startToken.indentIncrease = true;
                    node.endToken.indentDecrease = true;
                    node.elements.forEach(function (el) {
                        el && guaranteeNewLine(el);
                    });
                    if (node.elements.length > 0 && !isLineBreak(node.endToken.prev)) {
                        insertBefore(node.endToken, nextLineFactory());
                    }
                    break;
                case 'BreakStatement':
                    guaranteeNewLine(node);
                    break;
                case 'ConditionalExpression':
                    if (_config.spaces.around.ternaryOperators && node.test) {
                        (function () {
                            var token = node.test.endToken;
                            // TODO 这样做到底安全不？
                            while (!(token.value === '?' && token.type === 'Punctuator')) {
                                token = token.next;
                            }
                            if (!isWhiteSpace(token.prev)) {
                                insertBefore(token, whiteSpaceFactory());
                            }
                            if (!isWhiteSpace(token.next)) {
                                insertAfter(token, whiteSpaceFactory());
                            }
                        })();
                    }
                    if (_config.spaces.around.ternaryOperators && node.consequent) {
                        (function () {
                            var token = node.consequent.endToken;
                            while (!(token.value === ':' && token.type === 'Punctuator')) {
                                token = token.next;
                            }
                            if (!isWhiteSpace(token.prev)) {
                                insertBefore(token, whiteSpaceFactory());
                            }
                            if (!isWhiteSpace(token.next)) {
                                insertAfter(token, whiteSpaceFactory());
                            }
                        })();
                    }
                    break;
                case 'ContinueStatement':
                    guaranteeNewLine(node);
                    break;
                case 'DoWhileStatement':
                    guaranteeNewLine(node);
                    if (node.body.type === 'BlockStatement') {
                        if (!isWhiteSpace(node.body.endToken.next)) {
                            _config.spaces.before.keywords && insertAfter(node.body.endToken, whiteSpaceFactory());
                        }
                    } else {
                        if (isWhiteSpace(node.startToken.next)) {
                            removeToken(node.startToken.next);
                        }
                        node.body.startToken.indentSelf = true;
                        if (!isWhiteSpace(node.test.startToken.prev.prev)) {
                            if (!isLineBreak(node.test.startToken.prev.prev.prev)) {
                                insertBefore(node.test.startToken.prev.prev, nextLineFactory());
                            }
                            insertBefore(node.test.startToken.prev, whiteSpaceFactory());
                        } else {
                            if (!isLineBreak(node.test.startToken.prev.prev.prev.prev)) {
                                insertBefore(node.test.startToken.prev.prev.prev, nextLineFactory());
                            }
                        }
                    }
                    break;
                case 'ForStatement':
                    guaranteeNewLine(node);
                    if (node.test && !isWhiteSpace(node.test.startToken.prev)) {
                        insertBefore(node.test.startToken, whiteSpaceFactory());
                    }
                    if (node.update && !isWhiteSpace(node.update.startToken.prev)) {
                        insertBefore(node.update.startToken, whiteSpaceFactory());
                    }
                    if (_config.spaces.within.parentheses) {
                        if (node.init && !isWhiteSpace(node.init.startToken.prev)) {
                            insertBefore(node.init.startToken, whiteSpaceFactory());
                        } else {}
                        if (node.update && !isWhiteSpace(node.update.endToken.next)) {
                            insertAfter(node.update.endToken, whiteSpaceFactory());
                        }
                    }
                    break;
                case 'ForInStatement':
                    guaranteeNewLine(node);
                    break;
                case 'VariableDeclaration':
                    if (node.parent.type !== 'ForStatement' && node.parent.type !== 'ForInStatement') {
                        guaranteeNewLine(node);
                    }
                    break;
                case 'VariableDeclarator':
                    if (node.endToken.next && node.endToken.next.type === 'Punctuator' && node.endToken.next.value === ',' && !isLineBreak(node.endToken.next.next)) {
                        insertAfter(node.endToken.next, whiteSpaceFactory());
                    }
                    break;
                case 'ExpressionStatement':
                    guaranteeNewLine(node);
                    break;
                case 'FunctionDeclaration':
                    guaranteeNewLine(node);
                    insertAfter(node.startToken, whiteSpaceFactory());
                    if (node.id) {
                        _config.spaces.before.functionDeclarationParentheses && insertAfter(node.id.endToken, whiteSpaceFactory());
                    }
                    node.params.forEach(function (param, i) {
                        if (i > 0) {
                            insertBefore(param.startToken, whiteSpaceFactory());
                        }
                    });
                    if (_config.spaces.within.parentheses && node.params.length > 0) {
                        if (!isWhiteSpace(node.params[0].startToken.prev)) {
                            insertBefore(node.params[0].startToken, whiteSpaceFactory());
                        }
                        if (!isWhiteSpace(node.params[node.params.length - 1].endToken.next)) {
                            insertAfter(node.params[node.params.length - 1].endToken, whiteSpaceFactory());
                        }
                    }
                    break;
                case 'IfStatement':
                    // 坑：if statement 的 consequent 和 alternate 都是有可能不存在的
                    if (node.parent.type !== 'IfStatement') {
                        guaranteeNewLine(node);
                    } else {
                        insertBefore(node.startToken, whiteSpaceFactory());
                    }
                    if (node.consequent && node.consequent.type !== 'BlockStatement') {
                        node.consequent.startToken.indentSelf = true;
                        if (node.alternate && node.consequent.endToken.next && !isLineBreak(node.consequent.endToken.next)) {
                            insertAfter(node.consequent.endToken, nextLineFactory());
                        }
                    } else {
                        if (node.alternate) {
                            _config.spaces.before.keywords && insertAfter(node.consequent.endToken, whiteSpaceFactory());
                        }
                    }
                    if (node.alternate && node.alternate.type !== 'BlockStatement' && node.alternate.type !== 'IfStatement') {
                        node.alternate.startToken.indentSelf = true;
                    }
                    if (_config.spaces.within.parentheses && node.test) {
                        if (!isWhiteSpace(node.test.startToken.prev)) {
                            insertBefore(node.test.startToken, whiteSpaceFactory());
                        }
                        if (!isWhiteSpace(node.test.endToken.next)) {
                            insertAfter(node.test.endToken, whiteSpaceFactory());
                        }
                    }
                    break;
                case 'ReturnStatement':
                    guaranteeNewLine(node);
                    break;
                case 'BlockStatement':
                    node.startToken.indentIncrease = true;
                    node.endToken.indentDecrease = true;
                    if (node.startToken.prev && !isWhiteSpace(node.startToken.prev) && !isLineBreak(node.startToken.prev)) {
                        _config.spaces.before.leftBrace && insertBefore(node.startToken, whiteSpaceFactory());
                    }
                    if (!isLineBreak(node.endToken.prev)) {
                        insertBefore(node.endToken, nextLineFactory());
                    }
                    break;
                case 'ObjectExpression':
                    if (!isTypeBetween(node.startToken, node.endToken, ['WhiteSpace', 'LineBreak'])) {
                        node.startToken.indentIncrease = true;
                        node.endToken.indentDecrease = true;
                        if (!isLineBreak(node.endToken.prev)) {
                            insertBefore(node.endToken, nextLineFactory());
                        }
                    }
                    break;
                case 'Property':
                    guaranteeNewLine(node);
                    if (_config.spaces.other.beforePropertyNameValueSeparator) {
                        !isWhiteSpace(node.key.endToken.next) && insertAfter(node.key.endToken, whiteSpaceFactory());
                    }
                    if (_config.spaces.other.afterPropertyNameValueSeparator) {
                        !isWhiteSpace(node.value.startToken.prev) && insertBefore(node.value.startToken, whiteSpaceFactory());
                    }
                    break;
                case 'CallExpression':
                    node.arguments.forEach(function (arg, i) {
                        if (i !== 0) {
                            insertBefore(arg.startToken, whiteSpaceFactory());
                        }
                    });
                    if (_config.spaces.within.parentheses && node.arguments.length > 0) {
                        if (!isWhiteSpace(node.arguments[0].startToken.prev)) {
                            insertBefore(node.arguments[0].startToken, whiteSpaceFactory());
                        }
                        if (!isWhiteSpace(node.arguments[node.arguments.length - 1].endToken.next)) {
                            insertAfter(node.arguments[node.arguments.length - 1].endToken, whiteSpaceFactory());
                        }
                    }
                    break;
                case 'FunctionExpression':
                    if (_config.spaces.before.functionExpressionParentheses || node.id) {
                        insertAfter(node.startToken, whiteSpaceFactory());
                    }
                    node.params.forEach(function (param, i, array) {
                        if (param.endToken.next && param.endToken.next.type === 'Punctuator' && param.endToken.next.value === ',') {
                            insertAfter(param.endToken.next, whiteSpaceFactory());
                        }
                    });
                    if (_config.spaces.within.parentheses && node.params.length > 0) {
                        if (!isWhiteSpace(node.params[0].startToken.prev)) {
                            insertBefore(node.params[0].startToken, whiteSpaceFactory());
                        }
                        if (!isWhiteSpace(node.params[node.params.length - 1].endToken.next)) {
                            insertAfter(node.params[node.params.length - 1].endToken, whiteSpaceFactory());
                        }
                    }
                    break;
                case 'SequenceExpression':
                    node.expressions.forEach(function (exp) {
                        if (exp.endToken.next && exp.endToken.next.type === 'Punctuator' && exp.endToken.next.value === ',') {
                            insertAfter(exp.endToken.next, whiteSpaceFactory());
                        }
                    });
                    break;
                case 'UnaryExpression':
                    if (['+', '-', '!'].indexOf(node.startToken.value) !== -1) {
                        if (node.startToken.next.type === 'WhiteSpace') {
                            removeToken(node.startToken.next);
                        }
                    }
                    if (node.operator === 'void') {
                        if (node.startToken.next.type !== 'WhiteSpace') {
                            insertAfter(node.startToken, whiteSpaceFactory());
                        }
                    }
                    break;
                case 'WhileStatement':
                    guaranteeNewLine(node);
                    if (_config.spaces.within.parentheses && node.test) {
                        if (!isWhiteSpace(node.test.startToken.prev)) {
                            insertBefore(node.test.startToken, whiteSpaceFactory());
                        }
                        if (!isWhiteSpace(node.test.endToken.next)) {
                            insertAfter(node.test.endToken, whiteSpaceFactory());
                        }
                    }
                    break;
                case 'SwitchStatement':
                    guaranteeNewLine(node);
                    node.discriminant.endToken.next.indentIncrease = true;
                    _config.spaces.before.leftBrace && insertAfter(node.discriminant.endToken.next, whiteSpaceFactory());
                    node.endToken.indentDecrease = true;
                    if (!isLineBreak(node.endToken.prev)) {
                        insertBefore(node.endToken, nextLineFactory());
                    }
                    if (_config.spaces.within.parentheses && node.discriminant) {
                        if (!isWhiteSpace(node.discriminant.startToken.prev)) {
                            insertBefore(node.discriminant.startToken, whiteSpaceFactory());
                        }
                        if (!isWhiteSpace(node.discriminant.endToken.next)) {
                            insertAfter(node.discriminant.endToken, whiteSpaceFactory());
                        }
                    }
                    break;
                case 'SwitchCase':
                    guaranteeNewLine(node);
                    node.startToken.indentIncrease = true;
                    node.endToken.indentDecrease = true;
                    break;
                case 'ThrowStatement':
                    guaranteeNewLine(node);
                    break;
                case 'TryStatement':
                    guaranteeNewLine(node);
                    break;
                case 'CatchClause':
                    if (_config.spaces.before.keywords && !isWhiteSpace(node.startToken.prev)) {
                        insertBefore(node.startToken, whiteSpaceFactory());
                    }
                    if (_config.spaces.within.parentheses && node.param) {
                        if (!isWhiteSpace(node.param.startToken.prev)) {
                            insertBefore(node.param.startToken, whiteSpaceFactory());
                        }
                        if (!isWhiteSpace(node.param.endToken.next)) {
                            insertAfter(node.param.endToken, whiteSpaceFactory());
                        }
                    }
                    break;
                case 'EmptyStatement':
                    guaranteeNewLine(node);
                    break;
                default:
                    break;
            }
        });

        // process indent start
        // 缩进这块要单独拿出来处理，不然很容易混乱
        var indentLevel = 0;
        var processIndent = function (token) {
            if (token.indentIncrease) {
                indentLevel++;
            }
            if (token.type === 'LineBreak') {
                if (token.next && !isWhiteSpace(token.next) && !isLineBreak(token.next)) {
                    // 如果下一个token是要减小缩进的，那它本身就是要减少缩进的
                    if (token.next.indentDecrease) {
                        indentLevel--;
                        token.next.indentDecrease = false;
                    }
                    insertAfter(token, indentFactory());
                }
            }
            if (token.indentDecrease) {
                indentLevel--;
            }
            if (token.indentSelf) {
                indentLevel++;
                insertBefore(token, singleIndentFactory());
                indentLevel--;
            }
        };
        token = _ast.startToken;
        while (token !== _ast.endToken.next) {
            processIndent(token);
            token = token.next;
        }
        // process indent end

        // 单独的处理注释的逻辑
        var processComment = function (token) {
            // 行尾注释保持跟前面的代码一个空格的距离
            if (isLineComment(token) && token.prev && !isWhiteSpace(token.prev)) {
                insertBefore(token, whiteSpaceFactory());
            }
        };
        token = _ast.startToken;
        while (token !== _ast.endToken.next) {
            processComment(token);
            token = token.next;
        }


        var formattedString = _ast.toString();
        if (_config.blankLines.atEndOfFile) {
            if (formattedString.charAt(formattedString.length - 1) !== _config.lineSeparator) {
                formattedString += _config.lineSeparator;
            }
        } else {
            formattedString = formattedString.trim();
        }
        return formattedString;
    };

    /**
     * format given file and returns formatted code
     *
     * @param {string} file - file path
     * @param {Object} [config] - config object
     * @returns {string}
     */
    var formatFile = function (file, config) {
        return format(require('fs').readFileSync(file, 'utf-8'), config);
    };

    /**
     * returns version string
     *
     * @returns {string}
     */
    var version = function () {
        return require('./package.json').version;
    };

    exports.format = format;
    exports.formatFile = formatFile;
    exports.version = version;
    exports.getDefaultConfig = getDefaultConfig;
})();
