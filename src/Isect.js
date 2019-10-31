export default class Isect {

    constructor (p, ringAndEdge1, ringAndEdge2, nxtIsectAlongRingAndEdge1, nxtIsectAlongRingAndEdge2, ringAndEdge1Walkable, ringAndEdge2Walkable) {
        this.x = p[0]
        this.y = p[1]
        this.ringAndEdge1 = ringAndEdge1
        this.ringAndEdge2 = ringAndEdge2
        this.nxtIsectAlongRingAndEdge1 = nxtIsectAlongRingAndEdge1
        this.nxtIsectAlongRingAndEdge2 = nxtIsectAlongRingAndEdge2
        this.ringAndEdge1Walkable = ringAndEdge1Walkable
        this.ringAndEdge2Walkable = ringAndEdge2Walkable
    }

}

