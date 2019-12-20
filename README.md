# sweepline-simplify
A module for creating simple polygons out of self-intersecting polygons. Based on simplepolygon but made faster.

## Install
````
npm install sweepline-simplify
````

## Documentation
Valid inputs: Geojson `Polygon` or `MultiPolygon`.

````js
    const simplify = require('sweepline-simplify')

    const box = {type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]}
    simplify(box)
    // true
````

## Benchmarks

````
// Basic example
// Sweepline simplify x 76,196 ops/sec ±2.28% (85 runs sampled)
// SimplePolygon x 29,164 ops/sec ±1.10% (85 runs sampled)
// - Fastest is Sweepline simplify

// Warsaw example
// Sweepline simplify x 20.27 ops/sec ±4.42% (38 runs sampled)
// simplepolygon - x Breaks
// - Fastest is Sweepline simplify
````

### Acknowledgements
This library leans heavily on the work in the [simplepolygon library](https://github.com/mclaeysb/simplepolygon/). The core difference is in swapping out the algorithm for finding the self-intersections.
Rbush has also been removed to reduce dependencies however this has made performance a bit slower so that needs investigation.