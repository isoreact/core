import React from 'react';
import {__DO_NOT_USE_OR_YOU_WILL_BE_HAUNTED_BY_SPOOKY_GHOSTS} from 'styled-components';

import renderToHtml from '../src/render-to-html';
import StyledComponentsServerRenderer from '../src/styled-components-server-renderer';

import {IsoSimple} from './data/isomorphic/iso-simple';
import {IsoNested} from './data/isomorphic/iso-nested';
import {IsoNestedWithStyles} from './data/isomorphic/iso-nested-with-styles';
import {IsoThrowsError} from './data/isomorphic/iso-throws-error';

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

    describe('getData Observable produces an error', () => {
        let originalConsoleError;
        let consoleErrorSpy;
        let error;

        beforeEach(async () => {
            originalConsoleError = console.warn;
            console.error = () => {};
            consoleErrorSpy = jest.spyOn(console, 'error');

            return renderToHtml(<IsoThrowsError/>).then(({body}) => body).catch((e) => {
                error = e;
            });
        });

        afterEach(() => {
            consoleErrorSpy.mockRestore();
            console.error = originalConsoleError;
        });

        test('propagates the error to the caller', () => {
            expect(error).toBe('Goodnight');
        });
    });
});
