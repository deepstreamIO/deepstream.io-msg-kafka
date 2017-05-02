deepstream.io-msg-kafka
===================

[![Greenkeeper badge](https://badges.greenkeeper.io/deepstreamIO/deepstream.io-msg-kafka.svg)](https://greenkeeper.io/)

[deepstream](http://deepstream.io) message connector for [Apache Kafka](http://kafka.apache.org/)

This connector uses [the npm kafka-node package](https://www.npmjs.com/package/kafka-node).
Please have a look there for detailed config options.

##Basic Setup

```javascript
const Deepstream = require('deepstream.io');
const KafkaMessageConnector = require('deepstream.io-msg-kafka');  // Currently there is no npm package. Coming soon!
const server = new Deepstream();

server.set('messageConnector', new KafkaMessageConnector({
  connectionString: 'localhost:2181'
}));

server.start();
```
