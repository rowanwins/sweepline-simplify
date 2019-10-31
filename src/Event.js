export default class Event {

    constructor (p, ringId, segmentIndex) {
        this.p = {
            x: p[0],
            y: p[1]
        }
        this.contourId = ringId
        this.segmentIndex = segmentIndex

        this.otherEvent = null
        this.isLeftEndpoint = null
    }

    isSamePoint(eventToCheck) {
        return this.p.x === eventToCheck.p.x && this.p.y === eventToCheck.p.y
    }
}

