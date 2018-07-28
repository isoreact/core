import React from 'react';
import ReactDOMServer from 'react-dom/server';

import {first, map} from 'rxjs/operators';
import cuid from 'cuid';

import {ServerContext} from './context';

const defaultRender = ReactDOMServer.renderToString;

/**
 * Asynchronously render a React component to HTML, also rendering a script tag that stores <code>props</code> and
 * <code>hydration</code> for hydration in the browser.
 *
 * @param {Object}   isomorphicElement        - an instance of an isomorphic component
 * @param {Object}   [options]                - (see below)
 * @param {Function} [options.render]         - an optional alternative server renderer
 * @param {string}   [options.className]      - an optional class name for the mount point
 * @returns {Promise.<string>} a promise that will resolve to the element's HTML
 */
export default async function renderToHtml(
    isomorphicElement,
    {
        render = defaultRender,
        className,
    } = {}
) {
    const {__isomorphic_config__: isomorphicConfig} = isomorphicElement.type;

    // If this isn't an isomorphic component, rather than crapping out, just render it as a plain component.
    if (!isomorphicConfig) {
        return `<div${className ? ` class="${className}"` : ''}>${render(isomorphicElement)}</div>`;
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

    let error;
    const onError = (e) => {
        error = e;
    };

    // Start walking the element tree.
    ReactDOMServer.renderToStaticMarkup((
        <ServerContext.Provider value={{getStream, registerStream, onError}}>
            {isomorphicElement}
        </ServerContext.Provider>
    ));

    // Keep trying to synchronously render the component to HTML, retrying until nothing is waiting on pending streams.
    do {
        // Get all the currently pending keys
        const keys = [...pendingKeys];

        // Wait for all of them to resolve.
        await Promise.all(
            keys
                .map((key) => (
                    registeredStreams[key]
                        .pipe(
                            map(({hydration}) => hydration),
                            first()
                        )
                        .toPromise()
                ))
        );

        // Remove them from pendingKeys, which may have had more keys added while waiting.
        keys.forEach((key) => pendingKeys.delete(key));

        // Rethrow any error from the element tree
        if (error) {
            throw error;
        }
    } while (pendingKeys.size);

    // Now that everything is resolved, synchronously render the html.
    const html = render((
        <ServerContext.Provider value={{getStream}}>
            {isomorphicElement}
        </ServerContext.Provider>
    ));

    const id = cuid();

    // Return the component HTML and some JavaScript to store props and initial data.
    return [
        `<div id="${id}"${className ? ` class="${className}"` : ''}>${html}</div>`,
        '<script type="text/javascript">',
        `Object.assign(["__ISO_DATA__","${isomorphicConfig.name}","${id}"].reduce(function(a,b){return a[b]=a[b]||{};},window),${JSON.stringify({props: isomorphicElement.props, hydration})});`,
        '</script>',
    ].join('');
}
