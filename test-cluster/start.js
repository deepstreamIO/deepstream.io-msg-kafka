const connectionData = require('../test/connection-data');
const KafkaConnector = require( '../src/message-connector' );

const deepstreamClient = require( 'deepstream.io-client-js' );
const Deepstream = require( 'deepstream.io' );
var server1, server2, client1, client2;

function setupDeepstreamServer( port, onStart ) {
	const deepstream = new Deepstream();
	deepstream.set( 'messageConnector', new KafkaConnector(connectionData) );
	deepstream.set( 'tcpPort', port );
	deepstream.set( 'port', port - 1 );
	deepstream.set( 'webServerEnabled', false );
	deepstream.on( 'started', onStart.bind( null, deepstream ) );
	setTimeout( function() {
		deepstream.stop();
	}, 5000 );
	deepstream.start();
};

function setupClient1() {
	client1 = deepstreamClient( 'localhost:6021' ).login( {}, function( isLoggedIn ) {
		console.log( 'Client1 Logged in' );
		client1.event.subscribe( 'anEvent', function( data ) {
			console.log( 'Event occured with data:', data )
			client1.close();
		} );
	} );
}

function setupClient2() {
	client2 = deepstreamClient( 'localhost:6031' ).login( {}, function( isLoggedIn ) {
		console.log( 'Client2 Logged in' );
		client2.event.emit( 'anEvent', 'A String Associated With Event' );
		client2.close();
	} );
}

server1 = setupDeepstreamServer( 6021, setupClient1 );
server2 = setupDeepstreamServer( 6031, setupClient2 );
