import PropTypes from 'prop-types';
import {Observable} from 'rxjs';

import hydrate from '../../../src/hydrate';
import isomorphic from '../../../src/isomorphic';

import ThrowsError from '../components/throws-error';
import ThrowsErrorContext from '../context/throws-error-context';

const isoThrowsError = {
    name: 'iso-throws-error',
    component: ThrowsError,
    context: ThrowsErrorContext,
    getData: () => {
        return Observable.create((observer) => {
            observer.error('Goodnight');
        });
    },
    loadingProp: 'isLoading',
    propTypes: {
        power: PropTypes.number,
    },
};

export function hydrateThrowsError(options) {
    hydrate(isoThrowsError, options);
}

export const IsoThrowsError = isomorphic(isoThrowsError);
