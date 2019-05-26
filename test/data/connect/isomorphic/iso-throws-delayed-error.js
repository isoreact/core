import propTypes from 'prop-types';

import hydrate from '../../../../src/hydrate';
import isomorphic from '../../../../src/isomorphic';

import ThrowsErrorContext from '../../context/throws-error-context';
import getData from '../../iso-streams/throws-delayed-error';
import ThrowsError from '../components/throws-error';

const isoThrowsDelayedError = {
    name: 'iso-throws-delayed-error--connected',
    component: ThrowsError,
    context: ThrowsErrorContext,
    getData,
    propTypes: {
        power: propTypes.number,
    },
};

export const IsoThrowsDelayedError = isomorphic(isoThrowsDelayedError);

export function hydrateThrowsDelayedError(options) {
    hydrate(IsoThrowsDelayedError, options);
}
