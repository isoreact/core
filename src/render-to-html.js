import React from 'react';
import ReactDOMServer from 'react-dom/server';

import {first, map} from 'rxjs/operators';
import cuid from 'cuid';

import {ServerContext} from './context';

class DefaultServerRenderer {
    headHtml = '';
    bodyHtml = '';

    render(reactElement) {
        this.bodyHtml = ReactDOMServer.renderToString(reactElement);
    }
}

/**
 * Asynchronously render a React component to HTML, also rendering a script tag that stores <code>props</code> and
 * <code>hydration</code> for hydration in the browser.
 *
 * @param {Object}   isomorphicElement        - an instance of an isomorphic component
 * @param {Object}   [options]                - (see below)
 * @param {Function} [options.serverRenderer] - an optional constructor for an alternative server renderer
 * @param {string}   [options.className]      - an optional class name for the mount point
 * @returns {Promise.<{head: string, body: string}>} a promise that will resolve to the element's body HTML and any
 *                                                   supporting head HTML
 */
export default async function renderToHtml(
    isomorphicElement,
    {
        serverRenderer: ServerRenderer = DefaultServerRenderer,
        className,
    } = {}
) {
    const {__isomorphic_config__: isomorphicConfig} = isomorphicElement.type;

    // If this isn't an isomorphic component, rather than crapping out, just render it as a plain component.
    if (!isomorphicConfig) {
        const renderer = new ServerRenderer();

        renderer.render(isomorphicElement);

        return {
            head: renderer.headHtml,
            body: `<div${className ? ` class="${className}"` : ''}>${renderer.bodyHtml}</div>`,
        };
    }

    const registeredStreams = {};
    const pendingKeys = new Set();
    const hydration = {};

    const getStream = (key) => registeredStreams[key];

    // Register stream. In the background, this stores the initial event in hydration, then deregisters the stream.
    const registerStream = async (key, stream$) => {
        registeredStreams[key] = stream$;
        pendingKeys.add(key);

        hydration[key] = await stream$
            .pipe(
                map(({hydration}) => hydration),
                first(),
            )
            .toPromise();

        pendingKeys.delete(key);
    };

    let headHtml;
    let bodyHtml;

    const id = cuid();

    // Keep trying to synchronously render the component to HTML, retrying until nothing is waiting on pending streams.
    do {
        // Wait for any and all pending keys' streams to resolve.
        if (pendingKeys.size) {
            await Promise.all(
                [...pendingKeys].map(async (key) => {
                    hydration[key] = await registeredStreams[key]
                        .pipe(
                            map(({hydration}) => hydration),
                            first(),
                        )
                        .toPromise();
                    pendingKeys.delete(key);
                })
            );
        }

        const renderer = new ServerRenderer();

        // Render the component to HTML
        renderer.render((
            <ServerContext.Provider value={{getStream, registerStream}}>
                {isomorphicElement}
            </ServerContext.Provider>
        ), id);

        ({headHtml, bodyHtml} = renderer);
    } while (pendingKeys.size);

    // Return the component HTML and some JavaScript to store props and initial data.
    return {
        head: headHtml,
        body: [
            `<div id="${id}"${className ? ` class="${className}"` : ''}>${bodyHtml}</div>`,
            '<script type="text/javascript">',
            `Object.assign(["__ISO_DATA__","${isomorphicConfig.name}","${id}"].reduce(function(a,b){return a[b]=a[b]||{};},window),${JSON.stringify({props: isomorphicElement.props, hydration})});`,
            '</script>',
        ].join(''),
    };
}
