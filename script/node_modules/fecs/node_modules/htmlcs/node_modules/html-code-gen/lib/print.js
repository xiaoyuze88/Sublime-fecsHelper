/**
 * @file print methods for different kinds of node
 * @author nighca<nighca@live.cn>
 */

var spec = require('./spec');

var util = require('./util');

var array = Array.prototype;

// TEXT_NODE
var printTextNode = function(node, opt){
    return opt['no-format'] ?
        node.textContent :
        node.textContent.replace(/[\s\n\r]+/g, ' ');
};

// COMMENT_NODE
var printCommentNode = function(node, opt){
    return '<!--' + node.textContent + '-->';
};

// CDATA_SECTION_NODE
var printCDATASectionNode = function(node, opt){
    return '<![CDATA[' + node.textContent + ']]>';
};

// DOCUMENT_TYPE_NODE
var printDocumentTypeNode = function(node, opt){
    if(!node.publicId && !node.systemId){
        return '<!DOCTYPE ' + node.name + '>';
    }

    var output = '<!DOCTYPE ' + node.name;

    if(node.publicId){
        output += ' PUBLIC';
        output += ' "' + node.publicId + '"';
    }else{
        output += ' SYSTEM';
    }

    if(node.systemId){
        output += ' "' + node.systemId + '"';
    }

    output += '>';

    return output;
};

// DOCUMENT_NODE
var printDocumentNode = function(node, opt){
    return array.map.call(node.childNodes, function(childNode){
        return print(childNode, opt);
    }).filter(function(content){
        return content.trim();
    }).join('\n');
};

// ELEMENT_NODE
var printElementNode = require('./print-element');

// general print
var print = function(node, opt){

    // default options
    opt = util.extend({
        // size of indent
        'indent-size': 4,
        // char of indent ( space / tab )
        'indent-char': 'space',
        // max char num in one line
        'max-char': 80,
        // tags whose content should not be formatted
        'no-format-tag': spec.tagTypeMap.structural,
        // no format
        'no-format': false,
        // tags whose content should be inline
        'inline-tag': spec.tagTypeMap.inline,
        // special formatters { tagName ( script / style ) : formatter }
        'formatter': {},
        // hide value of boolean attribute or not ( 'remove' / 'preserve' )
        'bool-attribute-value': 'remove',
        // current level
        'level': 0
    }, opt);

    var typeMap = spec.nodeType;

    var output;

    switch(node.nodeType){

        case typeMap.TEXT_NODE:
            output = printTextNode(node, opt);
            break;

        case typeMap.COMMENT_NODE:
            output = printCommentNode(node, opt);
            break;

        case typeMap.CDATA_SECTION_NODE:
            output = printCDATASectionNode(node, opt);
            break;

        case typeMap.DOCUMENT_TYPE_NODE:
            output = printDocumentTypeNode(node, opt);
            break;

        case typeMap.DOCUMENT_NODE:
            output = printDocumentNode(node, opt);
            break;

        case typeMap.ELEMENT_NODE:
            output = printElementNode(node, opt);
            break;

        default:
            output = '';
    }

    return output;

};

module.exports = print;