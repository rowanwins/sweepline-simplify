export function modulo (someNum, n) {
    return ((someNum % n) + n) % n
}

export function isConvex(pts, righthanded) {
    const d = (pts[1].x - pts[0].x) * (pts[2].y - pts[0].y) - (pts[1].y - pts[0].y) * (pts[2].x - pts[0].x)
    return (d >= 0) === righthanded
}

export function areCoordsSame (p1, p2) {
    return Math.abs(p1 - p2) < Number.EPSILON
}

export function testSegmentIntersect (seg1, seg2) {
    if (seg1 === null || seg2 === null) return false

    if (seg1.rightSweepEvent.isSamePoint(seg2.leftSweepEvent) ||
        seg1.rightSweepEvent.isSamePoint(seg2.rightSweepEvent) ||
        seg1.leftSweepEvent.isSamePoint(seg2.leftSweepEvent) ||
        seg1.leftSweepEvent.isSamePoint(seg2.rightSweepEvent)) return false

    const x1 = seg1.leftSweepEvent.p.x
    const y1 = seg1.leftSweepEvent.p.y
    const x2 = seg1.rightSweepEvent.p.x
    const y2 = seg1.rightSweepEvent.p.y
    const x3 = seg2.leftSweepEvent.p.x
    const y3 = seg2.leftSweepEvent.p.y
    const x4 = seg2.rightSweepEvent.p.x
    const y4 = seg2.rightSweepEvent.p.y

    const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1))
    const numeA = ((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))
    const numeB = ((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))

    if (denom === 0) {
        if (numeA === 0 && numeB === 0) return false
        return false
    }

    const uA = numeA / denom
    const uB = numeB / denom

    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        const x = x1 + (uA * (x2 - x1))
        const y = y1 + (uA * (y2 - y1))

        const ring0 = seg1.leftSweepEvent.contourId
        const edge0 = seg1.leftSweepEvent.segmentIndex
        const ring1 = seg2.leftSweepEvent.contourId
        const edge1 = seg2.leftSweepEvent.segmentIndex

        let start0, end0, start1, end1
        if (seg1.isHeadingLeftToRight()) {
            start0 = seg1.leftSweepEvent
            end0 = seg1.rightSweepEvent
            start1 = seg2.leftSweepEvent
            end1 = seg2.rightSweepEvent
        } else {
            start0 = seg1.rightSweepEvent
            end0 = seg1.leftSweepEvent
            start1 = seg2.rightSweepEvent
            end1 = seg2.leftSweepEvent
        }
        let frac0, frac1

        if (end0.p.x !== start0.p.x) frac0 = (x - start0.p.x) / (end0.p.x - start0.p.x)
        else frac0 = (y - start0.p.y) / (end0.p.y - start0.p.y)

        if (end1.p.x !== start1.p.x) frac1 = (x - start1.p.x) / (end1.p.x - start1.p.x)
        else frac1 = (y - start1.p.y) / (end1.p.y - start1.p.y)


        const r1 = [[x, y], ring0, edge0, start0, end0, frac0, ring1, edge1, start1, end1, frac1, false]


        const ring01 = seg2.leftSweepEvent.contourId
        const edge01 = seg2.leftSweepEvent.segmentIndex
        const ring11 = seg1.leftSweepEvent.contourId
        const edge11 = seg1.leftSweepEvent.segmentIndex

        let start01, end01, start11, end11

        if (!seg2.isHeadingLeftToRight()) {
            start01 = seg1.leftSweepEvent
            end01 = seg1.rightSweepEvent
            start11 = seg2.leftSweepEvent
            end11 = seg2.rightSweepEvent
        } else {
            start01 = seg1.rightSweepEvent
            end01 = seg1.leftSweepEvent
            start11 = seg2.rightSweepEvent
            end11 = seg2.leftSweepEvent
        }

        let frac01, frac11
        if (end01.p.x !== start01.p.x) frac01 = (x - start01.p.x) / (end01.p.x - start01.p.x)
        else frac01 = (y - start01.p.y) / (end01.p.y - start01.p.y)

        if (end11.p.x !== start11.p.x) frac11 = (x - start11.p.x) / (end11.p.x - start11.p.x)
        else frac11 = (y - start11.p.y) / (end11.p.y - start11.p.y)

        const r2 = [[x, y], ring01, edge01, start01, end01, frac01, ring11, edge11, start11, end11, frac11, true]

        return [r1, r2]
    }
    return false
}
