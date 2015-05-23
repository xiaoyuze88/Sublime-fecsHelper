/**
 * @file EDP配置功能包主模块
 * @author errorrik[errorrik@gmail.com]
 *         leeight[leeight@gmail.com]
 */

var edpConfig = require( '../index' );

describe( 'API: set and get', function () {
    it('default', function(){
        edpConfig.set( 'test.name', 'erik' );
        edpConfig.set( 'test.age', 18 );

        expect( edpConfig.get( 'test.name' ) ).toBe( 'erik' );
        expect( edpConfig.get( 'test.age' ) ).toBe( 18 );
        expect( edpConfig.get( 'unknown' ) ).toBe( undefined );
        expect( typeof edpConfig.all() ).toBe( 'object' );
        expect( edpConfig.all()[ 'test.name' ] ).toBe( 'erik' );
        expect( edpConfig.all()[ 'test.age' ] ).toBe( 18 );
    });
});
