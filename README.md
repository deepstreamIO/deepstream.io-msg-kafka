deepstream.io-msg-kafka 
===================

[deepstream](http://deepstream.io) message connector for [Apache Kafka](http://kafka.apache.org/)

This connector uses [the npm kafka-node package](https://www.npmjs.com/package/kafka-node). Please have a look there for detailed config options.

##Basic Setup
```javascript
var Deepstream = require( 'deepstream.io' ),
    KafkaMessageConnector = require( 'deepstream.io-msg-kafka' ), //currently no npm package, coming soon
    server = new Deepstream();

server.set( 'messageConnector', new KafkaMessageConnector( { 
  connectionString: 'localhost:6709'
}));

server.start();
```
