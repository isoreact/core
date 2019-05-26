import propTypes from 'prop-types';

import hydrate from '../../../../src/hydrate';
import isomorphic from '../../../../src/isomorphic';

import ThrowsErrorContext from '../../context/throws-error-context';
import getData from '../../iso-streams/throws-immediate-error';
import ThrowsError from '../components/throws-error';

const isoThrowsImmediateError = {
    name: 'iso-throws-immediate-error--connected',
    component: ThrowsError,
    context: ThrowsErrorContext,
    getData,
    propTypes: {
        power: propTypes.number,
    },
};

export const IsoThrowsImmediateError = isomorphic(isoThrowsImmediateError);

export function hydrateThrowsImmediateError(options) {
    hydrate(IsoThrowsImmediateError, options);
}
