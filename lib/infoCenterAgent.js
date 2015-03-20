'use strict';
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var Requester = require('./requester');
var Responder = require('./responder');
var channelManager = require('./channelManager');
var messageFactory = require('./messageFactory');

function InfoCenterAgent(config) {
  this.doc = {};

  this.announceNamespace = config.announceNamespace;
  this.heartbeatsNamespace = config.heartbeatsNamespace;

  this.announcementProducer = null;
  this.heartbeatResponderEmitter = null;

  // Bind for events
  this._onHeartbeatResponder = this._onHeartbeatResponder.bind(this);
}

util.inherits(InfoCenterAgent, EventEmitter);

var infoCenterAgent = InfoCenterAgent.prototype;

infoCenterAgent.onHeartbeatResponder = null; // Override this with function(responder) {}

infoCenterAgent.start = infoCenterAgent.startBroadcasting = function() {
  if (this.heartbeatResponderEmitter) return; // Already responding to heartbeats

  this.heartbeatResponderEmitter = Responder.createEmitter({
    namespace: this.heartbeatsNamespace
  }).on('responder', this._onHeartbeatResponder);

  this.emit('start');
};

infoCenterAgent.stop = infoCenterAgent.stopBroadcasting = function() {
  if (!this.heartbeatResponderEmitter) return; // Not broadcasting

  this.heartbeatResponderEmitter.end();
  this.heartbeatResponderEmitter = null;

  this.emit('stop');
};

infoCenterAgent.doBroadcast = function() {
  if (!this.announcementProducer) {
    this.announcementProducer = channelManager.createProducer(this.announceNamespace);
  }

  var meta = messageFactory.createMeta();
  var message = messageFactory.createBroadcastMessage({
    namespace: this.announceNamespace
  });

  message.payload.body = this.doc;
  messageFactory.completeMeta(message, meta);
  this.announcementProducer.publish(JSON.stringify(message), _noop);
};

infoCenterAgent._onHeartbeatResponder = function(responder) {
  if (this.onHeartbeatResponder) return this.onHeartbeatResponder(responder);

  responder.send({ body: this.doc });
};

function _noop() {}

module.exports = InfoCenterAgent;