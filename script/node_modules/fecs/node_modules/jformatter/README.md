# jformatter

A JavaScript formatter

## Basic usage

The easiest way to use JFormatter is to install it as a Node program.

    npm -g install jformatter

After you've done that you should be able to use the `jformatter` program.

    jformatter file.js

## Command in Terminal

```
  Usage: jformatter [options] <file>

  Options:

    -h, --help     output usage information
    -v, --version  output the version number
    -d, --diff     Show difference between source and formatted
```

## Configuration

When use jformatter in terminal, it will try to load `.jformatterrc`.

JFormatter will start looking for this file in the same directory as the file that's being formatted. If not found, it will move one level up the directory tree all the way up to the filesystem root.

Default config, developing, not stable.

    {
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
    }

## API

    require('jformatter').format(code, [configObj]) : string
    require('jformatter').formatFile(filePath, [configObj]) : string
    require('jformatter').version() : string
    require('jformatter').getDefaultConfig() : configObj


## Important Note

please update to `>=v1.0.5`, see version change log

## Changelog

### next

* make all config work
* 调整注释缩进

### v1.0.7 (2015/04/14)

* fix bug: for windows environment

### v1.0.6 (2014/12/03)

* fix bug: single quotes auto-fix bugs
* update test case

### v1.0.5 (2014/12/03)

* fix bug: lost space before `instanceof`

### v1.0.4 (2014/12/03)

* fix bug: autoSemicolon add semicolon in for statement

### v1.0.3 (2014/12/03)

* add 5 auto fix, please see `config.fix`
* improve command line tool, please see document
* test case update

### v1.0.2 (2014/11/30)

* new and safe logic of keeping blank line
* config for blank line at end of file
* keep 1 blank line default
* test case update

### v1.0.1 (2014/11/28)

* keep blank line after file doc
* keep blank line after `},`

### v1.0.0 (2014/11/27)

* all new architecture with rocambole
* more config work
* fix a bug in auto-fixer

### v0.2.0 (2014/11/05)

* npm test: config auto test
* npm test: style auto test
* add four auto-fixer config
* fix bug: Comment at first line cause redundant LineBreak
* version rule

### v0.1.8 (2014/10/28)

* add version api

### v0.1.6 (2014/08/27)

* fix bug: lost space after `void`

### v0.1.5 (2014/08/27)

* fix bug: lost space after `typeof`
* fix bug: lost space after comma expression

### v0.1.4 (2014/08/19)

* remove config not relate to code style
* change config editable with common config editor
* support npm test

### v0.1.2 (2014/08/08)

* Fix DoWhileStatement bug

### v0.1.0 (2014/08/07)

* Initial release