/**
 * ice candidate class
 * jayccchen
 */

// var copy = require('copy-to');
const iceParse = require('wrtc-ice-cand-parse').parse;
const net = require('net');
const normalizeIPv6 = require('ipv6-normalize');

//  https://w3c.github.io/webrtc-pc/#rtcicecandidate-interface
//  属性
//  candidate      "candidate:2375581577 1 udp 2113937151 10.69.106.54 64404 typ host generation 0 ufrag an2K network-cost 50"
//  sdpMid         "data" "video"  "audio"
//  sdpMLineIndex  0, 1, 2, 3  this indicates the index (starting at zero) of the media description in the SDP this candidate is associated with.
//  foundation     A unique identifier that allows ICE to correlate candidates that appear on multiple RTCIceTransports.
//  component      The assigned network component of the candidate (rtp or rtcp).
//  priority       The assigned priority of the candidate.
//  ip
//  protocol
//  port
//  type           candidate type "host" "srflx" "relay"
//  tcpType
//  relatedAddress
//  relatedPort
  

const typePrefs = {
  host: 126,
  srflx: 100,
  relay: 0,
};

let foundationCounter = 0;


class RTCIceCandidate {

    constructor(dict) {

        Object.assign(this, dict);

        if (this.candidate) {
            var p = iceParse(this.candidate);
            this.foundation = +p.foundation;
            this.priority = +p.priority;
            this.ip = p.localIP;
            this.protocol = p.transport.toLowerCase();
            this.port = p.localPort;
            this.type = p.type;
            if (p.remoteIP && p.remotePort) {
                this.relatedAddress = p.remoteIP;
                this.relatedPort = p.remotePort;
            }
        }

        if (net.isIPv6(this.ip)) {
            this.ip = normalizeIPv6(this.ip);
        }

        if (typeof this.port !== 'number') {
            this.port = +this.port;
        }

        if (!('priority' in this)) {
            this.priority = computePriority(this.type, this.ip);
        }

        if (!('foundation' in this)) {
            // https://tools.ietf.org/html/rfc5245#section-4.2
            this.foundation = foundationCounter++;
        }

        this.protocol = this.protocol || 'udp';

    }

    /**
     * candidate排序
     * @param  {[type]} type [description]
     * @param  {[type]} addr [description]
     * @return {[type]}      [description]
     */
	computePriority (type, addr) {
	  // https://tools.ietf.org/html/rfc5245#section-2.3
	  // https://tools.ietf.org/html/rfc5245#section-4.1.2
	  // https://tools.ietf.org/html/rfc5245#section-4.1.2.2
	  let typePref = typePrefs[type];
	  let localPref = net.isIPv6(addr) ? 65535 : 0;
	  let componentID = 0;
	  return prioritize(typePref, localPref, componentID);
	};  

	/**
	 * 排序算法
	 * @param  {[type]} typePref    [description]
	 * @param  {[type]} localPref   [description]
	 * @param  {[type]} componentID [description]
	 * @return {[type]}             [description]
	 */
	prioritize (typePref, localPref, componentID) {
	  // https://tools.ietf.org/html/rfc5245#section-4.1.2.1
	  return (Math.pow(2, 24) * typePref +
	    Math.pow(2, 8) * localPref +
	    256 - componentID) | 0;
	};
}

module.exports = RTCIceCandidate;