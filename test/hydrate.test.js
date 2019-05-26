import React from 'react';
import ReactDOM from 'react-dom';

import hydrate from '../src/hydrate';
import keyFor from '../src/key-for';

import {hydrateSimple as hydrateSimpleConnected} from './data/connect/isomorphic/iso-simple';
import {hydrateNested as hydrateNestedConnected} from './data/connect/isomorphic/iso-nested';
import {hydrateVerySimple as hydrateVerySimpleConnected} from './data/connect/isomorphic/iso-very-simple';
import {hydrateNestedWithStyles as hydrateNestedWithStylesConnected} from './data/connect/isomorphic/iso-nested-with-styles';
import {hydrateSimple as hydrateSimpleHooked} from './data/hooks/isomorphic/iso-simple';
import {hydrateNested as hydrateNestedHooked} from './data/hooks/isomorphic/iso-nested';
import {hydrateVerySimple as hydrateVerySimpleHooked} from './data/hooks/isomorphic/iso-very-simple';
import {hydrateNestedWithStyles as hydrateNestedWithStylesHooked} from './data/hooks/isomorphic/iso-nested-with-styles';

import * as fetchBaseValue from './data/streams/fetch-base-value';
import * as fetchV from './data/streams/fetch-v';
import * as fetchW from './data/streams/fetch-w';

describe('hydrate(isomorphicComponent, options)', () => {
    [
        {
            name: '<Connect />',
            suffix: '--connected',
            hydrateSimple: hydrateSimpleConnected,
            hydrateNested: hydrateNestedConnected,
            hydrateVerySimple: hydrateVerySimpleConnected,
            hydrateNestedWithStyles: hydrateNestedWithStylesConnected,
        },
        {
            name: 'useIsomorphicContext()',
            suffix: '--hooked',
            hydrateSimple: hydrateSimpleHooked,
            hydrateNested: hydrateNestedHooked,
            hydrateVerySimple: hydrateVerySimpleHooked,
            hydrateNestedWithStyles: hydrateNestedWithStylesHooked,
        },
    ].forEach(({
        name,
        suffix,
        hydrateSimple,
        hydrateNested,
        hydrateVerySimple,
        hydrateNestedWithStyles,
    }) => {
        describe(name, () => {
            let originalProcessBrowser;
            let originalConsoleInfo;

            beforeEach(() => {
                originalProcessBrowser = process.browser;
                process.browser = true;
                originalConsoleInfo = console.info;
                console.info = () => {}; // suppress debugging messages
            });

            afterEach(() => {
                console.info = originalConsoleInfo;
                process.browser = originalProcessBrowser;
            });

            describe('simple isomorphic component', () => {
                let fetchBaseValueSpy;
                const html = `<div id="0123456789abcdef"><section>625</section></div><script type="text/javascript">Object.assign(["__ISO_DATA__","iso-simple${suffix}","0123456789abcdef"].reduce(function(a,b){return a[b]=a[b]||{};},window),{"props":{"power":4},"hydration":{"${keyFor(`iso-simple${suffix}`, {power: 4})}":{"baseValue":5}}});</script>`;

                beforeEach(() => {
                    fetchBaseValueSpy = jest.spyOn(fetchBaseValue, 'default');
                    document.body.innerHTML = html;
                    eval(document.querySelector('script').innerHTML);
                    hydrateSimple();
                });

                afterEach(() => {
                    ReactDOM.unmountComponentAtNode(document.getElementById('0123456789abcdef'));
                    delete window.__ISO_DATA__;
                    document.body.innerHTML = '';
                    fetchBaseValueSpy.mockRestore();
                });

                test('does not change DOM', () => {
                    expect(document.body.innerHTML).toBe(html);
                });

                test('does not call fetchBaseValue()', () => {
                    expect(fetchBaseValueSpy.mock.calls).toHaveLength(0);
                });

                test('marks all iso-simple components as hydrated', () => {
                    expect(window.__ISO_DATA__[`iso-simple${suffix}`].hydrated).toBe(true);
                });

                test('marks the specific iso-simple component as hydrated', () => {
                    expect(window.__ISO_DATA__[`iso-simple${suffix}`]['0123456789abcdef'].hydrated).toBe(true);
                });
            });

            describe('nested isomorphic component', () => {
                let fetchBaseValueSpy;
                let fetchVSpy;
                let fetchWSpy;
                const html = `<div id="fedcba9876543210"><section><ul><li>27</li><li>72</li><li><section>625</section></li></ul></section></div><script type="text/javascript">Object.assign(["__ISO_DATA__","iso-nested${suffix}","fedcba9876543210"].reduce(function(a,b){return a[b]=a[b]||{};},window),{"props":{"coefficient":9},"hydration":{"${keyFor(`iso-nested${suffix}`, {coefficient: 9})}":{"v":3,"w":8},"${keyFor(`iso-simple${suffix}`, {power: 4})}":{"baseValue":5}}});</script>`;

                beforeEach(() => {
                    fetchBaseValueSpy = jest.spyOn(fetchBaseValue, 'default');
                    fetchVSpy = jest.spyOn(fetchV, 'default');
                    fetchWSpy = jest.spyOn(fetchW, 'default');
                    document.body.innerHTML = html;
                    eval(document.querySelector('script').innerHTML);
                    hydrateNested();
                });

                afterEach(() => {
                    ReactDOM.unmountComponentAtNode(document.getElementById('fedcba9876543210'));
                    delete window.__ISO_DATA__;
                    document.body.innerHTML = '';
                    fetchWSpy.mockRestore();
                    fetchVSpy.mockRestore();
                    fetchBaseValueSpy.mockRestore();
                });

                test('does not change the DOM', () => {
                    expect(document.body.innerHTML).toBe(html);
                });

                test('does not call fetchBaseValue()', () => {
                    expect(fetchBaseValueSpy.mock.calls).toHaveLength(0);
                });

                test('does not call fetchV()', () => {
                    expect(fetchVSpy.mock.calls).toHaveLength(0);
                });

                test('does not call fetchW()', () => {
                    expect(fetchWSpy.mock.calls).toHaveLength(0);
                });
            });

            describe('styled nested isomorphic component', () => {
                let fetchBaseValueSpy;
                let fetchVSpy;
                let fetchWSpy;
                const head = '<style data-styled-components="lmVDjZ eNTiKw">/* sc-component-id: StyledSection-semgqu-0 */.lmVDjZ{padding:7px;background:#bbb;}/* sc-component-id: StyledList-semgqu-1 */.eNTiKw{margin:7px;background:#666;color:#ddd;}</style>';
                const body = `<div id="0123456789abcdef"><section class="StyledSection-semgqu-0 lmVDjZ"><ul class="StyledList-semgqu-1 eNTiKw"><li>27</li><li>72</li><li><section>625</section></li></ul></section></div><script type="text/javascript">Object.assign(["__ISO_DATA__","iso-nested-with-styles","0123456789abcdef"].reduce(function(a,b){return a[b]=a[b]||{};},window),{"props":{"coefficient":9},"hydration":{"${keyFor(`iso-nested-with-styled${suffix}`, {coefficient: 9})}":{"v":3,"w":8},"${keyFor(`iso-simple${suffix}`, {power: 4})}":{"baseValue":5}}});</script>`;

                beforeEach(() => {
                    fetchBaseValueSpy = jest.spyOn(fetchBaseValue, 'default');
                    fetchVSpy = jest.spyOn(fetchV, 'default');
                    fetchWSpy = jest.spyOn(fetchW, 'default');
                    document.head.innerHTML = head;
                    document.body.innerHTML = body;
                    eval(document.querySelector('script').innerHTML);
                    hydrateNestedWithStyles();
                });

                afterEach(() => {
                    ReactDOM.unmountComponentAtNode(document.getElementById('0123456789abcdef'));
                    delete window.__ISO_DATA__;
                    document.body.innerHTML = '';
                    document.head.innerHTML = '';
                    fetchWSpy.mockRestore();
                    fetchVSpy.mockRestore();
                    fetchBaseValueSpy.mockRestore();
                });

                test('does not change the head DOM', () => {
                    expect(document.head.innerHTML).toBe(head);
                });

                test('does not change the body DOM', () => {
                    expect(document.body.innerHTML).toBe(body);
                });

                test('does not call fetchBaseValue()', () => {
                    expect(fetchBaseValueSpy.mock.calls).toHaveLength(0);
                });

                test('does not call fetchV()', () => {
                    expect(fetchVSpy.mock.calls).toHaveLength(0);
                });

                test('does not call fetchW()', () => {
                    expect(fetchWSpy.mock.calls).toHaveLength(0);
                });
            });

            describe('observable does not immediately produce an event', () => {
                let originalConsoleWarn;
                let originalConsoleError;
                let consoleWarnSpy;
                const html = `<div id="0123456789abcdef"></div><script type="text/javascript">Object.assign(["__ISO_DATA__","iso-simple${suffix}","0123456789abcdef"].reduce(function(a,b){return a[b]=a[b]||{};},window),{"props":{"power":4},"hydration":{}});</script>`;

                beforeEach(() => {
                    originalConsoleWarn = console.warn;
                    console.warn = () => {};
                    originalConsoleError = console.error;
                    console.error = () => {};
                    consoleWarnSpy = jest.spyOn(console, 'warn');
                    document.body.innerHTML = html;
                    eval(document.querySelector('script').innerHTML);
                    hydrateSimple();
                });

                afterEach(() => {
                    ReactDOM.unmountComponentAtNode(document.getElementById('0123456789abcdef'));
                    delete window.__ISO_DATA__;
                    document.body.innerHTML = '';
                    consoleWarnSpy.mockRestore();
                    console.warn = originalConsoleWarn;
                    console.error = originalConsoleError;
                });

                test('it complains that subscribers have to wait for the observable before rendering', () => {
                    expect(consoleWarnSpy.mock.calls.slice(-1)[0][0]).toBe(
                        `Cannot hydrate isomorphic component "iso-simple${suffix}" at DOM node "#0123456789abcdef" because the Observable returned by its getData(props, hydration) function does not produce an event immediately upon subscription. To avoid this error, ensure getData(props, hydration) returns a Bacon.js Property which produces an event immediately when the hydration object is provided.`
                    );
                });
            });

            describe('no hydration', () => {
                const html = `<div id="0123456789abcdef"></div><script type="text/javascript">Object.assign(["__ISO_DATA__","iso-very-simple${suffix}","0123456789abcdef"].reduce(function(a,b){return a[b]=a[b]||{};},window),{"props":{"power":4},"hydration":null});</script>`;

                beforeEach(() => {
                    document.body.innerHTML = html;
                    eval(document.querySelector('script').innerHTML);
                    hydrateVerySimple();
                });

                afterEach(() => {
                    ReactDOM.unmountComponentAtNode(document.getElementById('0123456789abcdef'));
                    delete window.__ISO_DATA__;
                    document.body.innerHTML = '';
                });

                test('it updates the DOM', () => {
                    expect(document.body.innerHTML).toBe(`<div id="0123456789abcdef"><section>625</section></div><script type="text/javascript">Object.assign(["__ISO_DATA__","iso-very-simple${suffix}","0123456789abcdef"].reduce(function(a,b){return a[b]=a[b]||{};},window),{"props":{"power":4},"hydration":null});</script>`);
                });
            });

            describe('missing __ISO_DATA__', () => {
                describe('with warnings', () => {
                    let originalConsoleWarn;
                    let consoleWarnSpy;

                    beforeEach(() => {
                        originalConsoleWarn = console.warn;
                        console.warn = () => {};
                        consoleWarnSpy = jest.spyOn(console, 'warn');
                        hydrateVerySimple({warnIfNotFound: true});
                    });

                    afterEach(() => {
                        document.body.innerHTML = '';
                        consoleWarnSpy.mockRestore();
                        console.warn = originalConsoleWarn;
                    });

                    test('generates a warning', () => {
                        expect(consoleWarnSpy.mock.calls).toHaveLength(1);
                    });

                    test('warns that __ISO_DATA__ is missing', () => {
                        expect(consoleWarnSpy.mock.calls[0][0]).toBe('No isomorphic components to hydrate.');
                    });

                    test('does not change the DOM', () => {
                        expect(document.body.innerHTML).toBe('');
                    });
                });

                describe('without warnings', () => {
                    let originalConsoleWarn;
                    let consoleWarnSpy;

                    beforeEach(() => {
                        originalConsoleWarn = console.warn;
                        console.warn = () => {};
                        consoleWarnSpy = jest.spyOn(console, 'warn');
                        hydrateVerySimple();
                    });

                    afterEach(() => {
                        document.body.innerHTML = '';
                        consoleWarnSpy.mockRestore();
                        console.warn = originalConsoleWarn;
                    });

                    test('does not generate a warning', () => {
                        expect(consoleWarnSpy.mock.calls).toHaveLength(0);
                    });

                    test('does not change the DOM', () => {
                        expect(document.body.innerHTML).toBe('');
                    });
                });
            });

            describe('missing __ISO_DATA__ component entry', () => {
                describe('with warnings', () => {
                    const html = `<div id="0123456789abcdef"><section>625</section></div><script type="text/javascript">Object.assign(["__ISO_DATA__","iso-simple${suffix}","0123456789abcdef"].reduce(function(a,b){return a[b]=a[b]||{};},window),{"props":{"power":4},"hydration":null});</script>`;
                    let originalConsoleWarn;
                    let consoleWarnSpy;

                    beforeEach(() => {
                        originalConsoleWarn = console.warn;
                        console.warn = () => {};
                        consoleWarnSpy = jest.spyOn(console, 'warn');
                        document.body.innerHTML = html;
                        eval(document.querySelector('script').innerHTML);
                        hydrateVerySimple({warnIfNotFound: true});
                    });

                    afterEach(() => {
                        document.body.innerHTML = '';
                        consoleWarnSpy.mockRestore();
                        console.warn = originalConsoleWarn;
                    });

                    test('generates a warning', () => {
                        expect(consoleWarnSpy.mock.calls).toHaveLength(1);
                    });

                    test('warns that __ISO_DATA__ component entry is missing', () => {
                        expect(consoleWarnSpy.mock.calls[0][0]).toBe(`No hydration data found for isomorphic component "iso-very-simple${suffix}".`);
                    });

                    test('does not change the DOM', () => {
                        expect(document.body.innerHTML).toBe(html);
                    });
                });

                describe('without warnings', () => {
                    const html = `<div id="0123456789abcdef"><section>625</section></div><script type="text/javascript">Object.assign(["__ISO_DATA__","iso-simple${suffix}","0123456789abcdef"].reduce(function(a,b){return a[b]=a[b]||{};},window),{"props":{"power":4},"hydration":null});</script>`;
                    let originalConsoleWarn;
                    let consoleWarnSpy;

                    beforeEach(() => {
                        originalConsoleWarn = console.warn;
                        console.warn = () => {};
                        consoleWarnSpy = jest.spyOn(console, 'warn');
                        document.body.innerHTML = html;
                        eval(document.querySelector('script').innerHTML);
                        hydrateVerySimple();
                    });

                    afterEach(() => {
                        document.body.innerHTML = '';
                        consoleWarnSpy.mockRestore();
                        console.warn = originalConsoleWarn;
                    });

                    test('does not generate a warning', () => {
                        expect(consoleWarnSpy.mock.calls).toHaveLength(0);
                    });

                    test('does not change the DOM', () => {
                        expect(document.body.innerHTML).toBe(html);
                    });
                });
            });

            describe('__ISO_DATA__ component entry already hydrated', () => {
                describe('with warnings', () => {
                    const html = `<div id="0123456789abcdef"><section>625</section></div><script type="text/javascript">Object.assign(["__ISO_DATA__","iso-simple${suffix}","0123456789abcdef"].reduce(function(a,b){return a[b]=a[b]||{};},window),{"props":{"power":4},"hydration":{"${keyFor(`iso-simple${suffix}`, {power: 4})}":{"baseValue":5}}});</script>`;
                    let originalConsoleWarn;
                    let consoleWarnSpy;

                    beforeEach(() => {
                        originalConsoleWarn = console.warn;
                        console.warn = () => {};
                        consoleWarnSpy = jest.spyOn(console, 'warn');
                        document.body.innerHTML = html;
                        eval(document.querySelector('script').innerHTML);
                        window.__ISO_DATA__[`iso-simple${suffix}`].hydrated = true;
                        hydrateSimple();
                    });

                    afterEach(() => {
                        ReactDOM.unmountComponentAtNode(document.getElementById('0123456789abcdef'));
                        delete window.__ISO_DATA__;
                        document.body.innerHTML = '';
                        consoleWarnSpy.mockRestore();
                        console.warn = originalConsoleWarn;
                    });

                    test('generates a warning', () => {
                        expect(consoleWarnSpy.mock.calls).toHaveLength(1);
                    });

                    test('warns that __ISO_DATA__ is already hydrated', () => {
                        expect(consoleWarnSpy.mock.calls[0][0]).toBe(`Isomorphic component "iso-simple${suffix}" is already hydrated.`);
                    });

                    test('does not change the DOM', () => {
                        expect(document.body.innerHTML).toBe(html);
                    });
                });

                describe('without warnings', () => {
                    const html = `<div id="0123456789abcdef"><section>625</section></div><script type="text/javascript">Object.assign(["__ISO_DATA__","iso-simple${suffix}","0123456789abcdef"].reduce(function(a,b){return a[b]=a[b]||{};},window),{"props":{"power":4},"hydration":{"${keyFor(`iso-simple${suffix}`, {power: 4})}":{"baseValue":5}}});</script>`;
                    let originalConsoleWarn;
                    let consoleWarnSpy;

                    beforeEach(() => {
                        originalConsoleWarn = console.warn;
                        console.warn = () => {};
                        consoleWarnSpy = jest.spyOn(console, 'warn');
                        document.body.innerHTML = html;
                        eval(document.querySelector('script').innerHTML);
                        window.__ISO_DATA__[`iso-simple${suffix}`].hydrated = true;
                        hydrateSimple({warnIfAlreadyHydrated: false});
                    });

                    afterEach(() => {
                        ReactDOM.unmountComponentAtNode(document.getElementById('0123456789abcdef'));
                        delete window.__ISO_DATA__;
                        document.body.innerHTML = '';
                        consoleWarnSpy.mockRestore();
                        console.warn = originalConsoleWarn;
                    });

                    test('does not generates a warning', () => {
                        expect(consoleWarnSpy.mock.calls).toHaveLength(0);
                    });

                    test('does not change the DOM', () => {
                        expect(document.body.innerHTML).toBe(html);
                    });
                });
            });

            describe('__ISO_DATA__ component instance already hydrated', () => {
                const html = `<div id="0123456789abcdef"><section>625</section></div><script type="text/javascript">Object.assign(["__ISO_DATA__","iso-simple${suffix}","0123456789abcdef"].reduce(function(a,b){return a[b]=a[b]||{};},window),{"props":{"power":4},"hydration":{"${keyFor(`iso-simple${suffix}`, {power: 4})}":{"baseValue":5}}});</script>`;
                let originalConsoleError;
                let consoleErrorSpy;

                beforeEach(() => {
                    originalConsoleError = console.warn;
                    console.error = () => {};
                    consoleErrorSpy = jest.spyOn(console, 'error');
                    document.body.innerHTML = html;
                    eval(document.querySelector('script').innerHTML);
                    window.__ISO_DATA__[`iso-simple${suffix}`]['0123456789abcdef'].hydrated = true;
                    hydrateSimple();
                });

                afterEach(() => {
                    ReactDOM.unmountComponentAtNode(document.getElementById('0123456789abcdef'));
                    delete window.__ISO_DATA__;
                    document.body.innerHTML = '';
                    consoleErrorSpy.mockRestore();
                    console.error = originalConsoleError;
                });

                test('generates an error message', () => {
                    expect(consoleErrorSpy.mock.calls).toHaveLength(1);
                });

                test('generates an error message to say that __ISO_DATA__ is already hydrated', () => {
                    expect(consoleErrorSpy.mock.calls[0][0]).toBe(`Isomorphic component "iso-simple${suffix}" at mount point "#0123456789abcdef" is already hydrated.`);
                });

                test('does not change the DOM', () => {
                    expect(document.body.innerHTML).toBe(html);
                });
            });

            describe('__ISO_DATA__ component instance mount point not found', () => {
                const html = `<div id="fedcba9876543210"><section>625</section></div><script type="text/javascript">Object.assign(["__ISO_DATA__","iso-simple${suffix}","0123456789abcdef"].reduce(function(a,b){return a[b]=a[b]||{};},window),{"props":{"power":4},"hydration":{"${keyFor(`iso-simple${suffix}`, {power: 4})}":{"baseValue":5}}});</script>`;
                let originalConsoleError;
                let consoleErrorSpy;

                beforeEach(() => {
                    originalConsoleError = console.warn;
                    console.error = () => {};
                    consoleErrorSpy = jest.spyOn(console, 'error');
                    document.body.innerHTML = html;
                    eval(document.querySelector('script').innerHTML);
                    hydrateSimple();
                });

                afterEach(() => {
                    ReactDOM.unmountComponentAtNode(document.getElementById('fedcba9876543210'));
                    delete window.__ISO_DATA__;
                    document.body.innerHTML = '';
                    consoleErrorSpy.mockRestore();
                    console.error = originalConsoleError;
                });

                test('generates an error message', () => {
                    expect(consoleErrorSpy.mock.calls).toHaveLength(1);
                });

                test('generates an error message to say that tne mount point is not found', () => {
                    expect(consoleErrorSpy.mock.calls[0][0]).toBe(`Cannot hydrate isomorphic component "iso-simple${suffix}" at mount point "#0123456789abcdef" because the mount point was not found.`);
                });

                test('does not change the DOM', () => {
                    expect(document.body.innerHTML).toBe(html);
                });
            });

            describe('non-isomorphic component', () => {
                let originalConsoleError;
                let consoleErrorSpy;

                beforeEach(() => {
                    originalConsoleError = console.error;
                    console.error = () => {};
                    consoleErrorSpy = jest.spyOn(console, 'error');

                    const Component = ({children}) => (<div>{children}</div>);

                    hydrate(Component);
                });

                afterEach(() => {
                    consoleErrorSpy.mockRestore();
                    console.error = originalConsoleError;
                });

                test('generates an error message', () => {
                    expect(consoleErrorSpy.mock.calls).toHaveLength(1);
                });

                test('generates an error message to say that non-isomorphic components cannot be hydrated', () => {
                    expect(consoleErrorSpy.mock.calls[0][0]).toBe('Cannot hydrate a non-isomorphic component');
                });

                test('does not change the DOM', () => {
                    expect(document.body.innerHTML).toBe('');
                });
            });

            describe('hydrateElement throws an error', () => {
                const html = `<div id="0123456789abcdef"><section>625</section></div><script type="text/javascript">Object.assign(["__ISO_DATA__","iso-simple${suffix}","0123456789abcdef"].reduce(function(a,b){return a[b]=a[b]||{};},window),{"props":{"power":4},"hydration":{"${keyFor(`iso-simple${suffix}`, {power: 4})}":{"baseValue":5}}});</script>`;
                let originalConsoleError;
                let consoleErrorSpy;

                let originalReactDomHydrate;
                let error;

                beforeEach(() => {
                    originalConsoleError = console.error;
                    console.error = () => {};
                    consoleErrorSpy = jest.spyOn(console, 'error');

                    originalReactDomHydrate = ReactDOM.hydrate;
                    ReactDOM.hydrate = () => {
                        throw new Error('Huzzah!');
                    };

                    document.body.innerHTML = html;
                    eval(document.querySelector('script').innerHTML);
                    try {
                        hydrateSimple();
                    } catch (e) {
                        error = e;
                    }
                });

                afterEach(() => {
                    ReactDOM.unmountComponentAtNode(document.getElementById('0123456789abcdef'));
                    delete window.__ISO_DATA__;
                    document.body.innerHTML = '';

                    ReactDOM.hydrate = originalReactDomHydrate;

                    consoleErrorSpy.mockRestore();
                    console.error = originalConsoleError;
                });

                test('generates an error message', () => {
                    expect(consoleErrorSpy.mock.calls).toHaveLength(1);
                });

                test('generates an error message to say that an error was thrown', () => {
                    expect(consoleErrorSpy.mock.calls[0][0]).toBe(`Component "#0123456789abcdef" with name "iso-simple${suffix}" threw an error while hydrating.`);
                });

                test('does not change the DOM', () => {
                    expect(document.body.innerHTML).toBe(html);
                });

                test('rethrows the error', () => {
                    expect(error.message).toBe('Huzzah!');
                });
            });

            describe('server', () => {
                const html = `<div id="0123456789abcdef"><section>625</section></div><script type="text/javascript">Object.assign(["__ISO_DATA__","iso-simple${suffix}","0123456789abcdef"].reduce(function(a,b){return a[b]=a[b]||{};},window),{"props":{"power":4},"hydration":{"${keyFor(`iso-simple${suffix}`, {power: 4})}":{"baseValue":5}}});</script>`;
                let originalProcessBrowser;

                beforeEach(() => {
                    originalProcessBrowser = process.browser;
                    process.browser = false;

                    document.body.innerHTML = html;
                    eval(document.querySelector('script').innerHTML);
                    hydrateSimple();
                });

                afterEach(() => {
                    ReactDOM.unmountComponentAtNode(document.getElementById('0123456789abcdef'));
                    document.body.innerHTML = '';

                    process.browser = originalProcessBrowser;
                });

                test('does not attempt to hydrate', () => {
                    expect(window.__ISO_DATA__[`iso-simple${suffix}`].hydrated).toBe(undefined);
                });
            });
        });
    });
});
