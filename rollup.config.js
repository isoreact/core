import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import sourceMaps from 'rollup-plugin-sourcemaps';

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
                'js',
            ].join('.'),
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
                        'env',
                        {
                            modules: false,
                            targets: target === 'server ' ? {node: '10.0'} : {browsers: ['last 2 versions']},
                        },
                    ],
                    'react',
                ],
                plugins: [
                    'transform-object-rest-spread',
                    'transform-class-properties',
                    'external-helpers',
                    [
                        'styled-components',
                        {
                            ssr: true,
                            displayName: true,
                            fileName: false,
                        },
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
            'util',
        ],
    })),
], []);
