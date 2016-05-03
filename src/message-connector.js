var events = require( 'events' ),
	util = require( 'util' ),
	pckg = require( '../package.json' ),
	Connection = require( './connection.js' )

/**
 *
 * @param {Object} config Connection configuration.
 *
 * @constructor
 */
var MessageConnector = function( config ) {
	this.isReady = false;
	this.name = pckg.name;
	this.version = pckg.version;

	this._connection = Connection(config);

};

util.inherits( MessageConnector, events.EventEmitter );

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
MessageConnector.prototype.unsubscribe = function( topic, callback ) {
	
};

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
MessageConnector.prototype.subscribe = function( topic, callback ) {
	
};

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
MessageConnector.prototype.publish = function( topic, message ) {
	if ( this._connection.isReady ) {
	    this._connection.publish(topic, message);
	}
};

module.exports = MessageConnector;