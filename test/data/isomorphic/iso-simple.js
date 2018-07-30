import PropTypes from 'prop-types';
import {combineLatest, of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

import hydrate from '../../../src/hydrate';
import isomorphic from '../../../src/isomorphic';

import Simple from '../components/simple';
import SimpleContext from '../context/simple-context';
import fetchBaseValue from '../streams/fetch-base-value';

const isoSimple = {
    name: 'iso-simple',
    component: Simple,
    context: SimpleContext,
    getData: (props, hydration) => {
        const {power = 1} = props;

        // Get baseValue from hydration if hydrating, or from an external data source if not hydrating.
        const baseValue$ = hydration
            ? observableOf(hydration.baseValue)
            : fetchBaseValue();

        // Calculate x based on baseValue (from external data source) and power (from props)
        const x$ = baseValue$.pipe(map((baseValue) => baseValue ** power));

        return combineLatest(
            x$.pipe(map((x) => ({
                x,
            }))),
            hydration ? observableOf(null) : baseValue$.pipe(map((baseValue) => ({
                baseValue,
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
        power: PropTypes.number,
    },
};

export const IsoSimple = isomorphic(isoSimple);

export function hydrateSimple(options) {
    hydrate(IsoSimple, options);
}
