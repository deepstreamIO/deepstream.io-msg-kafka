var events = require( 'events' ),
	util = require( 'util' ),
	pckg = require( '../package.json' );

/**
 * MessageConnectors allow deepstream instances to communicate with each other.
 *
 * Messaging uses a publish-subscribe pattern. A publisher can broadcast
 * a message on a topic that zero or more subscribers listen to
 *
 * Some things that might be worth taking into account when building a new message connector
 *
 * - Deepstream only uses a relatively small number of topics (record, rpc and event plus a private topic),
 *   but will send and receive large numbers of messages on each of them. If this leads to performance problems
 *   it might make sense for the message connector to do some custom sub-routing, e.g. based on record namespaces etc.
 *
 * - Messages are passed to publish() as javascript objects and expected to be returned
 *   by the receiver as such. So its up to the message connector to serialize and deserialize them, e.g. as JSON or MsgPack
 *
 * - The message connector acts as both publisher and subscriber for each topic. It should however not receive its
 *   own messages. Some messaging middleware supports this, but for others it might be necessary to add an unique
 *   sender-id to outgoing messages and filter out incoming messages that have the same id
 *
 * - Messaging is the backbone of deepstreams scaling / clustering capabilites. So this needs to be reliable... and fast!
 * 
 * @param {Object} config Connection configuration.
 *
 * @constructor
 */
var MessageConnector = function( config ) {
	this.isReady = false;
	this.name = pckg.name;
	this.version = pckg.version;

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
	
};

module.exports = MessageConnector;