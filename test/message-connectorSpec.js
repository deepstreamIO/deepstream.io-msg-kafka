"use strict";
/* global describe, it, expect, jasmine */

const MessageConnector = require('../src/message-connector');
const EventEmitter = require('events').EventEmitter;
const connectionData = require('./connection-data');


describe('the message connector has the correct structure', () => {
  let messageConnector;

  it('creates a messageConnector', (done) => {
    messageConnector = new MessageConnector(connectionData);

    expect(messageConnector.isReady).toBe(false);

    messageConnector.once('error', (err) => {
      fail();
      done();
    });

    messageConnector.once('ready', done);
  });

  it('implements the messageConnector interface', () => {
    expect(typeof messageConnector.subscribe).toBe('function');
    expect(typeof messageConnector.unsubscribe).toBe('function');
    expect(typeof messageConnector.publish).toBe('function');
    expect(typeof messageConnector.isReady).toBe('boolean');
    expect(typeof messageConnector.name).toBe('string');
    expect(typeof messageConnector.version).toBe('string');

    expect(messageConnector instanceof EventEmitter).toBe(true);
  });

  it('throws an error when required settings are missing', () => {
    expect(() => {
      new MessageConnector('gibberish');
    }).toThrow();
  });
});
