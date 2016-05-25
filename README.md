deepstream.io-msg-kafka
===================

[deepstream](http://deepstream.io) message connector for [Apache Kafka](http://kafka.apache.org/)
[![Build Status](https://travis-ci.org/deepstreamIO/deepstream.io-msg-kafka.svg?branch=master)](https://travis-ci.org/deepstreamIO/deepstream.io-msg-kafka)
[![Coverage Status](https://coveralls.io/repos/github/deepstreamIO/deepstream.io-msg-kafka/badge.svg?branch=master)](https://coveralls.io/github/deepstreamIO/deepstream.io-msg-kafka?branch=master)
[![npm](https://img.shields.io/npm/v/deepstream.io-msg-kafka.svg)](https://www.npmjs.com/package/deepstream.io-msg-kafka)
[![Dependency Status](https://david-dm.org/deepstreamIO/deepstream.io-msg-kafka.svg)](https://david-dm.org/deepstreamIO/deepstream.io-msg-kafka)
[![devDependency Status](https://david-dm.org/deepstreamIO/deepstream.io-msg-kafka/dev-status.svg)](https://david-dm.org/deepstreamIO/deepstream.io-msg-kafka#info=devDependencies)

This connector uses [the npm kafka-node package](https://www.npmjs.com/package/kafka-node).
Please have a look there for detailed config options.

##Basic Setup

```javascript
const Deepstream = require('deepstream.io');
const KafkaMessageConnector = require('deepstream.io-msg-kafka');
const server = new Deepstream();

server.set('messageConnector', new KafkaMessageConnector({
  connectionString: 'localhost:2181'
}));

server.start();
```
