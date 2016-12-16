// Helpful series on configuring rollup: https://code.lengstorf.com/learn-rollup-js/

// Rollup plugins
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import postcss from 'rollup-plugin-postcss';

// PostCSS plugins
import cssnano from 'cssnano';

export default {
    entry: 'src/showcaser.js',
    dest: 'dist/showcaser.js',
    format: 'umd',
    moduleName: 'Showcaser',
    plugins: [
        postcss({
            plugins: [
                cssnano()
            ],
            extensions: ['.css']
        }),
        nodeResolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        commonjs()
    ]
};