deepstream.io-msg-kafka
===================

[![Greenkeeper badge](https://badges.greenkeeper.io/deepstreamIO/deepstream.io-msg-kafka.svg)](https://greenkeeper.io/)

#### What is Apache Kafka?
Kafka started life as the messaging system that powered LinkedIn. It was open-sourced by the Apache Foundation in 2011 and has since found its way as the message broker of choice into many large enterprise organisations.

At its core, Kafka is a distributed publish/subscribe system that can scale to almost biblical dimensions. It's highly reliable through features like message persistence, buffering, message replication and guaranteed delivery, but can be a bit of a handful to set up and run.

#### Why use Kafka with deepstream?
deepstream can scale horizontally by creating clusters of nodes that communicate with each other via a messagebus. Kafka can be used as such a message bus. It provides the same reliability as AMQP brokers, but is faster and can be extended to a much larger scale. It is the recommended choice for seriously large deepstream deployments with high availability requirements.

#### When not to use Kafka with deepstream?
Kafka is a bit like a Jumbo Jet: Great if you need to fly many people over large distances at high speeds - but a bit much if you just want to pop down to the shop for some groceries. For many small to medium sized deployments, Redis might be a better choice. It doesn't offer the same messaging guarantees, but is faster than Kafka and way easier to set up and run. It also doubles as a cache and persists data to disk, making it the perfect companion for any but the largest deepstream clusters.

#### How to use Kafka with deepstream?
deepstream offers an official plugin to connect to Kafka-clusters. It can be installed via deepstream's Command Line Interface using the `msg` keyword, e.g.

```bash
deepstream install msg kafka
```

If you're using deepstream in Node, you can also install it via [NPM](https://www.npmjs.com/package/deepstream.io-msg-kafka)

#### How to configure the Kafka connector?
You can configure the Kafka connector in the `plugins` section of deepstream's config.yml file (by default either in the `conf` directory or in `/etc/deepstream` on Linux)

```yaml
plugins:
  message:
    name: kafka
    options:
      connectionString: <String>
      clientId: <String>
```
