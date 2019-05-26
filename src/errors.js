export const SSR_TIMEOUT_ERROR = Symbol(); // eslint-disable-line

export function noImmediateStateOnServerError(name) {
    return (
        '\n👀\n'
        + '📎:\n'
        + `It looks like you\'re trying to render '${name || '(accidentally untitled isomorphic component)'}. Try the`
        + ' following:\n\n'
        + '1. Use the client-side build of IsoReact in the browser, not the server-side build.\n'
        + '2. When getData(props, hydration) is executed in the browser, ensure the Bacon.js Property it returns'
        + ' produces an event immediately.'
    );
}

export function noImmediateStateOnHydrationError(name, elementId) {
    return (
        `Cannot hydrate isomorphic component "${name}" at DOM node "#${elementId}" because the Observable`
        + ' returned by its getData(props, hydration) function does not produce an event immediately upon subscription.'
        + ' To avoid this error, ensure getData(props, hydration) returns a Bacon.js Property which produces an event'
        + ' immediately when the hydration object is provided.'
    );
}

export function noImmediateStateOnRenderError(name) {
    return (
        `Isomorphic component "${name}" is being rendered client-side, but the Observable returned by its`
        + ' getData(props, hydration) function does not produce an event immediately upon subscription. To avoid this'
        + ' error, ensure getData(props, hydration) returns a Bacon.js Property which produces an event immediately.'
    );
}
