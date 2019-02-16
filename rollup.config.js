import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import sourceMaps from 'rollup-plugin-sourcemaps';
import {terser} from 'rollup-plugin-terser';

import pkg from './package.json';

export default [
    {target: 'server', format: 'esm'},
    {target: 'server', format: 'cjs'},
    {target: 'browser', format: 'esm'},
].reduce((acc, {target, format}) => [
    ...acc,
    ...[
        'development',
        'production',
    ].map((environment) => ({
        input: './src/index.js',
        output: {
            format,
            sourcemap: true,
            globals: {
                'react': 'React',
                'react-dom': 'ReactDOM',
                'react-dom/server': 'ReactDOMServer',
            },
            file: [
                'dist/isoreact-core',
                target,
                format,
                environment === 'production' && 'min',
                'js',
            ]
                .filter(Boolean)
                .join('.'),
        },
        plugins: [
            sourceMaps(),
            nodeResolve({
                browser: target === 'browser',
                preferBuiltins: target === 'server',
            }),
            babel({
                babelrc: false,
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            modules: false,
                            targets: target === 'server ' ? {node: '10.0'} : {browsers: ['last 2 versions']},
                        },
                    ],
                    '@babel/preset-react',
                ]
                    .filter(Boolean),
                plugins: [
                    '@babel/plugin-proposal-object-rest-spread',
                    '@babel/plugin-proposal-class-properties',
                    [
                        'babel-plugin-styled-components',
                        {
                            ssr: true,
                            displayName: true,
                            fileName: false,
                        },
                    ],
                    environment === 'production' && 'babel-plugin-transform-react-remove-prop-types',
                ]
                    .filter(Boolean),
                exclude: 'node_modules/**',
            }),
            commonjs(),
            replace({
                'process.browser': (target === 'browser').toString(),
                'process.server': (target === 'server').toString(),
                'process.env.NODE_ENV': `"${environment}"`,
            }),
            environment === 'production' && terser(),
        ]
            .filter(Boolean),
        external: [
            // Top-level peerDependencies modules
            ...Object.keys(pkg.peerDependencies),

            // Submodules of peerDependencies
            'react-dom/server',
            'rxjs/operators',

            // Node modules
            'crypto',
            'os',
            'util',
        ],
    })),
], []);
