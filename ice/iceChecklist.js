const Enum = require('enum');
const IceCandidatePair = require('./IceCandidatePair');

// https://tools.ietf.org/html/draft-ietf-ice-rfc5245bis-00#section-5.1.3.4
const checklistStates = new Enum([
    // Would be nice to have a NOTSTARTED state.
    'Running',
    'Completed',
    'Failed'
]);

function descendingPriority(pairA, pairB) {
    return pairA.priority < pairB.priority;
}

function thaw(pair) {
    if (pair.isFrozen()) {
        pair.unfreeze();
    }
}

function freeze(pair) {
    pair.freeze();
}

function firstWaiting(pair) {
    return pair.isWaiting();
}

function failedOrSucceeded(pair) {
    return pair.isFailed() || pair.isSucceeded();
}

class IceChecklist {

    constructor() {
        this.candidatePairs = [];
        this.state = checklistStates.Running;
        this.pendingRequestTransactions = {};
        this.validList = [];
    }

    add(pair) {
        if (!(pair instanceof IceCandidatePair)) {
            throw new TypeError('unable to add non-IceCandidatePair to ICE checklist');
        }
        // https://tools.ietf.org/html/draft-ietf-ice-trickle-01#section-8.1
        if (this.candidatePairs.length === 100) {
            console.warn('dropping candidate pair, reached 100 pairs');
            return;
        }
        this.candidatePairs.push(pair);
    }

    prioritize() {
        this.candidatePairs.sort(descendingPriority);
    }

    unfreezeFirst() {
        if (this.candidatePairs.length > 0) {
            this.candidatePairs[0].unfreeze();
        }
    }

    unfreezeAll() {
        this.candidatePairs.forEach(thaw);
    }

    highestPriorityWaiting() {
        return this.candidatePairs.find(firstWaiting);
    }

    highestPriorityFrozen() {
        return this.candidatePairs.find(firstFrozen);
    }

    checkForFailure() {
        if (!this.candidatePairs.some(failedOrSucceeded) &&
            this.validList.length === 0) {
            this.state = checklistStates.Failed;
            // TODO: maybe bubble this up?
            console.error('Ice Check list failure');
        }
    }

    removeWaitingAndFrozenCandidates() {
        this.candidatePairs = this.candidatePairs.filter(failedOrSucceeded);
    }

    isRunning() {
        return this.state === checklistStates.Running;
    }

    isCompleted() {
    	return this.state === checklistStates.Completed;
    }

    isFailed() {
    	return this.state === checklistStates.Failed;
    }

    complete() {
        this.state = checklistStates.Completed;
    }
}

module.exports = IceChecklist;