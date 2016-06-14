"use strict"

/**
 * Specify the connection data that will be used in the tests here, e.g.
 *
 * @type {Object}
 */

const kafka_host = process.env.KAFKA_HOST || 'localhost'
const kafka_port = process.env.KAFKA_PORT || 2181

module.exports = {
  connectionString: (kafka_host + ':' + kafka_port),
  clientId: null,
  zkOptions: {},
  noAckBatchOptions: {}
}
