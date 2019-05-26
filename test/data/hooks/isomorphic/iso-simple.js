import propTypes from 'prop-types';

import hydrate from '../../../../src/hydrate';
import isomorphic from '../../../../src/isomorphic';

import Simple from '../components/simple';
import SimpleContext from '../../context/simple-context';
import getData from '../../iso-streams/simple';

const isoSimple = {
    name: 'iso-simple--hooked',
    component: Simple,
    context: SimpleContext,
    getData,
    propTypes: {
        power: propTypes.number,
    },
};

export const IsoSimple = isomorphic(isoSimple);

export function hydrateSimple(options) {
    hydrate(IsoSimple, options);
}
