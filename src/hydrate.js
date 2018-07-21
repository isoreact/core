import React from 'react';
import ReactDOM from 'react-dom';

import {BrowserContext} from './context';
import isomorphic from './isomorphic';
import hasValueNow from './has-value-now';

/**
 * Hydrate all dehydrated instances of the specified isomorphic component, returning a <code>Promise</code>.
 *
 * window.__ISO_DATA__[name][elementId]
 *
 * @param {Object}                   isomorphicComponent             - isomorphic component details
 * @param {string}                   isomorphicComponent.name        - name
 * @param {Function|React.Component} isomorphicComponent.component   - React component
 * @param {React.Context}            isomorphicComponent.context     - context to provide and consume the data stream
 * @param {getData}                  isomorphicComponent.getData     - data stream creation function
 * @param {String}                   isomorphicComponent.loadingProp - the name of the flag to toggle when loading/completed
 * @param {Object}                   [options]                       - options (see below)
 * @param {Boolean}                  [options.warnIfNotFound=false]  - whether or not to warn if the dehydrated isomorphic component is not found
 * @param {Boolean}                  [options.warnIfAlreadyHydrated] - whether or not to warn if the isomorphic component has already been hydrated
 * @returns {undefined}
 */
export default function hydrate(
    {
        name,
        component,
        context,
        getData,
        loadingProp,
    },
    {
        warnIfNotFound = false,
        warnIfAlreadyHydrated = true,
    } = {}
) {
    if (!process.browser) {
        return;
    }

    const {__ISO_DATA__: isoData} = window;

    if (!isoData) {
        if (warnIfNotFound) {
            console.warn('No isomorphic components to hydrate.');
        }

        return;
    }

    const componentHydrations = isoData[name];

    if (!componentHydrations) {
        if (warnIfNotFound) {
            console.warn(`No hydration data found for isomorphic component "${name}".`);
        }

        return;
    }

    if (componentHydrations.hydrated) {
        if (warnIfAlreadyHydrated) {
            console.warn(`Isomorphic component "${name}" is already hydrated.`);
        }

        return;
    }

    for (const [elementId, elementHydration] of Object.entries(componentHydrations).filter(([elementId]) => elementId !== 'hydrated')) {
        // Shouldn't happen.
        if (elementHydration.hydrated) {
            console.error(`Isomorphic component "${name}" at mount point "#${elementId}" is already hydrated.`);
            continue;
        }

        const element = document.getElementById(elementId);

        if (!element) {
            console.error(`Cannot hydrate isomorphic component "${name}" at mount point "#${elementId}" because the mount point was not found.`);
            continue;
        }

        try {
            const {props, hydration} = elementHydration;

            hydrateElement({name, component, context, getData, loadingProp}, {element, props, hydration});
            elementHydration.hydrated = true;
        } catch (error) {
            console.error(`Component "#${elementId}" with name "${name}" threw an error while hydrating.`);
            throw error;
        }
    }

    componentHydrations.hydrated = true;
}

// Hydrate a single element
function hydrateElement(
    {
        name,
        component,
        context,
        getData,
        loadingProp,
    },
    {
        element,
        props,
        hydration,
    }
) {
    if (process.env.NODE_ENV === 'development') {
        console.info(`Hydrating component "${name}"...`); // eslint-disable-line no-console
    }

    const IsomorphicComponent = isomorphic({name, component, context, getData, loadingProp});

    // Ensure hydration (or rendering) happens immediately.
    if (!hasValueNow(getData(props, hydration))) {
        console.error(
            `Cannot hydrate isomorphic component "${name}" at DOM node "#${element.id}" because the Observable`
            + ' returned by its getData() function does not produce its first event to subscribers immediately.'
        );

        return;
    }

    if (hydration) {
        // If we have initial data, hydrate the server-rendered component
        ReactDOM.hydrate((
            <BrowserContext.Provider value={(key) => hydration[key]}>
                <IsomorphicComponent {...props} />
            </BrowserContext.Provider>
        ), element);
    } else {
        // If we don't have initial data, render over the top of anything currently in the element.
        ReactDOM.render((
            <BrowserContext.Provider value={() => {}}>
                <IsomorphicComponent {...props} />
            </BrowserContext.Provider>
        ), element);
    }

    // Debugging info
    if (process.env.NODE_ENV === 'development') {
        console.info(`Isomorphic component "${name}" hydrated 💦 at`, element); // eslint-disable-line no-console
    }
}
