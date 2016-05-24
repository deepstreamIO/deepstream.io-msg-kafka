'use strict';

const EventEmitter = require('events').EventEmitter;
const pckg = require('../package.json');
const kafka = require('kafka-node');
const kafkaErrors = require('kafka-node/lib/errors');


/**
 * A [deepstream](http://deepstream.io) message connector class
 * for Kafka.
 *
 * @extends EventEmitter
 */
class KafkaConnector extends EventEmitter {
  /**
   * @param {Object} config Kafka connection configuration.
   */
  constructor(config) {
    super();

    this.name = pckg.name;
    this.version = pckg.version;

    this.isReady = false;
    this._topics = [];

    this._validateConfig(config);
    this._clientId = config.clientId || (Math.random() * 1e32).toString(36);

    this._client = new kafka.Client(config.connectionString);

    this._producer = new kafka.Producer(this._client);
    this._producer.on('ready', () => {
      this.isReady = true;
      this.emit('ready');
    });
    this._producer.on('error', this._onError.bind(this));

    this._consumer = new kafka.Consumer(this._client, []);
    this._consumer.on('message', this._onMessage.bind(this));
    this._consumer.on('error', this._onError.bind(this));
    this._consumer.on('offsetOutOfRange', this._onError.bind(this));
  }

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
  unsubscribe(topic, callback) {
    if (this.listenerCount(topic)) {
      this.removeListener(topic, callback);
      return;
    }

    this._consumer.removeTopics([topic], (err, removed) => {
      if (err) {
        this._onError(err);
      }
      if (removed) {
        this.removeListener(topic, callback);
      }
    });
  }

  /**
   * Adds a function as a listener for a topic.
   *
   * If the topic doesn't exist to be added, it will be created, then
   * added.
   *
   * @param   {String}   topic
   * @param   {Function} callback
   *
   * @public
   * @returns {void}
   */
  subscribe(topic, callback) {
    if (this.listenerCount(topic)) {
      this.on(topic, callback);
      return;
    }

    this._addTopic(topic, (err, added) => {
      if (err) {
        this._onError(err);
      }
      if (added) {
        this.on(topic, callback);
      }
    });
  }

  /**
   * Publishes a deepstream message on a topic
   *
   * Given a deepstream message of:
   * {
   *   topic: 'R',
   *   action: 'P',
   *   data: ['user-54jcvew34', 32, 'zip', 'SE34JN']
   * }
   *
   * a clientId 75783 and a topic 'topic1', it publishes the following payload:
   *
   * {
   *   topic: "topic1",
   *   messages: "{
   *     \"data\": {
   *       \"topic\":\"R\",
   *       \"action\":\"P\",
   *       \"data\":[\"user-54jcvew34\", 32, \"zip\", \"SE34JN\"]
   *     },
   *     \"_s\":75783
   *   }"
   * }
   *
   * @param   {String}   topic
   * @param   {Object}   message
   *
   * @public
   * @returns {void}
   */
  publish(topic, message) {
    const payload = {
      topic: topic,
      messages: JSON.stringify({
        data: message,
        _s: this._clientId
      })
    }

    this._send(payload, (err) => {
      if (err) {
        this._onError(err);
      }
    })
  }

  /**
   * Callback for incoming messages.
   *
   * Parses the message, removes _s (the sender Id) and emits if not sent from
   * the same clientId.
   *
   * @param   {object}   message
   *
   * @private
   * @returns {void}
   */
  _onMessage(message) {
    var parsedMessage;

    try {
      parsedMessage = JSON.parse(message.value.toString('utf-8'));
    } catch (err) {
      this.emit('error', `message parse error ${err}`);
    }

    if (parsedMessage._s === this._clientId) {
      return;
    }

    delete parsedMessage._s;

    this.emit(message.topic, parsedMessage.data);
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
  _hasNoListeners(topic) {
    return this.listenerCount(topic) === 0;
  }

  /**
   * Generic error callback.
   *
   * @param   {string}   err
   *
   * @returns {void}
   */
  _onError(err) {
    this.emit(`error`, `Kafka error: ${err}`);
  }

  /**
   * Tries to add a topic to the consumer, creates it if
   * it doesn't exist, then adds it.
   *
   * @param   {String}   topic
   * @param   {Function} callback
   *
   * @private
   * @returns {void}
   */
  _addTopic(topic, callback) {
    const autoCreateCallback = this._createTopicCallback(topic, callback, () => {
      this._consumer.addTopics([topic], callback);
    });

    this._consumer.addTopics([topic], autoCreateCallback);
  }

  /**
   * Tries to send a topic, creates it if it doesn't exist, then
   * sends it.
   *
   * @param   {Object}   payload
   * @param   {Function} callback
   *
   * @private
   * @returns {void}
   */
  _send(payload, callback) {
    const autoCreateCallback = this._createTopicCallback(payload.topic, callback, () => {
      this._producer.send([payload], callback);
    });

    this._producer.send([payload], autoCreateCallback);
  }

  /**
   * Creates a callback function that catches TopicsNotExistError, creates a new
   * topic and calls retryCallback.
   *
   * @param   {String}   topic
   * @param   {Function} callback
   * @param   {Function} retryCallback
   *
   * @private
   * @returns {Function}
   */
  _createTopicCallback(topic, callback, retryCallback) {
    return (err, arg) => {
      if (err) {
        if(err instanceof kafkaErrors.TopicsNotExistError) {
          this._producer.createTopics([topic], false, (err) => {
            if(err) {
              // Error creating topic:
              callback(err);
              return;
            }
            // Topic created, retry:
            retryCallback();
          });
          return;
        }
        // Something else went wrong:
        callback(err);
      }
      // Topic exists, no problem:
      callback(null, arg);
    }
  }

  /**
   * Checks that the config has a connectionString key.
   *
   * @param   {Object} config
   *
   * @private
   * @returns {void}
   */
  _validateConfig(config) {
    if (typeof config.connectionString !== 'string') {
      throw new Error('Missing config parameter "connectionString"');
    }
  }
}

module.exports = KafkaConnector;
