import resolve from 'rollup-plugin-node-resolve'
import {terser} from 'rollup-plugin-terser'

const output = (file, plugins) => ({
    input: './src/main.js',
    output: {
        name: 'sweeplineSimplify',
        file,
        format: 'umd',
        exports: 'default'
    },
    plugins
})

export default [
    output('./dist/sweeplineSimplify.js', [
        resolve()
    ]),
    output('./dist/sweeplineSimplify.min.js', [
        resolve(),
        terser()
    ])
]
