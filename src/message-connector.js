var EventEmitter = require( 'events' ).EventEmitter,
	util = require( 'util' ),
	pckg = require( '../package.json' ),
	kafka = require( 'kafka-node' );

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
	this._topics = [];

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
	var self = this;
	if ( this._hasNoListeners( topic ) ) {
		this._consumer.removeTopics( [ topic ], function( err, removed ) {
			if ( err ) {
				self._onError( err );
			}
		} );
	} else {
		this.removeListener( topic, callback );
	}
}

/**
 * Adds a function as a listener for a topic.
 *
 * If the topic doesn't exist to be added, it will
 * be created, then added.
 *
 * @param   {String}   topic
 * @param   {Function} callback
 *
 * @public
 * @returns {void}
 */
KafkaConnector.prototype.subscribe = function( topic, callback ) {
	var self = this;
	if ( this._hasNoListeners( topic ) ) {

		this._consumer.addTopics( [ topic ], function( errAdding, added ) {
			if ( errAdding ) {

				// When adding a topic to a consumer and the topic
				// does not exist, we'll get a 'The topic(s) [topic] do not exist'
				// error. This block creates the topic asynchronously 
				// then calls subscribe again.
				var matchingErrMsg = 'The topic(s) ' + topic + ' do not exist';
				if ( errAdding.message.indexOf( matchingErrMsg ) > -1 ) {

					self._producer.createTopics( [ topic ], function( errCreating, data ) {
						if ( errCreating ) {
							self._onError( errCreating );
						}
						if ( data ) {
							self.subscribe( topic, callback );
						}
					} );

				} else {
					// something else went wrong
					self._onError( errAdding );
				}
			}
			if ( added ) {
				self.on( topic, callback );
				return;
			}
		} );
	} else {
		this.on( topic, callback );
	}
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
 * a clientId 75783 and a topic 'topic1', it publishes the following payload:
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
	var self = this;
	var payload = {
		topic: topic,
		messages: JSON.stringify( {
			data: message,
			_s: this._clientId
		} )
	}
	this._producer.send( [ payload ], function( err, data ) {
		if ( err ) {
			// If the topic doesn't exist when sending a payload we'll get a 
			// LeaderNotAvailable error. This block creates the topic async 
			// then sends the payload.
			if ( err.indexOf( 'LeaderNotAvailable' ) > -1 ) {
				self._producer.createTopics( [ topic ], function( errCreating, data ) {
					if ( errCreating ) {
						self._onError( errCreating );
					}
					if ( data ) {
						self._producer.send( [ payload ], function( _err, data ) {
							if ( _err ) {
								self._onError( _err );
							}
						} );
					}
				} );
			} else {
				//something else went wrong
				self._onError( err );
			}
		}
	} );
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

	try {
		parsedMessage = JSON.parse( message.value.toString( 'utf-8' ) );
	} catch ( e ) {
		this.emit( 'error', 'message parse error ' + e.toString() );
	}

	if ( parsedMessage._s === this._clientId ) {
		return;
	}
	delete parsedMessage._s;
	this.emit( message.topic, parsedMessage.data );
}

KafkaConnector.prototype._onReady = function() {
	this.isReady = true;
	this.emit( 'ready' );
}

/**
 * Checks if this connector has any subscribers to [topic],
 * returns true if it does.
 *
 * @param   {string} topic
 *
 * @private
 * @returns {bool}
 */
KafkaConnector.prototype._hasNoListeners = function( topic ) {
	return this.listenerCount( topic ) == 0;
}

/**
 * Generic error callback.
 *
 * @param   {string}   err
 *
 * @returns {void}
 */
KafkaConnector.prototype._onError = function( err ) {
	this.emit( 'error', 'Kafka error: ' + err );
}

/**
 * Checks that the config has a connectionString key.
 *
 * @param   {Object} config
 *
 * @private
 * @returns {void}
 */
KafkaConnector.prototype._validateConfig = function( config ) {
	if ( typeof config.connectionString !== 'string' ) {
		throw new Error( 'Missing config parameter "connectionString"' );
	}
}

module.exports = KafkaConnector;