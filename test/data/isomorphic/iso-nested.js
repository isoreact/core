import PropTypes from 'prop-types';
import {combineLatest, of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

import hydrate from '../../../src/hydrate';
import isomorphic from '../../../src/isomorphic';

import Nested from '../components/nested';
import NestedContext from '../context/nested-context';
import fetchV from '../streams/fetch-v';
import fetchW from '../streams/fetch-w';

const isoNested = {
    name: 'iso-nested',
    component: Nested,
    context: NestedContext,
    getData: (props, hydration) => {
        const {coefficient = 1} = props;

        // Get {v, w} from hydration if hydrating, or from an external data source if not hydrating.
        const v$ = hydration
            ? observableOf(hydration.v)
            : fetchV();

        const w$ = hydration
            ? observableOf(hydration.w)
            : fetchW();

        // Calculate {a, b} based on v (from external data source) and coefficient (from props)
        const a$ = v$.pipe(map((v) => coefficient * v));
        const b$ = w$.pipe(map((w) => coefficient * w));

        return combineLatest(
            combineLatest(a$, b$).pipe(map(([a, b]) => ({
                a,
                b,
            }))),
            hydration ? observableOf(null) : combineLatest(v$, w$).pipe(map(([v, w]) => ({
                v,
                w,
            }))),
        )
            .pipe(
                map(([state, hydration]) => ({
                    state,
                    hydration,
                })),
            );
    },
    propTypes: {
        coefficient: PropTypes.number,
    },
};

export const IsoNested = isomorphic(isoNested);

export function hydrateNested(options) {
    hydrate(IsoNested, options);
}
