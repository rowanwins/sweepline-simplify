export default class PseudoVtx {

    constructor (p, param, ringAndEdgeIn, ringAndEdgeOut, nxtIsectAlongEdgeIn) {
        this.x = p[0]
        this.y = p[1]
        this.param = param; // fractional distance of this intersection on incoming edge
        this.ringAndEdgeIn = ringAndEdgeIn; // [ring index, edge index] of incoming edge
        this.ringAndEdgeOut = ringAndEdgeOut; // [ring index, edge index] of outgoing edge
        this.nxtIsectAlongEdgeIn = nxtIsectAlongEdgeIn;
    }
}

