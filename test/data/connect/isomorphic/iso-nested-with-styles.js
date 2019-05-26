import propTypes from 'prop-types';

import hydrate from '../../../../src/hydrate';
import isomorphic from '../../../../src/isomorphic';

import NestedWithStyles from '../components/nested-with-styles';
import NestedWithStylesContext from '../../context/nested-with-styles-context';
import getData from '../../iso-streams/nested-with-styles';

const isoNestedWithStyles = {
    name: 'iso-nested-with-styles--connected',
    component: NestedWithStyles,
    context: NestedWithStylesContext,
    getData,
    propTypes: {
        coefficient: propTypes.number,
    },
};

export const IsoNestedWithStyles = isomorphic(isoNestedWithStyles);

export function hydrateNestedWithStyles(options) {
    hydrate(IsoNestedWithStyles, options);
}
