"use strict"

/* global describe, it, expect, jasmine */
const kafka = require('kafka-node')
const MessageConnector = require( '../src/message-connector' )
const expect = require('chai').expect
const sinon = require( 'sinon' )
const sinonChai = require("sinon-chai")
require('chai').use(sinonChai)
const EventEmitter = require( 'events' ).EventEmitter
const connectionData = require('./connection-data')
const MESSAGE_TIME = 1000

describe('Messages are sent between multiple instances', () => {
  let connectorA
  let connectorB
  let connectorC

  let topic = (Math.random() * 1e32).toString(36)

  let callback_A1 = sinon.spy()
  let callback_B1 = sinon.spy()
  let callback_C1 = sinon.spy()

  it('creates connectorA', (done) => {
    connectorA = new MessageConnector(connectionData)
    expect(connectorA.isReady).to.equal(false)
    connectorA.once('ready', done)
    connectorA.once('error', done)
  })

  it('creates connectorB', (done) => {
    connectorB = new MessageConnector(connectionData)
    expect(connectorB.isReady).to.equal(false)
    connectorB.once('ready', done)
  })

  it('creates connectorC', (done) => {
    connectorC = new MessageConnector(connectionData)
    expect(connectorC.isReady).to.equal(false)
    connectorC.once('ready', done)
  })

  it('the connectors are ready', () => {
    expect(connectorA.isReady).to.equal(true)
    expect(connectorB.isReady).to.equal(true)
    expect(connectorC.isReady).to.equal(true)
  })

  it('subscribes to a topic', (done) => {
    connectorA.subscribe(topic, callback_A1)
    connectorB.subscribe(topic, callback_B1)
    connectorC.subscribe(topic, callback_C1)

    expect(callback_A1).to.not.have.been.called
    expect(callback_B1).to.not.have.been.called
    expect(callback_C1).to.not.have.been.called

    setTimeout(done, MESSAGE_TIME)
  })

  it('connectorB sends a message', (done) => {
    connectorB.publish(topic, {
      some: 'data'
    })

    setTimeout(done, MESSAGE_TIME)
  })

  it('connectorA and connectorC have received the message', () => {
    expect(callback_A1).to.have.been.calledWith({
      some: 'data'
    })

    expect(callback_B1).to.not.have.been.called

    expect(callback_C1).to.have.been.calledWith({
      some: 'data'
    })
  })

  it('connectorC sends a message', (done) => {
    connectorC.publish(topic, {
      other: 'value'
    })

    setTimeout(done, MESSAGE_TIME)
  })

  it('connectorA and connectorB have received the message', () => {
    expect(callback_A1).to.have.been.calledWith({
      other: 'value'
    })

    expect(callback_B1).to.have.been.calledWith({
      other: 'value'
    })

    expect(callback_C1).to.have.been.calledWith({
      some: 'data'
    })
  })

  it('connectorA and connectorC send messages at the same time', (done) => {
    connectorA.publish(topic, {
      val: 'x'
    })

    connectorC.publish(topic, {
      val: 'y'
    })

    setTimeout(done, MESSAGE_TIME)
  })

  it('connectorA and connectorB have received the message', () => {
    expect(callback_A1).to.have.been.calledWith({
      val: 'y'
    })

    expect(callback_B1).to.have.been.calledWith({
      val: 'x'
    })

    expect(callback_B1).to.have.been.calledWith({
      val: 'y'
    })

    expect(callback_C1).to.have.been.calledWith({
      val: 'x'
    })
  })

  it('connectorB unsubscribes', () => {
    connectorB.unsubscribe(topic, callback_B1)
  })

  it('connectorA sends a message', (done) => {
    connectorA.publish(topic, {
      notFor: 'B'
    })

    setTimeout(done, MESSAGE_TIME)
  })

  it('only connector c has received the message', () => {
    expect(callback_A1).not.to.have.been.calledWith({
      notFor: 'B'
    })

    expect(callback_B1).not.to.have.been.calledWith({
      notFor: 'B'
    })

    expect(callback_C1).to.have.been.calledWith({
      notFor: 'B'
    })
  })
})
