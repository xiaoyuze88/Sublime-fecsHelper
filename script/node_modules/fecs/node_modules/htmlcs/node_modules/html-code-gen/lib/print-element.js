/**
 * @file print method for element
 * @author nighca<nighca@live.cn>
 */

var util = require('./util');

var spec = require('./spec');

var booleanAttributes = spec.booleanAttributes,
    tagTypeMap = spec.tagTypeMap;

var array = Array.prototype;

var indent = function(opt){
    return util.indent(opt.level, opt['indent-char'], opt['indent-size']);
};

var printAttribute = function(attribute, opt){
    // boolean attribute
    if(util.isIn(attribute.name, booleanAttributes)){
        if(
            opt['bool-attribute-value'] === 'remove' ||
            !attribute.value
        ){
            return attribute.name;
        }
    }

    return util.format('${name}="${value}"', attribute);
};

var printAttributes = function(attributes, opt){
    if(!attributes) return '';

    return array.map.call(attributes, function(attribute){
        return printAttribute(attribute, opt);
    }).join(' ');
};

var printVoidElementNode = function(info, node, condition, opt){
    return util.format('<${tag}${attributes}>', info);
};

var packageElement = function(info, content){
    return (
        content ?
        [
            info.start,
            content,
            info.end
        ] :
        [
            info.start,
            info.end
        ]
    ).join(info.sep);
};

var removeBlankLineAround = function(content){
    return content.replace(/(^([\s\t]*\n)+)|((\n[\s\t]*)+$)/g, '');
};

var printRawTextElementNode = function(info, node, condition, opt){
    var formatter = opt.formatter[info.tag] || removeBlankLineAround;

    var indentContent = function (content) {
        opt.level++;

        return content.split('\n').map(function (line) {
            return line ? (indent(opt) + line) : line;
        }).join('\n');
    };

    var content = node.childNodes.length ?
        formatter(node.childNodes[0].textContent, node, opt, {
            indent: indentContent,
            trim: removeBlankLineAround
        }) :
        '';

    return packageElement(info, content);
};

var printNormalElementNode = function(info, node, condition, opt){
    var content = (
        condition.newLine ?
        info.children.filter(function(child){
            return child.trim()
        }).map(function(child){
            return info.innerIndent + child;
        }) :
        info.children
    ).join(info.sep);

    return packageElement(info, content);
};

// format method for general element
var printElementNode = function(node, opt){

    // print method for node
    var print = require('./print');

    var tag = node.tagName.toLowerCase(),
        attributesStr = printAttributes(node.attributes, opt);

    // conditions
    var condition = {
        isVoid: util.isIn(tag, tagTypeMap['void']),
        isHtml: tag === 'html',
        noFormat: opt['no-format'] || util.isIn(tag, opt['no-format-tag']),
        inline: util.isIn(tag, opt['inline-tag']) || !node.childNodes.length,
        isRawText: util.isIn(tag, tagTypeMap['raw-text'])
    };
    condition.newLine = !(condition.noFormat || condition.inline);

    // node info
    var info = {
        indent: indent(opt),
        tag: tag,
        attributes: attributesStr ? (' ' + attributesStr) : ''
    };

    // void elements
    if(condition.isVoid) return printVoidElementNode(info, node, condition, opt);

    // new opt for next-level (child) nodes
    var newOpt = util.extend({}, opt);

    // no-format should be inheritted
    if(condition.noFormat) newOpt['no-format'] = true;

    // increase level
    // do not indent 'head' & 'body' (under 'html')
    if(!condition.isHtml) newOpt.level++;

    // tag start & end
    util.extend(info, {
        start: util.format('<${tag}${attributes}>', info),
        end: (condition.newLine ? info.indent : '') + util.format('</${tag}>', info),
        sep: condition.newLine ? '\n' : '',
        // indent for child nodes
        innerIndent: indent(newOpt)
    });

    // raw text ( 'script' / 'style' )
    if(condition.isRawText) return printRawTextElementNode(info, node, condition, opt);

    // children
    util.extend(info, {
        children: array.map.call(node.childNodes, function(childNode, i){
            return print(childNode, newOpt);
        })
    });

    return printNormalElementNode(info, node, condition, opt);
};

module.exports = printElementNode;