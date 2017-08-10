/**
 * @jayccchen
 */

var Enum = require('enum');
var RTCIceCandidate = require('./RTCIceCandidate');

// https://tools.ietf.org/html/draft-ietf-ice-rfc5245bis-00#section-5.1.3.4
// ice对校验状态
const iceStates = new Enum([
    'Waiting',
    'InProgress',
    'Succeeded',
    'Failed',
    'Frozen'
]);

/**
 * candidate对
 */
class IceCandidatePair {

    constructor(localCandidate, remoteCandidate, iceControlling) {
        if (!(localCandidate instanceof RTCIceCandidate)) {
            throw new TypeError('localCandidate is not an instance of RTCIceCandidate');
        }
        if (!(remoteCandidate instanceof RTCIceCandidate)) {
            throw new TypeError('remoteCandidate is not an instance of RTCIceCandidate');
        }

        this.local = localCandidate;
        this.remote = remoteCandidate;
        this.default = false;
        // https://tools.ietf.org/html/draft-ietf-ice-rfc5245bis-00#section-6.1.3.2.2
        this.valid = false;
        this.nominated = false;
        // this.state.key will give you the corresponding string
        this.state = iceStates.Frozen;
        this.priority = this.computePriority(iceControlling);

    }

    computePriority(iceControlling) {
        if (iceControlling) {
            return this.prioritize(this.local.priority, this.remote.priority);
        } else {
            return this.prioritize(this.remote.priority, this.local.priority);
        }
    }

    // https://tools.ietf.org/html/draft-ietf-ice-rfc5245bis-00#section-5.1.3.2
    prioritize(g, d) {
        return Math.pow(2, 32) * Math.min(g, d) + 2 * Math.max(g, d) +
            (g > d ? 1 : 0);
    }

    static freeze = () => {
    	this.state = iceStates.Frozen;
    }

}