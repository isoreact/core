import React from 'react';
import {__DO_NOT_USE_OR_YOU_WILL_BE_HAUNTED_BY_SPOOKY_GHOSTS} from 'styled-components';

import renderToHtml from '../src/render-to-html';
import StyledComponentsServerRenderer from '../src/styled-components-server-renderer';

import {IsoSimple as IsoSimpleConnected} from './data/connect/isomorphic/iso-simple';
import {IsoNested as IsoNestedConnected} from './data/connect/isomorphic/iso-nested';
import {IsoNestedWithStyles as IsoNestedWithStylesConnected} from './data/connect/isomorphic/iso-nested-with-styles';
import {IsoThrowsDelayedError} from './data/connect/isomorphic/iso-throws-delayed-error';
import {IsoThrowsImmediateError} from './data/connect/isomorphic/iso-throws-immediate-error';

import {IsoSimple as IsoSimpleHooked} from './data/hooks/isomorphic/iso-simple';
import {IsoNested as IsoNestedHooked} from './data/hooks/isomorphic/iso-nested';
import {IsoNestedWithStyles as IsoNestedWithStylesHooked} from './data/hooks/isomorphic/iso-nested-with-styles';

import * as fetchBaseValue from './data/streams/fetch-base-value';
import * as fetchV from './data/streams/fetch-v';
import * as fetchW from './data/streams/fetch-w';

jest.mock('cuid');
require('cuid').mockImplementation(() => '0123456789abcdef');

const {StyleSheet} = __DO_NOT_USE_OR_YOU_WILL_BE_HAUNTED_BY_SPOOKY_GHOSTS;

describe('renderToHtml(isomorphicComponent)', () => {
    let originalProcessBrowser;

    beforeEach(() => {
        originalProcessBrowser = process.browser;
        process.browser = false;
    });

    afterEach(() => {
        process.browser = originalProcessBrowser;
    });

    [
        {
            name: '<Connect />',
            IsoSimple: IsoSimpleConnected,
            IsoNested: IsoNestedConnected,
            IsoNestedWithStyles: IsoNestedWithStylesConnected,
        },
        {
            name: 'useIsomorphicContext()',
            IsoSimple: IsoSimpleHooked,
            IsoNested: IsoNestedHooked,
            IsoNestedWithStyles: IsoNestedWithStylesHooked,
        }
    ].forEach(({
        name,
        IsoSimple,
        IsoNested,
        IsoNestedWithStyles,
    }) => {
        describe(name, () => {
            describe('simple isomorphic component', () => {
                let fetchBaseValueSpy;
                let html;

                beforeEach(() => {
                    fetchBaseValueSpy = jest.spyOn(fetchBaseValue, 'default');
                });

                afterEach(() => {
                    html = undefined;
                    fetchBaseValueSpy.mockRestore();
                });

                describe('with mount point className', () => {
                    beforeEach(async () => {
                        html = {body: await renderToHtml(<IsoSimple power={4} />, {className: 'mount-point'})};
                    });

                    test('renders correctly', () => {
                        expect(html).toMatchSnapshot();
                    });

                    test('calls fetchBaseValue() once', () => {
                        expect(fetchBaseValueSpy.mock.calls).toHaveLength(1);
                    });
                });

                describe('without mount point className', () => {
                    beforeEach(async () => {
                        html = {body: await renderToHtml(<IsoSimple power={4} />)};
                    });

                    test('renders correctly', () => {
                        expect(html).toMatchSnapshot();
                    });

                    test('calls fetchBaseValue() once', () => {
                        expect(fetchBaseValueSpy.mock.calls).toHaveLength(1);
                    });
                });
            });

            describe('nested isomorphic component', () => {
                let fetchBaseValueSpy;
                let fetchVSpy;
                let fetchWSpy;
                let html;

                beforeEach(async () => {
                    fetchBaseValueSpy = jest.spyOn(fetchBaseValue, 'default');
                    fetchVSpy = jest.spyOn(fetchV, 'default');
                    fetchWSpy = jest.spyOn(fetchW, 'default');
                    html = {body: await renderToHtml(<IsoNested coefficient={9} />)};
                });

                afterEach(() => {
                    html = undefined;
                    fetchWSpy.mockRestore();
                    fetchVSpy.mockRestore();
                    fetchBaseValueSpy.mockRestore();
                });

                test('renders correctly', () => {
                    expect(html).toMatchSnapshot();
                });

                test('calls fetchBaseValue() once', () => {
                    expect(fetchBaseValueSpy.mock.calls).toHaveLength(1);
                });

                test('calls fetchVSpy() once', () => {
                    expect(fetchVSpy.mock.calls).toHaveLength(1);
                });

                test('calls fetchWSpy() once', () => {
                    expect(fetchWSpy.mock.calls).toHaveLength(1);
                });
            });

            describe('styled nested isomorphic component', () => {
                beforeEach(() => {
                    // Pretend we're on a server
                    StyleSheet.reset(true);
                });

                afterEach(() => {
                    // Stop pretending
                    StyleSheet.reset();
                });

                test('renders correctly', async () => {
                    const renderer = new StyledComponentsServerRenderer();
                    const body = await renderToHtml(
                        <IsoNestedWithStyles coefficient={9} />,
                        {render: new StyledComponentsServerRenderer().render}
                    );

                    expect({head: renderer.getStyleTags(), body})
                        .toMatchSnapshot();
                });
            });

            describe('non-isomorphic component', () => {
                describe('with mount point className', () => {
                    test('renders as a regular element', async () => {
                        expect({body: await renderToHtml(<div>Hello ;)</div>)}).toMatchSnapshot();
                    });
                });

                describe('without mount point className', () => {
                    test('renders as a regular element', async () => {
                        expect({body: await renderToHtml(<div>Hello ;)</div>, {className: 'mount-point'})}).toMatchSnapshot();
                    });
                });
            });
        });
    });

    describe('getData Observable produces an immediate error', () => {
        let originalConsoleError;
        let error;

        beforeEach(async () => {
            originalConsoleError = console.error;
            console.error = () => {};

            return renderToHtml(<IsoThrowsImmediateError />).then(({body}) => body).catch((e) => {
                error = e;
            });
        });

        afterEach(() => {
            console.error = originalConsoleError;
        });

        test('propagates the error to the caller', () => {
            expect(error).toBe('Nope!');
        });
    });

    describe('getData Observable produces a delayed error', () => {
        let originalConsoleError;
        let error;

        beforeEach(async () => {
            originalConsoleError = console.error;
            console.error = () => {};

            return renderToHtml(<IsoThrowsDelayedError />).then(({body}) => body).catch((e) => {
                error = e;
            });
        });

        afterEach(() => {
            console.error = originalConsoleError;
        });

        test('propagates the error to the caller', () => {
            expect(error).toBe('Nope!');
        });
    });
});
