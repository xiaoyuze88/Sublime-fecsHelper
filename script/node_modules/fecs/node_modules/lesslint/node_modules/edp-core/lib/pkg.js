/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 **************************************************************************/



/**
 * lib/pkg.js ~ 2014/03/07 14:17:36
 * @author leeight(liyubei@baidu.com)
 * @version $Revision$
 * @description
 * 安装npm pkg的功能
 **/
var Deferred = require( './base/Deferred' );

/**
 * @param {string|Array.<string>} pkgs 需要安装的npm pkg的名称.
 * @return {Deferred}
 */
exports.install = function( pkgs ) {
    var d = new Deferred();

    if ( typeof pkgs === 'string' ) {
        pkgs = [ pkgs ];
    }

    var args = [ 'install', '-g' ].concat( pkgs );
    var npm = require( './util' ).spawn( 'npm', args, {
        stdio: 'inherit'
    } );
    npm.on( 'close', function( code ){
        if ( code !== 0 ) {
            d.reject( new Error( code ) );
            return;
        }

        d.resolve();
    });

    return d.promise;
};





















/* vim: set ts=4 sw=4 sts=4 tw=100: */
