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
// Sweepline simplify x 76,196 ops/sec ±2.28% (85 runs sampled)
// SimplePolygon x 29,164 ops/sec ±1.10% (85 runs sampled)
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
// Sweepline simplify x 20.27 ops/sec ±4.42% (38 runs sampled)
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
