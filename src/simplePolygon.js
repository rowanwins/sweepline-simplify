import {windingOfRing} from './windingNumber'
import {isConvex, modulo} from './utils'
import PseudoVtx from './PseudoVertex'
import Isect from './Isect'

export function rewire (inputDetails, selfIsectsData, returnPrimaryPolygonOnly) {

    const numRings = inputDetails.numberOfRings
    const numVertices = inputDetails.numVertices
    const geometry = inputDetails.geom

    const numSelfIsect = selfIsectsData.length;
    if (numSelfIsect === 0) {
        const outputFeatureArray = []
        for (let i = 0; i < numRings; i++) {
            outputFeatureArray.push({
                type: 'Feature',
                properties: {
                    parent: -1,
                    winding: windingOfRing(geometry.coordinates[i])
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: [geometry.coordinates[i]]
                }
            })
        }
        const output = {
            type: 'FeatureCollection',
            features: outputFeatureArray
        }
        // determineParents()
        // setNetWinding()
        return output
    }

    // If self-intersections are found, we will compute the output rings
    // with the help of two intermediate variables
    // First, we build the pseudo vertex list and intersection list
    // The Pseudo vertex list is an array with for each ring an array with
    // for each edge an array containing the pseudo-vertices (as made by their constructor)
    // that have this ring and edge as ringAndEdgeIn, sorted for each edge by
    // their fractional distance on this edge. It's length hence equals numRings.
    const pseudoVtxListByRingAndEdge = []

    // The intersection list is an array containing intersections (as made by their constructor).
    // First all numVertices ring-vertex-intersections,
    // then all self-intersections (intra- and inter-ring).
    // The order of the latter is not important but is permanent once given.
    const isectList = []

    // Adding ring-pseudo-vertices to pseudoVtxListByRingAndEdge and ring-vertex-intersections to isectList
    for (let i = 0; i < numRings; i++) {
        const outarray = []
        for (let j = 0; j < geometry.coordinates[i].length - 1; j++) {
            // Each edge will feature one ring-pseudo-vertex in its array, on the last position. /
            // i.e. edge j features the ring-pseudo-vertex of the ring vertex j+1,
            // which has ringAndEdgeIn = [i,j], on the last position.
            outarray.push([new PseudoVtx(
                geometry.coordinates[i][modulo((j + 1), geometry.coordinates[i].length - 1)],
                1,
                [i, j],
                [i, modulo(j + 1, geometry.coordinates[i].length - 1)],
                undefined
            )]);

            // The first numVertices elements in isectList correspond to the ring-vertex-intersections
            isectList.push(new Isect(
                geometry.coordinates[i][j],
                [i, modulo((j - 1), geometry.coordinates[i].length - 1)],
                [i, j],
                undefined,
                undefined,
                false,
                true)
            );
        }
        pseudoVtxListByRingAndEdge.push(outarray)
    }

    // Adding intersection-pseudo-vertices to pseudoVtxListByRingAndEdge
    // and self-intersections to isectList
    for (let i = 0; i < numSelfIsect; i++) {

        const c = selfIsectsData[i]
        // Adding intersection-pseudo-vertices made using selfIsectsData
        // to pseudoVtxListByRingAndEdge's array corresponding to the incomming ring and edge
        pseudoVtxListByRingAndEdge[c[0][1]][c[0][2]].push(
            new PseudoVtx(
                c[0][0],
                c[0][5],
                [c[0][1], c[0][2]],
                [c[0][6], c[0][7]],
                undefined
            )
        );

        pseudoVtxListByRingAndEdge[c[1][1]][c[1][2]].push(
            new PseudoVtx(
                c[1][0],
                c[1][5],
                [c[1][1], c[1][2]],
                [c[1][6], c[1][7]],
                undefined
            )
        );

        isectList.push(
            new Isect(
                selfIsectsData[i][0][0],
                [selfIsectsData[i][0][1], selfIsectsData[i][0][2]],
                [selfIsectsData[i][0][6], selfIsectsData[i][0][7]],
                undefined,
                undefined,
                true,
                true
            )
        )

    }

    for (let i = 0; i < pseudoVtxListByRingAndEdge.length; i++) {
        for (let j = 0; j < pseudoVtxListByRingAndEdge[i].length; j++) {
            pseudoVtxListByRingAndEdge[i][j].sort(function(a, b) {
                return (a.param < b.param) ? -1 : 1
            })
        }
    }

    const intersectionsMap = new Map()
    for (let i = 0; i < isectList.length; i++) {
        intersectionsMap.set(`${isectList[i].x},${isectList[i].y}`, i)
    }


    // Now we will teach each intersection in isectList
    // which is the next intersection along both it's [ring, edge]'s, in two steps.
    // First, we find the next intersection for each pseudo-vertex in pseudoVtxListByRingAndEdge:
    // For each pseudovertex in pseudoVtxListByRingAndEdge (3 loops) look at the next
    // pseudovertex on that edge and find the corresponding intersection by comparing coordinates
    for (let i = 0; i < pseudoVtxListByRingAndEdge.length; i++) {
        const outer = pseudoVtxListByRingAndEdge[i]
        for (let j = 0; j < outer.length; j++) {
            const inner = outer[j]
            for (let k = 0; k < inner.length; k++) {
                let coordToFind = null
                if (k === inner.length - 1) {
                    coordToFind = outer[modulo((j + 1), geometry.coordinates[i].length - 1)][0]
                } else {
                    coordToFind = inner[k + 1]
                }
                pseudoVtxListByRingAndEdge[i][j][k].nxtIsectAlongEdgeIn = intersectionsMap.get(`${coordToFind.x},${coordToFind.y}`)
            }
        }
    }

    // Second, we port this knowledge of the next intersection over to the intersections in isectList,
    // by finding the intersection corresponding to each pseudo-vertex and copying the pseudo-vertex'
    // knownledge of the next-intersection over to the intersection
    for (let i = 0; i < pseudoVtxListByRingAndEdge.length; i++) {
        const outer = pseudoVtxListByRingAndEdge[i]
        for (let j = 0; j < outer.length; j++) {
            const inner = outer[j]
            for (let k = 0; k < inner.length; k++) {
                const coordToFind = inner[k]
                const l = intersectionsMap.get(`${coordToFind.x},${coordToFind.y}`)
                if (l < numVertices) {
                    // Special treatment at ring-vertices: we correct the misnaming that happened in the previous block,
                    // since ringAndEdgeOut = ringAndEdge2 for ring vertices.
                    isectList[l].nxtIsectAlongRingAndEdge2 = coordToFind.nxtIsectAlongEdgeIn
                } else if (arraysEqual(isectList[l].ringAndEdge1, coordToFind.ringAndEdgeIn)) {
                    isectList[l].nxtIsectAlongRingAndEdge1 = coordToFind.nxtIsectAlongEdgeIn
                } else {
                    isectList[l].nxtIsectAlongRingAndEdge2 = coordToFind.nxtIsectAlongEdgeIn
                }
            }
        }
    }
    // Before we start walking over the intersections to build the output rings,
    // we prepare a queue that stores information on intersections we still have
    // to deal with, and put at least one intersection in it.
    // This queue will contain information on intersections where we can start
    // walking from once the current walk is finished, and its parent output
    // ring (the smallest output ring it lies within, -1 if no parent or parent unknown yet)
    // and its winding number (which we can already determine).
    const queue = []

    // For each output ring, add the ring-vertex-intersection with the smalles x-value (i.e. the left-most) as a start intersection.
    // By choosing such an extremal intersections, we are sure to start at an intersection that is a convex vertex of its output ring.
    // By adding them all to the queue, we are sure that no rings will be forgotten.
    // If due to ring-intersections such an intersection will be encountered while walking, it will be removed from the queue.
    let i = 0
    for (let j = 0; j < numRings; j++) {
        let leftIsect = i
        for (let k = 0; k < geometry.coordinates[j].length - 1; k++) {
            if (isectList[i].x < isectList[leftIsect].x) leftIsect = i
            i++
        }

        // Compute winding at this left-most ring-vertex-intersection.
        // We thus this by using our knowledge that this extremal vertex must be a convex vertex.
        // We first find the intersection before and after it,
        // and then use them to determine the winding number of the corresponding output ring,
        // since we know that an extremal vertex of a simple, non-self-intersecting ring
        // is always convex, so the only reason it would not be is because the winding number we use to compute it is wrong
        const isectAfterLeftIsect = isectList[leftIsect].nxtIsectAlongRingAndEdge2

        let isectBeforeLeftIsect = null
        for (let k = 0; k < isectList.length; k++) {
            if ((isectList[k].nxtIsectAlongRingAndEdge1 === leftIsect) || (isectList[k].nxtIsectAlongRingAndEdge2 === leftIsect)) {
                isectBeforeLeftIsect = k
                break
            }
        }
        const windingAtIsect = isConvex([isectList[isectBeforeLeftIsect], isectList[leftIsect], isectList[isectAfterLeftIsect]], true) ? 1 : -1

        queue.push({
            isect: leftIsect,
            parent: -1,
            winding: windingAtIsect
        })
    }
    // Sort the queue by the same criterion used to find the leftIsect: the left-most leftIsect must be last in the queue,
    // such that it will be popped first, such that we will work from out to in regarding input rings.
    // This assumtion is used when predicting the winding number and parent of a new queue member.
    queue.sort(function(a, b) {
        return isectList[a.isect].x > isectList[b.isect].x ? -1 : 1
    })
    // Initialise output
    const outputFeatureArray = []

    // While the queue is not empty, take the last object (i.e. its intersection) out and start
    // making an output ring by walking in the direction that has not been walked away over yet.
    while (queue.length > 0) {
        // Get the last object out of the queue
        const popped = queue.pop()
        const startIsect = popped.isect
        const currentOutputRingParent = popped.parent
        const currentOutputRingWinding = popped.winding
        // Make new output ring and add vertex from starting intersection
        const currentOutputRing = outputFeatureArray.length
        const currentOutputRingCoords = []
        currentOutputRingCoords.push([isectList[startIsect].x, isectList[startIsect].y])

        let walkingRingAndEdge = null
        let nxtIsect = null

        // if (startIsect < numVertices) debugAll("This is a ring-vertex-intersections, which means this output ring does not touch existing output rings");

        // Set up the variables used while walking over intersections: 'currentIsect', 'nxtIsect' and 'walkingRingAndEdge'
        let currentIsect = startIsect
        if (isectList[startIsect].ringAndEdge1Walkable) {
            walkingRingAndEdge = isectList[startIsect].ringAndEdge1
            nxtIsect = isectList[startIsect].nxtIsectAlongRingAndEdge1
        } else {
            walkingRingAndEdge = isectList[startIsect].ringAndEdge2
            nxtIsect = isectList[startIsect].nxtIsectAlongRingAndEdge2
        }

        // While we have not arrived back at the same intersection, keep walking
        while (!pointsEqual(isectList[startIsect], isectList[nxtIsect])) {
            currentOutputRingCoords.push([isectList[nxtIsect].x, isectList[nxtIsect].y])

            // If the next intersection is queued, we can remove it, because we will go there now.
            let nxtIsectInQueue = null
            for (let i = 0; i < queue.length; i++) {
                if (queue[i].isect === nxtIsect) {
                    nxtIsectInQueue = i
                    break
                }
            }
            if (nxtIsectInQueue !== null) {
                queue.splice(nxtIsectInQueue, 1)
            }

            // Arriving at this new intersection, we know which will be our next walking ring and edge
            // (if we came from 1 we will walk away from 2 and vice versa),
            // So we can set it as our new walking ring and intersection and remember that we (will) have walked over it
            // If we have never walked away from this new intersection along the other ring and edge then we will soon do,
            // add the intersection (and the parent wand winding number) to the queue
            // (We can predict the winding number and parent as follows: if the edge is convex, the other output ring
            // started from there will have the alternate winding and lie outside of the current one,
            // and thus have the same parent ring as the current ring.
            // Otherwise, it will have the same winding number and lie inside of the current ring.
            // We are, however, only sure of this of an output ring started from there does not enclose the current ring.
            // This is why the initial queue's intersections must be sorted such that outer ones come out first.)
            // We then update the other two walking variables.
            if (arraysEqual(walkingRingAndEdge, isectList[nxtIsect].ringAndEdge1)) {
                walkingRingAndEdge = isectList[nxtIsect].ringAndEdge2
                isectList[nxtIsect].ringAndEdge2Walkable = false
                if (isectList[nxtIsect].ringAndEdge1Walkable) {
                    const pushing = {
                        isect: nxtIsect,
                        parent: currentOutputRing,
                        winding: currentOutputRingWinding
                    }

                    if (isConvex([isectList[currentIsect], isectList[nxtIsect], isectList[nxtIsect].nxtIsectAlongRingAndEdge2], currentOutputRingWinding === 1)) {
                        pushing.parent = currentOutputRingParent
                        pushing.winding = -currentOutputRingWinding
                    }
                    queue.push(pushing)
                }
                currentIsect = nxtIsect
                nxtIsect = isectList[nxtIsect].nxtIsectAlongRingAndEdge2

            } else {
                walkingRingAndEdge = isectList[nxtIsect].ringAndEdge1
                isectList[nxtIsect].ringAndEdge1Walkable = false

                if (isectList[nxtIsect].ringAndEdge2Walkable) {
                    const pushing = {
                        isect: nxtIsect,
                        parent: currentOutputRing,
                        winding: currentOutputRingWinding
                    }
                    if (isConvex([isectList[currentIsect], isectList[nxtIsect], isectList[nxtIsect].nxtIsectAlongRingAndEdge1], currentOutputRingWinding === 1)) {
                        pushing.parent = currentOutputRingParent
                        pushing.winding = -currentOutputRingWinding
                    }
                    queue.push(pushing)
                }
                currentIsect = nxtIsect
                nxtIsect = isectList[nxtIsect].nxtIsectAlongRingAndEdge1
            }
        }

        currentOutputRingCoords.push([isectList[nxtIsect].x, isectList[nxtIsect].y])

        // Push output ring to output
        outputFeatureArray.push({
            type: 'Feature',
            properties: {
                index: currentOutputRing,
                parent: currentOutputRingParent,
                winding: currentOutputRingWinding,
                netWinding: undefined
            },
            geometry: {
                type: 'Polygon',
                coordinates: [currentOutputRingCoords]
            }
        });
        if (returnPrimaryPolygonOnly) break;
    }

    const output = {
        type: 'FeatureCollection',
        features: outputFeatureArray
    }

    determineParents()

    setNetWinding()

    return output

    // These functions are also used if no intersections are found
    function determineParents() {
        const featuresWithoutParent = []
        for (let i = 0; i < output.features.length; i++) {
            if (output.features[i].properties.parent === -1) featuresWithoutParent.push(i)
        }
        if (featuresWithoutParent.length > 1) {
            for (let i = 0; i < featuresWithoutParent.length; i++) {
                const parent = -1
                const parentArea = Infinity
                for (let j = 0; j < output.features.length; j++) {
                    if (featuresWithoutParent[i] === j) continue
                    // if (inside(helpers.point(output.features[featuresWithoutParent[i]].geometry.coordinates[0][0]), output.features[j], true)) {
                    //     if (area(output.features[j]) < parentArea) {
                    //         parent = j
                    //     }
                    // }
                }
                output.features[featuresWithoutParent[i]].properties.parent = parent
            }
        }
    }

    function setNetWinding() {
        for (let i = 0; i < output.features.length; i++) {
            if (output.features[i].properties.parent === -1) {
                const netWinding = output.features[i].properties.winding
                output.features[i].properties.netWinding = netWinding
                setNetWindingOfChildren(i, netWinding)
            }
        }
    }

    function setNetWindingOfChildren(parent, ParentNetWinding) {
        for (let i = 0; i < output.features.length; i++) {
            if (output.features[i].properties.parent === parent) {
                const netWinding = ParentNetWinding + output.features[i].properties.winding
                output.features[i].properties.netWinding = netWinding
                setNetWindingOfChildren(i, netWinding)
            }
        }
    }

    function pointsEqual (p, p2) {
        return p.x === p2.x && p.y === p2.y
    }

    function arraysEqual (array1, array2) {
        return array1[0] === array2[0] && array1[1] === array2[1]
    }

}
