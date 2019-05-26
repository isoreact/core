import propTypes from 'prop-types';

import hydrate from '../../../../src/hydrate';
import isomorphic from '../../../../src/isomorphic';

import VerySimple from '../components/very-simple';
import VerySimpleContext from '../../context/very-simple-context';
import getData from '../../iso-streams/very-simple';

const isoVerySimple = {
    name: 'iso-very-simple--connected',
    component: VerySimple,
    context: VerySimpleContext,
    getData,
    propTypes: {
        power: propTypes.number,
    },
};

export const IsoVerySimple = isomorphic(isoVerySimple);

export function hydrateVerySimple(options) {
    hydrate(IsoVerySimple, options);
}
