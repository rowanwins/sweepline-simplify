const path = require('path')
const Benchmark = require('benchmark')
const sweeplineSimplify = require('../dist/sweeplineSimplify.js')
const loadJsonFile = require('load-json-file')
const simplepolygon = require('simplepolygon')

const example1 = loadJsonFile.sync(path.join(__dirname, 'fixtures', 'example.geojson'))
const warsaw = loadJsonFile.sync(path.join(__dirname, 'fixtures', 'warsaw.geojson'))

const options = {
    onStart () { console.log(this.name) },
    onError (event) { console.log(event.target.error) },
    onCycle (event) { console.log(String(event.target)) },
    onComplete () {
        console.log(`- Fastest is ${this.filter('fastest').map('name')}`)
    }
}

// Basic example
// Sweepline simplify - x 155,206 ops/sec ±2.03% (95 runs sampled)
// simplepolygon - x 29,294 ops/sec ±0.39% (64 runs sampled)
// - Fastest is Sweepline simplify
const suite = new Benchmark.Suite('Basic example', options)
suite
    .add('Sweepline simplify', function () {
        sweeplineSimplify(example1)
    })
    .add('SimplePolygon', function () {
        simplepolygon(example1)
    })
    .run()

// Warsaw example
// Sweepline simplify - x 26 ops/sec ±2.03% (95 runs sampled)
// simplepolygon - x n/a
// - Fastest is Sweepline simplify
const suite2 = new Benchmark.Suite('Warsaw example', options)
suite2
    .add('Sweepline simplify', function () {
        sweeplineSimplify(warsaw)
    })
    // .add('Sweepline simplify', function () {
    //     simplepolygon(warsaw)
    // })
    .run()
