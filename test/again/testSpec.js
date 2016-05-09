/* global describe, it, expect, jasmine */
var A = require('../tester.js')

describe( 'Messages are send between multiple instances', function(){
	var a;

	it( 'creates connectorA', function( ){
        a = new A();
		expect( a.isReady ).toBe( false );
		a.on( 'ready', done );
		expect( a.isReady ).toBe( true );
	});
});

describe( 'the message connector has the correct structure', function(){

	var messageConnector;

	it( 'creates a messageConnector', function( done ){
		a = new A();
		expect( a.isReady ).toBe( false );
		a.on( 'ready', done );
		expect( a.isReady ).toBe( true );
	});

	it( 'implements the messageConnector interface', function() {
		expect( typeof messageConnector.subscribe ).toBe( 'function' );
		expect( typeof messageConnector.unsubscribe ).toBe( 'function' );
		expect( typeof messageConnector.publish ).toBe( 'function' );
		expect( typeof messageConnector.isReady ).toBe( 'boolean' );
		expect( typeof messageConnector.name ).toBe( 'string' );
		expect( typeof messageConnector.version ).toBe( 'string' );
		expect( messageConnector instanceof EventEmitter ).toBe( true );
	});

	it( 'throws an error when required settings are missing', function() {
		expect(function(){ new MessageConnector( 'gibberish' ); }).toThrow();
	});
});
