import React from 'react';
import ReactDOMServer from 'react-dom/server';
import {first, map, shareReplay} from 'rxjs/operators';

import {ServerContext, HydrationContext} from './context';
import hasValueNow from './has-value-now';
import keyFor from './key-for';

/**
 * A function to create an RxJS <code>Observable</code>, optionally taking initial data when hydrating in the browser.
 *
 * @callback getData
 * @param {Object} props       - props passed to the isomorphic component, some of which it may use to look up data
 * @param {Object} [hydration] - initial data if we're in the browser and hydrating
 */

/**
 * Create an isomorphic version of a React component.
 *
 * @param {Object}        isomorphicComponent             - isomorphic component details
 * @param {String}        isomorphicComponent.name        - name
 * @param {Function}      isomorphicComponent.component   - React component
 * @param {React.Context} isomorphicComponent.context     - context to provide and consume the data stream
 * @param {getData}       isomorphicComponent.getData     - data stream creation function
 * @param {String}        isomorphicComponent.loadingProp - the name of the flag to toggle when loading/completed
 * @param {Object}        isomorphicComponent.propTypes   - propType validations
 * @returns {Function} the created isomorphic component
 */
export default function isomorphic({
    name,
    component:   Component,
    context:     Context,
    getData,
    loadingProp,
    propTypes, // eslint-disable-line react/forbid-foreign-prop-types
}) {
    return class Isomorphic extends React.Component {
        static __isomorphic_config__ = { // eslint-disable-line camelcase
            name,
            component: Component,
            context: Context,
            getData,
            loadingProp,
            propTypes,
        };

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
                        {(getHydration) => (
                            <Context.Provider
                                value={{
                                    data$: getData(props, getHydration(name, props)).pipe(map(({props}) => props)),
                                    loadingProp,
                                }}
                            >
                                <Component />
                            </Context.Provider>
                        )}
                    </HydrationContext.Consumer>
                );
            } else {
                return (
                    <ServerContext.Consumer>
                        {({getStream, registerStream, onError}) => {
                            const key = keyFor(name, props);
                            let stream$ = getStream(key);

                            if (!stream$) {
                                stream$ = getData(props, undefined);
                                registerStream(key, stream$);
                            }

                            // If the stream is resolved, render it.
                            if (hasValueNow(stream$)) {
                                return (
                                    <Context.Provider
                                        value={{
                                            data$: stream$.pipe(map(({props}) => props), shareReplay(1)),
                                            loadingProp,
                                        }}
                                    >
                                        <Component />
                                    </Context.Provider>
                                );
                            }

                            // When the stream resolves later, continue walking the tree.
                            stream$
                                .pipe(first())
                                .toPromise()
                                .then(() => {
                                    ReactDOMServer.renderToStaticMarkup(
                                        <ServerContext.Provider value={{getStream, registerStream}}>
                                            <Context.Provider
                                                value={{
                                                    data$: stream$.pipe(map(({props}) => props), shareReplay(1)),
                                                    loadingProp,
                                                }}
                                            >
                                                <Component />
                                            </Context.Provider>
                                        </ServerContext.Provider>
                                    );
                                })
                                .catch((error) => {
                                    onError(error);
                                });
                        }}
                    </ServerContext.Consumer>
                );
            }
        }
    };
}
