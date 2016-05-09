var EventEmitter = require( 'events' ).EventEmitter,
	util = require( 'util' ),
	pckg = require( '../package.json' ),
	Connection = require( './connection.js' ),
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
    this._clientId = config.clientId || ( Math.random() * 10000000000000000000 ).toString( 36 );
    this._client = new kafka.Client( config.connectionString );
    this._producer = new kafka.Producer( this._client );
    this._consumer = new kafka.Consumer( this._client, [] );

    this._producer.on('ready', this._onReady.bind( this ));

	this._consumer.on('message', this._onMessage.bind( this ));

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
        var _clientId = this._clientId;

        this._consumer.addTopics([topic], function( err, added ) {
            console.log(_clientId + ': subscribing to topic: ' + topic);
            if ( err ) {
                this._onError( err );
            }
        });
    }
    this.on( topic, callback );
}

/**
 * Publishes a message on a topic
 *
 * Please note: message is a javascript object. Its up to the client
 * to serialize it. message will look somewhat like this:
 *
 * {
 * 		topic: 'R',
 * 		action: 'P',
 * 		data: [ 'user-54jcvew34', 32, 'zip', 'SE34JN' ]
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
    var _clientId = this._clientId;
    this._producer.send([payload], function(err, data) {
        console.log(_clientId + ': publishing topic: ' + topic + ' message: ' + message)
        if ( err ) {
            this._onError( err );
        }
    });
}

KafkaConnector.prototype._onMessage = function( message ) {
    var rawMsg = JSON.parse(message.value);
    if ( rawMsg._s != this._clientId ) {
        console.log(this._clientId + ': receiving topic: ' + message.topic + ' message: ' + rawMsg.data);
        this.emit(message.topic, rawMsg.data);
    }
}

KafkaConnector.prototype._onReady = function() {
    this.isReady = true;
    console.log('Emitting ready');
    this.emit('ready');
}

KafkaConnector.prototype._hasNoListeners = function( topic ) {
    return this.listenerCount( topic ) == 0;
}

KafkaConnector.prototype._onError = function( err ) {
    this.emit( 'error', 'Kafka error: ' + err );
}

module.exports = KafkaConnector;