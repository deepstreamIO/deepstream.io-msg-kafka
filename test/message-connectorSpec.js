"use strict"

/* global describe, it, expect, jasmine */
const kafka = require('kafka-node')
const MessageConnector = require( '../src/message-connector' )
const expect = require('chai').expect
const EventEmitter = require( 'events' ).EventEmitter
const connectionData = require('./connection-data')
const MESSAGE_TIME = 1000

describe('the message connector has the correct structure', () => {
  let messageConnector

  it('creates a messageConnector', (done) => {
    messageConnector = new MessageConnector(connectionData)
    expect(messageConnector.isReady).to.equal(false)

    messageConnector.once('error', done )
    messageConnector.once('ready', done)
  })

  it('implements the messageConnector interface', () => {
    expect(typeof messageConnector.subscribe).to.equal('function')
    expect(typeof messageConnector.unsubscribe).to.equal('function')
    expect(typeof messageConnector.publish).to.equal('function')
    expect(typeof messageConnector.isReady).to.equal('boolean')
    expect(typeof messageConnector.name).to.equal('string')
    expect(typeof messageConnector.version).to.equal('string')

    expect(messageConnector instanceof EventEmitter).to.equal(true)
  })

  it('throws an error when required settings are missing', () => {
    expect(() => {
      new MessageConnector('gibberish')
    }).to.throw()
  })
})
