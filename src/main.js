import TinyQueue from 'tinyqueue'
import Segment from './Segment'

import {checkWhichEventIsLeft, checkWhichSegmentHasRightEndpointFirst} from './comparitors'
import {fillEventQueue} from './fillQueue'
import {testSegmentIntersect} from './utils'

import {rewire} from './simplePolygon'

export default function sweeplineSimplify (geojson, returnPrimaryOnly) {

    const returnPrimaryPolygonOnly = returnPrimaryOnly !== undefined ? returnPrimaryOnly : false

    const intersectionPoints = []
    const eventQueue = new TinyQueue([], checkWhichEventIsLeft);

    const inputDetails = fillEventQueue(geojson, eventQueue)

    const outQueue = new TinyQueue([], checkWhichSegmentHasRightEndpointFirst);

    while (eventQueue.length) {
        const event = eventQueue.pop();
        if (event.isLeftEndpoint) {
            const segment = new Segment(event)
            for (let i = 0; i < outQueue.data.length; i++) {
                const intersection = testSegmentIntersect(segment, outQueue.data[i])
                if (intersection !== false) intersectionPoints.push(intersection)
            }
            outQueue.push(segment)
        } else if (event.isLeftEndpoint === false) {
            outQueue.pop()
        }
    }

    return {
        intersections: intersectionPoints,
        simpleContours: rewire(inputDetails, intersectionPoints, returnPrimaryPolygonOnly)
    }

}
