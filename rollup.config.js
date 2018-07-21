import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import sourceMaps from 'rollup-plugin-sourcemaps';
import {terser} from 'rollup-plugin-terser';

import pkg from './package.json';

export default [
    {target: 'server', format: 'esm', minifyProduction: true},
    {target: 'server', format: 'cjs', minifyProduction: false},
    {target: 'browser', format: 'esm', minifyProduction: true},
].reduce((acc, {target, format, minifyProduction}) => [
    ...acc,
    ...[
        {environment: 'development', minify: false},
        {environment: 'production', minify: minifyProduction},
    ].map(({environment, minify}) => ({
        input: `./src/${target}.js`,
        output: {
            format,
            sourcemap: minify,
            globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
                'react-dom/server': 'ReactDOMServer',
            },
            file: [
                'dist/isoreact-core',
                target,
                format,
                minify ? 'min.js' : 'js',
            ].join('.'),
        },
        plugins: [
            sourceMaps(),
            nodeResolve(),
            babel({
                babelrc: false,
                presets: [
                    [
                        'env',
                        {
                            modules: false,
                            targets: target === 'server ' ? {node: '10.0'} : {browsers: ['last 2 versions']}
                        }
                    ],
                    'react',
                ],
                plugins: [
                    'transform-object-rest-spread',
                    'transform-class-properties',
                    'external-helpers',
                    [
                        "styled-components",
                        {
                            "ssr": true,
                            "displayName": true,
                            "fileName": false
                        }
                    ],
                ].filter(Boolean),
                exclude: 'node_modules/**',
            }),
            commonjs(),
            replace({
                'process.browser': (target === 'browser').toString(),
                'process.server': (target === 'server').toString(),
                'process.env.NODE_ENV': `"${environment}"`,
            }),
            ...(minify ? [terser({sourceMap: true})] : []),
        ],
        external: [
            // Top-level peerDependencies modules
            ...Object.keys(pkg.peerDependencies),

            // Submodules of peerDependencies
            'react-dom/server',
            'rxjs/operators',

            // Node modules
            'crypto',
            'os',
        ],
    }))
], []);
