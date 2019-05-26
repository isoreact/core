import propTypes from 'prop-types';

import hydrate from '../../../../src/hydrate';
import isomorphic from '../../../../src/isomorphic';

import SimpleContext from '../../context/simple-context';
import getData from '../../iso-streams/simple';
import Simple from '../components/simple';

const isoSimple = {
    name: 'iso-simple--connected',
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
