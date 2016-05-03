var kafka = require('kafka-node'),
    util = require( 'util' ),
    EventEmitter = require( 'events' ).EventEmitter;

var Connection = function( connectionString, clientId, zkOptions, noAckBatchOptions ) {

    this._clientId = clientId;

    this._client = new kafka.Client(connectionString);
    this._producer = new kafka.Producer(this._client);
    this._consumer = new kafka.Consumer(this._client, []);

    this._producer.on('ready', this._onReady.bind( this ));

    this._consumer.on('message', this._onMessage.bind( this ));

}

util.inherits( Connection, EventEmitter );

Connection.prototype.publish = function( _topic, _message ) {
    var payload = {
        topic: _topic,
        messages: JSON.stringify({
            data: _message,
            _s: this._clientId
        })
    }
    this._producer.send([payload], function(err, data) {
        console.log('Publishing topic:' + payload.topic + ' messages:' + payload.messages);
    });
}

Connection.prototype.subscribe( topic ) {
    //no need for callback, as can just emit the topic and
    //call callback from MessageConnector
}

Connection.prototype._onReady = function() {
    this.isReady = true;
    this.emit('ready');
}

Connection.prototype._onMessage = function( message ) {
    var rawMsg = JSON.parse(message);
    if ( rawMsg.messages._sid != this._clientId ) {
        this.emit('message', rawMsg.messages.data);
    }
}

module.exports = Connection;