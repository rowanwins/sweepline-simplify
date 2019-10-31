# sweepline-simplify
A module for creating simple polygons out of self-intersecting polygons. Based on simplepolygon but made much faster.

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

### Acknowledgements
This library leans heavily on the work in the [simplepolygon library](https://github.com/mclaeysb/simplepolygon/). The core difference is in swapping out the algorithm for finding the self-intersections.
Rbush has also been removed to reduce dependencies however this has made performance a bit slower so that needs investigation.