export default class Segment {

    constructor (event) {
        this.leftSweepEvent = event
        this.rightSweepEvent = event.otherEvent
    }

    isHeadingLeftToRight () {
        if (this.leftSweepEvent.nextVertice === null) return false
        return true
    }
}
