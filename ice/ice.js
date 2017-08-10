var chalk = require('chalk');
var debug = require('./debug');
var udp = require('dgram');
var EventEmitter = require('events');
var forEachInet = require('./forEachInet');
var IceCandidatePair = require('./IceCandidatePair');
var IceChecklist = require('./IceChecklist');
var RTCIceCandidate = require('./RTCIceCandidate');
var net = require('net');
var normalizeIPv6 = require('ipv6-normalize');
var Packet = require('vs-stun/lib/Packet');
// var util = require('util');
var url = require('url');
var vsStun = require('vs-stun');

class IceAgent extends EventEmitter {

	constructor (config) {
		// https://tools.ietf.org/html/rfc5245#section-2.2
		  this.candidates = [];
		  this.remoteCandidates = [];
		  // If there were more media streams, there'd be a checklist per.
		  this.checklist = new IceChecklist;

		  // If not "controlling", then "controlled." The controlling peer's agent
		  // nominates the candidate pair that will be used for the rest of
		  // communication. Public and set by RTCPeerConnections's createOffer().
		  this.iceControlling = false;

		  // https://tools.ietf.org/html/draft-ietf-ice-rfc5245bis-00#section-12
		  // https://tools.ietf.org/html/draft-ietf-ice-rfc5245bis-00#section-12.1
		  this.Ta = 1000;//20; // ms
		  this.checkTimeout = null;

		  // used for short term credentialing
		  this.localUsername = null;
		  this.localPassword = null;
		  this.remoteUsername = null;
		  this.remotePassword = null;

		  this.config = config;
	}

}