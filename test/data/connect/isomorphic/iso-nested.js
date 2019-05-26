import propTypes from 'prop-types';

import hydrate from '../../../../src/hydrate';
import isomorphic from '../../../../src/isomorphic';

import Nested from '../components/nested';
import NestedContext from '../../context/nested-context';
import getData from '../../iso-streams/nested';

const isoNested = {
    name: 'iso-nested--connected',
    component: Nested,
    context: NestedContext,
    getData,
    propTypes: {
        coefficient: propTypes.number,
    },
};

export const IsoNested = isomorphic(isoNested);

export function hydrateNested(options) {
    hydrate(IsoNested, options);
}
