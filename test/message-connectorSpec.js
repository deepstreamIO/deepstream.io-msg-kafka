/* global describe, it, expect, jasmine */

var MessageConnector = require( '../src/message-connector' ),
	EventEmitter = require( 'events' ).EventEmitter,
	connectionData = require( './connection-data' ),
	MESSAGE_TIME = 20;


describe( 'the message connector has the correct structure', function(){

	var messageConnector;

	it( 'creates a messageConnector', function( done ){
		messageConnector = new MessageConnector( connectionData );
		expect( messageConnector.isReady ).toBe( false );
		messageConnector.on( 'error', function( e ){ throw e; });
		messageConnector.on( 'ready', done );
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
