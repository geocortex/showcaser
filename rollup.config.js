import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    entry: 'build/showcaser.js',
    dest: 'dist/showcaser.min.js',
    format: 'iife',
    moduleName: 'Showcaser',
    plugins: [
        nodeResolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        commonjs()
    ]
};