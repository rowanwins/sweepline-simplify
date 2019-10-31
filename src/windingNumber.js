import { isConvex, modulo } from './utils'

// Modified from http://geomalgorithms.com/a03-_inclusion.html#Winding-Number
export function calculateWindingNumber (point, points) {
    let windingNumber = 0
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i]
        const p2 = points[i + 1]

        if (p1[1] <= point[1]) {
            if (p2[1] > point[1]) {
                if (isLeft(p1, p2, point) > 0) windingNumber++
            }
        } else if (p2[1] <= point[1]) {
            if (isLeft(p1, p2, point) < 0) windingNumber--
        }
    }

    return windingNumber
}

export function windingOfRing(ring) {
    // 'ring' is an array of [x,y] pairs with the last equal to the first
    // Compute the winding number based on the vertex with the smallest x-value, it precessor and successor. An extremal vertex of a simple, non-self-intersecting ring is always convex, so the only reason it is not is because the winding number we use to compute it is wrong
    let leftVtx = 0
    let winding = -1
    for (let i = 0; i < ring.length - 1; i++) {
        if (ring[i][0] < ring[leftVtx][0]) leftVtx = i
    }
    if (isConvex([ring[modulo((leftVtx - 1), (ring.length - 1))], ring[leftVtx], ring[modulo((leftVtx + 1), ring.length - 1)]], true)) {
        winding = 1;
    }
    return winding
}

export function getCentroidOfTriangle (p1, p2, p3) {
    // debugCoords(p1, p2, p3)
    return [(p1[0] + p2[0] + p3[0]) / 3, (p1[1] + p2[1] + p3[1]) / 3]
}

function isLeft (P0, P1, P2) {
    return ((P1[0] - P0[0]) * (P2[1] - P0[1]) - (P2[0] - P0[0]) * (P1[1] - P0[1]))
}
