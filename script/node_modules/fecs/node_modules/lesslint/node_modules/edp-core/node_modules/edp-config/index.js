/**
 * @file EDP配置功能包主模块
 * @author errorrik[errorrik@gmail.com]
 */

var fs = require( 'fs' );

/**
 * 配置文件名
 * 
 * @const
 * @ignore
 * @type {string}
 */
var CONFIG_FILE = '.edprc';

/**
 * 获取配置文件存储的目录
 * 
 * @ignore
 * @return {string}
 */
function getConfigHome() {
    return process.env[
        require( 'os' ).platform() === 'win32' 
            ? 'APPDATA'
            : 'HOME'
    ];
}

/**
 * 获取配置文件
 * 
 * @ignore
 * @return {string}
 */
function getConfigFile() {
    return require( 'path' ).resolve(
        getConfigHome(),
        CONFIG_FILE 
    );
}

/**
 * 获取所有配置项
 * 
 * @return {Object}
 */
exports.all = function () {
    var config = {};
    var configFile = getConfigFile();
    
    if ( fs.existsSync( configFile ) ) {
        config = JSON.parse( fs.readFileSync( configFile, 'UTF-8' ) );
    }

    return config;
};

/**
 * 获取配置项的值
 * 
 * @param {string} name 配置项名称
 * @return {string}
 */
exports.get = function ( name ) {
    return exports.all()[ name ];
};

/**
 * 设置配置项的值
 * 
 * @param {string} name 配置项名称
 * @param {string} value 配置项的值
 */
exports.set = function ( name, value ) {
    var config = exports.all();
    var configFile = getConfigFile();

    config[ name ] = value;
    fs.writeFileSync(
        configFile, 
        JSON.stringify( config, null, 4 ),
        'UTF-8'
    );
};

/**
 * @ignore
 */
// exports.cli = require( './cli/config' ).cli;
