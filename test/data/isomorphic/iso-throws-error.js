import propTypes from 'prop-types';
import {Observable} from 'rxjs';

import hydrate from '../../../src/hydrate';
import isomorphic from '../../../src/isomorphic';

import ThrowsError from '../components/throws-error';
import ThrowsErrorContext from '../context/throws-error-context';

const isoThrowsError = {
    name: 'iso-throws-error',
    component: ThrowsError,
    context: ThrowsErrorContext,
    getData: () => Observable.create((observer) => void observer.error('Goodnight')),
    propTypes: {
        power: propTypes.number,
    },
};

export const IsoThrowsError = isomorphic(isoThrowsError);

export function hydrateThrowsError(options) {
    hydrate(IsoThrowsError, options);
}
