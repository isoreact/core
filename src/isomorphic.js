import React from 'react';
import ReactDOMServer from 'react-dom/server';
import bacon from 'baconjs';

import {ServerContext, HydrationContext} from './context';
import {SSR_TIMEOUT_ERROR} from './errors';
import keyFor from './key-for';

/**
 * A function to create a Bacon.js <code>Observable</code>, optionally taking initial data when hydrating in the browser.
 *
 * @callback getData
 * @param {Object} props       - props passed to the isomorphic component, some of which it may use to look up data
 * @param {Object} [hydration] - initial data if we're in the browser and hydrating
 */

/**
 * Create an isomorphic version of a React component.
 *
 * @param {Object}        isomorphicComponent               - isomorphic component details
 * @param {String}        isomorphicComponent.name          - name
 * @param {Function}      isomorphicComponent.component     - React component
 * @param {React.Context} isomorphicComponent.context       - context to provide and consume the data stream
 * @param {getData}       isomorphicComponent.getData       - data stream creation function
 * @param {timeout}       [isomorphicComponent.timeout]     - the number of milliseconds to wait for the stream to emit its first value
 * @param {Object}        [isomorphicComponent.propTypes]   - propType validations
 * @returns {Function} the created isomorphic component
 */
export default function isomorphic({
    name,
    component:   Component,
    context:     Context,
    getData,
    timeout,
    propTypes, // eslint-disable-line react/forbid-foreign-prop-types
}) {
    return class Isomorphic extends React.Component {
        static __isomorphic_name__ = name; // eslint-disable-line camelcase
        static displayName = name;
        static propTypes = propTypes;

        shouldComponentUpdate() {
            return false;
        }

        render() {
            const {children, ...props} = this.props; // eslint-disable-line no-unused-vars, react/prop-types

            if (process.browser) {
                return (
                    <HydrationContext.Consumer>
                        {(getHydration) => {
                            const {hydration, elementId} = getHydration(name, props) || {};
                            const data$ = getData(props, hydration).map('.state');

                            return (
                                <Context.Provider value={{data$, name, elementId}}>
                                    <Component />
                                </Context.Provider>
                            );
                        }}
                    </HydrationContext.Consumer>
                );
            } else {
                return (
                    <ServerContext.Consumer>
                        {({getStream, registerStream, onError}) => {
                            const key = keyFor(name, props);
                            let stream$ = getStream(key);

                            if (!stream$) {
                                stream$ = getData(props, undefined).first();
                                registerStream(key, stream$);
                            }

                            let immediate = true;
                            let immediateValue = null;
                            let hasImmediateValue = false;

                            bacon
                                .mergeAll(
                                    stream$
                                        .first()
                                        .doAction(({state}) => {
                                            if (immediate) {
                                                hasImmediateValue = true;
                                                immediateValue = state;
                                            }
                                        })
                                        .doError((error) => {
                                            if (immediate) {
                                                onError(error);
                                            }
                                        }),
                                    // Insert an error into the stream after the timeout, if specified, has elapsed.
                                    timeout === undefined
                                        ? bacon.never()
                                        : bacon.later(timeout).flatMapLatest(() => new bacon.Error(SSR_TIMEOUT_ERROR))
                                )
                                .firstToPromise()
                                .then(() => {
                                    if (!hasImmediateValue) {
                                        // When the stream resolves later, continue walking the tree.
                                        ReactDOMServer.renderToStaticMarkup(
                                            <ServerContext.Provider value={{getStream, registerStream}}>
                                                <Context.Provider
                                                    value={{
                                                        data$: stream$.map('.state'),
                                                        name,
                                                    }}
                                                >
                                                    <Component />
                                                </Context.Provider>
                                            </ServerContext.Provider>
                                        );
                                    }
                                })
                                .catch((error) => {
                                    onError(error);
                                });

                            immediate = false;

                            // If the stream is resolved, render it.
                            if (hasImmediateValue) {
                                return (
                                    <Context.Provider
                                        value={{
                                            data$: bacon.constant(immediateValue),
                                            name,
                                        }}
                                    >
                                        <Component />
                                    </Context.Provider>
                                );
                            }
                        }}
                    </ServerContext.Consumer>
                );
            }
        }
    };
}
