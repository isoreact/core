import React from 'react';
import ReactDOM from 'react-dom';

import {HydrationContext} from './context';
import keyFor from './key-for';

/**
 * Hydrate all dehydrated instances of the specified isomorphic component, returning a <code>Promise</code>.
 *
 * window.__ISO_DATA__[name][elementId]
 *
 * @param {Object}                   IsomorphicComponent             - isomorphic React component created with <code>isomorphic</code>
 * @param {Object}                   [options]                       - options (see below)
 * @param {Boolean}                  [options.warnIfNotFound=false]  - whether or not to warn if the dehydrated isomorphic component is not found
 * @param {Boolean}                  [options.warnIfAlreadyHydrated] - whether or not to warn if the isomorphic component has already been hydrated
 * @returns {undefined}
 */
export default function hydrate(
    IsomorphicComponent,
    {
        warnIfNotFound = false,
        warnIfAlreadyHydrated = true,
    } = {}
) {
    if (!process.browser) {
        return;
    }

    if (!IsomorphicComponent.__isomorphic_name__) {
        console.error('Cannot hydrate a non-isomorphic component');

        return;
    }

    const {__ISO_DATA__: isoData} = window;

    if (!isoData) {
        if (warnIfNotFound) {
            console.warn('No isomorphic components to hydrate.');
        }

        return;
    }

    const {__isomorphic_name__: name} = IsomorphicComponent;
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

            hydrateElement({IsomorphicComponent, element, props, hydration});
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
        IsomorphicComponent,
        element,
        props,
        hydration,
    }
) {
    const {__isomorphic_name__: name} = IsomorphicComponent;

    if (process.env.NODE_ENV === 'development') {
        console.info(`Hydrating component "${name}"...`); // eslint-disable-line no-console
    }

    if (hydration) {
        // If we have initial data, hydrate the server-rendered component
        ReactDOM.hydrate((
            <HydrationContext.Provider
                value={(name, props) => ({
                    hydration: hydration[keyFor(name, props)],
                    elementId: element.id,
                })}
            >
                <IsomorphicComponent {...props} />
            </HydrationContext.Provider>
        ), element);
    } else {
        // If we don't have initial data, render over the top of anything currently in the element.
        ReactDOM.render((
            <IsomorphicComponent {...props} />
        ), element);
    }

    // Debugging info
    if (process.env.NODE_ENV === 'development') {
        console.info(`Isomorphic component "${name}" hydrated 💦 at`, element); // eslint-disable-line no-console
    }
}
