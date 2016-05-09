var EventEmitter = require( 'events' ).EventEmitter,
	util = require( 'util' ),
	pckg = require( '../package.json' ),
	kafka = require('kafka-node');

/**
 *
 * @param {Object} config Connection configuration.
 *
 * @constructor
 */
var KafkaConnector = function( config ) {

	this.name = pckg.name;
	this.version = pckg.version;

	this.isReady = false;

	this._validateConfig( config );
    this._clientId = config.clientId || ( Math.random() * 10000000000000000000 ).toString( 36 );

    this._client = new kafka.Client( config.connectionString );
    this._producer = new kafka.Producer( this._client );
    this._consumer = new kafka.Consumer( this._client, [] );

    this._producer.on( 'ready', this._onReady.bind( this ) );
    this._producer.on( 'error', this._onError.bind( this ) );

	this._consumer.on( 'message', this._onMessage.bind( this ) );
	this._consumer.on( 'error', this._onError.bind( this ) );
	this._consumer.on( 'offsetOutOfRange', this._onError.bind( this ) );

}

util.inherits( KafkaConnector, EventEmitter );

/**
 * Unsubscribes a function as a listener for a topic. 
 *
 * Often it makes sense to make only one subscription per topic to the messaging
 * middleware and use an eventemitter to notify multiple subscribers of updates
 * for the same topic. This however does mean that the message-connector
 * needs to keep track of the subscribers and unsubscribe from the messaging middleware
 * if all subscribers have unsubscribed
 * 
 * @param   {String}   topic
 * @param   {Function} callback
 *
 * @public
 * @returns {void}
 */
KafkaConnector.prototype.unsubscribe = function( topic, callback ) {
	this.removeListener( topic, callback );
	if ( this._hasNoListeners( topic ) ) {
	    this._consumer.removeTopics([topic], function( err, removed ) {
        if ( err ) {
            this._onError( err );
        }
    });
	}
}

/**
 * Adds a function as a listener for a topic.
 *
 * It might make sense to only send the subscription to the messaging
 * middleware for the first subscriber for a topic and multiplex incoming
 * messages using an eventemitter
 *
 * @param   {String}   topic
 * @param   {Function} callback
 *
 * @public
 * @returns {void}
 */
KafkaConnector.prototype.subscribe = function( topic, callback ) {

    if ( this._hasNoListeners( topic ) ) {
        this._consumer.addTopics([topic], function( err, added ) {
            if ( err ) {
                this._onError( err );
            }
        });
    }
    this.on( topic, callback );
}

/**
 * Publishes a deepstream message on a topic
 *
 * Given a deepstream message of:
 * {
 * 		topic: 'R',
 * 		action: 'P',
 * 		data: [ 'user-54jcvew34', 32, 'zip', 'SE34JN' ]
 * }
 *
 * and a clientId of 75783, it publishes the following payload:
 *
 * {
 *      topic: 'topic1',
 *      messages: '{
 *          "data": {
 *              "topic":"R",
 *              "action":"P",
 *              "data":["user-54jcvew34",32,"zip","SE34JN"]},
 *              "_s":75783
 *      }'
 * }
 *
 * @param   {String}   topic
 * @param   {Object}   message
 *
 * @public
 * @returns {void}
 */
KafkaConnector.prototype.publish = function( topic, message ) {
	var payload = {
        topic: topic,
        messages: JSON.stringify({
            data: message,
            _s: this._clientId
        })
    }
    this._producer.send([payload], function(err, data) {
        if ( err ) {
            this._onError( err );
        }
    });
}

/**
 * Callback for incoming messages.
 *
 * Parses the message and emits if not sent from the same clientId.
 *
 * @param   {object}   message
 *
 * @public
 * @returns {void}
 */
KafkaConnector.prototype._onMessage = function( message ) {
    var parsedMessage;

	try{
		parsedMessage = JSON.parse( message.value.toString( 'utf-8' )  );
	} catch( e ) {
		this.emit( 'error', 'message parse error ' + e.toString() );
	}

	if( parsedMessage._s === this._clientId ) {
		return;
	}
	delete parsedMessage._s;
    this.emit( message.topic, parsedMessage.data );
}

KafkaConnector.prototype._onReady = function() {
    this.isReady = true;
    this.emit('ready');
}

KafkaConnector.prototype._hasNoListeners = function( topic ) {
    return this.listenerCount( topic ) == 0;
}

KafkaConnector.prototype._onError = function( err ) {
    this.emit( 'error', 'Kafka error: ' + err );
}

/**
 * Check that the configuration contains all mandatory parameters
 *
 * @param   {Object} config
 *
 * @private
 * @returns {void}
 */
KafkaConnector.prototype._validateConfig = function( config ) {
	if( typeof config.connectionString !== 'string' ) {
		throw new Error( 'Missing config parameter "connectionString"' );
    }
};

module.exports = KafkaConnector;